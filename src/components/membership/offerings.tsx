import { ArrowUpRight, Briefcase, Coins, GraduationCap, Hammer, Megaphone, MessagesSquare } from "lucide-react";
import Link from "next/link";
import { FINCUBEX_FOCUS_AREAS, OFFERINGS, PROTOTYPE_PROGRAMME, type OfferingIcon } from "@/lib/offerings";

const ICONS: Record<OfferingIcon, typeof GraduationCap> = {
  training: GraduationCap,
  prototype: Hammer,
  advice: MessagesSquare,
  funding: Coins,
  showcase: Megaphone,
  talent: Briefcase,
};

/** Grid of the programme offerings included in membership. */
export function OfferingsGrid({ detailed = false }: { detailed?: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
      {OFFERINGS.map((o, i) => {
        const Icon = ICONS[o.icon];
        const body = (
          <>
            <div className="flex items-start justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sun-soft transition group-hover:bg-sun">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="font-mono text-xs text-subtle">0{i + 1}</span>
            </div>
            <h3 className="mt-6 text-lg leading-snug font-bold tracking-tight">{o.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{o.summary}</p>
            {detailed && <p className="mt-3 text-sm leading-relaxed text-ink-soft">{o.detail}</p>}
            {o.href && (
              <span className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-semibold">
                Learn more <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            )}
          </>
        );
        return o.href ? (
          <Link key={o.id} href={o.href} className="group flex flex-col bg-white p-7 transition hover:bg-mist">
            {body}
          </Link>
        ) : (
          <div key={o.id} className="group flex flex-col bg-white p-7">
            {body}
          </div>
        );
      })}
    </div>
  );
}

/** The 10-month prototype programme rhythm, shown as a month-by-month strip. */
export function PrototypeSchedule() {
  const p = PROTOTYPE_PROGRAMME;
  return (
    <div className="rounded-3xl bg-ink p-7 text-white sm:p-10">
      <p className="eyebrow text-sun">Prototype development programme</p>
      <h3 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
        {p.months} months. {p.months * p.sessionsPerMonth} sessions. One working prototype.
      </h3>
      <p className="mt-3 max-w-2xl text-white/70">
        Every month you get {p.sessionsPerMonth} two-hour sessions: one {p.formats[0].toLowerCase()} and one {p.formats[1].toLowerCase()}. Kick the tyres on your idea, then build it step by step with people who&apos;ve done it before.
      </p>
      <ol className="mt-8 grid grid-cols-5 gap-2 sm:grid-cols-10" aria-label={`${p.months}-month schedule`}>
        {Array.from({ length: p.months }).map((_, i) => (
          <li key={i} className="rounded-xl bg-white/5 p-2 text-center">
            <span className="block font-mono text-[10px] text-white/50">M{i + 1}</span>
            <span className="mt-1.5 flex justify-center gap-1" aria-label="One online and one hybrid session">
              <span className="h-2 w-2 rounded-full bg-white/70" title="Online" />
              <span className="h-2 w-2 rounded-full bg-sun" title="Hybrid in person" />
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-white/60">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-white/70" /> Online · 2 hours</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sun" /> Hybrid, in person · 2 hours</span>
      </p>
    </div>
  );
}

export function FocusAreas() {
  return (
    <ul className="flex flex-wrap gap-2">
      {FINCUBEX_FOCUS_AREAS.map((f) => (
        <li key={f} className="rounded-full border border-line bg-white px-3.5 py-1.5 text-sm">{f}</li>
      ))}
    </ul>
  );
}
