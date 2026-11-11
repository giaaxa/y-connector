import type { Metadata } from "next";
import Link from "next/link";
import { CourseCard } from "@/components/learning/course-card";
import { PageHero } from "@/components/site/page-hero";
import { Container, Notice } from "@/components/ui/primitives";
import { getViewer } from "@/lib/auth";
import { repo } from "@/lib/data";
import { COURSE_CATEGORIES } from "@/lib/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Upskill",
  description: "Practical learning in AI, building with AI, digital marketing, FinTech, markets and entrepreneurship.",
};

const blurbs: Record<string, string> = {
  "AI Fundamentals": "Understanding modern AI, LLMs and practical applications.",
  "Building With AI": "Automation, AI agents, no-code tools and rapid prototyping.",
  "Digital Marketing": "Growth strategy, analytics, social content, SEO and AI-assisted marketing.",
  "FinTech & Digital Payments": "Digital financial infrastructure, payment systems, digital money and innovation.",
  "Understanding Markets": "Market structures, business models, economic shifts and funding.",
  Entrepreneurship: "Validation, MVP development, product-market fit, pitches and startup operations.",
};

export default async function UpskillPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const [courses, viewer] = await Promise.all([repo().listCourses(), getViewer()]);
  const done = viewer?.isActiveMember ? new Set(await repo().listCompletedLessons(viewer.id)) : null;
  const shown = courses.filter((c) => !category || c.category === category);
  const included = shown.filter((c) => c.access === "included");
  const premium = shown.filter((c) => c.access === "premium");
  const pct = (lessonIds: string[]) => (done && lessonIds.length ? Math.round((lessonIds.filter((l) => done.has(l)).length / lessonIds.length) * 100) : undefined);

  return (
    <>
      <PageHero
        eyebrow="Upskilling hub"
        title={<>Practical skills for the <span className="mark">digital economy.</span></>}
        intro="Short, applied courses and workshops that get you building, linked directly to our monthly events so you can learn, then practise in the room."
      />
      <section className="border-b border-line">
        <Container className="grid gap-px py-0 sm:grid-cols-2 lg:grid-cols-3">
          {COURSE_CATEGORIES.map((c, i) => (
            <Link key={c} href={category === c ? "/upskill" : `/upskill?category=${encodeURIComponent(c)}`} className={cn("group border-line p-6 transition sm:border-r", i < 3 && "border-b", category === c ? "bg-sun" : "hover:bg-mist")}>
              <p className="font-mono text-xs text-subtle">0{i + 1}</p>
              <p className="mt-2 text-lg font-bold tracking-tight">{c}</p>
              <p className="mt-1 text-sm text-muted">{blurbs[c]}</p>
            </Link>
          ))}
        </Container>
      </section>
      <section className="py-14 sm:py-20">
        <Container>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-2xl font-bold tracking-tight">{category ?? "All courses"} <span className="text-muted">· included with membership</span></h2>
            {category && <Link href="/upskill" className="text-sm underline">Clear filter</Link>}
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {included.map((c) => (
              <CourseCard key={c.id} course={c} progress={pct(c.lessons.map((l) => l.id))} />
            ))}
          </div>
          {premium.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold tracking-tight">Future programmes</h2>
              <Notice tone="neutral" className="mt-4 max-w-3xl">
                These are possible intensive programmes that may be offered separately in future. They are <strong>not</strong> part of the current annual membership, and no pricing has been set.
              </Notice>
              <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {premium.map((c) => (
                  <CourseCard key={c.id} course={c} />
                ))}
              </div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
