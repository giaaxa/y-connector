import { ArrowRight, Banknote, Building2, CircuitBoard, Landmark, LineChart, Network, PiggyBank, Repeat, Scale, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Container, Notice, SectionHeading } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "FinTech & Investment Insights",
  description: "An educational hub on how technology, finance and entrepreneurship intersect.",
};

const topics = [
  { icon: LineChart, t: "How investment markets work", b: "Primary vs secondary markets, price discovery, liquidity and who the participants are." },
  { icon: PiggyBank, t: "Startup funding pathways", b: "Bootstrapping, grants, friends & family, angels, accelerators and when each makes sense." },
  { icon: Sparkles, t: "Venture capital basics", b: "How funds work, what VCs look for, dilution, term sheets and the power law." },
  { icon: Scale, t: "Financial market structures", b: "Exchanges, brokers, clearing, settlement and the role of regulators." },
  { icon: Repeat, t: "Peer-to-peer platforms", b: "How P2P models match supply and demand, and the risks and regulation involved." },
  { icon: Banknote, t: "Credit & microfinance", b: "Credit scoring, financial inclusion and the economics of small-ticket lending." },
  { icon: Building2, t: "Digital banking", b: "Neobanks, banking-as-a-service and how licences shape what's possible." },
  { icon: Network, t: "Payment infrastructure", b: "Card schemes, Faster Payments, open banking and cross-border rails." },
  { icon: CircuitBoard, t: "Digital twins of payment ecosystems", b: "Simulating payment networks to test resilience, policy and new products." },
  { icon: Landmark, t: "AI in financial services", b: "Fraud detection, underwriting, advice and the governance questions AI raises." },
];

export default function InsightsPage() {
  return (
    <>
      <PageHero
        eyebrow="Investment & FinTech knowledge"
        title={<>Understand how money <span className="font-serif font-normal italic">really</span> moves.</>}
        intro="An educational hub on where technology, finance and entrepreneurship meet. Built for founders who want to understand the systems they're building on."
      />
      <section className="py-14 sm:py-20">
        <Container>
          <Notice tone="sun" title="Education and networking only" className="max-w-3xl">
            Y Connector is not an investment platform, broker, lender or financial adviser. We don&apos;t solicit investments, pool member money, arrange loans or advertise returns. Nothing here is financial advice. Any future regulated activity would only follow proper legal and regulatory assessment.
          </Notice>
          <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
            {topics.map((x, i) => (
              <div key={x.t} className="group bg-white p-6 transition hover:bg-sun-soft">
                <div className="flex items-center justify-between">
                  <x.icon className="h-5 w-5" aria-hidden />
                  <span className="font-mono text-xs text-subtle">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <p className="mt-6 font-semibold leading-snug">{x.t}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{x.b}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
      <section className="border-t border-line bg-mist py-14 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <SectionHeading
            eyebrow="Investment & Finance discussion group"
            title="Ask the questions you'd be embarrassed to ask anywhere else."
            intro="Members discuss funding, markets and FinTech in a dedicated forum category, alongside learning paths and our Investment Education events."
          />
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <ButtonLink href="/forum/c/funding" size="lg">Open the discussion <ArrowRight className="h-4 w-4" /></ButtonLink>
            <ButtonLink href="/upskill/fintech-and-digital-payments" variant="outline" size="lg">FinTech course</ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
