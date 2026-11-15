import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { isSupabaseConfigured } from "@/lib/config";
import { getMembershipAsService, upsertMembershipAsService } from "@/lib/data/service";
import { sendEmail, templates } from "@/lib/email";
import { formatDate } from "@/lib/utils";
import { lifetimePriceId, mapSubscriptionStatus, periodEnd, stripe, tierForPriceId } from "@/lib/stripe";
import type { Tier } from "@/lib/types";
import { createSupabaseAdmin } from "@/lib/supabase/server";

/**
 * Stripe webhook — the ONLY path that activates, renews or ends membership.
 * Configure in Stripe: checkout.session.completed, checkout.session.async_payment_succeeded, customer.subscription.created,
 * customer.subscription.updated, customer.subscription.deleted, invoice.payment_failed
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !isSupabaseConfigured) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }
  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await req.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createSupabaseAdmin();
  // Idempotency: ignore events we've already processed.
  const { error: dupErr } = await admin.from("stripe_events").insert({ id: event.id, type: event.type });
  if (dupErr?.code === "23505") return NextResponse.json({ received: true, duplicate: true });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.mode === "subscription" && session.subscription) {
          const sub = await stripe().subscriptions.retrieve(String(session.subscription));
          await syncSubscription(sub, { activationEmail: true });
        } else if (session.mode === "payment" && session.metadata?.plan === "lifetime") {
          await activateLifetime(session);
        }
        break;
      }
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;
        if (session.mode === "payment" && session.metadata?.plan === "lifetime") await activateLifetime(session);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncSubscription(event.data.object);
        break;
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const email = invoice.customer_email;
        if (email) await sendEmail(email, templates.paymentFailed());
        break; // status change arrives via customer.subscription.updated (past_due)
      }
    }
  } catch (e) {
    // Remove idempotency marker so Stripe's retry can be processed.
    await admin.from("stripe_events").delete().eq("id", event.id);
    console.error("[stripe:webhook]", event.type, e);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}

async function syncSubscription(sub: Stripe.Subscription, opts: { activationEmail?: boolean } = {}) {
  const userId = sub.metadata?.user_id;
  if (!userId) throw new Error(`Subscription ${sub.id} has no user_id metadata`);
  // A lifetime member's old annual subscription must never downgrade them.
  const existing = await getMembershipAsService(userId);
  if (existing?.plan === "lifetime") return;
  const item = sub.items.data[0];
  const tier = tierForPriceId(item?.price?.id) ?? metaTier(sub.metadata?.tier);
  const status = mapSubscriptionStatus(sub.status);
  const end = periodEnd(sub);
  await upsertMembershipAsService({
    userId,
    tier,
    plan: "annual",
    status,
    currentPeriodEnd: end,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    stripeCustomerId: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
    stripeSubscriptionId: sub.id,
    amountPence: item?.price?.unit_amount ?? 0,
  });
  if (opts.activationEmail && status === "active" && end) {
    const admin = createSupabaseAdmin();
    const { data } = await admin.from("applications").select("email, full_name").eq("user_id", userId).maybeSingle();
    if (data) await sendEmail(data.email, templates.membershipActivated(String(data.full_name).split(" ")[0], formatDate(end)));
  }
}

function metaTier(t: string | undefined): Tier {
  return t === "essex_student" || t === "essex_alumni" ? t : "standard";
}

/** One-off lifetime payment: verify it really is the lifetime Price and is paid. */
async function activateLifetime(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  if (!userId) throw new Error(`Checkout ${session.id} has no user_id metadata`);
  if (session.payment_status !== "paid") return; // async methods confirm later via checkout.session.async_payment_succeeded
  const items = await stripe().checkout.sessions.listLineItems(session.id, { limit: 5 });
  if (!items.data.some((li) => li.price?.id === lifetimePriceId())) throw new Error(`Checkout ${session.id} is not a lifetime purchase`);

  // Upgrading from annual: cancel the subscription now so they're never billed again.
  const existing = await getMembershipAsService(userId);
  if (existing?.stripeSubscriptionId) {
    await stripe().subscriptions.cancel(existing.stripeSubscriptionId).catch((e) => console.error("[stripe] cancel after lifetime", e));
  }
  await upsertMembershipAsService({
    userId,
    tier: metaTier(session.metadata?.tier),
    plan: "lifetime",
    status: "active",
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    stripeCustomerId: typeof session.customer === "string" ? session.customer : (session.customer?.id ?? null),
    stripeSubscriptionId: null,
    amountPence: session.amount_total ?? 0,
  });
  const admin = createSupabaseAdmin();
  const { data } = await admin.from("applications").select("email, full_name").eq("user_id", userId).maybeSingle();
  if (data) await sendEmail(data.email, templates.lifetimeActivated(String(data.full_name).split(" ")[0]));
}
