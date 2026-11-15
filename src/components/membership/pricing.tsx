import { Check, Infinity as InfinityIcon } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { formatPence } from "@/lib/policy";
import type { PlatformSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

export const MEMBERSHIP_BENEFITS = [
  "AI-FincubeX non-degree training",
  "10-month prototype development programme (2 sessions a month)",
  "Online technical advice, including AI EdTech",
  "Access to non-VC seed-corn funding opportunities",
  "Web listing of your prototype for potential VC investors",
  "Opt-in talent dissemination to industry",
  "Members-only community forum & discussions",
  "Member networking and talent directory",
  "Co-founder and collaborator matching",
  "Registration for monthly events",
  "Included upskilling resources",
  "Startup project participation",
  "Opportunities to engage with mentors",
];

interface TierCard {
  key: string;
  name: string;
  price: number;
  who: string;
}

function tierCards(settings: PlatformSettings): TierCard[] {
  return [
    { key: "essex_student", name: "Essex Students", price: settings.priceEssexStudentPence, who: "Current University of Essex students." },
    { key: "essex_alumni", name: "Essex Alumni", price: settings.priceEssexAlumniPence, who: "Graduates of the University of Essex." },
    { key: "standard", name: "Students & Graduates", price: settings.priceStandardPence, who: "Students and graduates of any other university." },
  ];
}

/** Three annual tiers + one-off lifetime membership. `compact` = price list for the homepage. */
export function PricingCards({ settings, compact = false }: { settings: PlatformSettings; compact?: boolean }) {
  const tiers = tierCards(settings);
  const age = settings.maxAgeExclusive;

  if (compact) {
    return (
      <div className="overflow-hidden rounded-3xl border border-line bg-white">
        <ul className="divide-y divide-line">
          {tiers.map((t) => (
            <li key={t.key} className="flex items-center justify-between gap-6 px-6 py-5 sm:px-8">
              <div>
                <p className="font-semibold">{t.name}</p>
                <p className="text-sm text-muted">{t.who}</p>
              </div>
              <p className="shrink-0 text-right"><span className="text-3xl font-bold tracking-tight">{formatPence(t.price)}</span><span className="text-sm text-muted"> /yr</span></p>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between gap-6 bg-ink px-6 py-5 text-white sm:px-8">
          <div>
            <p className="flex items-center gap-2 font-semibold"><InfinityIcon className="h-4 w-4 text-sun" /> Lifetime membership</p>
            <p className="text-sm text-white/60">Pay once. Never renew.</p>
          </div>
          <p className="shrink-0 text-right"><span className="text-3xl font-bold tracking-tight text-sun">{formatPence(settings.priceLifetimePence)}</span><span className="text-sm text-white/60"> once</span></p>
        </div>
        <p className="border-t border-line px-6 py-3 text-xs text-muted sm:px-8">Open to everyone under {age}. Same core benefits on every plan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {tiers.map((t, i) => {
          const featured = i === 2;
          return (
            <div key={t.key} className={cn("relative flex flex-col rounded-3xl border p-7 sm:p-8", featured ? "border-ink" : "border-line bg-white")}>
              <div className="flex items-center justify-between gap-2">
                <p className="eyebrow text-muted">{t.name}</p>
                <span className="rounded-full bg-sun-soft px-2.5 py-1 text-[11px] font-semibold">Annual</span>
              </div>
              <p className="mt-6 flex items-baseline gap-2">
                <span className="text-6xl font-bold tracking-[-0.04em]">{formatPence(t.price)}</span>
                <span className="text-muted">/ year</span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">{t.who} Under {age}.</p>
              <div className="mt-auto pt-8">
                <ButtonLink href="/join" variant={featured ? "primary" : "dark"} className="w-full">Apply for membership</ButtonLink>
                <p className="mt-3 text-center text-xs text-subtle">Renews annually · cancel any time</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative grid grid-cols-1 gap-8 overflow-hidden rounded-3xl bg-ink p-7 text-white sm:p-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <div aria-hidden className="pointer-events-none absolute -right-24 -bottom-32 h-80 w-80 rounded-full border border-sun/30" />
        <div className="relative">
          <p className="eyebrow inline-flex items-center gap-2 text-sun"><InfinityIcon className="h-4 w-4" /> Lifetime membership</p>
          <p className="mt-5 flex items-baseline gap-2">
            <span className="text-6xl font-bold tracking-[-0.04em] text-sun">{formatPence(settings.priceLifetimePence)}</span>
            <span className="text-white/60">one-off</span>
          </p>
          <p className="mt-3 text-sm text-white/70">Pay once and keep every benefit for life. No renewals. Open to any eligible applicant under {age}, whichever university you&apos;re from.</p>
          <ButtonLink href="/join" className="mt-7">Apply for lifetime membership</ButtonLink>
        </div>
        <ul className="relative grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          {MEMBERSHIP_BENEFITS.map((b) => (
            <li key={b} className="flex gap-3">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-sun" aria-hidden />
              <span className="text-white/85">{b}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-center text-sm text-muted">Every plan includes the same core benefits listed above.</p>
    </div>
  );
}
