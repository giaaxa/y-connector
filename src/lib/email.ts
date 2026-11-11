import "server-only";
import { siteConfig } from "./config";

/**
 * Email notification architecture.
 * Templates are plain functions → { subject, text }. Delivery goes through a
 * single `sendEmail` so the provider can be swapped. If RESEND_API_KEY is set,
 * messages are sent via Resend's HTTP API; otherwise they are logged to the
 * server console (local/demo) — nothing is silently "sent".
 */
type Template = { subject: string; text: string };

export const templates = {
  applicationReceived: (name: string): Template => ({
    subject: "We've received your Y Connector application",
    text: `Hi ${name},\n\nThanks for applying to Y Connector. We'll review your eligibility and get back to you — usually within a few days.\n\nYou can check your status any time at ${siteConfig.url}/dashboard.\n\n— The Y Connector team`,
  }),
  applicationDecision: (name: string, status: string, note: string): Template => ({
    subject:
      status === "verified"
        ? "You're verified — activate your Y Connector membership"
        : status === "more_info"
          ? "We need a little more information"
          : "Update on your Y Connector application",
    text: `Hi ${name},\n\n${
      status === "verified"
        ? `Good news — your eligibility has been verified. Activate your annual membership at ${siteConfig.url}/dashboard.`
        : status === "more_info"
          ? `We need a bit more information to verify your eligibility. Please update your application at ${siteConfig.url}/dashboard.`
          : "Unfortunately we can't approve your application at this time."
    }${note ? `\n\nNote from the team: ${note}` : ""}\n\n— The Y Connector team`,
  }),
  universityEmailVerify: (link: string): Template => ({
    subject: "Confirm your university email",
    text: `Confirm this university email address for your Y Connector application:\n\n${link}\n\nThis link expires in 48 hours. If you didn't request this, ignore this email.`,
  }),
  rsvpConfirmed: (name: string, eventTitle: string, when: string, status: string): Template => ({
    subject: status === "waitlist" ? `You're on the waitlist: ${eventTitle}` : `You're registered: ${eventTitle}`,
    text: `Hi ${name},\n\n${status === "waitlist" ? "The event is currently full, so you're on the waitlist. We'll email you if a place opens up." : "Your place is confirmed."}\n\n${eventTitle}\n${when}\n\n— The Y Connector team`,
  }),
  membershipActivated: (name: string, until: string): Template => ({
    subject: "Welcome to Y Connector — your membership is active",
    text: `Hi ${name},\n\nYour annual membership is active until ${until}. Jump in: ${siteConfig.url}/dashboard\n\n— The Y Connector team`,
  }),
  paymentFailed: (): Template => ({
    subject: "Action needed: your Y Connector renewal payment failed",
    text: `We couldn't process your membership renewal. Please update your payment details at ${siteConfig.url}/account/billing to keep your access.`,
  }),
};

export async function sendEmail(to: string, t: Template): Promise<{ delivered: boolean }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) {
    console.info(`[email:not-configured] to=${to} subject="${t.subject}"\n${t.text}`);
    return { delivered: false };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject: t.subject, text: t.text }),
    });
    if (!res.ok) console.error("[email] provider error", res.status, await res.text());
    return { delivered: res.ok };
  } catch (e) {
    console.error("[email] send failed", e);
    return { delivered: false };
  }
}
