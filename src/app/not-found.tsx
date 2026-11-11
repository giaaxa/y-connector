import { LogoMark } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <LogoMark className="w-28" />
      <p className="eyebrow mt-8 text-muted">404</p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.035em] sm:text-5xl">This page hasn&apos;t been built yet.</h1>
      <p className="mt-4 max-w-md text-muted">It may have moved, or it might be a member-only page. Let&apos;s get you back to something real.</p>
      <div className="mt-8 flex gap-3">
        <ButtonLink href="/">Go home</ButtonLink>
        <ButtonLink href="/events" variant="outline">See events</ButtonLink>
      </div>
    </main>
  );
}
