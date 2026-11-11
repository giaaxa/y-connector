import { ArrowRight, ArrowUpRight, Check, CreditCard, Hourglass, MessageSquare, Rocket, X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CourseCard } from "@/components/learning/course-card";
import { ResendUniEmail } from "@/components/platform/resend-uni-email";
import { Button, ButtonLink } from "@/components/ui/button";
import { Avatar, Badge, Card, EmptyState, Notice } from "@/components/ui/primitives";
import { startCheckout } from "@/lib/actions/billing";
import { respondCollab } from "@/lib/actions/member";
import { requireViewer } from "@/lib/auth";
import { isDemoMode, isStripeConfigured } from "@/lib/config";
import { repo } from "@/lib/data";
import { formatPence, tierLabel, tierPricePence } from "@/lib/policy";
import type { Viewer } from "@/lib/types";
import { cn, dateParts, formatDate, formatTime, timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

type SP = Promise<Record<string, string | undefined>>;

export default async function DashboardPage({ searchParams }: { searchParams: SP }) {
  const v = await requireViewer();
  const sp = await searchParams;
  return (
    <div className="space-y-6">
      <Notices sp={sp} />
      {v.isActiveMember ? <MemberHub v={v} /> : <ApplicantJourney v={v} sp={sp} />}
    </div>
  );
}

function Notices({ sp }: { sp: Record<string, string | undefined> }) {
  return (
    <>
      {sp.gate === "members" && <Notice title="That area is for active members">Complete verification and activate your membership to unlock the community.</Notice>}
      {sp.gate === "forbidden" && <Notice tone="bad">You don&apos;t have permission to view that page.</Notice>}
      {sp.submitted && <Notice tone="ok" title="Application received">We&apos;ve emailed you a confirmation. We&apos;ll review your eligibility shortly.</Notice>}
      {sp.uniEmail === "verified" && <Notice tone="ok">University email confirmed. Thanks!</Notice>}
      {sp.uniEmail === "invalid" && <Notice tone="bad">That verification link is invalid or has expired.</Notice>}
      {sp.checkout === "success" && (
        <Notice tone="ok" title="Payment received by Stripe">
          We&apos;re confirming it now. Your membership activates as soon as Stripe notifies us (usually within a minute). Refresh this page shortly.
        </Notice>
      )}
      {sp.checkout === "cancelled" && <Notice tone="neutral">Checkout cancelled. You haven&apos;t been charged.</Notice>}
      {sp.billing === "not-configured" && <Notice tone="neutral" title="Payments aren't connected yet">Stripe hasn&apos;t been configured for this environment, so membership can&apos;t be purchased.</Notice>}
    </>
  );
}

/* ════════════ APPLICANT ════════════ */
async function ApplicantJourney({ v, sp }: { v: Viewer; sp: Record<string, string | undefined> }) {
  const a = v.application;
  const settings = await repo().getSettings();
  if (!a) {
    return (
      <EmptyState
        title="You haven't applied yet"
        body="Tell us a little about yourself so we can verify your eligibility."
        action={<ButtonLink href="/join">Start your application</ButtonLink>}
      />
    );
  }
  const paidPending = sp.checkout === "success";
  const steps = [
    { label: "Applied", state: "done" as const, note: formatDate(a.submittedAt) },
    {
      label: "Eligibility",
      state: a.status === "verified" ? "done" : a.status === "rejected" ? "fail" : ("current" as const),
      note: { pending: "Under review", verified: "Verified", rejected: "Not approved", more_info: "More info needed" }[a.status],
    },
    { label: "Membership", state: a.status === "verified" ? ("current" as const) : ("todo" as const), note: paidPending ? "Confirming payment" : "Annual payment" },
    { label: "Connect & build", state: "todo" as const, note: "Full access" },
  ];
  const price = tierPricePence(a.tier, settings);
  return (
    <>
      <div>
        <p className="eyebrow text-muted">Your application</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">Hi {v.profile.fullName.split(" ")[0]}, here&apos;s where you are.</h1>
      </div>
      <Card className="p-6 sm:p-8">
        <ol className="grid gap-6 sm:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.label} className="relative">
              <div className="flex items-center gap-3 sm:flex-col sm:items-start">
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                    s.state === "done" && "bg-ink text-sun",
                    s.state === "current" && "bg-sun ring-4 ring-sun/30",
                    s.state === "fail" && "bg-bad text-white",
                    s.state === "todo" && "bg-fog text-muted",
                  )}
                >
                  {s.state === "done" ? <Check className="h-4 w-4" /> : s.state === "fail" ? <X className="h-4 w-4" /> : i + 1}
                </span>
                <div>
                  <p className="font-semibold">{s.label}</p>
                  <p className="text-sm text-muted">{s.note}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      {a.status === "pending" && (
        <Card className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:p-8">
          <div className="flex gap-4">
            <Hourglass className="mt-1 h-6 w-6 shrink-0" />
            <div>
              <p className="text-lg font-bold">We&apos;re reviewing your eligibility</p>
              <p className="mt-1 text-muted">
                {a.universityEmail
                  ? a.universityEmailVerified
                    ? "Your university email is confirmed, which speeds things up."
                    : `Confirm ${a.universityEmail} using the link we sent to speed things up.`
                  : a.proofPath
                    ? "We've received your proof of status."
                    : "Add a university email or proof of status if you haven't already."}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {a.universityEmail && !a.universityEmailVerified && <ResendUniEmail />}
            <ButtonLink href="/join" variant="ghost" size="sm">Edit application</ButtonLink>
          </div>
        </Card>
      )}
      {a.status === "more_info" && (
        <Notice title="We need a bit more information">
          {a.reviewerNote || "Please update your application with additional proof of status."}{" "}
          <Link href="/join" className="font-semibold underline">Update application →</Link>
        </Notice>
      )}
      {a.status === "rejected" && (
        <Notice tone="bad" title="We couldn't approve your application">
          {a.reviewerNote || "Your application doesn't meet the current eligibility criteria."} If you think this is a mistake, <Link href="/contact" className="underline">contact us</Link>.
        </Notice>
      )}
      {a.status === "verified" && (
        <Card className="overflow-hidden">
          <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <Badge tone="ok"><Check className="h-3 w-3" /> Eligibility verified</Badge>
              <p className="mt-4 text-2xl font-bold tracking-tight">Activate your annual membership</p>
              <p className="mt-1 text-muted">
                {tierLabel(a.tier)} · <strong className="text-ink">{formatPence(price)} per year</strong>. Renews annually, cancel any time.
              </p>
              {v.membership?.status === "past_due" && <p className="mt-2 text-sm text-warn">Your last payment failed. Update your card in billing.</p>}
            </div>
            <div className="space-y-2">
              {isStripeConfigured ? (
                <form action={startCheckout}>
                  <Button size="lg" className="w-full"><CreditCard className="h-4 w-4" /> Pay securely with Stripe</Button>
                </form>
              ) : (
                <>
                  <Button size="lg" disabled className="w-full"><CreditCard className="h-4 w-4" /> Pay with Stripe</Button>
                  <p className="max-w-60 text-xs text-muted">{isDemoMode ? "Preview mode: payments aren't connected, so membership can't be activated here." : "Stripe isn't configured yet."}</p>
                </>
              )}
            </div>
          </div>
          <div className="border-t border-line bg-mist px-6 py-3 text-xs text-muted sm:px-8">Your access activates once Stripe confirms the payment to us. You won&apos;t be charged twice.</div>
        </Card>
      )}
      <Card className="p-6">
        <p className="font-semibold">While you wait</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <ButtonLink href="/events" variant="outline" size="sm">Browse public events</ButtonLink>
          <ButtonLink href="/upskill" variant="outline" size="sm">See the learning hub</ButtonLink>
          <ButtonLink href="/account" variant="outline" size="sm">Set up your profile</ButtonLink>
        </div>
      </Card>
    </>
  );
}

