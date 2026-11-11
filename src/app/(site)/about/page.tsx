import { ArrowRight, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import { LogoFull } from "@/components/brand/logo";
import { PageHero } from "@/components/site/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Container, Eyebrow, SampleTag, SectionHeading } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "About",
  description: "Y Connector is a grassroots, youth-led community bridging academic learning, practical digital-economy skills and entrepreneurship.",
};

const faqs = [
  {
    q: "What is Y Connector?",
    a: "A grassroots, youth-led community for university students, recent graduates and young founders who want to build: businesses, products, skills and careers in the digital economy. We combine a members-only community platform with monthly in-person and online experiences.",
  },
  {
    q: "Why was it created?",
    a: "Because the gap between what's taught and what's happening is widening. AI, automation and FinTech are reshaping work faster than curricula can change, and the people who benefit first are usually those with existing networks. We wanted a place where ambition and curiosity are the only entry requirements that matter.",
  },
  {
    q: "Who is it for?",
    a: "Current university students, recent graduates and young founders under 38: engineers, marketers, designers, economists, data scientists and anyone with an idea and the drive to learn what it takes to make it real.",
  },
  {
    q: "What are we trying to change?",
    a: "Who gets to take part in building what's next. Entrepreneurship shouldn't be restricted to people with connections, expensive networks or privileged access. We want practical skills, honest advice and meaningful introductions to be available to every ambitious young person.",
  },
  {
    q: "How do we operate?",
    a: "Members fund the community through a modest annual membership. At least one main event runs each month, each built around a principal speaker. Between events, the community lives online in a members-only forum, talent directory and learning hub. Members propose topics, run sessions, and help shape what we become.",
  },
  {
    q: "How is this different from a networking club?",
    a: "Networking clubs collect business cards. We build things. Every part of Y Connector is designed to move people from conversation to collaboration: finding co-founders, learning applied skills, testing ideas in startup labs and showcasing what the community builds.",
  },
];

const governance = [
  { group: "Founding team", note: "The people who started Y Connector and set its direction.", slots: 3 },
  { group: "Operations & team", note: "Running events, membership, community and communications.", slots: 3 },
  { group: "Mentors", note: "Experienced founders and specialists who give their time to members.", slots: 4 },
  { group: "Trustees & advisory panel", note: "Independent oversight of governance, safeguarding and finances.", slots: 3 },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Y Connector"
        title={
          <>
            From learning about the future to <span className="font-serif font-normal italic">participating in its creation.</span>
          </>
        }
        intro="The world is changing. We believe young people should be leading that change, not catching up with it."
        aside={<LogoFull className="ml-auto hidden w-full max-w-sm lg:block" />}
      />

      <section className="py-20 sm:py-24">
        <Container className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading eyebrow="The short version" title="A grassroots community, powered by its members." />
            <p className="mt-6 leading-relaxed text-muted">
              Y Connector bridges three things that are too often kept apart: <strong className="text-ink">academic learning</strong>,{" "}
              <strong className="text-ink">practical digital-economy skills</strong> and{" "}
              <strong className="text-ink">entrepreneurial application</strong>.
            </p>
          </div>
          <dl className="divide-y divide-line border-y border-line">
            {faqs.map((f, i) => (
              <div key={f.q} className="grid gap-3 py-8 sm:grid-cols-[3rem_1fr]">
                <span className="font-mono text-sm text-subtle">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <dt className="text-xl font-bold tracking-tight">{f.q}</dt>
                  <dd className="mt-3 leading-relaxed text-ink-soft">{f.a}</dd>
                </div>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <section className="bg-ink py-20 text-white sm:py-24">
        <Container>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              "From conversations to collaborations.",
              "From ideas to enterprises.",
              "Your network. Your skills. Your next move.",
            ].map((line, i) => (
              <p key={line} className="border-t border-white/15 pt-6 text-2xl font-bold tracking-tight sm:text-3xl">
                <span className="mb-3 block font-mono text-xs text-sun">0{i + 1}</span>
                {line}
              </p>
            ))}
          </div>
        </Container>
      </section>

      {/* Inspiration — no affiliation claimed */}
      <section className="py-20 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow>Inspiration</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">Learning from what&apos;s working.</h2>
            <p className="mt-5 leading-relaxed text-ink-soft">
              Our thinking has been inspired by the kind of work happening at the University of Essex&apos;s Financial
              Technology Essex Centre (FinteX) and its AI-FincubeX initiative: research and activity spanning AI, FinTech,
              digital finance, incubation and close engagement with industry.
            </p>
            <p className="mt-4 leading-relaxed text-ink-soft">
              That combination of rigorous research, applied technology and real-world industry links is exactly the
              bridge we want to make accessible to young people more widely, through a community they own and shape.
            </p>
            <a
              href="https://www.essex.ac.uk/centres-and-institutes/financial-technology-essex/ai-fincubex"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold underline decoration-sun decoration-2 underline-offset-4"
            >
              Read about AI-FincubeX <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <div className="rounded-3xl border border-dashed border-ink/25 bg-mist p-8">
            <p className="eyebrow text-muted">Independence statement</p>
            <p className="mt-4 text-lg leading-relaxed">
              Y Connector is an <strong>independent community initiative</strong> with its own identity. We are not part of,
              affiliated with, or endorsed by the University of Essex, FinteX or AI-FincubeX. Any future partnership will
              only be announced here once formally agreed.
            </p>
          </div>
        </Container>
      </section>

      {/* Team & governance */}
      <section className="border-t border-line bg-mist py-20 sm:py-24" id="team">
        <Container>
          <SectionHeading
            eyebrow="Team & governance"
            title="Run by the community, accountable to it."
            intro="Profiles will be published as roles are confirmed. We don't list anyone without their agreement."
          />
          <div className="mt-12 space-y-12">
            {governance.map((g) => (
              <div key={g.group}>
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
                  <h3 className="text-xl font-bold tracking-tight">{g.group}</h3>
                  <p className="text-sm text-muted">{g.note}</p>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: g.slots }).map((_, i) => (
                    <ProfilePlaceholder key={i} role={g.group} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-14 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/ambassadors">
              Get involved <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/contact" variant="outline">
              Volunteer as a mentor
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}

/** Editable profile slot — replace with real, consented profiles. */
function ProfilePlaceholder({ role }: { role: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-ink/20 font-mono text-xs text-subtle">
        Photo
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-ink/70">Name to be confirmed</p>
        <p className="truncate text-sm text-muted">{role.replace(/s$/, "")} · Role title</p>
        <SampleTag label="Placeholder" className="mt-1.5" />
      </div>
    </div>
  );
}
