import {
  ArrowRight,
  ArrowUpRight,
  BookOpenCheck,
  CalendarDays,
  Handshake,
  LineChart,
  Rocket,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { EventCard } from "@/components/events/event-card";
import { PostPreview } from "@/components/forum/post-preview";
import { Constellation } from "@/components/home/constellation";
import { PricingCards } from "@/components/membership/pricing";
import { ButtonLink } from "@/components/ui/button";
import { Container, Eyebrow, SampleTag, SectionHeading } from "@/components/ui/primitives";
import { repo } from "@/lib/data";
import { getPublicPreviewThreads, getUpcomingEvents } from "@/lib/queries";

export default async function HomePage() {
  const [events, threads, settings] = await Promise.all([
    getUpcomingEvents(3),
    getPublicPreviewThreads(5),
    repo().getSettings(),
  ]);

  return (
    <>
      <Hero />
      <Marquee />
      <WhyWeExist />
      <Ecosystem />
      <HowItWorks />

      {/* ───────── 05 MONTHLY EXPERIENCES ───────── */}
      <section className="bg-mist py-20 sm:py-28" aria-labelledby="events-heading">
        <Container>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              eyebrow="05 — Monthly experiences"
              title={<span id="events-heading">One room. The right people. Every month.</span>}
              intro="Workshops, founder conversations and industry sessions, each built around one principal speaker and plenty of time to talk."
            />
            <ButtonLink href="/events" variant="outline" className="shrink-0">
              All events <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {events.map(({ event, taken }) => (
              <EventCard key={event.id} event={event} taken={taken} />
            ))}
          </div>
          {events.some((e) => e.event.isSample) && (
            <p className="mt-6 text-xs text-muted">
              Events marked “Example event” are illustrative. Confirmed dates, venues and speakers will be announced here.
            </p>
          )}
        </Container>
      </section>

      {/* ───────── 06 COMMUNITY PREVIEW ───────── */}
      <section className="relative overflow-hidden bg-ink py-24 text-white sm:py-32 grain" aria-labelledby="community-heading">
        <div aria-hidden className="pointer-events-none absolute -top-40 -right-40 h-[36rem] w-[36rem] rounded-full border border-sun/20" />
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 h-[28rem] w-[28rem] rounded-full border border-white/5" />
        <Container className="relative grid items-center gap-14 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <Eyebrow className="text-white/50">06 — The community</Eyebrow>
            <h2 id="community-heading" className="mt-4 text-4xl font-bold tracking-[-0.03em] text-balance sm:text-6xl">
              Great ideas begin with <span className="font-serif font-normal italic text-sun">better conversations.</span>
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-white/70">
              A members-only forum to ask honest questions, find collaborators, share what you&apos;re building and learn
              from people a few steps ahead.
            </p>
            <ul className="mt-8 grid max-w-md grid-cols-2 gap-x-6 gap-y-3 text-sm text-white/80">
              {["Upvote what helps", "Find a co-founder", "Ask a mentor", "Share your build"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-sun" /> {t}
                </li>
              ))}
            </ul>
            <ButtonLink href="/join" className="mt-10" size="lg">
              Join the Conversation <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
          <div className="relative">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-2 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sun animate-pulse-dot" /> Community feed
                </div>
                <div className="flex gap-1 text-xs text-white/50">
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-white">Popular</span>
                  <span className="px-2.5 py-1">New</span>
                  <span className="px-2.5 py-1">Active</span>
                </div>
              </div>
              <div className="divide-y divide-white/5">
                {threads.map((t) => (
                  <PostPreview key={t.id} dark title={t.title} category={t.category} author={t.author} score={t.score} replies={t.replies} createdAt={t.createdAt} />
                ))}
              </div>
            </div>
            {threads.some((t) => t.isSample) && (
              <SampleTag label="Example discussions" className="absolute -bottom-7 left-2 border-white/30 text-white/50" />
            )}
          </div>
        </Container>
      </section>

      {/* ───────── 07 MEMBERSHIP ───────── */}
      <section className="py-20 sm:py-28" aria-labelledby="membership-heading">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="07 — Membership"
                title={<span id="membership-heading">One year. Everything you need to start building.</span>}
                intro="Two simple annual tiers with the same core benefits. No monthly subscriptions, no hidden extras. Membership opens once your student or recent-graduate status is verified."
              />
              <ButtonLink href="/membership" variant="link" className="mt-6">
                What&apos;s included &amp; who&apos;s eligible <ArrowUpRight className="h-4 w-4" />
              </ButtonLink>
            </div>
            <PricingCards settings={settings} compact />
          </div>
        </Container>
      </section>

      <FinalCta />
    </>
  );
}

