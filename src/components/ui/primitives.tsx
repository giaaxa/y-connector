import type { ComponentProps, ReactNode } from "react";
import { cn, initials } from "@/lib/utils";

export function Container({ className, ...p }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-7xl px-5 sm:px-8", className)} {...p} />;
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("eyebrow inline-flex items-center gap-2 text-muted", className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-sun" aria-hidden />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  className,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  className?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <Eyebrow className={align === "center" ? "justify-center" : ""}>{eyebrow}</Eyebrow>}
      <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] text-balance sm:text-5xl">{title}</h2>
      {intro && <p className="mt-5 text-lg leading-relaxed text-muted text-pretty">{intro}</p>}
    </div>
  );
}

type Tone = "neutral" | "sun" | "ok" | "warn" | "bad" | "dark" | "outline";
const tones: Record<Tone, string> = {
  neutral: "bg-fog text-ink-soft",
  sun: "bg-sun-soft text-ink",
  ok: "bg-[#e6f4ec] text-ok",
  warn: "bg-[#fdf0dc] text-warn",
  bad: "bg-[#fdeceb] text-bad",
  dark: "bg-ink text-white",
  outline: "border border-line text-muted",
};
export function Badge({ tone = "neutral", className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}

/** Marks illustrative content that must be replaced before launch. */
export function SampleTag({ label = "Example", className }: { label?: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border border-dashed border-ink/30 px-1.5 py-px font-mono text-[10px] tracking-wider text-muted uppercase",
        className,
      )}
      title="Sample content for preview — replace before launch"
    >
      {label}
    </span>
  );
}

export function Card({ className, ...p }: ComponentProps<"div">) {
  return <div className={cn("rounded-2xl border border-line bg-white", className)} {...p} />;
}

export function Avatar({ name, size = 36, className }: { name: string; size?: number; className?: string }) {
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 4;
  const palettes = ["bg-ink text-sun", "bg-sun text-ink", "bg-fog text-ink", "bg-ink-soft text-white"];
  return (
    <span
      aria-hidden
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-semibold", palettes[hue], className)}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials(name) || "?"}
    </span>
  );
}

export function EmptyState({ title, body, action, icon }: { title: string; body?: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-mist px-6 py-14 text-center">
      {icon && <div className="mb-4 text-subtle">{icon}</div>}
      <p className="font-semibold">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-muted">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Notice({ tone = "sun", title, children, className }: { tone?: "sun" | "ok" | "bad" | "neutral"; title?: string; children: ReactNode; className?: string }) {
  const t = {
    sun: "border-sun bg-sun-soft",
    ok: "border-ok/30 bg-[#eef8f2]",
    bad: "border-bad/30 bg-[#fdf1f0]",
    neutral: "border-line bg-mist",
  }[tone];
  return (
    <div role="status" className={cn("rounded-xl border-l-4 px-4 py-3 text-sm", t, className)}>
      {title && <p className="font-semibold">{title}</p>}
      <div className={cn("text-ink-soft", title && "mt-0.5")}>{children}</div>
    </div>
  );
}
