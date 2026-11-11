import { ArrowLeft, CalendarPlus, Clock, Lock, MapPin, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RsvpForm } from "@/components/events/rsvp-form";
import { ButtonLink } from "@/components/ui/button";
import { Avatar, Badge, Container, Notice, SampleTag } from "@/components/ui/primitives";
import { cancelRsvp } from "@/lib/actions/member";
import { getViewer } from "@/lib/auth";
import { repo } from "@/lib/data";
import { cn, dateParts, FORMAT_LABEL, formatDate, formatTime } from "@/lib/utils";

type P = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: P }): Promise<Metadata> {
  const e = await repo().getEventBySlug((await params).slug);
  return e ? { title: e.title, description: e.summary } : { title: "Event not found" };
}

export default async function EventDetailPage({ params }: { params: P }) {
  const { slug } = await params;
  const r = repo();
  const [event, viewer] = await Promise.all([r.getEventBySlug(slug), getViewer()]);
  if (!event || event.status === "draft") notFound();

  const taken = (await r.confirmedCounts([event.id]))[event.id] ?? 0;
  const mine = viewer ? (await r.listUserRsvps(viewer.id)).find((x) => x.eventId === event.id) : undefined;
  const past = new Date(event.startsAt) < new Date();
  const full = event.capacity !== null && taken >= event.capacity;
  const membersOnly = event.access === "members";
  const d = dateParts(event.startsAt);

  return (
    <article>
      <header className="relative overflow-hidden border-b border-line bg-mist">
        <div aria-hidden className="absolute inset-0 dot-grid opacity-60 [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
        <Container className="relative py-12 sm:py-16">
          <Link href="/events" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> All events
          </Link>
          <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-start">
            <div className="flex w-24 shrink-0 flex-col items-center rounded-2xl bg-ink py-4 text-white">
              <span className="font-mono text-xs tracking-widest text-sun">{d.month}</span>
              <span className="text-5xl leading-none font-bold">{d.day}</span>
              <span className="mt-1 text-xs text-white/60">{d.weekday}</span>
            </div>
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge tone="sun">{event.category}</Badge>
                <Badge tone="outline">{FORMAT_LABEL[event.format]}</Badge>
                {membersOnly && <Badge><Lock className="h-3 w-3" /> Members only</Badge>}
                {event.status === "cancelled" && <Badge tone="bad">Cancelled</Badge>}
                {event.isSample && <SampleTag label="Example event" />}
              </div>
              <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-[-0.035em] text-balance sm:text-5xl">{event.title}</h1>
              <p className="mt-4 max-w-2xl text-lg text-muted">{event.summary}</p>
            </div>
          </div>
        </Container>
      </header>

      <Container className="grid gap-12 py-12 lg:grid-cols-[1fr_380px] lg:py-16">
        <div className="min-w-0">
          <h2 className="eyebrow text-muted">About this event</h2>
          <div className="prose-yc mt-4 max-w-2xl text-[17px] text-ink-soft">
            {event.description.split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <section className="mt-12" aria-labelledby="speaker-h">
            <h2 id="speaker-h" className="eyebrow text-muted">{event.speaker ? "Principal speaker" : "Format"}</h2>
            {event.speaker ? (
              <div className="mt-4 flex gap-5 rounded-2xl border border-line p-6">
                <Avatar name={event.speaker.name.startsWith("Principal") ? "TBC" : event.speaker.name} size={64} />
                <div>
                  <p className="text-lg font-bold">{event.speaker.name}</p>
                  <p className="text-sm text-muted">{event.speaker.title}</p>
                  <p className="mt-3 leading-relaxed text-ink-soft">{event.speaker.bio}</p>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-ink-soft">A hands-on, community-led session. No single speaker, everyone builds together.</p>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-line bg-white p-6 shadow-[0_24px_50px_-30px_rgb(0_0_0/0.25)]">
            <dl className="space-y-3 text-sm">
              <Row icon={<Clock className="h-4 w-4" />} label="When">
                {formatDate(event.startsAt, { weekday: "long" })}
                <br />
                <span className="text-muted">{formatTime(event.startsAt)}–{formatTime(event.endsAt)} (UK time)</span>
              </Row>
              <Row icon={<MapPin className="h-4 w-4" />} label="Where">{event.location}</Row>
              {event.capacity && (
                <Row icon={<Users className="h-4 w-4" />} label="Capacity">
                  {full ? "Fully booked — waitlist open" : `${event.capacity - taken} of ${event.capacity} places left`}
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-fog">
                    <div className="h-full rounded-full bg-sun" style={{ width: `${Math.min(100, (taken / event.capacity) * 100)}%` }} />
                  </div>
                </Row>
              )}
            </dl>
            {event.priceNote && <p className="mt-4 rounded-xl bg-mist px-3 py-2 text-xs text-muted">{event.priceNote}</p>}

            <div className="mt-6 border-t border-line pt-6">
              {event.status === "cancelled" ? (
                <Notice tone="bad" title="This event has been cancelled">Registered attendees have been notified.</Notice>
              ) : past ? (
                <p className="text-sm text-muted">This event has taken place. Recaps are shared in the members&apos; forum.</p>
              ) : mine ? (
                <div className="space-y-4">
                  <Notice tone="ok" title={mine.status === "waitlist" ? "You're on the waitlist" : "You're registered"}>
                    We&apos;ll send reminders to {mine.email}.
                  </Notice>
                  <div className="flex gap-2">
                    <ButtonLink href={`/events/${event.slug}/ics`} variant="outline" size="sm" prefetch={false}>
                      <CalendarPlus className="h-4 w-4" /> Add to calendar
                    </ButtonLink>
                    <form action={cancelRsvp}>
                      <input type="hidden" name="rsvpId" value={mine.id} />
                      <button className="h-9 rounded-full px-4 text-sm font-medium text-bad hover:bg-[#fdf1f0]">Cancel booking</button>
                    </form>
                  </div>
                </div>
              ) : membersOnly && !viewer?.isActiveMember ? (
                <div className="space-y-3">
                  <p className="text-sm text-ink-soft">This event is for active Y Connector members.</p>
                  <ButtonLink href={viewer ? "/dashboard" : "/join"} className="w-full">{viewer ? "Complete your membership" : "Become a member"}</ButtonLink>
                  {!viewer && (
                    <ButtonLink href={`/login?next=/events/${event.slug}`} variant="outline" className="w-full">Log in</ButtonLink>
                  )}
                </div>
              ) : (
                <RsvpForm eventId={event.id} signedIn={Boolean(viewer)} full={full} />
              )}
            </div>
          </div>
          {!past && event.status !== "cancelled" && (
            <Link href={`/events/${event.slug}/ics`} prefetch={false} className={cn("mt-4 flex items-center justify-center gap-1.5 text-sm text-muted hover:text-ink", mine && "hidden")}>
              <CalendarPlus className="h-4 w-4" /> Add to calendar
            </Link>
          )}
        </aside>
      </Container>
    </article>
  );
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-subtle" aria-hidden>{icon}</span>
      <div className="flex-1">
        <dt className="sr-only">{label}</dt>
        <dd>{children}</dd>
      </div>
    </div>
  );
}
