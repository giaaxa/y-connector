import { repo } from "@/lib/data";
import { siteConfig } from "@/lib/config";

const fmt = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const esc = (s: string) => s.replace(/[\\;,]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");

/** iCalendar download for an event. */
export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const event = await repo().getEventBySlug((await params).slug);
  if (!event || event.status !== "published") return new Response("Not found", { status: 404 });
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Y Connector//Events//EN",
    "BEGIN:VEVENT",
    `UID:${event.id}@yconnector`,
    `DTSTAMP:${fmt(new Date().toISOString())}`,
    `DTSTART:${fmt(event.startsAt)}`,
    `DTEND:${fmt(event.endsAt)}`,
    `SUMMARY:${esc(event.title)}`,
    `DESCRIPTION:${esc(event.summary)}`,
    `LOCATION:${esc(event.location)}`,
    `URL:${siteConfig.url}/events/${event.slug}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return new Response(body, {
    headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": `attachment; filename="${event.slug}.ics"` },
  });
}
