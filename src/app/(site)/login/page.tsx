import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-forms";
import { Notice } from "@/components/ui/primitives";
import { demoSignIn } from "@/lib/actions/auth";
import { isDemoMode } from "@/lib/config";
import { DEMO_PERSONAS } from "@/lib/seed";
import { safeNext } from "@/lib/utils";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  return (
    <AuthShell
      title="Welcome back."
      intro="Log in to your member hub, the forum and your events."
      side={<p className="text-3xl leading-tight font-bold tracking-tight">From conversations to collaborations. <span className="text-sun">From ideas to enterprises.</span></p>}
    >
      {sp.error === "link" && <Notice tone="bad" className="mb-6">That link has expired or was already used. Please try again.</Notice>}
      {isDemoMode ? (
        <div>
          <Notice tone="neutral" title="Preview mode: choose a demo persona" className="mb-6">
            Supabase isn&apos;t connected yet, so real accounts are disabled. Explore the platform as one of these sample users.
          </Notice>
          <div className="grid gap-3">
            {DEMO_PERSONAS.map((p) => (
              <form key={p.id} action={demoSignIn}>
                <input type="hidden" name="persona" value={p.id} />
                <input type="hidden" name="next" value={next} />
                <button className="group flex w-full items-center justify-between rounded-2xl border border-line p-5 text-left transition hover:border-ink hover:bg-mist">
                  <span>
                    <span className="block font-semibold">{p.label}</span>
                    <span className="mt-0.5 block text-sm text-muted">{p.description}</span>
                  </span>
                  <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                </button>
              </form>
            ))}
          </div>
        </div>
      ) : (
        <LoginForm next={next} />
      )}
      <p className="mt-8 text-sm text-muted">
        New here? <Link href="/join" className="font-semibold text-ink underline decoration-sun decoration-2 underline-offset-4">Apply to join</Link>
      </p>
    </AuthShell>
  );
}
