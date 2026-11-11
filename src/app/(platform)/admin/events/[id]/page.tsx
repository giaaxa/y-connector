import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader, Table } from "@/components/admin/stat";
import { EventForm } from "@/components/admin/event-form";
import { Badge, Card } from "@/components/ui/primitives";
import { setRsvpStatus } from "@/lib/actions/admin";
import { requirePermission } from "@/lib/auth";
import { repo } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("manageEvents");
  const { id } = await params;
  const r = repo();
  const event = await r.getEventById(id);
  if (!event) notFound();
  const rsvps = await r.listRsvps(id);
  return (
    <div className="space-y-10">
      <div className="max-w-3xl">
        <AdminHeader title={`Edit: ${event.title}`} actions={<Link href={`/events/${event.slug}`} className="text-sm underline">View public page</Link>} />
        <Card className="p-6 sm:p-8"><EventForm event={event} /></Card>
      </div>
      <section>
        <h2 className="mb-4 text-xl font-bold">Registrations ({rsvps.filter((x) => x.status === "confirmed").length} confirmed)</h2>
        <Table head={["Name", "Email", "Status", "Registered", "Change"]}>
          {rsvps.map((x) => (
            <tr key={x.id}>
              <td className="px-4 py-3 font-medium">{x.name}{!x.userId && <span className="ml-1 text-xs text-muted">(guest)</span>}</td>
              <td className="px-4 py-3 text-muted">{x.email}</td>
              <td className="px-4 py-3"><Badge tone={x.status === "confirmed" ? "ok" : x.status === "waitlist" ? "warn" : "neutral"}>{x.status}</Badge></td>
              <td className="px-4 py-3 text-muted">{formatDate(x.createdAt)}</td>
              <td className="px-4 py-3">
                <form action={setRsvpStatus} className="flex gap-1">
                  <input type="hidden" name="id" value={x.id} />
                  {(["confirmed", "waitlist", "cancelled"] as const).filter((s) => s !== x.status).map((s) => (
                    <button key={s} name="status" value={s} className="rounded-full border border-line px-2.5 py-1 text-xs capitalize hover:border-ink">{s === "confirmed" ? "Confirm" : s}</button>
                  ))}
                </form>
              </td>
            </tr>
          ))}
          {rsvps.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-muted">No registrations yet.</td></tr>}
        </Table>
      </section>
    </div>
  );
}
