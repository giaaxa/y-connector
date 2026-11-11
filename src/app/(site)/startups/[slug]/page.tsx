import { ArrowLeft, ExternalLink, Flag, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StageMeter } from "@/components/startups/startup-card";
import { ButtonLink } from "@/components/ui/button";
import { Badge, Container, SampleTag } from "@/components/ui/primitives";
import { getViewer } from "@/lib/auth";
import { repo } from "@/lib/data";

type P = Promise<{ slug: string }>;
export async function generateMetadata({ params }: { params: P }): Promise<Metadata> {
  const s = await repo().getStartup((await params).slug);
  return s ? { title: s.name, description: s.tagline } : {};
}

export default async function StartupPage({ params }: { params: P }) {
  const [s, viewer] = await Promise.all([repo().getStartup((await params).slug), getViewer()]);
  // Unapproved entries are visible only to their submitter and admins.
  if (!s || (s.approval !== "approved" && s.submittedBy !== viewer?.id && !viewer?.isStaff)) notFound();
  return (
    <Container className="py-10 sm:py-14">
      <Link href="/startups" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"><ArrowLeft className="h-4 w-4" /> Built by the community</Link>
      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="sun">{s.industry}</Badge>
            {s.approval !== "approved" && <Badge tone="warn">Awaiting approval</Badge>}
            {s.isSample && <SampleTag label="Sample concept" />}
          </div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.035em] sm:text-6xl">{s.name}</h1>
          <p className="mt-4 text-xl text-muted">{s.tagline}</p>
          <div className="mt-6"><StageMeter stage={s.stage} /></div>
          <p className="mt-10 max-w-2xl text-lg leading-relaxed text-ink-soft">{s.description}</p>
          {s.milestones.length > 0 && (
            <section className="mt-12">
              <h2 className="eyebrow text-muted">Milestones</h2>
              <ol className="mt-5 space-y-4 border-l-2 border-sun pl-6">
                {s.milestones.map((m) => (
                  <li key={m} className="relative"><span className="absolute top-1.5 -left-[31px] h-3 w-3 rounded-full border-2 border-white bg-ink" />{m}</li>
                ))}
              </ol>
            </section>
          )}
        </div>
        <aside className="space-y-4">
          <div className="rounded-2xl border border-line p-6">
            <p className="flex items-center gap-2 font-semibold"><Users className="h-4 w-4" /> Team needs</p>
            {s.teamNeeds.length ? (
              <div className="mt-3 flex flex-wrap gap-1.5">{s.teamNeeds.map((n) => <Badge key={n}>{n}</Badge>)}</div>
            ) : <p className="mt-2 text-sm text-muted">Not recruiting right now.</p>}
            {s.teamNeeds.length > 0 && <ButtonLink href="/forum/c/co-founders" size="sm" variant="outline" className="mt-5">Discuss in the forum</ButtonLink>}
          </div>
          <div className="rounded-2xl border border-line p-6 text-sm">
            <p className="font-semibold">Founders</p>
            <p className="mt-1 text-muted">{s.founders.length ? s.founders.join(", ") : "Not displayed (names shown only with consent)."}</p>
            <p className="mt-4 font-semibold">Connection to Y Connector</p>
            <p className="mt-1 text-muted">{s.communityConnection || "Member-led project."}</p>
            {s.website && (
              <a href={s.website} target="_blank" rel="noopener noreferrer nofollow" className="mt-4 inline-flex items-center gap-1.5 font-semibold underline decoration-sun decoration-2 underline-offset-4">Website <ExternalLink className="h-3.5 w-3.5" /></a>
            )}
          </div>
          <p className="flex gap-2 text-xs text-muted"><Flag className="h-3.5 w-3.5 shrink-0" /> Listings are member-submitted and approved by admins. Y Connector does not own or invest in listed projects.</p>
        </aside>
      </div>
    </Container>
  );
}
