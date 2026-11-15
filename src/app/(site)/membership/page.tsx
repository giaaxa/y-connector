import { ArrowRight, BadgeCheck, CalendarClock, FileCheck2, GraduationCap, Mail, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { FocusAreas, OfferingsGrid, PrototypeSchedule } from "@/components/membership/offerings";
import { PricingCards } from "@/components/membership/pricing";
import { PageHero } from "@/components/site/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { repo } from "@/lib/data";
import { formatPence } from "@/lib/policy";

export const metadata: Metadata = {
  title: "Membership",
  description: "Y Connector membership: £30/year for Essex students, £40/year for Essex alumni, £50/year for other students and graduates, or £350 for life. Open to under-38s.",
};

export default async function MembershipPage() {
  const s = await repo().getSettings();
  const terms = [
    { icon: CalendarClock, title: "Annual, not monthly", body: `One payment covers 12 months: ${formatPence(s.priceEssexStudentPence)} for Essex students, ${formatPence(s.priceEssexAlumniPence)} for Essex alumni, ${formatPence(s.priceStandardPence)} for everyone else.` },
    { icon: BadgeCheck, title: "Or pay once, for life", body: `Lifetime membership is a single ${formatPence(s.priceLifetimePence)} payment. No renewals, ever. You can upgrade from annual at any time.` },
    { icon: ShieldCheck, title: "Cancel any time", body: "Annual plans renew automatically. Turn off renewal from your billing settings and keep access until the end of the year you've paid for." },
  ];
  const faqs = [
    { q: "Are all events and courses free for members?", a: "Many events and all core learning resources are included in membership. Some special events or future intensive programmes may be priced separately. Each listing clearly says what's included." },
    { q: "How does the prototype programme work?", a: "Over 10 months you get two 2-hour sessions a month: one online and one hybrid in person. You can join with an idea at any stage and work towards a working prototype." },
    { q: "Does membership guarantee funding?", a: "No. Membership gives you access to non-VC seed-corn funding opportunities and a public prototype listing that potential VC investors can see. Each funding opportunity has its own criteria, and Y Connector doesn't pool member money, offer investments or give financial advice." },
    { q: "Who sees my profile if I opt in to talent dissemination?", a: "Industry partners looking for emerging talent. It's off by default; you switch it on or off any time in your profile settings." },
    { q: "Who is eligible?", a: `Anyone under ${s.maxAgeExclusive} who is a current university student or a university graduate.${s.recentAlumniYears > 0 ? ` Graduates must have graduated within the last ${s.recentAlumniYears} years.` : ""} Your price depends on whether you study or studied at the University of Essex.` },
    { q: "Which price do I pay?", a: `${formatPence(s.priceEssexStudentPence)}/year if you're a current University of Essex student, ${formatPence(s.priceEssexAlumniPence)}/year if you're an Essex graduate, and ${formatPence(s.priceStandardPence)}/year for students and graduates of other universities. We confirm your tier when we verify your status.` },
    { q: "How does lifetime membership work?", a: `You pay ${formatPence(s.priceLifetimePence)} once and keep full membership for life, with no renewals. If you're on an annual plan, upgrading cancels your subscription so you're never charged twice.` },
    { q: "Why do you verify eligibility?", a: "Y Connector is built for students and early-career founders. Verification keeps the community focused and trusted. We collect the minimum information needed and delete verification documents after a decision." },
    { q: "When does my access start?", a: "As soon as your eligibility is verified and your payment has been confirmed by our payment provider. Usually within minutes of paying." },
    { q: "What happens if a renewal payment fails?", a: "We'll email you and give you time to update your card. If payment can't be collected, community access pauses until it's resolved." },
    { q: "Is Y Connector an investment platform?", a: "No. Our finance and investment content is educational. We don't offer investments, lending or financial advice." },
  ];
  return (
    <>
      <PageHero
        eyebrow="Membership"
        title={<>Your network. Your skills. <span className="mark">Your next move.</span></>}
        intro="One membership, paid yearly or once for life, gives you the community, the events, the learning and the people to build with."
      >
        <ButtonLink href="/join" size="lg">
          Apply now <ArrowRight className="h-4 w-4" />
        </ButtonLink>
      </PageHero>

      <section className="py-16 sm:py-20">
        <Container>
          <PricingCards settings={s} />
          <div className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-3">
            {terms.map((t) => (
              <div key={t.title} className="bg-white p-7">
                <t.icon className="h-5 w-5" aria-hidden />
                <p className="mt-4 font-semibold">{t.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{t.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-line py-16 sm:py-24" id="programme">
        <Container>
          <SectionHeading
            eyebrow="What membership includes"
            title="Training, building time, advice, and a route to funding and industry."
            intro="Alongside the community, events and learning hub, every member gets the full programme. The core offer is the same at both price tiers."
          />
          <div className="mt-12"><OfferingsGrid detailed /></div>
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
            <PrototypeSchedule />
            <div className="rounded-3xl border border-line p-7 sm:p-10">
              <p className="eyebrow text-muted">AI-FincubeX training focus areas</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Non-degree training delivered in partnership with AI-FincubeX, the AI and FinTech incubator and lab at the University of Essex.
              </p>
              <div className="mt-6"><FocusAreas /></div>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-y border-line bg-mist py-16 sm:py-24" id="eligibility">
        <Container className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Eligibility" title="Who can join?" intro="Y Connector is designed for people at the start of their building journey." />
            <ul className="mt-8 space-y-4">
              {[
                `Under ${s.maxAgeExclusive} years old`,
                "Current university students",
                s.recentAlumniYears > 0 ? `University graduates (within ${s.recentAlumniYears} years of graduating)` : "University graduates",
                "Including young founders and aspiring entrepreneurs who are students or graduates",
              ].map((x) => (
                <li key={x} className="flex gap-3">
                  <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-ink" aria-hidden />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted">
              <strong className="text-ink">Essex Student</strong> and <strong className="text-ink">Essex Alumni</strong> rates apply to current students and graduates of the University of Essex.
            </p>
          </div>
          <div>
            <SectionHeading eyebrow="Verification" title="How we verify, simply and privately." />
            <ol className="mt-8 space-y-5">
              {[
                { icon: Mail, t: "University email", b: "The fastest route: add your .ac.uk address and click the link we send you." },
                { icon: FileCheck2, t: "Or proof of status", b: "Upload a student ID, enrolment letter or degree certificate (PDF/JPG/PNG). Stored privately and deleted after review." },
                { icon: BadgeCheck, t: "Review", b: "Our team confirms your eligibility. You'll see your status (pending, verified, more information required or not approved) in your dashboard." },
              ].map((x, i) => (
                <li key={x.t} className="flex gap-4 rounded-2xl border border-line bg-white p-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sun font-mono text-sm font-semibold">{i + 1}</span>
                  <div>
                    <p className="font-semibold">{x.t}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{x.b}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading eyebrow="FAQ" title="Good questions." />
          <div className="divide-y divide-line border-y border-line">
            {faqs.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-semibold">
                  {f.q}
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line transition group-open:rotate-45 group-open:bg-sun" aria-hidden>+</span>
                </summary>
                <p className="mt-3 max-w-2xl leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
