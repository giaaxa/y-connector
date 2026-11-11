import "server-only";
import Stripe from "stripe";
import type { MembershipStatus, Tier } from "./types";

let client: Stripe | null = null;
export function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe is not configured (STRIPE_SECRET_KEY missing).");
  client ??= new Stripe(key);
  return client;
}

/** Server-side source of truth for which Stripe Price each tier is charged. */
export function priceIdForTier(tier: Tier): string {
  const id = tier === "essex_alumni" ? process.env.STRIPE_PRICE_ESSEX_ALUMNI : process.env.STRIPE_PRICE_STANDARD;
  if (!id) throw new Error(`Stripe price for tier "${tier}" is not configured.`);
  return id;
}

export function tierForPriceId(priceId: string | undefined): Tier | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_ESSEX_ALUMNI) return "essex_alumni";
  if (priceId === process.env.STRIPE_PRICE_STANDARD) return "standard";
  return null;
}

export function mapSubscriptionStatus(s: Stripe.Subscription.Status): MembershipStatus {
  switch (s) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
      return "canceled";
    case "incomplete":
      return "incomplete";
    default:
      return "expired"; // unpaid, incomplete_expired, paused
  }
}

/** Period end lives on subscription items in recent API versions; fall back for older ones. */
export function periodEnd(sub: Stripe.Subscription): string | null {
  const item = sub.items?.data?.[0] as (Stripe.SubscriptionItem & { current_period_end?: number }) | undefined;
  const legacy = (sub as unknown as { current_period_end?: number }).current_period_end;
  const ts = item?.current_period_end ?? legacy;
  return ts ? new Date(ts * 1000).toISOString() : null;
}
