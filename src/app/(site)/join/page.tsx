import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ApplicationForm } from "@/components/auth/application-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { Notice } from "@/components/ui/primitives";
import { getViewer } from "@/lib/auth";
import { isDemoMode, isSupabaseConfigured } from "@/lib/config";
import { repo } from "@/lib/data";
import { formatPence } from "@/lib/policy";

export const metadata: Metadata = { title: "Apply to join", description: "Apply for Y Connector membership." };

export default async function JoinPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  const [viewer, settings] = await Promise.all([getViewer(), repo().getSettings()]);
  if (viewer?.application && !["pending", "more_info"].includes(viewer.application.status)) redirect("/dashboard");
  const referrer = ref ? await repo().findProfileByReferralCode(ref) : null;

  return (
    <AuthShell
      title={viewer?.application ? "Update your application" : "Apply to join."}
      intro="Takes about four minutes. We'll verify your eligibility, then invite you to activate your annual membership."
      side={
        <>
          <p className="text-3xl leading-tight font-bold tracking-tight">Don&apos;t just prepare for the future. <span className="text-sun">Participate in building it.</span></p>
          <ul className="mt-10 space-y-4 text-sm text-white/75">
            <li className="flex justify-between border-b border-white/10 pb-3"><span>Essex alumni</span><span className="font-semibold text-white">{formatPence(settings.priceEssexPence)}/yr</span></li>
            <li className="flex justify-between border-b border-white/10 pb-3"><span>Other eligible members</span><span className="font-semibold text-white">{formatPence(settings.priceStandardPence)}/yr</span></li>
            <li className="pt-2 text-white/50">Students & recent graduates under {settings.maxAgeExclusive}. Pay only after verification.</li>
          </ul>
        </>
      }
    >
      {isDemoMode && (
        <Notice tone="neutral" title="Preview mode" className="mb-8">
          Applications are stored in temporary memory and no account is created. Files you upload are not retained.
        </Notice>
      )}
      {viewer?.application?.status === "more_info" && viewer.application.reviewerNote && (
        <Notice title="Our team asked for more information" className="mb-8">{viewer.application.reviewerNote}</Notice>
      )}
      {referrer && <Notice tone="ok" className="mb-8">You were invited by {referrer.fullName.split(" ")[0]}. Welcome!</Notice>}
      <ApplicationForm
        requirePassword={isSupabaseConfigured}
        existing={viewer?.application ?? null}
        email={viewer?.email}
        referral={ref}
        maxAge={settings.maxAgeExclusive}
        recentYears={settings.recentAlumniYears}
      />
      {!viewer && (
        <p className="mt-8 text-sm text-muted">
          Already applied? <Link href="/login" className="font-semibold text-ink underline decoration-sun decoration-2 underline-offset-4">Log in</Link>
        </p>
      )}
    </AuthShell>
  );
}
