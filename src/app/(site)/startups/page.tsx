import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/page-hero";
import { STAGES, StartupCard } from "@/components/startups/startup-card";
import { ButtonLink } from "@/components/ui/button";
import { Container, EmptyState, Notice } from "@/components/ui/primitives";
import { repo } from "@/lib/data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Built by the Community",
  description: "Businesses, experiments and technology projects from the Y Connector community.",
};

const THEMES = [
  "AI-powered startups",
  "Digital marketing tools",
  "Peer-to-peer platforms",
  "Credit and microfinance innovation",
  "Digital payments",
  "Digital twins of payment ecosystems",
  "Data and automation products",
];

export default async function StartupsPage({ searchParams }: { searchParams: Promise<{ stage?: string; theme?: string }> }) {
  const sp = await searchParams;
  const all = await repo().listStartups();
  const list = all.filter((s) => (!sp.stage || s.stage === sp.stage) && (!sp.theme || s.themes.includes(sp.theme)));
  const q = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams(Object.entries({ ...sp, ...patch }).filter(([, v]) => v) as [string, string][]);
    return `/startups${p.size ? `?${p}` : ""}`;
  };
  return (
    <>
      <PageHero
        eyebrow="Startups & projects"
        title={<span className="uppercase">Built by the community.</span>}
        intro="A growing showcase of businesses, experiments and technology projects started or supported by Y Connector members, from first idea to growing company."
      >
        <ButtonLink href="/projects" variant="dark">Submit your project <ArrowRight className="h-4 w-4" /></ButtonLink>
      </PageHero>
      <section className="py-12 sm:py-16">
        <Container>
          <Notice tone="neutral" className="max-w-3xl">
            Projects listed here are led by members. Unless explicitly stated, Y Connector does not own, invest in or formally incubate them. Cards marked “Sample concept” are illustrations, not real companies.
          </Notice>
          <div className="mt-8 flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <Chip href={q({ stage: undefined })} active={!sp.stage}>All stages</Chip>
              {STAGES.map((s) => <Chip key={s} href={q({ stage: s })} active={sp.stage === s}><span className="capitalize">{s}</span></Chip>)}
            </div>
            <div className="-mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
              <Chip href={q({ theme: undefined })} active={!sp.theme}>All themes</Chip>
              {THEMES.map((t) => <Chip key={t} href={q({ theme: t })} active={sp.theme === t}>{t}</Chip>)}
            </div>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {list.map((s, i) => <StartupCard key={s.id} s={s} featured={i === 0 && !sp.stage && !sp.theme} />)}
          </div>
          {list.length === 0 && <EmptyState title="Nothing here yet" body="Be the first to put a project in this category." action={<ButtonLink href="/projects" size="sm">Submit a project</ButtonLink>} />}
        </Container>
      </section>
    </>
  );
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={cn("shrink-0 rounded-full border px-3.5 py-1.5 text-sm whitespace-nowrap transition", active ? "border-ink bg-ink text-white" : "border-line hover:border-ink")}>
      {children}
    </Link>
  );
}
