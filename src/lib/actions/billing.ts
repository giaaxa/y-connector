"use server";

import { redirect } from "next/navigation";
import { getViewer } from "../auth";
import { isLifetimeConfigured, isStripeConfigured, siteConfig } from "../config";
import { isMembershipActive } from "../policy";
import { lifetimePriceId, priceIdForTier, stripe } from "../stripe";

/**
 * Starts Stripe Checkout: annual subscription (price by tier) or one-off lifetime membership.
 * - Only verified applicants may pay.
 * - Price is chosen server-side from the admin-confirmed tier; nothing from
 *   the browser influences the amount.
 * - Reaching the success URL does NOT activate membership — the verified
 *   webhook does (see /api/stripe/webhook).
 */
export async function startCheckout(formData?: FormData) {
  const plan = formData?.get("plan") === "lifetime" ? "lifetime" : "annual";
  const v = await getViewer();
  if (!v) redirect("/login?next=/dashboard");
  if (!isStripeConfigured || (plan === "lifetime" && !isLifetimeConfigured)) redirect("/dashboard?billing=not-configured");
  if (v.application?.status !== "verified") redirect("/dashboard?billing=not-verified");
  const active = isMembershipActive(v.application, v.membership);
  // Annual: only if not already a member. Lifetime: also allowed as an upgrade from annual.
  if (v.membership?.plan === "lifetime" && active) redirect("/account/billing");
  if (plan === "annual" && active) redirect("/account/billing");

  const s = stripe();
  const tier = v.application.tier;
  const common = {
    ...(v.membership?.stripeCustomerId ? { customer: v.membership.stripeCustomerId } : { customer_email: v.email }),
    client_reference_id: v.id,
    metadata: { user_id: v.id, tier, plan },
    allow_promotion_codes: false,
    billing_address_collection: "auto" as const,
    success_url: `${siteConfig.url}/dashboard?checkout=success`,
    cancel_url: `${siteConfig.url}/dashboard?checkout=cancelled`,
  };
  const session =
    plan === "lifetime"
      ? await s.checkout.sessions.create({
          ...common,
          mode: "payment",
          line_items: [{ price: lifetimePriceId(), quantity: 1 }],
          ...(v.membership?.stripeCustomerId ? {} : { customer_creation: "always" as const }),
          payment_intent_data: { metadata: { user_id: v.id, tier, plan } },
        })
      : await s.checkout.sessions.create({
          ...common,
          mode: "subscription",
          line_items: [{ price: priceIdForTier(tier), quantity: 1 }],
          subscription_data: { metadata: { user_id: v.id, tier, plan } },
        });
  if (!session.url) throw new Error("Stripe did not return a checkout URL.");
  redirect(session.url);
}

/** Stripe Customer Portal: update card, view invoices, cancel at period end. */
export async function openBillingPortal() {
  const v = await getViewer();
  if (!v) redirect("/login?next=/account/billing");
  if (!isStripeConfigured || !v.membership?.stripeCustomerId) redirect("/account/billing?portal=unavailable");
  const session = await stripe().billingPortal.sessions.create({
    customer: v.membership.stripeCustomerId,
    return_url: `${siteConfig.url}/account/billing`,
  });
  redirect(session.url);
}
