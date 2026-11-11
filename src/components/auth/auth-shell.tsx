import type { ReactNode } from "react";
import { LogoMark } from "@/components/brand/logo";
import { Container } from "@/components/ui/primitives";

export function AuthShell({ title, intro, children, side }: { title: ReactNode; intro?: ReactNode; children: ReactNode; side?: ReactNode }) {
  return (
    <Container className="grid gap-12 py-12 sm:py-16 lg:grid-cols-[1fr_0.8fr] lg:gap-20">
      <div className="mx-auto w-full max-w-xl lg:mx-0">
        <h1 className="text-4xl font-extrabold tracking-[-0.035em] sm:text-5xl">{title}</h1>
        {intro && <p className="mt-4 text-lg text-muted">{intro}</p>}
        <div className="mt-10">{children}</div>
      </div>
      <aside className="hidden lg:block">
        <div className="sticky top-24 overflow-hidden rounded-3xl bg-ink p-10 text-white">
          <span className="inline-flex rounded-2xl bg-white p-3"><LogoMark className="w-20" /></span>
          <div className="mt-10">{side}</div>
        </div>
      </aside>
    </Container>
  );
}
