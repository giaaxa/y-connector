import Link from "next/link";
import { LogoFull } from "@/components/brand/logo";
import { siteConfig } from "@/lib/config";

const cols = [
  {
    title: "Explore",
    links: [
      { href: "/about", label: "About" },
      { href: "/events", label: "Events" },
      { href: "/community", label: "Community" },
      { href: "/upskill", label: "Upskill" },
      { href: "/startups", label: "Startups" },
      { href: "/insights", label: "FinTech & Investment" },
    ],
  },
  {
    title: "Join",
    links: [
      { href: "/membership", label: "Membership" },
      { href: "/join", label: "Apply" },
      { href: "/login", label: "Log in" },
      { href: "/ambassadors", label: "Become an ambassador" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/privacy", label: "Privacy policy" },
      { href: "/legal/terms", label: "Terms" },
      { href: "/legal/community-guidelines", label: "Community guidelines" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-mist">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 pt-16 pb-10 sm:px-8 lg:grid-cols-[1.3fr_2fr]">
        <div>
          <LogoFull className="w-56" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
            A grassroots, youth-led community connecting the next generation of builders with skills, people and
            opportunities.
          </p>
          <p className="mt-5 text-sm">
            <span className="text-muted">Say hello: </span>
            <a href={`mailto:${siteConfig.contactEmail}`} className="font-medium underline decoration-sun decoration-2 underline-offset-4">
              {siteConfig.contactEmail}
            </a>
          </p>
          <div className="mt-6 flex flex-wrap gap-2" aria-label="Social media (links coming soon)">
            {Object.keys(siteConfig.socials).map((s) => (
              <a
                key={s}
                href={siteConfig.socials[s as keyof typeof siteConfig.socials]}
                className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium capitalize transition hover:border-ink"
              >
                {s === "x" ? "X" : s}
              </a>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {cols.map((c) => (
            <div key={c.title}>
              <p className="eyebrow text-subtle">{c.title}</p>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-ink/80 transition hover:text-ink hover:underline hover:decoration-sun hover:decoration-2 hover:underline-offset-4">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-2 border-t border-line px-5 py-6 text-xs text-muted sm:flex-row sm:justify-between sm:px-8">
        <p>© {new Date().getFullYear()} Y Connector. An independent community initiative.</p>
        <p>Educational community — not a regulated financial services provider.</p>
      </div>
    </footer>
  );
}
