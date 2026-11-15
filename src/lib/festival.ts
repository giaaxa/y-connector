/**
 * Annual AI FinTech Festival — single source of truth.
 * Fill in `dates`, `location` and `ticketsOpen` once confirmed; the festival
 * page, homepage feature and nav badge all read from here.
 */
export const FESTIVAL = {
  name: "AI FinTech Festival",
  /** e.g. "2027" — shown as the edition label. */
  edition: String(new Date().getFullYear() + 1),
  /** Human-readable dates once confirmed, e.g. "12–13 June 2027". null = to be announced. */
  dates: null as string | null,
  /** Venue/city once confirmed. null = to be announced. */
  location: null as string | null,
  /** When true, the CTA switches from "register interest" to ticket booking via /events. */
  ticketsOpen: false,
  tagline: "One weekend a year where AI, finance and the next generation of founders meet.",

  tracks: [
    { title: "AI in Financial Services", body: "Agents, fraud detection, underwriting, advice, and the governance questions AI raises." },
    { title: "Digital Payments & Money", body: "Instant payments, open banking, tokenised assets and the future of money." },
    { title: "Building With AI", body: "Hands-on build sessions: automation, agents, rapid prototyping and AI EdTech." },
    { title: "Founders & Funding", body: "From prototype to first customers, and how early-stage funding really works." },
    { title: "Markets & Policy", body: "Market structures, regulation and digital twins of payment ecosystems." },
    { title: "Talent & Careers", body: "Meet industry teams looking for the next generation of AI and FinTech talent." },
  ],

  formats: [
    { title: "Keynotes & panels", body: "Big-picture conversations with founders, technologists and industry specialists." },
    { title: "Prototype Demo Showcase", body: "Members present what they built in the 10-month prototype programme." },
    { title: "Build sprint", body: "A time-boxed AI × FinTech challenge in mixed teams." },
    { title: "Workshops", body: "Practical, small-group sessions you leave with a skill from." },
    { title: "Talent & industry fair", body: "Opted-in members meet employers and partners." },
    { title: "Founder networking", body: "Structured introductions to co-founders, mentors and investors." },
  ],

  /** Roles offered on the register-interest form. */
  interestRoles: ["Attend", "Speak", "Demo a prototype", "Partner or sponsor", "Exhibit / recruit", "Volunteer"],
};

export function festivalWhen() {
  return FESTIVAL.dates ?? "Dates to be announced";
}
export function festivalWhere() {
  return FESTIVAL.location ?? "Venue to be announced";
}
