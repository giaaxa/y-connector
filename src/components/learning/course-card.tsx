import { ArrowUpRight, Clock, Lock } from "lucide-react";
import Link from "next/link";
import { Badge, SampleTag } from "@/components/ui/primitives";
import type { Course } from "@/lib/types";

export function CourseCard({ course, progress }: { course: Course; progress?: number }) {
  const minutes = course.lessons.reduce((a, l) => a + l.minutes, 0);
  const premium = course.access === "premium";
  return (
    <Link href={`/upskill/${course.slug}`} className="group relative flex flex-col rounded-2xl border border-line bg-white p-6 transition hover:-translate-y-0.5 hover:border-ink/40">
      <div className="flex items-center justify-between gap-2">
        <span className="eyebrow text-muted">{course.category}</span>
        <ArrowUpRight className="h-4 w-4 text-subtle transition group-hover:text-ink" />
      </div>
      <h3 className="mt-4 text-xl leading-snug font-bold tracking-tight">{course.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{course.summary}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {course.skills.map((s) => (
          <span key={s} className="rounded-md bg-fog px-2 py-0.5 text-xs">{s}</span>
        ))}
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-6 text-xs text-muted">
        {premium ? <Badge tone="dark"><Lock className="h-3 w-3" /> Future paid programme</Badge> : <Badge tone="sun">Included with membership</Badge>}
        <span>{course.level}</span>
        {minutes > 0 && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {minutes} min</span>}
        {course.isSample && <SampleTag />}
      </div>
      {progress !== undefined && course.lessons.length > 0 && (
        <div className="mt-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-fog">
            <div className="h-full rounded-full bg-sun transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-muted">{progress}% complete</p>
        </div>
      )}
    </Link>
  );
}
