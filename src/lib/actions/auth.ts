"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { DEMO_COOKIE, getViewer } from "../auth";
import { isSupabaseConfigured, siteConfig } from "../config";
import { repo } from "../data";
import { createApplicationAsService, storeProof, validateProof } from "../data/service";
import { sendEmail, templates } from "../email";
import { checkEligibility, suggestTier } from "../policy";
import { DEMO_PERSONAS } from "../seed";
import { createSupabaseServer } from "../supabase/server";
import { signToken } from "../tokens";
import type { Application } from "../types";
import { safeNext, str } from "../utils";
import type { ActionState } from "./types";

const demoCookieOpts = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 };

/* ───────────── Demo persona switcher (demo mode only) ───────────── */
export async function demoSignIn(formData: FormData) {
  if (isSupabaseConfigured) throw new Error("Demo sign-in is disabled when Supabase is configured.");
  const id = str(formData, "persona");
  const allowed = DEMO_PERSONAS.some((p) => p.id === id) || id.startsWith("u_");
  if (!allowed || !(await repo().getProfile(id))) throw new Error("Unknown demo persona");
  (await cookies()).set(DEMO_COOKIE, id, demoCookieOpts);
  redirect(safeNext(str(formData, "next")));
}

/* ───────────── Password sign-in ───────────── */
export async function signIn(_: ActionState, formData: FormData): Promise<ActionState> {
  const email = str(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!isSupabaseConfigured) return { ok: false, message: "Accounts aren't connected in preview mode — choose a demo persona below." };
  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, message: "That email and password combination didn't work." };
  redirect(safeNext(str(formData, "next")));
}

/* ───────────── Passwordless (magic link) ───────────── */
export async function sendMagicLink(_: ActionState, formData: FormData): Promise<ActionState> {
  const email = str(formData, "email").toLowerCase();
  if (!z.email().safeParse(email).success) return { ok: false, message: "Enter a valid email address." };
  if (!isSupabaseConfigured) return { ok: false, message: "Magic links need Supabase to be configured." };
  const supabase = await createSupabaseServer();
  await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, emailRedirectTo: `${siteConfig.url}/auth/callback?next=/dashboard` },
  });
  // Same response whether or not the account exists (prevents account enumeration).
  return { ok: true, message: "If an account exists for that email, a sign-in link is on its way." };
}

export async function signOut() {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServer();
    await supabase.auth.signOut();
  } else {
    (await cookies()).delete(DEMO_COOKIE);
  }
  redirect("/");
}

