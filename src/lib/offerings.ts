/**
 * Membership programme offerings — single source of truth for the
 * membership page, homepage and benefit lists.
 */

/**
 * AI-FincubeX training focus areas.
 * TO CONFIRM: derived from the AI-FincubeX page at essex.ac.uk; check against
 * "Figure 1" in the programme materials and edit this list to match.
 */
export const FINCUBEX_FOCUS_AREAS = [
  "AI and FinTech solution design",
  "Digital payments and the future of money",
  "Tokenised assets and digital finance",
  "Central bank digital currency and agent-based modelling",
  "Trustworthy and agentic AI",
  "AI-driven entrepreneurship",
];

export const PROTOTYPE_PROGRAMME = {
  months: 10,
  sessionsPerMonth: 2,
  hoursPerSession: 2,
  /** One online session and one hybrid in-person session each month. */
  formats: ["Online", "Hybrid, in person"] as const,
};

export type OfferingIcon = "training" | "prototype" | "advice" | "funding" | "showcase" | "talent";

export interface Offering {
  id: string;
  icon: OfferingIcon;
  title: string;
  summary: string;
  detail: string;
  href?: string;
}

const p = PROTOTYPE_PROGRAMME;

export const OFFERINGS: Offering[] = [
  {
    id: "fincubex-training",
    icon: "training",
    title: "AI-FincubeX non-degree training",
    summary: "Practical, non-degree training with AI-FincubeX, the AI and FinTech incubator and lab at the University of Essex.",
    detail: "Applied learning across AI, FinTech and the digital economy, built around designing operationally relevant solutions with input from industry experts.",
    href: "/upskill",
  },
  {
    id: "prototype-programme",
    icon: "prototype",
    title: "Kick-the-tyres & prototype development",
    summary: `${p.sessionsPerMonth} × ${p.hoursPerSession}-hour sessions every month for ${p.months} months: one online, one hybrid in person.`,
    detail: `Bring an idea, stress-test it, and build it into a working prototype over ${p.months * p.sessionsPerMonth} structured sessions (${p.months * p.sessionsPerMonth * p.hoursPerSession} hours) across the year.`,
    href: "/events?category=Prototype%20Session",
  },
  {
    id: "ai-edtech-advice",
    icon: "advice",
    title: "Online technical advice: AI EdTech",
    summary: "Ask technical questions and get advice from the community on building with AI, including AI EdTech.",
    detail: "A dedicated members-only forum space where builders, mentors and technologists help you get unstuck.",
    href: "/forum/c/ai-edtech",
  },
  {
    id: "seed-corn",
    icon: "funding",
    title: "Access to non-VC seed-corn funding",
    summary: "Routes to early, non-venture seed-corn funding opportunities for promising member projects.",
    detail: "Funding is not guaranteed and is subject to each opportunity's own criteria. Y Connector does not pool member money or offer investments.",
  },
  {
    id: "prototype-listing",
    icon: "showcase",
    title: "Web listing of your prototype",
    summary: "Showcase your prototype publicly to attract the attention of potential VC investors.",
    detail: "Approved projects appear on our Built by the Community showcase. Any investment conversations happen directly between founders and investors.",
    href: "/startups",
  },
  {
    id: "talent",
    icon: "talent",
    title: "Talent dissemination to industry",
    summary: "Opt in to have your profile shared with industry partners looking for emerging talent.",
    detail: "Entirely opt-in from your profile settings. Nothing is shared with industry unless you switch it on.",
  },
];