/* ═════════ HERO ═════════ */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(60%_50%_at_75%_30%,#fff6cc_0%,transparent_70%)]" />
      <Container className="relative grid items-center gap-10 pt-14 pb-20 sm:pt-20 lg:grid-cols-[1.25fr_0.75fr] lg:gap-6 lg:pt-20 lg:pb-24">
        <div>
          <Eyebrow className="animate-rise">The next generation starts here</Eyebrow>
          <h1 className="mt-6 text-[clamp(2.3rem,5vw,4.6rem)] leading-[0.95] font-extrabold tracking-[-0.045em] uppercase">
            <span className="block animate-rise" style={{ animationDelay: "80ms" }}>
              The world is <span className="mark">changing.</span>
            </span>
            <span className="block text-ink/35 animate-rise" style={{ animationDelay: "180ms" }}>
              Don&apos;t just keep up.
            </span>
            <span className="block animate-rise" style={{ animationDelay: "280ms" }}>
              Build <span className="relative inline-block">
                what&apos;s next.
                <svg aria-hidden viewBox="0 0 300 20" className="absolute -bottom-[0.32em] left-0 h-[0.22em] w-full" preserveAspectRatio="none">
                  <path d="M3 14 C 80 4, 200 2, 297 9" stroke="#FFCC00" strokeWidth="6" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted text-pretty animate-rise sm:text-xl" style={{ animationDelay: "380ms" }}>
            A grassroots community connecting the next generation of entrepreneurs, innovators and AI-powered builders.
            Learn new skills, meet ambitious people and turn ideas into real opportunities.
          </p>
          <div className="mt-10 flex flex-col gap-3 animate-rise sm:flex-row" style={{ animationDelay: "480ms" }}>
            <ButtonLink href="/join" size="lg">
              Become a Member <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/community" variant="outline" size="lg">
              Explore the Community
            </ButtonLink>
          </div>
          <p className="mt-6 text-sm text-subtle animate-rise" style={{ animationDelay: "560ms" }}>
            For university students, recent graduates and young founders under 38.
          </p>
        </div>
        <div className="animate-rise" style={{ animationDelay: "200ms" }}>
          <Constellation />
        </div>
      </Container>
    </section>
  );
}