/* ───────────── Password recovery ───────────── */
export async function requestPasswordReset(_: ActionState, formData: FormData): Promise<ActionState> {
  const email = str(formData, "email").toLowerCase();
  if (!z.email().safeParse(email).success) return { ok: false, message: "Enter a valid email address." };
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServer();
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${siteConfig.url}/auth/callback?next=/reset-password` });
  }
  return { ok: true, message: "If an account exists for that email, we've sent a reset link." };
}

export async function updatePassword(_: ActionState, formData: FormData): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 10) return { ok: false, message: "Use at least 10 characters." };
  if (password !== confirm) return { ok: false, message: "Passwords don't match." };
  if (!isSupabaseConfigured) return { ok: false, message: "Password changes need Supabase to be configured." };
  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, message: "Your reset link may have expired. Request a new one." };
  return { ok: true, message: "Password updated. You're signed in." };
}

/* ───────────── Membership application (sign-up + eligibility) ───────────── */
const applicationSchema = z
  .object({
    fullName: z.string().min(2, "Please enter your full name.").max(120),
    email: z.email("Enter a valid email address."),
    password: z.string().optional(),
    dateOfBirth: z.iso.date("Enter your date of birth."),
    university: z.string().min(2, "Tell us your university.").max(160),
    studentStatus: z.enum(["student", "alumni"], { message: "Choose student or alumni." }),
    graduationYear: z.coerce.number().int().min(1950).max(2100).nullable(),
    universityEmail: z.union([z.literal(""), z.email("Enter a valid university email.")]),
    location: z.string().min(2, "Add your city or country.").max(120),
    interests: z.array(z.string().max(60)).max(12),
    professionalInterests: z.string().max(1000),
    consent: z.literal("on", { message: "Please accept the terms and privacy policy." }),
  });

export async function submitApplication(_: ActionState, formData: FormData): Promise<ActionState> {
  const viewer = await getViewer();
  const gradRaw = str(formData, "graduationYear");
  const parsed = applicationSchema.safeParse({
    fullName: str(formData, "fullName", 120),
    email: (viewer?.email ?? str(formData, "email")).toLowerCase(),
    password: String(formData.get("password") ?? ""),
    dateOfBirth: str(formData, "dateOfBirth"),
    university: str(formData, "university", 160),
    studentStatus: str(formData, "studentStatus"),
    graduationYear: gradRaw ? gradRaw : null,
    universityEmail: str(formData, "universityEmail").toLowerCase(),
    location: str(formData, "location", 120),
    interests: formData.getAll("interests").map(String),
    professionalInterests: str(formData, "professionalInterests", 1000),
    consent: formData.get("consent") ?? undefined,
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    return { ok: false, message: "Please check the highlighted fields.", errors };
  }
  const d = parsed.data;
  const r = repo();
  const settings = await r.getSettings();

  const problems = checkEligibility(
    { dateOfBirth: d.dateOfBirth, studentStatus: d.studentStatus, graduationYear: d.graduationYear, university: d.university },
    settings,
  );
  if (problems.length) return { ok: false, message: problems.join(" ") };

  const proof = formData.get("proof") as File | null;
  const proofError = validateProof(proof);
  if (proofError) return { ok: false, message: proofError, errors: { proof: proofError } };
  const hasProof = Boolean(proof && proof.size > 0);
  const academicEmail = /\.(ac\.uk|edu)$/i.test(d.universityEmail.split("@")[1] ?? "");
  if (settings.requireProofOfStatus && !academicEmail && !hasProof && !viewer?.application?.proofPath) {
    return {
      ok: false,
      message: "Add a university email (.ac.uk) or upload proof of your student/alumni status.",
      errors: { universityEmail: "University email or proof of status required." },
    };
  }

  // Resolve (or create) the account.
  let userId = viewer?.id;
  let needsEmailConfirmation = false;
  if (!userId) {
    if (isSupabaseConfigured) {
      if (!d.password || d.password.length < 10) return { ok: false, message: "Choose a password of at least 10 characters.", errors: { password: "At least 10 characters." } };
      const supabase = await createSupabaseServer();
      const { data, error } = await supabase.auth.signUp({
        email: d.email,
        password: d.password,
        options: {
          data: { full_name: d.fullName, referral_code: str(formData, "ref", 32) },
          emailRedirectTo: `${siteConfig.url}/auth/callback?next=/dashboard`,
        },
      });
      if (error || !data.user) return { ok: false, message: error?.message ?? "We couldn't create your account." };
      userId = data.user.id;
      needsEmailConfirmation = !data.session;
    } else {
      userId = `u_${crypto.randomUUID().slice(0, 8)}`;
    }
  } else if (viewer?.application && !["pending", "more_info"].includes(viewer.application.status)) {
    return { ok: false, message: "Your application has already been reviewed." };
  }

  const proofPath = hasProof ? await storeProof(userId, proof!) : (viewer?.application?.proofPath ?? null);
  const app: Application = {
    id: viewer?.application?.id ?? `app_${userId}`,
    userId,
    fullName: d.fullName,
    email: d.email,
    dateOfBirth: d.dateOfBirth,
    university: d.university,
    studentStatus: d.studentStatus,
    graduationYear: d.studentStatus === "alumni" ? d.graduationYear : null,
    universityEmail: d.universityEmail,
    universityEmailVerified: viewer?.application?.universityEmail === d.universityEmail ? (viewer.application.universityEmailVerified ?? false) : false,
    proofPath,
    location: d.location,
    interests: d.interests,
    professionalInterests: d.professionalInterests,
    status: "pending",
    tier: suggestTier(d, settings),
    reviewerNote: viewer?.application?.reviewerNote ?? "",
    submittedAt: new Date().toISOString(),
    reviewedAt: null,
  };
  await createApplicationAsService(app);

  if (!isSupabaseConfigured && !viewer) {
    // Demo: attribute referral and sign the applicant in.
    const ref = str(formData, "ref", 32);
    const referrer = ref ? await r.findProfileByReferralCode(ref) : null;
    // (In Supabase mode the signup trigger attributes referrals from user metadata.)
    if (referrer && referrer.id !== userId) await r.updateProfile(userId, { referredBy: referrer.id });
    (await cookies()).set(DEMO_COOKIE, userId, demoCookieOpts);
  }

  await sendEmail(d.email, templates.applicationReceived(d.fullName.split(" ")[0]));
  if (d.universityEmail && academicEmail && !app.universityEmailVerified) {
    const token = signToken({ uid: userId, email: d.universityEmail });
    await sendEmail(d.universityEmail, templates.universityEmailVerify(`${siteConfig.url}/verify-university-email?token=${token}`));
  }

  if (needsEmailConfirmation) {
    return { ok: true, message: "Application received! Check your inbox to confirm your email address, then sign in to follow your status." };
  }
  redirect("/dashboard?submitted=1");
}

/** Re-sends the university email verification link for the signed-in applicant. */
export async function resendUniversityEmail(): Promise<ActionState> {
  const v = await getViewer();
  const a = v?.application;
  if (!v || !a?.universityEmail) return { ok: false, message: "No university email on your application." };
  const token = signToken({ uid: v.id, email: a.universityEmail });
  const link = `${siteConfig.url}/verify-university-email?token=${token}`;
  const { delivered } = await sendEmail(a.universityEmail, templates.universityEmailVerify(link));
  if (!delivered && !isSupabaseConfigured) {
    return { ok: true, message: "Preview mode: email delivery isn't configured.", data: { link } };
  }
  return { ok: true, message: delivered ? "Verification email sent." : "Email delivery isn't configured yet — the link was written to the server log." };
}
