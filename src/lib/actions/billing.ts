"use server";

import { redirect } from "next/navigation";
import { getViewer } from "../auth";
import { isStripeConfigured, siteConfig } from "../config";
import { isMembershipActive } from "../policy";
import { priceIdForTier, stripe } from "../stripe";

/**
 * Starts Stripe Checkout for the annual membership.
 * - Only verified applicants may pay.
 * - Price is chosen server-side from the admin-confirmed tier; nothing from
 *   the browser influences the amount.
 * - Reaching the success URL does NOT activate membership — the verified
 *   webhook does (see /api/stripe/webhook).
 */
export async function startCheckout() {
  const v = await getViewer();
  if (!v) redirect("/login?next=/dashboard");
  if (!isStripeConfigured) redirect("/dashboard?billing=not-configured");
  if (v.application?.status !== "verified") redirect("/dashboard?billing=not-verified");
  if (isMembershipActive(v.application, v.membership)) redirect("/account/billing");

  const s = stripe();
  const tier = v.application.tier;
  const session = await s.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceIdForTier(tier), quantity: 1 }],
    ...(v.membership?.stripeCustomerId ? { customer: v.membership.stripeCustomerId } : { customer_email: v.email }),
    client_reference_id: v.id,
    metadata: { user_id: v.id, tier },
    subscription_data: { metadata: { user_id: v.id, tier } },
    allow_promotion_codes: false,
    billing_address_collection: "auto",
    success_url: `${siteConfig.url}/dashboard?checkout=success`,
    cancel_url: `${siteConfig.url}/dashboard?checkout=cancelled`,
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
