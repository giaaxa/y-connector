import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "dark" | "outline" | "ghost" | "link" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px";
const variants: Record<Variant, string> = {
  primary: "bg-sun text-ink hover:bg-sun-deep shadow-[0_1px_0_rgb(0_0_0/0.08)]",
  dark: "bg-ink text-white hover:bg-ink-soft",
  outline: "border border-ink/15 bg-white text-ink hover:border-ink hover:bg-mist",
  ghost: "text-ink hover:bg-fog",
  link: "text-ink underline decoration-sun decoration-2 underline-offset-4 hover:decoration-ink px-0!",
  danger: "bg-bad text-white hover:bg-bad/90",
};
const sizes: Record<Size, string> = {
  sm: "h-9 rounded-full px-4 text-sm",
  md: "h-11 rounded-full px-5 text-[15px]",
  lg: "h-13 rounded-full px-7 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: { href: string; variant?: Variant; size?: Size; className?: string; children: ReactNode } & Omit<ComponentProps<typeof Link>, "href" | "className">) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}
