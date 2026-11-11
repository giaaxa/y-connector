import { Plus } from "lucide-react";
import Link from "next/link";
import { AdminHeader, Table } from "@/components/admin/stat";
import { ButtonLink } from "@/components/ui/button";
import { Badge, Notice, SampleTag } from "@/components/ui/primitives";
import { setEventStatus } from "@/lib/actions/admin";
import { requirePermission } from "@/lib/auth";
import { repo } from "@/lib/data";
import { formatDate, FORMAT_LABEL } from "@/lib/utils";

const TONE = { draft: "neutral", published: "ok", cancelled: "bad", archived: "outline" } as const;

export default async function EventsAdminPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requirePermission("manageEvents");
  const { saved } = await searchParams;
  const r = repo();
  const [events, rsvps] = await Promise.all([r.listEvents({ includeUnpublished: true }), r.listRsvps()]);
  return (
    <div>
      <AdminHeader title="Events & RSVPs" intro="Create, publish, cancel and archive events. At least one main event per month." actions={<ButtonLink href="/admin/events/new" size="sm"><Plus className="h-4 w-4" /> New event</ButtonLink>} />
      {saved && <Notice tone="ok" className="mb-4">Event saved.</Notice>}
      <Table head={["Event", "Date", "Format", "Status", "Registrations", "Actions"]}>
        {events.map((e) => {
          const confirmed = rsvps.filter((x) => x.eventId === e.id && x.status === "confirmed").length;
          const wait = rsvps.filter((x) => x.eventId === e.id && x.status === "waitlist").length;
          return (
            <tr key={e.id}>
              <td className="px-4 py-3">
                <Link href={`/admin/events/${e.id}`} className="font-medium hover:underline">{e.title}</Link>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">{e.category} · {e.access === "members" ? "Members" : "Public"} {e.isSample && <SampleTag />}</div>
              </td>
              <td className="px-4 py-3 text-muted">{formatDate(e.startsAt)}</td>
              <td className="px-4 py-3">{FORMAT_LABEL[e.format]}</td>
              <td className="px-4 py-3"><Badge tone={TONE[e.status]}>{e.status}</Badge></td>
              <td className="px-4 py-3 tabular-nums">{confirmed}{e.capacity ? ` / ${e.capacity}` : ""}{wait > 0 && <span className="text-muted"> (+{wait} waitlist)</span>}</td>
              <td className="px-4 py-3">
                <form action={setEventStatus} className="flex items-center gap-1.5">
                  <input type="hidden" name="id" value={e.id} />
                  {e.status !== "published" && <button name="status" value="published" className="rounded-full border border-line px-2.5 py-1 text-xs hover:border-ink">Publish</button>}
                  {e.status === "published" && <button name="status" value="cancelled" className="rounded-full border border-line px-2.5 py-1 text-xs text-bad hover:border-bad">Cancel</button>}
                  {e.status !== "archived" && <button name="status" value="archived" className="rounded-full border border-line px-2.5 py-1 text-xs hover:border-ink">Archive</button>}
                  <Link href={`/admin/events/${e.id}`} className="rounded-full px-2.5 py-1 text-xs underline">Edit</Link>
                </form>
              </td>
            </tr>
          );
        })}
      </Table>
    </div>
  );
}
