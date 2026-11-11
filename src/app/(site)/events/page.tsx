import { CalendarDays, LayoutGrid } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EventCard } from "@/components/events/event-card";
import { MonthCalendar } from "@/components/events/month-calendar";
import { PageHero } from "@/components/site/page-hero";
import { Container, EmptyState } from "@/components/ui/primitives";
import { repo } from "@/lib/data";
import { EVENT_CATEGORIES } from "@/lib/types";
import { cn, FORMAT_LABEL } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Events",
  description: "Monthly founder conversations, AI workshops, FinTech sessions, startup labs and networking from Y Connector.",
};

type SP = Promise<{ when?: string; category?: string; format?: string; view?: string }>;

export default async function EventsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const when = sp.when === "past" ? "past" : "upcoming";
  const view = sp.view === "calendar" ? "calendar" : "cards";
  const r = repo();
  const now = new Date().toISOString();
  const all = await r.listEvents();
  const scoped = all
    .filter((e) => (when === "past" ? e.endsAt < now : e.endsAt >= now))
    .filter((e) => !sp.category || e.category === sp.category)
    // Hybrid events match both the online and in-person filters.
    .filter((e) => !sp.format || (sp.format === "online" ? e.format !== "in_person" : e.format !== "online"));
  const events = when === "past" ? scoped.reverse() : scoped;
  const counts = await r.confirmedCounts(events.map((e) => e.id));

  const href = (patch: Record<string, string | undefined>) => {
    const q = new URLSearchParams();
    const merged = { when, category: sp.category, format: sp.format, view, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v && !(k === "when" && v === "upcoming") && !(k === "view" && v === "cards")) q.set(k, v);
    const s = q.toString();
    return `/events${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <PageHero
        eyebrow="Events & conversations"
        title={<>At least one main event, <span className="mark">every month.</span></>}
        intro="Founder conversations, AI workshops, FinTech sessions, masterclasses, startup labs and meetups. Each main event features one principal speaker and plenty of room to connect."
      />
      <section className="py-12 sm:py-16">
        <Container>
          <div className="flex flex-col gap-5 border-b border-line pb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="inline-flex rounded-full bg-fog p-1" role="tablist" aria-label="Time">
                {(["upcoming", "past"] as const).map((w) => (
                  <Link key={w} href={href({ when: w })} role="tab" aria-selected={when === w} className={cn("rounded-full px-4 py-1.5 text-sm font-medium capitalize transition", when === w ? "bg-white shadow-sm" : "text-muted hover:text-ink")}>
                    {w}
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Link href={href({ view: "cards" })} aria-label="Card view" aria-pressed={view === "cards"} className={cn("rounded-full p-2", view === "cards" ? "bg-ink text-white" : "hover:bg-fog")}>
                  <LayoutGrid className="h-4 w-4" />
                </Link>
                <Link href={href({ view: "calendar" })} aria-label="Calendar view" aria-pressed={view === "calendar"} className={cn("rounded-full p-2", view === "calendar" ? "bg-ink text-white" : "hover:bg-fog")}>
                  <CalendarDays className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
              <FilterChip href={href({ category: undefined })} active={!sp.category}>All topics</FilterChip>
              {EVENT_CATEGORIES.map((c) => (
                <FilterChip key={c} href={href({ category: c })} active={sp.category === c}>{c}</FilterChip>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <FilterChip href={href({ format: undefined })} active={!sp.format}>Any format</FilterChip>
              <FilterChip href={href({ format: "in_person" })} active={sp.format === "in_person"}>{FORMAT_LABEL.in_person} &amp; hybrid</FilterChip>
              <FilterChip href={href({ format: "online" })} active={sp.format === "online"}>{FORMAT_LABEL.online} &amp; hybrid</FilterChip>
            </div>
          </div>

          <div className="mt-10">
            {events.length === 0 ? (
              <EmptyState title="No events match those filters" body="Try another topic or format, or check back soon. New events are added every month." icon={<CalendarDays className="h-8 w-8" />} />
            ) : view === "calendar" && when === "upcoming" ? (
              <MonthCalendar events={events} />
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {events.map((e) => (
                  <EventCard key={e.id} event={e} taken={counts[e.id]} />
                ))}
              </div>
            )}
          </div>
          <p className="mt-8 text-xs text-muted">
            Events marked “Example event” illustrate the programme and will be replaced by confirmed events. We only name speakers who have agreed to appear.
          </p>
        </Container>
      </section>
    </>
  );
}

function FilterChip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn("shrink-0 rounded-full border px-3.5 py-1.5 text-sm whitespace-nowrap transition", active ? "border-ink bg-ink text-white" : "border-line hover:border-ink")}
    >
      {children}
    </Link>
  );
}
