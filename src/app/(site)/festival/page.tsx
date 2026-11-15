import { ArrowRight, CalendarDays, MapPin, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import { ButtonLink } from "@/components/ui/button";
import { Checkbox, ChipCheckbox, Field, Input, Textarea } from "@/components/ui/form";
import { Container, Eyebrow, SectionHeading } from "@/components/ui/primitives";
import { registerFestivalInterest } from "@/lib/actions/member";
import { FESTIVAL, festivalWhen, festivalWhere } from "@/lib/festival";

export const metadata: Metadata = {
  title: `${FESTIVAL.name} ${FESTIVAL.edition}`,
  description: `Y Connector's annual ${FESTIVAL.name}: talks, build sprints, a prototype demo showcase and a talent fair where AI, finance and young founders meet.`,
};

export default function FestivalPage() {
  const f = FESTIVAL;
  return (
    <>
      {/* ───── HERO ───── */}
      <section className="relative overflow-hidden bg-ink text-white grain">
        <svg aria-hidden viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 h-full w-full">
          <g fill="none" strokeLinecap="round">
            <ellipse cx="880" cy="330" rx="520" ry="210" stroke="#FFCC00" strokeOpacity="0.55" strokeWidth="2.5" transform="rotate(-18 880 330)" strokeDasharray="900 1400" className="origin-center animate-orbit" style={{ transformBox: "fill-box" }} />
            <ellipse cx="880" cy="330" rx="420" ry="160" stroke="#fff" strokeOpacity="0.08" transform="rotate(-18 880 330)" />
            <ellipse cx="880" cy="330" rx="300" ry="110" stroke="#fff" strokeOpacity="0.06" transform="rotate(-18 880 330)" strokeDasharray="4 8" />
          </g>
        </svg>
        <Container className="relative py-20 sm:py-28 lg:py-32">
          <p className="eyebrow inline-flex items-center gap-2 text-sun animate-rise">
            <Sparkles className="h-3.5 w-3.5" /> Annual flagship · Edition {f.edition}
          </p>
          <h1 className="mt-6 max-w-5xl text-[clamp(3rem,9vw,8rem)] leading-[0.88] font-extrabold tracking-[-0.05em] uppercase animate-rise" style={{ animationDelay: "80ms" }}>
            AI <span className="text-sun">FinTech</span>
            <br />
            Festival
          </h1>
          <p className="mt-8 max-w-2xl text-xl leading-relaxed text-white/75 animate-rise" style={{ animationDelay: "160ms" }}>
            {f.tagline} Talks, build sprints, a prototype demo showcase and a talent fair, all in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 animate-rise" style={{ animationDelay: "220ms" }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm">
              <CalendarDays className="h-4 w-4 text-sun" /> {festivalWhen()}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm">
              <MapPin className="h-4 w-4 text-sun" /> {festivalWhere()}
            </span>
          </div>
          <div className="mt-10 flex flex-col gap-3 animate-rise sm:flex-row" style={{ animationDelay: "300ms" }}>
            {f.ticketsOpen ? (
              <ButtonLink href="/events?category=Festival" size="lg">Get tickets <ArrowRight className="h-4 w-4" /></ButtonLink>
            ) : (
              <ButtonLink href="#interest" size="lg">Register your interest <ArrowRight className="h-4 w-4" /></ButtonLink>
            )}
            <ButtonLink href="#interest" variant="outline" size="lg" className="border-white/20 bg-transparent text-white hover:border-white hover:bg-white/5">
              Speak, demo or partner
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* ───── WHY ───── */}
      <section className="py-20 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <Eyebrow>Why a festival</Eyebrow>
            <h2 className="mt-4 text-4xl font-bold tracking-[-0.035em] text-balance sm:text-5xl">
              A year of building, <span className="font-serif font-normal italic">celebrated</span> in one weekend.
            </h2>
          </div>
          <div className="space-y-5 text-lg leading-relaxed text-ink-soft">
            <p>
              Every month, Y Connector members learn, meet and build. Once a year we bring it all together: the community,
              the prototypes, and the industry, investors and specialists shaping AI and finance.
            </p>
            <p className="border-l-2 border-sun pl-5 font-medium text-ink">
              The festival is where members who&apos;ve spent the year in the prototype development programme show what
              they&apos;ve built.
            </p>
          </div>
        </Container>
      </section>

      {/* ───── TRACKS ───── */}
      <section className="border-y border-line bg-mist py-20 sm:py-24">
        <Container>
          <SectionHeading eyebrow="Programme tracks" title="Six tracks across AI and finance." intro="The full programme and speakers will be announced as they're confirmed." />
          <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {f.tracks.map((t, i) => (
              <div key={t.title} className="group bg-white p-7 transition hover:bg-ink">
                <span className="font-mono text-xs text-subtle group-hover:text-sun">Track 0{i + 1}</span>
                <h3 className="mt-5 text-xl font-bold tracking-tight group-hover:text-white">{t.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted group-hover:text-white/65">{t.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ───── FORMATS ───── */}
      <section className="py-20 sm:py-24">
        <Container>
          <SectionHeading eyebrow="What happens" title="More than a conference." />
          <ol className="mt-12 grid grid-cols-1 gap-x-10 gap-y-2 md:grid-cols-2">
            {f.formats.map((x, i) => (
              <li key={x.title} className="flex gap-5 border-t border-line py-6">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sun font-mono text-sm font-semibold">{i + 1}</span>
                <div>
                  <p className="text-lg font-bold tracking-tight">{x.title}</p>
                  <p className="mt-1 text-muted">{x.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ───── WHO ───── */}
      <section className="bg-ink py-20 text-white sm:py-24">
        <Container className="grid gap-10 md:grid-cols-4">
          {[
            ["Students & graduates", "Learn, build and meet the people shaping the industry."],
            ["Founders", "Demo your prototype and meet collaborators and investors."],
            ["Industry", "Find emerging AI and FinTech talent and fresh ideas."],
            ["Investors & partners", "See early-stage prototypes from the community first."],
          ].map(([t, b]) => (
            <div key={t} className="border-t border-white/15 pt-6">
              <p className="text-xl font-bold tracking-tight">{t}</p>
              <p className="mt-2 text-sm text-white/65">{b}</p>
            </div>
          ))}
        </Container>
      </section>

      {/* ───── REGISTER INTEREST ───── */}
      <section className="py-20 sm:py-24" id="interest">
        <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHeading
              eyebrow="Register your interest"
              title="Be first to hear when tickets open."
              intro="Tell us how you'd like to take part. We'll email you when dates, speakers and tickets are announced."
            />
            <dl className="mt-10 space-y-4 text-sm">
              <div className="flex gap-3"><dt className="w-28 shrink-0 text-muted">When</dt><dd className="font-medium">{festivalWhen()}</dd></div>
              <div className="flex gap-3"><dt className="w-28 shrink-0 text-muted">Where</dt><dd className="font-medium">{festivalWhere()}</dd></div>
              <div className="flex gap-3"><dt className="w-28 shrink-0 text-muted">Tickets</dt><dd className="font-medium">Details, including any member benefits, to be announced</dd></div>
            </dl>
            <p className="mt-8 rounded-2xl bg-sun-soft p-5 text-sm">
              <strong>Want to sponsor the festival?</strong> Recruiters, investors, industry leaders and funders can sponsor from £500.{" "}
              <Link href="/sponsors" className="font-semibold underline">See sponsorship →</Link>
            </p>
          </div>
          <div className="rounded-3xl border border-line p-6 sm:p-10">
            <ActionForm action={registerFestivalInterest} submitLabel="Register interest" pendingLabel="Registering…">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Name" htmlFor="fx-name" required><Input id="fx-name" name="name" autoComplete="name" required /></Field>
                <Field label="Email" htmlFor="fx-email" required><Input id="fx-email" name="email" type="email" autoComplete="email" required /></Field>
              </div>
              <Field label="Organisation or university" htmlFor="fx-org"><Input id="fx-org" name="organisation" /></Field>
              <div>
                <p className="mb-3 text-sm font-medium">I&apos;d like to…</p>
                <div className="flex flex-wrap gap-2">
                  {f.interestRoles.map((r) => <ChipCheckbox key={r} name="roles" value={r} />)}
                </div>
              </div>
              <Field label="Anything we should know?" htmlFor="fx-msg" hint="e.g. a talk idea, the prototype you'd demo, or partnership interest"><Textarea id="fx-msg" name="message" rows={4} /></Field>
              <Checkbox name="consent" required label="I agree to Y Connector emailing me about the festival and using these details as described in the privacy policy." />
            </ActionForm>
          </div>
        </Container>
      </section>
    </>
  );
}