function Marquee() {
  const items = ["AI & automation", "Founder collaboration", "Digital payments", "Monthly events", "Startup labs", "Market insights", "Mentors", "Talent directory"];
  return (
    <div className="overflow-hidden border-y border-line bg-white py-4" aria-hidden>
      <div className="flex w-max animate-[marquee_40s_linear_infinite] gap-10 pr-10">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="flex items-center gap-10 text-sm font-medium whitespace-nowrap text-ink/60">
            {t} <span className="h-1.5 w-1.5 rotate-45 bg-sun" />
          </span>
        ))}
      </div>
      <style>{`@keyframes marquee { to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}

/* ═════════ 02 WHY WE EXIST ═════════ */
function WhyWeExist() {
  const points = [
    { n: "01", title: "Learn what matters.", body: "Practical exposure to AI, technology, business and the digital economy — the skills employers and markets are asking for right now." },
    { n: "02", title: "Meet your people.", body: "Find fellow founders, collaborators, mentors and ambitious peers who care about the same problems you do." },
    { n: "03", title: "Build something real.", body: "Move from ideas and conversations to prototypes, businesses and opportunities — with a community behind you." },
  ];
  return (
    <section className="py-20 sm:py-28" aria-labelledby="why-heading">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <Eyebrow>02 — Why we exist</Eyebrow>
            <h2 id="why-heading" className="mt-4 text-4xl font-bold tracking-[-0.035em] text-balance sm:text-6xl">
              The future isn&apos;t <span className="font-serif font-normal italic">waiting</span> for us.
            </h2>
          </div>
          <div className="space-y-5 text-lg leading-relaxed text-ink-soft">
            <p>
              AI, automation, FinTech and emerging technologies are changing how businesses operate and how people work,
              faster than most courses can be rewritten.
            </p>
            <p className="text-muted">
              Traditional education still matters. On its own, though, it rarely provides all the practical skills,
              experimentation time or industry connections needed to take part in what&apos;s happening. Young people need
              spaces to learn, experiment, collaborate and build.
            </p>
            <p className="border-l-2 border-sun pl-5 font-medium text-ink">
              Y Connector closes the gap between education, practical skills, entrepreneurship and real industry
              opportunity.
            </p>
          </div>
        </div>
        <div className="mt-20 grid border-t border-ink md:grid-cols-3">
          {points.map((p, i) => (
            <div key={p.n} className={`group py-10 md:px-8 ${i > 0 ? "border-t border-line md:border-t-0 md:border-l" : ""} md:first:pl-0`}>
              <p className="font-mono text-sm text-subtle transition group-hover:text-ink">{p.n}</p>
              <h3 className="mt-6 text-2xl font-bold tracking-tight">
                <span className="bg-[linear-gradient(transparent_62%,var(--color-sun)_62%)] bg-[length:0%_100%] bg-no-repeat transition-[background-size] duration-500 group-hover:bg-[length:100%_100%]">
                  {p.title}
                </span>
              </h3>
              <p className="mt-3 leading-relaxed text-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ═════════ 03 ECOSYSTEM ═════════ */
const pillars = [
  { icon: UsersRound, title: "Community & Connections", body: "A network of students, alumni, young founders and experts.", href: "/community" },
  { icon: BookOpenCheck, title: "AI & Digital Upskilling", body: "Practical technology learning and applied workshops.", href: "/upskill" },
  { icon: CalendarDays, title: "Events & Conversations", body: "Monthly sessions with entrepreneurs, technologists and industry specialists.", href: "/events" },
  { icon: Handshake, title: "Founder Collaboration", body: "Find co-founders, collaborators and people with complementary skills.", href: "/community#directory" },
  { icon: LineChart, title: "Investment & Market Insights", body: "Learn how funding, financial systems and markets actually work.", href: "/insights" },
  { icon: Rocket, title: "Startup Incubation", body: "Help community-led ideas develop into functioning businesses.", href: "/startups" },
];

function Ecosystem() {
  return (
    <section className="border-t border-line bg-mist py-20 sm:py-28" aria-labelledby="eco-heading">
      <Container>
        <SectionHeading
          eyebrow="03 — The Y Connector ecosystem"
          title={
            <span id="eco-heading">
              More than networking. <span className="text-ink/40">An ecosystem for building.</span>
            </span>
          }
        />
        <div className="mt-14 grid overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 1 }}>
          {pillars.map((p, i) => (
            <Link key={p.title} href={p.href} className="group relative flex min-h-64 flex-col bg-white p-8 transition-colors duration-300 hover:bg-ink">
              <div className="flex items-start justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sun-soft text-ink transition group-hover:bg-sun">
                  <p.icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="font-mono text-xs text-subtle group-hover:text-white/40">0{i + 1}</span>
              </div>
              <h3 className="mt-auto pt-10 text-xl font-bold tracking-tight transition group-hover:text-white">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted transition group-hover:text-white/65">{p.body}</p>
              <ArrowUpRight className="absolute right-7 bottom-7 h-5 w-5 -translate-x-1 translate-y-1 text-sun opacity-0 transition group-hover:translate-0 group-hover:opacity-100" aria-hidden />
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ═════════ 04 HOW IT WORKS ═════════ */
function HowItWorks() {
  const steps = [
    { n: "01", title: "Apply to join", body: "Tell us about yourself, your university and what you want to build. Takes about four minutes." },
    { n: "02", title: "Verify your eligibility", body: "Confirm your student or recent-graduate status with a university email or a quick document check." },
    { n: "03", title: "Activate your annual membership", body: "Once verified, pay securely once a year: £30 for Essex alumni, £50 for other eligible members." },
    { n: "04", title: "Connect, learn and build", body: "Unlock the forum, directory, events and learning hub, and start building with your people." },
  ];
  return (
    <section className="py-20 sm:py-28" aria-labelledby="how-heading">
      <Container>
        <SectionHeading eyebrow="04 — How it works" title={<span id="how-heading">Four steps from curious to building.</span>} />
        <ol className="relative mt-16 grid gap-10 md:grid-cols-4 md:gap-6">
          <div aria-hidden className="absolute top-5 right-0 left-0 hidden h-px bg-line md:block">
            <div className="h-px w-3/4 bg-gradient-to-r from-sun to-transparent" />
          </div>
          {steps.map((s, i) => (
            <li key={s.n} className="relative flex gap-5 md:block">
              <span className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-mono text-sm font-semibold ring-8 ring-white ${i === 0 ? "bg-sun" : "bg-ink text-white"}`}>
                {s.n}
              </span>
              <div>
                <h3 className="text-lg font-bold tracking-tight md:mt-7">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/* ═════════ FINAL CTA ═════════ */
function FinalCta() {
  return (
    <section className="px-3 pb-3 sm:px-5 sm:pb-5">
      <div className="relative overflow-hidden rounded-[2rem] bg-sun px-6 py-24 text-center sm:py-32">
        <svg aria-hidden viewBox="0 0 800 400" className="pointer-events-none absolute inset-0 h-full w-full opacity-60" preserveAspectRatio="xMidYMid slice">
          <ellipse cx="400" cy="200" rx="380" ry="150" fill="none" stroke="#111" strokeOpacity="0.12" transform="rotate(-12 400 200)" />
          <ellipse cx="400" cy="200" rx="300" ry="110" fill="none" stroke="#111" strokeOpacity="0.08" transform="rotate(-12 400 200)" />
        </svg>
        <div className="relative mx-auto max-w-4xl">
          <h2 className="text-[clamp(2.4rem,6.5vw,5.5rem)] leading-[0.95] font-extrabold tracking-[-0.045em] uppercase">
            The future won&apos;t build itself.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg font-medium text-ink/75 sm:text-xl">
            Find your people. Develop your skills. Build what&apos;s next.
          </p>
          <ButtonLink href="/join" variant="dark" size="lg" className="mt-10">
            Become a Y Connector <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
