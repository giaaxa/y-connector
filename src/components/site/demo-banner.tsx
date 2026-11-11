import Link from "next/link";
import { isDemoMode } from "@/lib/config";

/** Shown on every page while Supabase is not configured. */
export function DemoBanner() {
  if (!isDemoMode) return null;
  return (
    <div className="bg-ink text-[12px] text-white/80">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-5 py-2 text-center">
        <span className="font-mono tracking-wider text-sun uppercase">Preview mode</span>
        <span>Sample data only — no real accounts, verification or payments.</span>
        <Link href="/login" className="underline decoration-sun underline-offset-2 hover:text-white">
          Try a demo persona
        </Link>
      </div>
    </div>
  );
}
