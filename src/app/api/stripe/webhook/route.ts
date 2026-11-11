import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { isSupabaseConfigured } from "@/lib/config";
import { upsertMembershipAsService } from "@/lib/data/service";
import { sendEmail, templates } from "@/lib/email";
import { formatDate } from "@/lib/utils";
import { mapSubscriptionStatus, periodEnd, stripe, tierForPriceId } from "@/lib/stripe";
import { createSupabaseAdmin } from "@/lib/supabase/server";

/**
 * Stripe webhook — the ONLY path that activates, renews or ends membership.
 * Configure in Stripe: checkout.session.completed, customer.subscription.created,
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
        }
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
  const item = sub.items.data[0];
  const tier = tierForPriceId(item?.price?.id) ?? (sub.metadata?.tier === "essex_alumni" ? "essex_alumni" : "standard");
  const status = mapSubscriptionStatus(sub.status);
  const end = periodEnd(sub);
  await upsertMembershipAsService({
    userId,
    tier,
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
