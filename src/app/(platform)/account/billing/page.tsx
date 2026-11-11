import { CreditCard, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge, Card, Notice } from "@/components/ui/primitives";
import { openBillingPortal, startCheckout } from "@/lib/actions/billing";
import { requireViewer } from "@/lib/auth";
import { isStripeConfigured } from "@/lib/config";
import { repo } from "@/lib/data";
import { formatPence, isMembershipActive, tierLabel, tierPricePence } from "@/lib/policy";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Membership & billing" };

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ portal?: string }> }) {
  const v = await requireViewer("/account/billing");
  const { portal } = await searchParams;
  const m = v.membership;
  const a = v.application;
  const settings = await repo().getSettings();
  const active = isMembershipActive(a, m);
  const statusTone = { active: "ok", past_due: "warn", canceled: "neutral", expired: "neutral", incomplete: "warn", none: "neutral" } as const;

  return (
    <div className="space-y-6">
      {portal === "unavailable" && <Notice tone="neutral">The billing portal is available once you have a Stripe subscription.</Notice>}
      <Card className="p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-muted">Membership</p>
            <p className="mt-2 text-2xl font-bold">{m ? tierLabel(m.tier) : a ? tierLabel(a.tier) : "No membership"}</p>
          </div>
          <Badge tone={m ? statusTone[m.status] : "neutral"}>{m ? m.status.replace("_", " ") : "inactive"}</Badge>
        </div>
        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
          <div><dt className="text-muted">Annual price</dt><dd className="mt-1 font-semibold">{formatPence(m?.amountPence || (a ? tierPricePence(a.tier, settings) : settings.priceStandardPence))} / year</dd></div>
          <div><dt className="text-muted">{m?.cancelAtPeriodEnd ? "Access ends" : "Renews on"}</dt><dd className="mt-1 font-semibold">{m?.currentPeriodEnd ? formatDate(m.currentPeriodEnd) : "—"}</dd></div>
          <div><dt className="text-muted">Eligibility</dt><dd className="mt-1 font-semibold capitalize">{a?.status.replace("_", " ") ?? "not applied"}</dd></div>
        </dl>
        {m?.cancelAtPeriodEnd && <Notice tone="neutral" className="mt-6">Renewal is off. You keep full access until {formatDate(m.currentPeriodEnd!)}.</Notice>}
        {m?.status === "past_due" && <Notice tone="bad" className="mt-6" title="Payment failed">Update your card to keep access. Stripe will retry automatically.</Notice>}

        <div className="mt-8 flex flex-wrap gap-3 border-t border-line pt-6">
          {m?.stripeCustomerId && isStripeConfigured ? (
            <form action={openBillingPortal}>
              <Button variant="dark"><ExternalLink className="h-4 w-4" /> Manage billing, invoices &amp; cancellation</Button>
            </form>
          ) : !active && a?.status === "verified" && isStripeConfigured ? (
            <form action={startCheckout}><Button><CreditCard className="h-4 w-4" /> Activate membership</Button></form>
          ) : null}
          {!a && <ButtonLink href="/join">Apply for membership</ButtonLink>}
        </div>
        {!isStripeConfigured && (
          <p className="mt-4 text-xs text-muted">Payments aren&apos;t configured in this environment. {m && !m.stripeCustomerId && "This sample membership has no Stripe record."}</p>
        )}
      </Card>
      <Card className="p-6 text-sm text-ink-soft">
        <p className="font-semibold text-ink">How billing works</p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5">
          <li>Membership is charged once per year and renews automatically on your anniversary.</li>
          <li>Cancel any time from the billing portal. You keep access until the end of your paid year.</li>
          <li>Payments are processed securely by Stripe. We never see or store your card details.</li>
        </ul>
      </Card>
    </div>
  );
}
