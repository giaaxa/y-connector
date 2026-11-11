"use client";

import { Loader2 } from "lucide-react";
import { useId, type ComponentProps, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import { buttonClass } from "./button";

const control =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[15px] text-ink placeholder:text-subtle transition focus:border-ink focus:outline-none focus:ring-4 focus:ring-sun/30 disabled:bg-mist aria-[invalid=true]:border-bad";

export function Field({
  label,
  hint,
  error,
  children,
  required,
  htmlFor,
  className,
}: {
  label: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  required?: boolean;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {label}
        {required && <span className="text-bad"> *</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && (
        <p className="text-xs font-medium text-bad" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({ className, ...p }: ComponentProps<"input">) {
  return <input className={cn(control, className)} {...p} />;
}

export function Textarea({ className, ...p }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-28 leading-relaxed", className)} {...p} />;
}

export function Select({ className, children, ...p }: ComponentProps<"select">) {
  return (
    <select className={cn(control, "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23111%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[right_0.9rem_center] bg-no-repeat pr-9", className)} {...p}>
      {children}
    </select>
  );
}

export function Checkbox({ label, className, ...p }: ComponentProps<"input"> & { label: ReactNode }) {
  const id = useId();
  return (
    <label htmlFor={p.id ?? id} className={cn("flex cursor-pointer items-start gap-3 text-sm", className)}>
      <input id={p.id ?? id} type="checkbox" className="mt-0.5 h-4.5 w-4.5 shrink-0 cursor-pointer rounded accent-ink" {...p} />
      <span className="leading-snug">{label}</span>
    </label>
  );
}

export function ChipCheckbox({ name, value, label, defaultChecked }: { name: string; value: string; label?: string; defaultChecked?: boolean }) {
  return (
    <label className="cursor-pointer">
      <input type="checkbox" name={name} value={value} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="inline-flex items-center rounded-full border border-line px-3 py-1.5 text-sm transition peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-sun hover:border-ink">
        {label ?? value}
      </span>
    </label>
  );
}

export function SubmitButton({
  children,
  pendingLabel = "Working…",
  variant = "primary",
  size = "md",
  className,
  ...p
}: ComponentProps<"button"> & { pendingLabel?: string; variant?: Parameters<typeof buttonClass>[0]; size?: Parameters<typeof buttonClass>[1] }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || p.disabled} aria-busy={pending} className={buttonClass(variant, size, className)} {...p}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function FormMessage({ state }: { state: { ok?: boolean; message?: string } | null | undefined }) {
  if (!state?.message) return null;
  return (
    <p
      role={state.ok ? "status" : "alert"}
      className={cn("rounded-xl px-4 py-3 text-sm", state.ok ? "bg-[#eef8f2] text-ok" : "bg-[#fdf1f0] text-bad")}
    >
      {state.message}
    </p>
  );
}
