import Link from "next/link";
import { AdminHeader, Table } from "@/components/admin/stat";
import { Button } from "@/components/ui/button";
import { Avatar, Badge } from "@/components/ui/primitives";
import { setMemberRoles } from "@/lib/actions/admin";
import { requirePermission } from "@/lib/auth";
import { repo } from "@/lib/data";
import { can, ROLE_LABELS } from "@/lib/policy";
import type { Role } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const ASSIGNABLE: Role[] = ["super_admin", "admin", "event_manager", "moderator", "mentor"];

export default async function MembersAdminPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const v = await requirePermission("manageMembers");
  const { q } = await searchParams;
  const r = repo();
  const [profiles, memberships, apps] = await Promise.all([r.listProfiles(), r.listMemberships(), r.listApplications()]);
  const term = q?.toLowerCase();
  const list = profiles.filter((p) => !term || `${p.fullName} ${p.university}`.toLowerCase().includes(term));
  const canRoles = can(v.roles, "manageRoles");
  return (
    <div>
      <AdminHeader title="Members" intro={`${profiles.length} accounts. Payment details stay in Stripe and are never shown here.`} />
      <form className="mb-4"><input name="q" defaultValue={q} placeholder="Search name or university" aria-label="Search members" className="h-10 w-full max-w-sm rounded-full border border-line bg-white px-4 text-sm" /></form>
      <Table head={["Member", "Application", "Membership", "Renews", "Referrals", canRoles ? "Roles (super admin)" : "Roles"]}>
        {list.map((p) => {
          const m = memberships.find((x) => x.userId === p.id);
          const a = apps.find((x) => x.userId === p.id);
          const refs = profiles.filter((x) => x.referredBy === p.id).length;
          return (
            <tr key={p.id} className="align-top">
              <td className="px-4 py-3">
                <Link href={`/members/${p.id}`} className="flex items-center gap-2.5 hover:underline">
                  <Avatar name={p.fullName} size={30} />
                  <span><span className="block font-medium">{p.fullName}</span><span className="block text-xs text-muted">{p.university}</span></span>
                </Link>
              </td>
              <td className="px-4 py-3">{a ? <Badge tone={a.status === "verified" ? "ok" : a.status === "rejected" ? "bad" : "warn"}>{a.status.replace("_", " ")}</Badge> : "—"}</td>
              <td className="px-4 py-3">{m ? <Badge tone={m.status === "active" ? "ok" : "neutral"}>{m.status}</Badge> : <span className="text-muted">none</span>}</td>
              <td className="px-4 py-3 text-muted">{m?.currentPeriodEnd ? formatDate(m.currentPeriodEnd) : "—"}{m?.cancelAtPeriodEnd && " (ends)"}</td>
              <td className="px-4 py-3 tabular-nums">{refs}</td>
              <td className="px-4 py-3">
                {canRoles ? (
                  <form action={setMemberRoles} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <input type="hidden" name="userId" value={p.id} />
                    {ASSIGNABLE.map((role) => (
                      <label key={role} className="flex items-center gap-1 text-xs">
                        <input type="checkbox" name="roles" value={role} defaultChecked={p.roles.includes(role)} disabled={p.id === v.id && role === "super_admin"} className="accent-ink" />
                        {ROLE_LABELS[role].split(" ")[0]}
                      </label>
                    ))}
                    {p.id === v.id && <input type="hidden" name="roles" value="super_admin" />}
                    <Button size="sm" variant="outline" className="h-7 px-3 text-xs">Save</Button>
                  </form>
                ) : (
                  <span className="text-xs">{p.roles.map((x) => ROLE_LABELS[x]).join(", ")}</span>
                )}
              </td>
            </tr>
          );
        })}
      </Table>
    </div>
  );
}
