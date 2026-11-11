import Link from "next/link";
import { AdminHeader } from "@/components/admin/stat";
import { Badge, Card, EmptyState, SampleTag } from "@/components/ui/primitives";
import { setStartupApproval } from "@/lib/actions/admin";
import { requirePermission } from "@/lib/auth";
import { repo } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function StartupsAdminPage() {
  await requirePermission("manageStartups");
  const all = await repo().listStartups({ approval: "all" });
  const submitters = await repo().getProfiles(all.map((s) => s.submittedBy).filter((x): x is string => Boolean(x)));
  const order = { pending: 0, approved: 1, rejected: 2 };
  return (
    <div>
      <AdminHeader title="Startup portfolio" intro="Approve member submissions before they appear publicly. Never describe projects as owned, funded or incubated by Y Connector unless that's formally true." />
      <div className="space-y-3">
        {[...all].sort((a, b) => order[a.approval] - order[b.approval]).map((s) => (
          <Card key={s.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/startups/${s.slug}`} className="font-semibold hover:underline">{s.name}</Link>
                <Badge tone={s.approval === "approved" ? "ok" : s.approval === "pending" ? "warn" : "bad"}>{s.approval}</Badge>
                {s.isSample && <SampleTag />}
              </div>
              <p className="mt-1 text-sm text-muted">{s.tagline}</p>
              <p className="mt-1 text-xs text-subtle">
                {s.submittedBy ? `Submitted by ${submitters.find((p) => p.id === s.submittedBy)?.fullName ?? "member"}` : "Added by admins"} · {formatDate(s.createdAt)} · founders shown: {s.founders.length ? s.founders.join(", ") : "none"}
              </p>
            </div>
            <form action={setStartupApproval} className="flex gap-2">
              <input type="hidden" name="slug" value={s.slug} />
              {s.approval !== "approved" && <button name="approval" value="approved" className="rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-white">Approve</button>}
              {s.approval !== "rejected" && <button name="approval" value="rejected" className="rounded-full border border-line px-3 py-1.5 text-xs font-medium">Reject</button>}
              {s.approval !== "pending" && <button name="approval" value="pending" className="rounded-full px-3 py-1.5 text-xs text-muted underline">Back to pending</button>}
            </form>
          </Card>
        ))}
        {all.length === 0 && <EmptyState title="No submissions yet" />}
      </div>
    </div>
  );
}
