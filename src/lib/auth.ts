import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { isSupabaseConfigured } from "./config";
import { repo } from "./data";
import { can, isMembershipActive, STAFF_ROLES, type Permission } from "./policy";
import { createSupabaseServer } from "./supabase/server";
import type { Viewer } from "./types";

export const DEMO_COOKIE = "yc_demo_user";

async function currentIdentity(): Promise<{ id: string; email: string } | null> {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServer();
    const { data } = await supabase.auth.getUser(); // verifies the JWT with Supabase
    return data.user ? { id: data.user.id, email: data.user.email ?? "" } : null;
  }
  const jar = await cookies();
  const id = jar.get(DEMO_COOKIE)?.value;
  return id ? { id, email: "" } : null;
}

/** The signed-in user with profile, application and membership — or null. Cached per request. */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const identity = await currentIdentity();
  if (!identity) return null;
  const r = repo();
  const [profile, application, membership] = await Promise.all([
    r.getProfile(identity.id),
    r.getApplication(identity.id),
    r.getMembership(identity.id),
  ]);
  if (!profile) return null;
  const roles = profile.roles.length ? profile.roles : ["member" as const];
  const isStaff = roles.some((x) => STAFF_ROLES.includes(x));
  return {
    id: identity.id,
    email: identity.email || application?.email || `${identity.id}@example.com`,
    profile,
    application,
    membership,
    roles,
    isStaff,
    isActiveMember: isMembershipActive(application, membership) || isStaff,
  };
});

export async function requireViewer(next = "/dashboard"): Promise<Viewer> {
  const v = await getViewer();
  if (!v) redirect(`/login?next=${encodeURIComponent(next)}`);
  return v;
}

/** Community features: verified + paid (or staff). Others are sent to their status page. */
export async function requireActiveMember(next = "/dashboard"): Promise<Viewer> {
  const v = await requireViewer(next);
  if (!v.isActiveMember) redirect("/dashboard?gate=members");
  return v;
}

export async function requirePermission(permission: Permission): Promise<Viewer> {
  const v = await requireViewer("/admin");
  if (!can(v.roles, permission)) redirect("/dashboard?gate=forbidden");
  return v;
}

/** For server actions: throws instead of redirecting. */
export async function assertActiveMember(): Promise<Viewer> {
  const v = await getViewer();
  if (!v) throw new Error("Please sign in.");
  if (!v.isActiveMember) throw new Error("An active membership is required.");
  return v;
}
export async function assertPermission(permission: Permission): Promise<Viewer> {
  const v = await getViewer();
  if (!v || !can(v.roles, permission)) throw new Error("You don't have permission to do that.");
  return v;
}
