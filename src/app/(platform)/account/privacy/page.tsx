import type { Metadata } from "next";
import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import { Field, Input, Textarea } from "@/components/ui/form";
import { Card, Notice } from "@/components/ui/primitives";
import { requestAccountDeletion } from "@/lib/actions/member";
import { requireViewer } from "@/lib/auth";
import { repo } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Privacy & data" };

export default async function PrivacyPage() {
  const v = await requireViewer("/account/privacy");
  const [open, settings] = await Promise.all([repo().getOpenDeletionRequest(v.id), repo().getSettings()]);
  const a = v.application;
  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-8">
        <p className="font-semibold">What we hold about you</p>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-muted">Account email</dt><dd className="font-medium">{v.email}</dd></div>
          <div><dt className="text-muted">Date of birth</dt><dd className="font-medium">{a ? formatDate(a.dateOfBirth) : "—"} <span className="text-xs text-muted">(private)</span></dd></div>
          <div><dt className="text-muted">Proof of status</dt><dd className="font-medium">{a?.proofPath ? `On file. Deleted ${settings.verificationRetentionDays} days after review` : "None stored"}</dd></div>
          <div><dt className="text-muted">Directory visibility</dt><dd className="font-medium">{v.profile.discoverable ? "Visible to members" : "Private"}</dd></div>
        </dl>
        <p className="mt-6 text-sm text-muted">
          To request a copy of your data or correct it, <Link href="/contact" className="underline">contact us</Link> (choose “Privacy / data request”). See our <Link href="/legal/privacy" className="underline">privacy policy</Link>.
        </p>
      </Card>
      <Card className="border-bad/30 p-6 sm:p-8">
        <p className="font-semibold text-bad">Delete my account</p>
        <p className="mt-2 text-sm text-ink-soft">
          We&apos;ll cancel any active subscription, delete your profile, application and verification data, and anonymise your forum posts within 30 days. Payment records we&apos;re legally required to keep are retained separately.
        </p>
        {open ? (
          <Notice tone="neutral" className="mt-5">Deletion requested on {formatDate(open.createdAt)}. We&apos;re processing it.</Notice>
        ) : (
          <ActionForm action={requestAccountDeletion} submitLabel="Request deletion" pendingLabel="Sending…" className="mt-5" submitClassName="bg-bad! text-white! hover:bg-bad/90!">
            <Field label="Reason (optional)" htmlFor="reason"><Textarea id="reason" name="reason" rows={3} className="min-h-0" /></Field>
            <Field label='Type "DELETE" to confirm' htmlFor="confirm"><Input id="confirm" name="confirm" autoComplete="off" required /></Field>
          </ActionForm>
        )}
      </Card>
    </div>
  );
}
