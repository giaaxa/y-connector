import { Download } from "lucide-react";
import Link from "next/link";
import { AdminHeader, Stat } from "@/components/admin/stat";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/primitives";
import { requirePermission } from "@/lib/auth";
import { repo } from "@/lib/data";
import { can, formatPence } from "@/lib/policy";
import { formatDate, timeAgo } from "@/lib/utils";

const DAY = 86_400_000;

export default async function AdminOverview() {
  const v = await requirePermission("viewMetrics");
  const r = repo();
  const [profiles, memberships, apps, events, rsvps, posts, startups, ambassadors, contacts, deletions] = await Promise.all([
    r.listProfiles(),
    can(v.roles, "manageMembers") ? r.listMemberships() : Promise.resolve([]),
    can(v.roles, "reviewApplications") ? r.listApplications() : Promise.resolve([]),
    r.listEvents({ includeUnpublished: true }),
    can(v.roles, "manageEvents") ? r.listRsvps() : Promise.resolve([]),
    r.listPosts({ includeRemoved: true, limit: 1000 }),
    can(v.roles, "manageStartups") ? r.listStartups({ approval: "all" }) : Promise.resolve([]),
    can(v.roles, "manageMembers") ? r.listAmbassadorApplications() : Promise.resolve([]),
    can(v.roles, "manageMembers") ? r.listContactMessages() : Promise.resolve([]),
    can(v.roles, "manageMembers") ? r.listDeletionRequests() : Promise.resolve([]),
  ]);
  // Server component rendered per request: "now" is intentionally request-time.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const active = memberships.filter((m) => ["active", "past_due"].includes(m.status) && m.currentPeriodEnd && new Date(m.currentPeriodEnd).getTime() > now);
  const revenue = active.reduce((a, m) => a + m.amountPence, 0);
  const renewingSoon = active.filter((m) => new Date(m.currentPeriodEnd!).getTime() - now < 30 * DAY);
  const cancelling = active.filter((m) => m.cancelAtPeriodEnd).length;
  const pending = apps.filter((a) => a.status === "pending" || a.status === "more_info").length;
  const upcoming = events.filter((e) => e.status === "published" && new Date(e.startsAt).getTime() > now);
  const activeRsvps = rsvps.filter((x) => x.status === "confirmed" && upcoming.some((e) => e.id === x.eventId));
  const posts30 = posts.filter((p) => now - new Date(p.createdAt).getTime() < 30 * DAY).length;
  const referrals = profiles.filter((p) => p.referredBy).length;
  const topReferrers = Object.entries(
    profiles.reduce<Record<string, number>>((acc, p) => (p.referredBy ? { ...acc, [p.referredBy]: (acc[p.referredBy] ?? 0) + 1 } : acc), {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const byStatus = ["pending", "more_info", "verified", "rejected"].map((s) => ({ s, n: apps.filter((a) => a.status === s).length }));
  const maxStatus = Math.max(1, ...byStatus.map((x) => x.n));

  return (
    <div>
      <AdminHeader
        title="Platform overview"
        intro="Membership, events and community health at a glance."
        actions={
          can(v.roles, "exportData") && (
            <>
              <ButtonLink href="/api/admin/export?type=members" variant="outline" size="sm" prefetch={false}><Download className="h-4 w-4" /> Members CSV</ButtonLink>
              <ButtonLink href="/api/admin/export?type=rsvps" variant="outline" size="sm" prefetch={false}><Download className="h-4 w-4" /> RSVPs CSV</ButtonLink>
            </>
          )
        }
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Total accounts" value={profiles.length} sub={`${referrals} via referral`} />
        <Stat label="Active paid memberships" value={active.length} accent sub={`${formatPence(revenue)} annual revenue`} />
        <Stat label="Pending applications" value={pending} sub={<Link href="/admin/applications" className="underline">Review →</Link>} />
        <Stat label="Renewals in 30 days" value={renewingSoon.length} sub={`${cancelling} set to cancel`} />
        <Stat label="Upcoming events" value={upcoming.length} />
        <Stat label="Upcoming registrations" value={activeRsvps.length} />
        <Stat label="New posts (30 days)" value={posts30} sub={`${posts.length} total threads`} />
        <Stat label="Pending startups" value={startups.filter((s) => s.approval === "pending").length} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <p className="font-semibold">Applications by status</p>
          <ul className="mt-5 space-y-3">
            {byStatus.map(({ s, n }) => (
              <li key={s}>
                <div className="flex justify-between text-sm"><span className="capitalize">{s.replace("_", " ")}</span><span className="font-semibold tabular-nums">{n}</span></div>
                <div className="mt-1 h-2 rounded-full bg-fog"><div className="h-full rounded-full bg-ink" style={{ width: `${(n / maxStatus) * 100}%` }} /></div>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-6">
          <p className="font-semibold">Top referrers</p>
          <ul className="mt-4 space-y-2 text-sm">
            {topReferrers.map(([id, n]) => (
              <li key={id} className="flex justify-between"><span>{profiles.find((p) => p.id === id)?.fullName ?? id}</span><span className="font-semibold">{n}</span></li>
            ))}
            {topReferrers.length === 0 && <li className="text-muted">No referrals yet.</li>}
          </ul>
        </Card>
        <Card className="p-6">
          <p className="font-semibold">Upcoming events</p>
          <ul className="mt-4 space-y-3 text-sm">
            {upcoming.slice(0, 5).map((e) => {
              const n = rsvps.filter((x) => x.eventId === e.id && x.status === "confirmed").length;
              return (
                <li key={e.id}>
                  <Link href={`/admin/events/${e.id}`} className="font-medium hover:underline">{e.title}</Link>
                  <p className="text-xs text-muted">{formatDate(e.startsAt)} · {n}{e.capacity ? `/${e.capacity}` : ""} registered</p>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      {can(v.roles, "manageMembers") && (
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Inbox title="Deletion requests" empty="None open." items={deletions.filter((d) => d.status === "open").map((d) => ({ id: d.id, title: profiles.find((p) => p.id === d.userId)?.fullName ?? d.userId, body: d.reason || "No reason given", at: d.createdAt }))} />
          <Inbox title="Ambassador applications" empty="No applications yet." items={ambassadors.map((a) => ({ id: a.id, title: `${a.name} · ${a.location}`, body: `${a.focus} ${a.message}`.trim(), at: a.createdAt }))} />
          <Inbox title="Contact messages" empty="Inbox zero." items={contacts.map((c) => ({ id: c.id, title: `${c.name} · ${c.topic}`, body: c.message, at: c.createdAt }))} />
        </div>
      )}
    </div>
  );
}

function Inbox({ title, items, empty }: { title: string; items: { id: string; title: string; body: string; at: string }[]; empty: string }) {
  return (
    <Card className="p-6">
      <p className="font-semibold">{title} <span className="text-muted">({items.length})</span></p>
      <ul className="mt-4 space-y-4 text-sm">
        {items.slice(0, 5).map((i) => (
          <li key={i.id}>
            <p className="font-medium">{i.title}</p>
            <p className="line-clamp-2 text-muted">{i.body}</p>
            <p className="text-xs text-subtle">{timeAgo(i.at)}</p>
          </li>
        ))}
        {items.length === 0 && <li className="text-muted">{empty}</li>}
      </ul>
    </Card>
  );
}
