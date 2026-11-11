"use client";

import { Upload } from "lucide-react";
import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { Checkbox, ChipCheckbox, Field, FormMessage, Input, Select, SubmitButton, Textarea } from "@/components/ui/form";
import { submitApplication } from "@/lib/actions/auth";
import type { ActionState } from "@/lib/actions/types";
import { INTEREST_OPTIONS } from "@/lib/constants";
import type { Application } from "@/lib/types";


export function ApplicationForm({
  requirePassword,
  existing,
  email,
  referral,
  maxAge,
  recentYears,
}: {
  requirePassword: boolean;
  existing: Application | null;
  email?: string;
  referral?: string;
  maxAge: number;
  recentYears: number;
}) {
  const [state, action] = useActionState<ActionState, FormData>(submitApplication, null);
  const [status, setStatus] = useState<"student" | "alumni">(existing?.studentStatus ?? "student");
  const [dob, setDob] = useState(existing?.dateOfBirth ?? "");
  const [fileName, setFileName] = useState("");
  const e = state?.errors ?? {};
  const thisYear = new Date().getFullYear();

  const ageHint = useMemo(() => {
    if (!dob) return null;
    const d = new Date(dob);
    if (Number.isNaN(d.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    if (now < new Date(now.getFullYear(), d.getMonth(), d.getDate())) age--;
    if (age >= maxAge) return `Membership is open to people under ${maxAge}.`;
    if (age < 16) return "Members must be at least 16.";
    return null;
  }, [dob, maxAge]);

  if (state?.ok) {
    return (
      <div role="status" className="rounded-3xl border border-line bg-mist p-8">
        <p className="text-2xl font-bold">Almost there.</p>
        <p className="mt-2 text-ink-soft">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-10" noValidate>
      {referral && <input type="hidden" name="ref" value={referral} />}

      <fieldset className="space-y-5">
        <legend className="eyebrow mb-5 text-muted">01 · About you</legend>
        <Field label="Full name" htmlFor="fullName" required error={e.fullName}>
          <Input id="fullName" name="fullName" autoComplete="name" defaultValue={existing?.fullName} required aria-invalid={!!e.fullName} />
        </Field>
        {!email ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Email address" htmlFor="email" required error={e.email}>
              <Input id="email" name="email" type="email" autoComplete="email" required aria-invalid={!!e.email} />
            </Field>
            {requirePassword && (
              <Field label="Password" htmlFor="password" required error={e.password} hint="At least 10 characters.">
                <Input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required aria-invalid={!!e.password} />
              </Field>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted">Signed in as <strong className="text-ink">{email}</strong></p>
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Date of birth" htmlFor="dob" required error={e.dateOfBirth ?? ageHint ?? undefined} hint="Kept private. Used only to confirm eligibility.">
            <Input id="dob" name="dateOfBirth" type="date" required value={dob} onChange={(ev) => setDob(ev.target.value)} max={new Date().toISOString().slice(0, 10)} aria-invalid={!!(e.dateOfBirth || ageHint)} />
          </Field>
          <Field label="City or country" htmlFor="location" required error={e.location}>
            <Input id="location" name="location" autoComplete="address-level2" defaultValue={existing?.location} placeholder="e.g. London" required aria-invalid={!!e.location} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="eyebrow mb-5 text-muted">02 · Your university</legend>
        <Field label="University" htmlFor="university" required error={e.university}>
          <Input id="university" name="university" list="unis" defaultValue={existing?.university} required aria-invalid={!!e.university} />
          <datalist id="unis">
            <option value="University of Essex" />
          </datalist>
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="I am a…" htmlFor="studentStatus" required error={e.studentStatus}>
            <Select id="studentStatus" name="studentStatus" value={status} onChange={(ev) => setStatus(ev.target.value as "student" | "alumni")}>
              <option value="student">Current student</option>
              <option value="alumni">Recent graduate (alumni)</option>
            </Select>
          </Field>
          {status === "alumni" && (
            <Field label="Graduation year" htmlFor="graduationYear" required error={e.graduationYear} hint={`Within the last ${recentYears} years.`}>
              <Input id="graduationYear" name="graduationYear" type="number" inputMode="numeric" min={thisYear - 30} max={thisYear} defaultValue={existing?.graduationYear ?? ""} required aria-invalid={!!e.graduationYear} />
            </Field>
          )}
        </div>
        <div className="rounded-2xl border border-line bg-mist p-5">
          <p className="text-sm font-semibold">Verify your status: choose either option</p>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <Field label="University email" htmlFor="universityEmail" error={e.universityEmail} hint="We'll send a confirmation link.">
              <Input id="universityEmail" name="universityEmail" type="email" placeholder="you@university.ac.uk" defaultValue={existing?.universityEmail} aria-invalid={!!e.universityEmail} />
            </Field>
            <Field label="Proof of status" htmlFor="proof" error={e.proof} hint="PDF, JPG or PNG · max 5 MB · deleted after review">
              <label htmlFor="proof" className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-ink/25 bg-white px-3.5 py-2.5 text-sm text-muted transition hover:border-ink">
                <Upload className="h-4 w-4" />
                <span className="truncate">{fileName || (existing?.proofPath ? "Document on file. Replace?" : "Upload a document")}</span>
              </label>
              <input id="proof" name="proof" type="file" accept="application/pdf,image/png,image/jpeg" className="sr-only" onChange={(ev) => setFileName(ev.target.files?.[0]?.name ?? "")} />
            </Field>
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="eyebrow mb-5 text-muted">03 · What you&apos;re into</legend>
        <div>
          <p className="mb-3 text-sm font-medium">Areas of interest</p>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((i) => (
              <ChipCheckbox key={i} name="interests" value={i} defaultChecked={existing?.interests.includes(i)} />
            ))}
          </div>
        </div>
        <Field label="What are you working on, or hoping to build?" htmlFor="professionalInterests" hint="Optional. Helps us connect you with the right people.">
          <Textarea id="professionalInterests" name="professionalInterests" defaultValue={existing?.professionalInterests} maxLength={1000} />
        </Field>
      </fieldset>

      <div className="space-y-5 border-t border-line pt-8">
        <Checkbox
          name="consent"
          required
          label={
            <>
              I agree to the <Link href="/legal/terms" className="underline" target="_blank">terms</Link>, the{" "}
              <Link href="/legal/community-guidelines" className="underline" target="_blank">community guidelines</Link> and the{" "}
              <Link href="/legal/privacy" className="underline" target="_blank">privacy policy</Link>, including the processing of my eligibility information.
            </>
          }
        />
        {e.consent && <p className="text-xs font-medium text-bad">{e.consent}</p>}
        <FormMessage state={state} />
        <SubmitButton size="lg" className="w-full sm:w-auto" pendingLabel="Submitting…">
          {existing ? "Update application" : "Submit application"}
        </SubmitButton>
        <p className="text-xs text-muted">You won&apos;t be charged now. Payment is only requested after your eligibility is verified.</p>
      </div>
    </form>
  );
}
