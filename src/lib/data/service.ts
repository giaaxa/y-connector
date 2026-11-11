import "server-only";
import { isSupabaseConfigured } from "../config";
import { createSupabaseAdmin } from "../supabase/server";
import type { Application, Membership } from "../types";
import { demoRepo } from "./demo-repo";

/**
 * Trusted, server-only operations that must not depend on the caller's
 * session (e.g. the applicant may not have confirmed their email yet, or the
 * caller is Stripe). Every function here is invoked only after server-side
 * validation/authorisation by its caller.
 */

const PROOF_TYPES: Record<string, string> = { "application/pdf": "pdf", "image/png": "png", "image/jpeg": "jpg" };
export const MAX_PROOF_BYTES = 5 * 1024 * 1024;

export function validateProof(file: File | null): string | null {
  if (!file || file.size === 0) return null;
  if (!PROOF_TYPES[file.type]) return "Proof must be a PDF, PNG or JPG.";
  if (file.size > MAX_PROOF_BYTES) return "Proof must be 5 MB or smaller.";
  return null;
}

/** Stores a proof-of-status document privately. Returns the storage path. */
export async function storeProof(userId: string, file: File): Promise<string> {
  const ext = PROOF_TYPES[file.type];
  const path = `${userId}/proof-${Date.now()}.${ext}`;
  if (!isSupabaseConfigured) return `demo-not-stored/${path}`; // demo: file is NOT retained
  const admin = createSupabaseAdmin();
  const { error } = await admin.storage.from("verification").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error("Could not store your document. Please try again.");
  return path;
}

/** Short-lived signed URL for admins reviewing a document. */
export async function signedProofUrl(path: string): Promise<string | null> {
  if (!isSupabaseConfigured || path.startsWith("demo-not-stored/")) return null;
  const admin = createSupabaseAdmin();
  const { data } = await admin.storage.from("verification").createSignedUrl(path, 60);
  return data?.signedUrl ?? null;
}

export async function createApplicationAsService(app: Application) {
  if (!isSupabaseConfigured) return demoRepo.saveApplication(app);
  const admin = createSupabaseAdmin();
  const { error } = await admin.from("applications").upsert(
    {
      user_id: app.userId, full_name: app.fullName, email: app.email, date_of_birth: app.dateOfBirth,
      university: app.university, student_status: app.studentStatus, graduation_year: app.graduationYear,
      university_email: app.universityEmail, proof_path: app.proofPath, location: app.location,
      interests: app.interests, professional_interests: app.professionalInterests, tier: app.tier,
      status: "pending",
    },
    { onConflict: "user_id" },
  );
  if (error) throw new Error(error.message);
  await admin.from("profiles").update({ full_name: app.fullName, university: app.university, city: app.location, interests: app.interests }).eq("id", app.userId);
}

export async function markUniversityEmailVerified(userId: string, email: string) {
  if (!isSupabaseConfigured) {
    const a = await demoRepo.getApplication(userId);
    if (a && a.universityEmail.toLowerCase() === email.toLowerCase()) await demoRepo.saveApplication({ ...a, universityEmailVerified: true });
    return;
  }
  const admin = createSupabaseAdmin();
  await admin.from("applications").update({ university_email_verified: true }).match({ user_id: userId, university_email: email });
}

/** Webhook-only: upsert the membership record from Stripe's source of truth. */
export async function upsertMembershipAsService(m: Omit<Membership, "updatedAt">) {
  if (!isSupabaseConfigured) throw new Error("Membership writes require Supabase (no demo payments).");
  const admin = createSupabaseAdmin();
  const { error } = await admin.from("memberships").upsert({
    user_id: m.userId, tier: m.tier, status: m.status, current_period_end: m.currentPeriodEnd,
    cancel_at_period_end: m.cancelAtPeriodEnd, stripe_customer_id: m.stripeCustomerId,
    stripe_subscription_id: m.stripeSubscriptionId, amount_pence: m.amountPence, updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}
