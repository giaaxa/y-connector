import { getViewer } from "@/lib/auth";
import { repo } from "@/lib/data";
import { can } from "@/lib/policy";

/**
 * Permissioned CSV exports for operations. Deliberately excludes dates of
 * birth, verification documents and payment details.
 */
const csv = (rows: (string | number | null)[][]) =>
  rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""').replace(/^[=+\-@]/, "'$&")}"`).join(",")).join("\r\n");

export async function GET(req: Request) {
  const v = await getViewer();
  if (!v || !can(v.roles, "exportData")) return new Response("Forbidden", { status: 403 });
  const type = new URL(req.url).searchParams.get("type");
  const r = repo();
  let body: string;
  if (type === "members") {
    const [profiles, memberships, apps] = await Promise.all([r.listProfiles(), r.listMemberships(), r.listApplications()]);
    body = csv([
      ["name", "email", "university", "city", "application_status", "tier", "membership_status", "renews_or_ends", "joined"],
      ...profiles.map((p) => {
        const m = memberships.find((x) => x.userId === p.id);
        const a = apps.find((x) => x.userId === p.id);
        return [p.fullName, a?.email ?? "", p.university, p.city, a?.status ?? "", m?.tier ?? a?.tier ?? "", m?.status ?? "none", m?.currentPeriodEnd ?? "", p.createdAt];
      }),
    ]);
  } else if (type === "rsvps") {
    const [events, rsvps] = await Promise.all([r.listEvents({ includeUnpublished: true }), r.listRsvps()]);
    body = csv([
      ["event", "event_date", "name", "email", "status", "registered_at"],
      ...rsvps.map((x) => {
        const e = events.find((ev) => ev.id === x.eventId);
        return [e?.title ?? x.eventId, e?.startsAt ?? "", x.name, x.email, x.status, x.createdAt];
      }),
    ]);
  } else {
    return new Response("Unknown export type", { status: 400 });
  }
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="yconnector-${type}-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
