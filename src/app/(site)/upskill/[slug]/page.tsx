import { ArrowLeft, CheckCircle2, Circle, ExternalLink, FileText, Link2, Lock, PlayCircle, Type } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { Badge, Container, Notice, SampleTag } from "@/components/ui/primitives";
import { RichText } from "@/components/ui/rich-text";
import { toggleLesson } from "@/lib/actions/member";
import { getViewer } from "@/lib/auth";
import { repo } from "@/lib/data";
import type { Lesson } from "@/lib/types";
import { cn } from "@/lib/utils";

type P = Promise<{ slug: string }>;
export async function generateMetadata({ params }: { params: P }): Promise<Metadata> {
  const c = await repo().getCourse((await params).slug);
  return c ? { title: c.title, description: c.summary } : {};
}

const KIND_ICON = { text: Type, video: PlayCircle, pdf: FileText, link: Link2 } as const;

export default async function CoursePage({ params, searchParams }: { params: P; searchParams: Promise<{ lesson?: string }> }) {
  const { slug } = await params;
  const { lesson: lessonParam } = await searchParams;
  const [course, viewer] = await Promise.all([repo().getCourse(slug), getViewer()]);
  if (!course || course.status !== "published") notFound();
  const canLearn = Boolean(viewer?.isActiveMember) && course.access === "included";
  const done = canLearn ? new Set(await repo().listCompletedLessons(viewer!.id)) : new Set<string>();
  const current = canLearn ? (course.lessons.find((l) => l.id === lessonParam) ?? course.lessons[0]) : undefined;
  const completed = course.lessons.filter((l) => done.has(l.id)).length;
  const events = (await repo().listEvents()).filter((e) => course.relatedEventSlugs.includes(e.slug));

  return (
    <Container className="py-10 sm:py-14">
      <Link href="/upskill" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Upskilling hub
      </Link>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Badge tone="sun">{course.category}</Badge>
        <Badge tone="outline">{course.level}</Badge>
        {course.access === "premium" && <Badge tone="dark">Future paid programme</Badge>}
        {course.isSample && <SampleTag label="Example course" />}
      </div>
      <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-[-0.035em] sm:text-5xl">{course.title}</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">{course.summary}</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[320px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          {canLearn && course.lessons.length > 0 && (
            <div className="mb-4">
              <div className="h-2 overflow-hidden rounded-full bg-fog">
                <div className="h-full rounded-full bg-sun" style={{ width: `${(completed / course.lessons.length) * 100}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted">{completed} of {course.lessons.length} lessons complete</p>
            </div>
          )}
          <ol className="divide-y divide-line rounded-2xl border border-line">
            {course.lessons.map((l, i) => {
              const Icon = KIND_ICON[l.kind];
              const active = current?.id === l.id;
              const inner = (
                <>
                  <span className="font-mono text-xs text-subtle">{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex-1 text-sm font-medium">{l.title}</span>
                  {canLearn ? done.has(l.id) ? <CheckCircle2 className="h-4 w-4 text-ok" /> : <Icon className="h-4 w-4 text-subtle" /> : <Lock className="h-3.5 w-3.5 text-subtle" />}
                </>
              );
              return (
                <li key={l.id}>
                  {canLearn ? (
                    <Link href={`?lesson=${l.id}`} scroll={false} className={cn("flex items-center gap-3 px-4 py-3 transition", active ? "bg-sun-soft" : "hover:bg-mist")}>{inner}</Link>
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-3 text-ink/70">{inner}</div>
                  )}
                </li>
              );
            })}
            {course.lessons.length === 0 && <li className="px-4 py-6 text-sm text-muted">Lessons coming soon.</li>}
          </ol>
          {events.length > 0 && (
            <div className="mt-6 rounded-2xl bg-mist p-5">
              <p className="eyebrow text-muted">Practise it live</p>
              {events.map((e) => (
                <Link key={e.id} href={`/events/${e.slug}`} className="mt-3 block font-semibold underline decoration-sun decoration-2 underline-offset-4">{e.title}</Link>
              ))}
            </div>
          )}
        </aside>

        <div className="min-w-0">
          {current ? (
            <LessonView lesson={current} courseSlug={course.slug} done={done.has(current.id)} />
          ) : (
            <div className="rounded-3xl border border-line bg-mist p-10 text-center">
              <Lock className="mx-auto h-8 w-8" />
              <p className="mt-4 text-xl font-bold">{course.access === "premium" ? "Not part of the current membership" : "Lessons are for members"}</p>
              <p className="mx-auto mt-2 max-w-md text-muted">
                {course.access === "premium"
                  ? "This programme is under consideration as a separately priced offering in future. Nothing is on sale yet."
                  : "Active members get full access to every included course, with progress tracking."}
              </p>
              {course.access === "included" && (
                <ButtonLink href={viewer ? "/dashboard" : "/join"} className="mt-6">{viewer ? "Complete your membership" : "Become a member"}</ButtonLink>
              )}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}

function LessonView({ lesson, courseSlug, done }: { lesson: Lesson; courseSlug: string; done: boolean }) {
  return (
    <article className="rounded-3xl border border-line p-6 sm:p-10">
      <p className="eyebrow text-muted">{lesson.kind} · {lesson.minutes} min</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight">{lesson.title}</h2>
      <RichText text={lesson.body} className="mt-6 max-w-2xl text-[17px] text-ink-soft" />
      {lesson.url && (
        <a href={lesson.url} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold hover:border-ink">
          {lesson.kind === "video" ? "Watch video" : lesson.kind === "pdf" ? "Open PDF" : "Open resource"} <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
      <form action={toggleLesson} className="mt-10 border-t border-line pt-6">
        <input type="hidden" name="courseSlug" value={courseSlug} />
        <input type="hidden" name="lessonId" value={lesson.id} />
        <input type="hidden" name="done" value={done ? "0" : "1"} />
        <button className={cn("inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition", done ? "bg-[#eef8f2] text-ok" : "bg-ink text-white hover:bg-ink-soft")}>
          {done ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
          {done ? "Completed. Mark as not done" : "Mark lesson complete"}
        </button>
      </form>
      <Notice tone="neutral" className="mt-6">Learning content is educational and not professional, legal or financial advice.</Notice>
    </article>
  );
}
