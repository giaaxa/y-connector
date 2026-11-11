import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { SampleTag } from "@/components/ui/primitives";
import type { Startup } from "@/lib/types";
import { cn } from "@/lib/utils";

export const STAGES = ["exploring", "building", "pilot", "launched", "growing"] as const;

export function StageMeter({ stage, dark = false }: { stage: Startup["stage"]; dark?: boolean }) {
  const idx = STAGES.indexOf(stage);
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1" aria-hidden>
        {STAGES.map((s, i) => (
          <span key={s} className={cn("h-1.5 w-5 rounded-full", i <= idx ? "bg-sun" : dark ? "bg-white/15" : "bg-fog")} />
        ))}
      </div>
      <span className={cn("text-xs font-medium capitalize", dark ? "text-white/70" : "text-muted")}>{stage}</span>
    </div>
  );
}

export function StartupCard({ s, featured = false }: { s: Startup; featured?: boolean }) {
  return (
    <Link
      href={`/startups/${s.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border p-7 transition hover:-translate-y-0.5",
        featured ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink/40",
      )}
    >
      <div className="flex items-start justify-between">
        <span className={cn("flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-extrabold", featured ? "bg-sun text-ink" : "bg-ink text-sun")}>
          {s.name.charAt(0)}
        </span>
        <ArrowUpRight className={cn("h-5 w-5 transition group-hover:rotate-45", featured ? "text-sun" : "text-subtle")} />
      </div>
      <p className={cn("mt-6 eyebrow", featured ? "text-white/50" : "text-muted")}>{s.industry}</p>
      <h3 className="mt-2 text-2xl font-bold tracking-tight">{s.name}</h3>
      <p className={cn("mt-2 leading-relaxed", featured ? "text-white/70" : "text-muted")}>{s.tagline}</p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-8">
        <StageMeter stage={s.stage} dark={featured} />
        {s.isSample && <SampleTag label="Sample concept" className={featured ? "border-white/30 text-white/50" : ""} />}
      </div>
    </Link>
  );
}
