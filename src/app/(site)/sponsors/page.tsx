import { ArrowRight, Mail } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/page-hero";
import { ActionForm } from "@/components/ui/action-form";
import { ButtonLink } from "@/components/ui/button";
import { Checkbox, ChipCheckbox, Field, Input, Textarea } from "@/components/ui/form";
import { Container, Notice, SectionHeading } from "@/components/ui/primitives";
import { sponsorEnquiry } from "@/lib/actions/member";
import { siteConfig } from "@/lib/config";
import { SPONSOR_MIN_POUNDS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Sponsor Y Connector",
  description: `Recruiters, investors, industry leaders and funders: sponsor the next generation of AI and FinTech builders. Sponsorships from £${SPONSOR_MIN_POUNDS}.`,
};

const AUDIENCES = [
  {
    title: "Recruiters",
    body: "Meet emerging AI, data, engineering and FinTech talent before anyone else.",
    gets: ["Introductions to members who opt in to industry talent sharing", "A presence at the AI FinTech Festival talent fair", "Host a recruiting session or challenge"],
  },
  {
    title: "Investors & VCs",
    body: "Get early sight of the prototypes our members build through the year.",
    gets: ["Front-row seats at the Prototype Demo Showcase", "Briefings on the public prototype listing", "Meet founders directly, on your own terms"],
  },
  {
    title: "Industry leaders",
    body: "Shape the skills, ideas and people your industry will need next.",
    gets: ["Speak at a monthly event or the festival", "Mentor members and set real-world briefs", "Co-design workshops and training content"],
  },
  {
    title: "Funders",
    body: "Put money where it changes trajectories: into young builders.",
    gets: ["Fund prototype programme places for members", "Back seed-corn awards and prizes", "Support events, training and the festival"],
  },
];

const SUPPORTS = ["AI FinTech Festival", "Prototype development programme", "Monthly events", "Seed-corn awards & prizes", "Training & workshops", "Talent fair", "Member scholarships"];
const TYPES = ["Recruiter", "Investor / VC", "Industry leader", "Funder", "Other"];

