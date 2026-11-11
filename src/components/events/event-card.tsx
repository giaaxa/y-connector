import { ArrowRight, Lock, MapPin, Mic, Users } from "lucide-react";
import Link from "next/link";
import { Badge, SampleTag } from "@/components/ui/primitives";
import type { YCEvent } from "@/lib/types";
import { cn, dateParts, FORMAT_LABEL, formatTime } from "@/lib/utils";

export function EventCard({ event, taken, className }: { event: YCEvent; taken?: number; className?: string }) {
  const d = dateParts(event.startsAt);
  const past = new Date(event.endsAt) < new Date();
  const full = event.capacity !== null && taken !== undefined && taken >= event.capacity;
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition duration-300 hover:-translate-y-1 hover:border-ink/40 hover:shadow-[0_18px_40px_-24px_rgb(0_0_0/0.35)]",
        className,
      )}
    >
      <div className="flex items-start gap-4 p-5 pb-0">
        <div className="flex w-14 shrink-0 flex-col items-center rounded-xl bg-ink py-2 text-white">
          <span className="font-mono text-[10px] tracking-widest text-sun">{d.month}</span>
          <span className="text-2xl leading-none font-bold">{d.day}</span>
          <span className="mt-0.5 text-[10px] text-white/60">{d.weekday}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone="sun">{event.category}</Badge>
            <Badge tone="outline">{FORMAT_LABEL[event.format]}</Badge>
            {event.access === "members" && (
              <Badge tone="neutral">
                <Lock className="h-3 w-3" /> Members
              </Badge>
            )}
            {event.status === "cancelled" && <Badge tone="bad">Cancelled</Badge>}
          </div>
          <h3 className="mt-2.5 text-lg leading-snug font-semibold tracking-tight text-balance">
            <Link href={`/events/${event.slug}`} className="after:absolute after:inset-0">
              {event.title}
            </Link>
          </h3>
        </div>
      </div>
      <p className="px-5 pt-3 text-sm leading-relaxed text-muted">{event.summary}</p>
      <dl className="mt-auto space-y-1.5 px-5 pt-4 text-[13px] text-ink-soft">
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-subtle" aria-hidden />
          <dt className="sr-only">Location</dt>
          <dd>
            {event.location} · {formatTime(event.startsAt)}
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <Mic className="h-3.5 w-3.5 text-subtle" aria-hidden />
          <dt className="sr-only">Speaker</dt>
          <dd className="truncate">{event.speaker ? event.speaker.name : "Community-led session"}</dd>
        </div>
        {event.capacity && (
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-subtle" aria-hidden />
            <dt className="sr-only">Capacity</dt>
            <dd>{taken !== undefined ? `${Math.max(0, event.capacity - taken)} of ${event.capacity} places left` : `${event.capacity} places`}</dd>
          </div>
        )}
      </dl>
      <div className="mt-4 flex items-center justify-between border-t border-line px-5 py-3.5">
        {event.isSample ? <SampleTag label="Example event" /> : <span />}
        <span className="relative z-10 inline-flex items-center gap-1 text-sm font-semibold transition group-hover:gap-2">
          {past ? "View recap" : event.status === "cancelled" ? "Details" : full ? "Join waitlist" : "RSVP"}
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </article>
  );
}
