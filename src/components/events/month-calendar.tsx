import Link from "next/link";
import type { YCEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Compact month grids showing which days have events. */
export function MonthCalendar({ events, months = 3 }: { events: YCEvent[]; months?: number }) {
  const start = new Date();
  start.setUTCDate(1);
  const grids = Array.from({ length: months }, (_, i) => new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1)));
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {grids.map((m) => {
        const year = m.getUTCFullYear();
        const month = m.getUTCMonth();
        const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
        const offset = (m.getUTCDay() + 6) % 7; // Monday-first
        const monthEvents = events.filter((e) => {
          const d = new Date(e.startsAt);
          return d.getUTCFullYear() === year && d.getUTCMonth() === month;
        });
        return (
          <div key={m.toISOString()} className="rounded-2xl border border-line bg-white p-5">
            <p className="font-semibold">{m.toLocaleString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" })}</p>
            <div className="mt-4 grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-subtle">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {Array.from({ length: offset }).map((_, i) => (
                <span key={`o${i}`} />
              ))}
              {Array.from({ length: days }).map((_, i) => {
                const ev = monthEvents.find((e) => new Date(e.startsAt).getUTCDate() === i + 1);
                const cls = cn("flex aspect-square items-center justify-center rounded-lg text-sm", ev ? "bg-sun font-bold hover:bg-ink hover:text-white" : "text-ink/60");
                return ev ? (
                  <Link key={i} href={`/events/${ev.slug}`} className={cls} title={ev.title}>
                    {i + 1}
                  </Link>
                ) : (
                  <span key={i} className={cls}>
                    {i + 1}
                  </span>
                );
              })}
            </div>
            <ul className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
              {monthEvents.length === 0 && <li className="text-muted">No events scheduled yet.</li>}
              {monthEvents.map((e) => (
                <li key={e.id}>
                  <Link href={`/events/${e.slug}`} className="flex gap-3 hover:underline hover:decoration-sun hover:decoration-2">
                    <span className="w-6 shrink-0 font-mono text-subtle">{new Date(e.startsAt).getUTCDate()}</span>
                    <span className="font-medium">{e.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