/* ════════════ ACTIVE MEMBER ════════════ */
async function MemberHub({ v }: { v: Viewer }) {
  const r = repo();
  const now = new Date().toISOString();
  const [events, rsvps, posts, profiles, courses, done, startups, myStartups, collabs, cats] = await Promise.all([
    r.listEvents(),
    r.listUserRsvps(v.id),
    r.listPosts({ sort: "new", limit: 5 }),
    r.searchDirectory({}),
    r.listCourses(),
    r.listCompletedLessons(v.id),
    r.listStartups(),
    r.listStartups({ approval: "all", submittedBy: v.id }),
    r.listCollabRequests(v.id),
    r.listCategories(),
  ]);
  const upcoming = events.filter((e) => e.startsAt > now && e.status === "published");
  const myEventIds = new Set(rsvps.map((x) => x.eventId));
  const myEvents = upcoming.filter((e) => myEventIds.has(e.id));
  const nextEvent = myEvents[0] ?? upcoming[0];
  const authors = await r.getProfiles([...new Set(posts.map((p) => p.authorId))]);
  const mine = new Set([...v.profile.skills, ...v.profile.interests]);
  const recommended = profiles
    .filter((p) => p.id !== v.id)
    .map((p) => ({ p, score: [...p.skills, ...p.interests].filter((x) => mine.has(x)).length + (p.lookingForCollaborators ? 1 : 0) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  const doneSet = new Set(done);
  const featured =
    courses
      .filter((c) => c.access === "included" && c.lessons.length)
      .map((c) => ({ c, pct: Math.round((c.lessons.filter((l) => doneSet.has(l.id)).length / c.lessons.length) * 100) }))
      .filter((x) => x.pct < 100)
      .sort((a, b) => b.pct - a.pct)[0] ?? null;
  const opportunities = startups.filter((s) => s.teamNeeds.length).slice(0, 3);
  const incoming = collabs.filter((c) => c.toId === v.id && c.status === "pending");
  const incomingProfiles = await r.getProfiles(incoming.map((c) => c.fromId));
  const m = v.membership;

  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow text-muted">{formatDate(now, { weekday: "long" })}</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
            Welcome back, <span className="mark">{v.profile.fullName.split(" ")[0]}</span>.
          </h1>
          <p className="mt-2 text-muted">Here&apos;s what&apos;s happening in your community.</p>
        </div>
        <ButtonLink href="/forum/new">Start a discussion <ArrowRight className="h-4 w-4" /></ButtonLink>
      </div>

      {incoming.length > 0 && (
        <Card className="border-sun bg-sun-soft p-5">
          <p className="font-semibold">{incoming.length} collaboration request{incoming.length > 1 ? "s" : ""}</p>
          {incoming.map((c) => {
            const from = incomingProfiles.find((p) => p.id === c.fromId);
            return (
              <div key={c.id} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Avatar name={from?.fullName ?? "Member"} size={36} />
                <p className="flex-1 text-sm"><Link href={`/members/${c.fromId}`} className="font-semibold underline">{from?.fullName}</Link>: “{c.message}”</p>
                <form action={respondCollab} className="flex gap-2">
                  <input type="hidden" name="id" value={c.id} />
                  <Button name="decision" value="accept" size="sm" variant="dark">Accept &amp; share email</Button>
                  <Button name="decision" value="decline" size="sm" variant="ghost">Decline</Button>
                </form>
              </div>
            );
          })}
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Next event */}
        <Card className="relative overflow-hidden bg-ink p-6 text-white lg:col-span-2">
          <div aria-hidden className="absolute -right-16 -bottom-24 h-64 w-64 rounded-full border border-sun/30" />
          <p className="eyebrow text-sun">{nextEvent && myEventIds.has(nextEvent.id) ? "Your next event" : "Next up"}</p>
          {nextEvent ? (
            <div className="relative mt-4 flex gap-5">
              <div className="flex w-16 shrink-0 flex-col items-center rounded-xl bg-white/10 py-2">
                <span className="font-mono text-[10px] text-sun">{dateParts(nextEvent.startsAt).month}</span>
                <span className="text-2xl font-bold">{dateParts(nextEvent.startsAt).day}</span>
              </div>
              <div>
                <p className="text-xl font-bold">{nextEvent.title}</p>
                <p className="mt-1 text-sm text-white/60">{formatTime(nextEvent.startsAt)} · {nextEvent.location}</p>
                <ButtonLink href={`/events/${nextEvent.slug}`} size="sm" className="mt-4">
                  {myEventIds.has(nextEvent.id) ? "View booking" : "Reserve a place"} <ArrowUpRight className="h-4 w-4" />
                </ButtonLink>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-white/60">New events are announced every month.</p>
          )}
        </Card>

        {/* Membership */}
        <Card className="p-6">
          <p className="eyebrow text-muted">Membership</p>
          <p className="mt-3 flex items-center gap-2 text-lg font-bold">
            <span className={cn("h-2 w-2 rounded-full", m?.status === "past_due" ? "bg-warn" : "bg-ok")} />
            {v.isStaff && !m ? "Staff access" : m?.status === "past_due" ? "Payment overdue" : "Active"}
          </p>
          {m && (
            <p className="mt-1 text-sm text-muted">
              {tierLabel(m.tier)} · {m.cancelAtPeriodEnd ? "ends" : "renews"} {m.currentPeriodEnd ? formatDate(m.currentPeriodEnd) : "—"}
            </p>
          )}
          <ButtonLink href="/account/billing" variant="link" size="sm" className="mt-4">Manage billing</ButtonLink>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* New discussions */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <p className="font-semibold">New discussions</p>
            <Link href="/forum" className="text-sm text-muted hover:text-ink">View forum →</Link>
          </div>
          <ul className="divide-y divide-line">
            {posts.map((p) => (
              <li key={p.id}>
                <Link href={`/forum/post/${p.id}`} className="flex items-start gap-4 px-6 py-4 transition hover:bg-mist">
                  <Avatar name={authors.find((a) => a.id === p.authorId)?.fullName ?? "?"} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.title}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {cats.find((c) => c.slug === p.categorySlug)?.name} · {timeAgo(p.createdAt)} · <MessageSquare className="inline h-3 w-3" /> {p.replyCount}
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">▲ {p.score}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        {/* Recommended connections */}
        <Card className="p-6">
          <p className="font-semibold">People you should meet</p>
          <ul className="mt-4 space-y-4">
            {recommended.map(({ p }) => (
              <li key={p.id}>
                <Link href={`/members/${p.id}`} className="group flex items-center gap-3">
                  <Avatar name={p.fullName} size={40} />
                  <div className="min-w-0">
                    <p className="font-medium group-hover:underline">{p.fullName}</p>
                    <p className="truncate text-xs text-muted">{p.headline}</p>
                  </div>
                </Link>
              </li>
            ))}
            {recommended.length === 0 && <li className="text-sm text-muted">Add skills to your profile to get recommendations.</li>}
          </ul>
          <ButtonLink href="/directory" variant="link" size="sm" className="mt-4">Browse the directory</ButtonLink>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div>
          <p className="mb-3 font-semibold">Continue learning</p>
          {featured ? <CourseCard course={featured.c} progress={featured.pct} /> : <EmptyState title="All caught up" body="New courses are added regularly." />}
        </div>
        <Card className="p-6">
          <p className="font-semibold">Founder opportunities</p>
          <ul className="mt-4 space-y-4">
            {opportunities.map((s) => (
              <li key={s.id}>
                <Link href={`/startups/${s.slug}`} className="group block">
                  <p className="font-medium group-hover:underline">{s.name}</p>
                  <p className="text-xs text-muted">Looking for: {s.teamNeeds.join(", ")}</p>
                </Link>
              </li>
            ))}
          </ul>
          <ButtonLink href="/forum/c/co-founders" variant="link" size="sm" className="mt-4">Co-founder board</ButtonLink>
        </Card>
        <Card className="p-6">
          <p className="font-semibold">My registrations</p>
          <ul className="mt-4 space-y-3 text-sm">
            {myEvents.map((e) => (
              <li key={e.id} className="flex justify-between gap-3">
                <Link href={`/events/${e.slug}`} className="font-medium hover:underline">{e.title}</Link>
                <span className="shrink-0 text-muted">{formatDate(e.startsAt, { year: undefined })}</span>
              </li>
            ))}
            {myEvents.length === 0 && <li className="text-muted">No upcoming bookings.</li>}
          </ul>
          <p className="mt-6 font-semibold">My projects</p>
          <ul className="mt-3 space-y-2 text-sm">
            {myStartups.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2">
                <Link href={`/startups/${s.slug}`} className="hover:underline">{s.name}</Link>
                <Badge tone={s.approval === "approved" ? "ok" : s.approval === "pending" ? "warn" : "bad"}>{s.approval}</Badge>
              </li>
            ))}
            {myStartups.length === 0 && (
              <li><Link href="/projects" className="inline-flex items-center gap-1.5 text-muted hover:text-ink"><Rocket className="h-3.5 w-3.5" /> Add a project</Link></li>
            )}
          </ul>
        </Card>
      </div>
    </>
  );
}
