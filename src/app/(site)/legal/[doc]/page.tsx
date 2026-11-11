import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container, Notice } from "@/components/ui/primitives";
import { siteConfig } from "@/lib/config";

type Section = { h: string; p: string[] };
const DOCS: Record<string, { title: string; sections: Section[] }> = {
  privacy: {
    title: "Privacy policy",
    sections: [
      { h: "Who we are", p: [`Y Connector ("we") is the data controller for personal data processed through this website. Contact: ${siteConfig.contactEmail}. [PLACEHOLDER: insert legal entity name, registered address and ICO registration number.]`] },
      { h: "What we collect", p: ["Account data: name, email, password (hashed by our authentication provider).", "Eligibility data: date of birth, university, student/alumni status, graduation year, university email and optional proof-of-status documents.", "Profile data you choose to share: headline, skills, interests, projects, links.", "Community content: posts, replies, votes, bookmarks and reports.", "Event registrations and membership/billing status. Card details are handled by Stripe and never stored by us."] },
      { h: "Why we use it (lawful bases)", p: ["To provide membership and community services (contract).", "To verify eligibility for a student/young-founder community (legitimate interests).", "To process payments and keep financial records (legal obligation).", "To send service emails such as booking confirmations (contract). Marketing only with consent."] },
      { h: "Who can see it", p: ["Date of birth and verification documents are private: visible only to you and authorised admins.", "Directory profiles are opt-in. Contact details are only shared when both members agree.", "Forum content is visible to active members only unless an admin publishes a specific public preview."] },
      { h: "Retention", p: ["Verification documents are deleted a fixed period after a decision (currently configured by admins, default 90 days).", "Account data is kept while you're a member and deleted or anonymised within 30 days of an erasure request, except where we must keep records (e.g. payments) by law."] },
      { h: "Your rights", p: ["You can access, correct, export or delete your data, object to processing and complain to the ICO (ico.org.uk). Use Account → Privacy or email us."] },
      { h: "Processors", p: ["Supabase (database, authentication, storage), Stripe (payments), Vercel (hosting), and our email provider. [PLACEHOLDER: confirm hosting regions and transfer safeguards.]"] },
    ],
  },
  terms: {
    title: "Terms of membership",
    sections: [
      { h: "Membership", p: ["Membership is annual and renews automatically unless cancelled. Prices are shown on the Membership page. Access begins once eligibility is verified and payment is confirmed."] },
      { h: "Eligibility", p: ["You must meet the published eligibility criteria and provide accurate information. We may suspend memberships obtained with inaccurate information."] },
      { h: "Cancellation & refunds", p: ["You can cancel renewal any time and keep access until the end of your paid period. [PLACEHOLDER: confirm refund and statutory cooling-off policy with legal advice.]"] },
      { h: "Events", p: ["Event places are allocated first-come, first-served subject to capacity. Not all events are included in membership; each listing says so."] },
      { h: "Not financial advice", p: ["Y Connector is an educational community. Nothing on the platform is financial, investment, legal or tax advice. We do not offer investments, lending or brokerage services."] },
      { h: "Content", p: ["You own what you post and grant us a licence to display it within the platform. You must follow the community guidelines."] },
      { h: "Liability", p: ["[PLACEHOLDER: liability, governing law (England & Wales) and dispute clauses to be finalised with legal advice.]"] },
    ],
  },
  "community-guidelines": {
    title: "Community guidelines",
    sections: [
      { h: "Be generous", p: ["Share what you know. Answer questions you once had. Upvote what helps."] },
      { h: "Be respectful", p: ["No harassment, discrimination, hate speech or personal attacks. Disagree with ideas, not people."] },
      { h: "Be honest", p: ["Don't misrepresent yourself, your project or your credentials."] },
      { h: "No solicitation of investment", p: ["Do not solicit investment, offer securities, promote lending schemes or advertise returns. Funding discussions are educational only."] },
      { h: "Protect privacy", p: ["Don't share other people's personal information. Use the collaboration request feature to connect."] },
      { h: "No spam", p: ["Self-promotion is welcome in context (e.g. the monthly “what are you building” thread), not as unsolicited ads."] },
      { h: "Moderation", p: ["Report anything that breaks these rules. Moderators may remove content, lock threads or suspend accounts."] },
    ],
  },
};

type P = Promise<{ doc: string }>;
export async function generateMetadata({ params }: { params: P }): Promise<Metadata> {
  const d = DOCS[(await params).doc];
  return d ? { title: d.title } : {};
}
export function generateStaticParams() {
  return Object.keys(DOCS).map((doc) => ({ doc }));
}

export default async function LegalPage({ params }: { params: P }) {
  const d = DOCS[(await params).doc];
  if (!d) notFound();
  return (
    <Container className="max-w-3xl py-14 sm:py-20">
      <p className="eyebrow text-muted">Legal</p>
      <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.035em] sm:text-5xl">{d.title}</h1>
      <Notice tone="sun" className="mt-8">Draft placeholder for preview. Have this reviewed by a qualified UK legal adviser before launch.</Notice>
      <div className="prose-yc mt-10">
        {d.sections.map((s) => (
          <section key={s.h}>
            <h2>{s.h}</h2>
            {s.p.length > 1 ? <ul>{s.p.map((x) => <li key={x}>{x}</li>)}</ul> : <p>{s.p[0]}</p>}
          </section>
        ))}
      </div>
    </Container>
  );
}
