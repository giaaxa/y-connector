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
const TIER_PRICE_ENV: Record<Tier, string> = {
  essex_student: "STRIPE_PRICE_ESSEX_STUDENT",
  essex_alumni: "STRIPE_PRICE_ESSEX_ALUMNI",
  standard: "STRIPE_PRICE_STANDARD",
};

/** Recurring yearly Price for a tier. */
export function priceIdForTier(tier: Tier): string {
  const id = process.env[TIER_PRICE_ENV[tier]];
  if (!id) throw new Error(`Stripe price for tier "${tier}" is not configured.`);
  return id;
}

/** One-off Price for lifetime membership. */
export function lifetimePriceId(): string {
  const id = process.env.STRIPE_PRICE_LIFETIME;
  if (!id) throw new Error("Stripe lifetime price is not configured.");
  return id;
}

export function tierForPriceId(priceId: string | undefined): Tier | null {
  if (!priceId) return null;
  for (const [tier, env] of Object.entries(TIER_PRICE_ENV)) if (priceId === process.env[env]) return tier as Tier;
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
