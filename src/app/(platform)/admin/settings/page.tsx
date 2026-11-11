import { AdminHeader } from "@/components/admin/stat";
import { ActionForm } from "@/components/ui/action-form";
import { Checkbox, Field, Input } from "@/components/ui/form";
import { Card, Notice } from "@/components/ui/primitives";
import { updateSettings } from "@/lib/actions/admin";
import { requirePermission } from "@/lib/auth";
import { isStripeConfigured } from "@/lib/config";
import { repo } from "@/lib/data";

export default async function SettingsPage() {
  await requirePermission("manageSettings");
  const s = await repo().getSettings();
  return (
    <div className="max-w-3xl">
      <AdminHeader title="Eligibility & membership policy" intro="Changes apply to new applications immediately and are reflected on public pages." />
      <Card className="p-6 sm:p-8">
        <ActionForm action={updateSettings} submitLabel="Save settings" pendingLabel="Saving…" replaceOnSuccess={false}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="“Recent alumni” window (years)" htmlFor="recentAlumniYears" hint="Graduated within this many years"><Input id="recentAlumniYears" name="recentAlumniYears" type="number" min={0} max={20} defaultValue={s.recentAlumniYears} /></Field>
            <Field label="Age limit (must be under)" htmlFor="maxAgeExclusive"><Input id="maxAgeExclusive" name="maxAgeExclusive" type="number" min={18} max={100} defaultValue={s.maxAgeExclusive} /></Field>
            <Field label="Essex alumni price (pence)" htmlFor="priceEssexPence" hint="Display only. Must match STRIPE_PRICE_ESSEX_ALUMNI"><Input id="priceEssexPence" name="priceEssexPence" type="number" min={0} defaultValue={s.priceEssexPence} /></Field>
            <Field label="Standard price (pence)" htmlFor="priceStandardPence" hint="Display only. Must match STRIPE_PRICE_STANDARD"><Input id="priceStandardPence" name="priceStandardPence" type="number" min={0} defaultValue={s.priceStandardPence} /></Field>
            <Field label="Essex university names" htmlFor="essexUniversityNames" hint="Comma separated"><Input id="essexUniversityNames" name="essexUniversityNames" defaultValue={s.essexUniversityNames.join(", ")} /></Field>
            <Field label="Essex email domains" htmlFor="essexEmailDomains" hint="Comma separated"><Input id="essexEmailDomains" name="essexEmailDomains" defaultValue={s.essexEmailDomains.join(", ")} /></Field>
            <Field label="Delete verification documents after (days)" htmlFor="verificationRetentionDays"><Input id="verificationRetentionDays" name="verificationRetentionDays" type="number" min={7} max={730} defaultValue={s.verificationRetentionDays} /></Field>
          </div>
          <Checkbox name="requireProofOfStatus" defaultChecked={s.requireProofOfStatus} label="Require a university email (.ac.uk) or proof-of-status upload with every application" />
        </ActionForm>
      </Card>
      <Notice tone="neutral" className="mt-6" title="Payments">
        Charges always use the Stripe Price IDs in environment variables, chosen server-side from each member&apos;s verified tier. Stripe status: <strong>{isStripeConfigured ? "configured" : "not configured"}</strong>.
      </Notice>
    </div>
  );
}