export default function SponsorsPage() {
  return (
    <>
      <PageHero
        eyebrow="Sponsorship"
        title={<>Back the next generation of <span className="mark">builders.</span></>}
        intro="Recruiters, investors, industry leaders and funders sponsor Y Connector to reach, develop and back ambitious young people building in AI and FinTech."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="#enquire" size="lg">Become a sponsor <ArrowRight className="h-4 w-4" /></ButtonLink>
          <ButtonLink href="/contact" variant="outline" size="lg">Contact us</ButtonLink>
        </div>
        <p className="mt-5 text-sm text-muted">Sponsorships start from <strong className="text-ink">£{SPONSOR_MIN_POUNDS}</strong>. Every package is shaped with you.</p>
      </PageHero>

      {/* ───── Who sponsors: editorial list, no cards ───── */}
      <section className="py-20 sm:py-28">
        <Container className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading eyebrow="Who sponsors" title="Four ways to get involved." intro="Whether you want to hire, invest, lead or fund, there's a sponsorship that fits." />
          </div>
          <ol className="border-b border-ink">
            {AUDIENCES.map((a, i) => (
              <li key={a.title} className="group grid gap-x-8 gap-y-3 border-t border-ink py-9 sm:grid-cols-[3.5rem_1fr]">
                <span className="font-mono text-sm text-subtle transition group-hover:text-ink">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
                    <span className="bg-[linear-gradient(transparent_62%,var(--color-sun)_62%)] bg-[length:0%_100%] bg-no-repeat transition-[background-size] duration-500 group-hover:bg-[length:100%_100%]">
                      {a.title}
                    </span>
                  </h3>
                  <p className="mt-3 max-w-xl text-lg text-ink-soft">{a.body}</p>
                  <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
                    {a.gets.map((g, j) => (
                      <span key={g}>
                        {g}
                        {j < a.gets.length - 1 && <span className="mx-2 text-sun" aria-hidden>/</span>}
                      </span>
                    ))}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ───── What it funds + minimum ───── */}
      <section className="bg-ink py-20 text-white sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <p className="eyebrow text-sun">Where your support goes</p>
            <h2 className="mt-4 text-4xl font-bold tracking-[-0.035em] sm:text-5xl">Straight into what members build.</h2>
            <ul className="mt-8 flex flex-wrap gap-2">
              {SUPPORTS.map((s) => <li key={s} className="rounded-full border border-white/15 px-3.5 py-1.5 text-sm text-white/85">{s}</li>)}
            </ul>
          </div>
          <div className="rounded-3xl bg-sun p-8 text-ink sm:p-10">
            <p className="eyebrow text-ink/70">Sponsorship from</p>
            <p className="mt-3 text-7xl font-extrabold tracking-[-0.05em]">£{SPONSOR_MIN_POUNDS}</p>
            <p className="mt-3 text-lg font-medium text-ink/80">Any amount from £{SPONSOR_MIN_POUNDS} up. We&apos;ll shape a package around your goals and budget, from a single event to a year-round partnership.</p>
            <ol className="mt-8 space-y-3 text-sm">
              {["Tell us what you'd like to achieve", "We design a package with you", "Agreement and invoice", "Recognition, and an impact report"].map((s, i) => (
                <li key={s} className="flex items-center gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink font-mono text-xs text-sun">{i + 1}</span>{s}</li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {/* ───── Enquiry form ───── */}
      <section className="py-20 sm:py-24" id="enquire">
        <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHeading eyebrow="Contact us to sponsor" title="Let's talk about what you'd like to back." intro="Tell us a little about you. Our partnerships team will come back to you within a few working days." />
            <p className="mt-8 flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4" /> Prefer email?{" "}
              <a href={`mailto:${siteConfig.contactEmail}?subject=Sponsorship`} className="font-semibold underline decoration-sun decoration-2 underline-offset-4">{siteConfig.contactEmail}</a>
            </p>
            <Notice tone="neutral" className="mt-8">
              Sponsorship supports Y Connector&apos;s programmes. It isn&apos;t an investment in Y Connector or its members. Investors who want to back a member&apos;s project deal directly with that founder. Sponsors don&apos;t receive members&apos; personal data unless members have opted in.
            </Notice>
          </div>
          <div className="rounded-3xl border border-line p-6 sm:p-10">
            <ActionForm action={sponsorEnquiry} submitLabel="Send sponsorship enquiry" pendingLabel="Sending…">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Name" htmlFor="sp-name" required><Input id="sp-name" name="name" autoComplete="name" required /></Field>
                <Field label="Work email" htmlFor="sp-email" required><Input id="sp-email" name="email" type="email" autoComplete="email" required /></Field>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Organisation" htmlFor="sp-org" required><Input id="sp-org" name="organisation" autoComplete="organization" required /></Field>
                <Field label="Indicative amount (£)" htmlFor="sp-amount" required hint={`From £${SPONSOR_MIN_POUNDS}`}>
                  <Input id="sp-amount" name="amount" type="number" inputMode="numeric" min={SPONSOR_MIN_POUNDS} step={50} placeholder={String(SPONSOR_MIN_POUNDS)} required />
                </Field>
              </div>
              <div>
                <p className="mb-3 text-sm font-medium">I&apos;m a…</p>
                <div className="flex flex-wrap gap-2">{TYPES.map((t) => <ChipCheckbox key={t} name="sponsorType" value={t} />)}</div>
              </div>
              <div>
                <p className="mb-3 text-sm font-medium">I&apos;d like to support</p>
                <div className="flex flex-wrap gap-2">{SUPPORTS.map((t) => <ChipCheckbox key={t} name="supports" value={t} />)}</div>
              </div>
              <Field label="Anything else?" htmlFor="sp-msg"><Textarea id="sp-msg" name="message" rows={4} /></Field>
              <Checkbox name="consent" required label={<>I agree to Y Connector contacting me about sponsorship, as described in the <Link href="/legal/privacy" className="underline">privacy policy</Link>.</>} />
            </ActionForm>
          </div>
        </Container>
      </section>
    </>
  );
}
