import { Check } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { formatPence } from "@/lib/policy";
import type { PlatformSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

export const MEMBERSHIP_BENEFITS = [
  "Members-only community forum & discussions",
  "Member networking and talent directory",
  "Co-founder and collaborator matching",
  "Registration for monthly events",
  "Included upskilling resources",
  "Startup project participation",
  "Opportunities to engage with mentors",
];

export function PricingCards({ settings, compact = false }: { settings: PlatformSettings; compact?: boolean }) {
  const tiers = [
    {
      key: "essex",
      name: "Essex Alumni",
      price: settings.priceEssexPence,
      who: `Recent graduates of the University of Essex (within ${settings.recentAlumniYears} years).`,
      featured: false,
    },
    {
      key: "standard",
      name: "Eligible Member",
      price: settings.priceStandardPence,
      who: `Current university students and recent graduates from any university, under ${settings.maxAgeExclusive}.`,
      featured: true,
    },
  ];
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {tiers.map((t) => (
        <div
          key={t.key}
          className={cn(
            "relative flex flex-col rounded-3xl border p-7 sm:p-9",
            t.featured ? "border-ink bg-ink text-white" : "border-line bg-white",
          )}
        >
          <div className="flex items-center justify-between">
            <p className={cn("eyebrow", t.featured ? "text-sun" : "text-muted")}>{t.name}</p>
            <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", t.featured ? "bg-sun text-ink" : "bg-sun-soft")}>
              Annual
            </span>
          </div>
          <p className="mt-6 flex items-baseline gap-2">
            <span className="text-6xl font-bold tracking-[-0.04em]">{formatPence(t.price)}</span>
            <span className={t.featured ? "text-white/60" : "text-muted"}>/ year</span>
          </p>
          <p className={cn("mt-3 text-sm leading-relaxed", t.featured ? "text-white/70" : "text-muted")}>{t.who}</p>
          {!compact && (
            <ul className="mt-7 space-y-3 text-sm">
              {MEMBERSHIP_BENEFITS.map((b) => (
                <li key={b} className="flex gap-3">
                  <Check className={cn("mt-0.5 h-4 w-4 shrink-0", t.featured ? "text-sun" : "text-ink")} aria-hidden />
                  {b}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-auto pt-8">
            <ButtonLink href="/join" variant={t.featured ? "primary" : "dark"} className="w-full">
              Apply for membership
            </ButtonLink>
            <p className={cn("mt-3 text-center text-xs", t.featured ? "text-white/50" : "text-subtle")}>
              One payment per year · renews annually · cancel any time
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
