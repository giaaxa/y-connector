import type { ReactNode } from "react";
import { Container, Eyebrow } from "@/components/ui/primitives";

export function PageHero({
  eyebrow,
  title,
  intro,
  children,
  aside,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div aria-hidden className="pointer-events-none absolute -top-48 -right-48 h-[34rem] w-[34rem] rounded-full border border-sun/40" />
      <div aria-hidden className="pointer-events-none absolute -top-32 -right-32 h-[26rem] w-[26rem] rounded-full border border-line" />
      <Container className="relative grid gap-10 py-16 sm:py-20 lg:grid-cols-[1.4fr_1fr] lg:items-end">
        <div>
          <Eyebrow className="animate-rise">{eyebrow}</Eyebrow>
          <h1 className="mt-5 text-4xl leading-[1.02] font-extrabold tracking-[-0.04em] text-balance animate-rise sm:text-6xl" style={{ animationDelay: "80ms" }}>
            {title}
          </h1>
          {intro && (
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted text-pretty animate-rise" style={{ animationDelay: "160ms" }}>
              {intro}
            </p>
          )}
          {children && <div className="mt-8 animate-rise" style={{ animationDelay: "240ms" }}>{children}</div>}
        </div>
        {aside && <div className="animate-rise" style={{ animationDelay: "200ms" }}>{aside}</div>}
      </Container>
    </section>
  );
}
