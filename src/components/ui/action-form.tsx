"use client";

import { CheckCircle2 } from "lucide-react";
import { useActionState, type ReactNode } from "react";
import type { ActionState } from "@/lib/actions/types";
import { cn } from "@/lib/utils";
import { FormMessage, SubmitButton } from "./form";

/** Generic form bound to a server action with pending, error and success states. */
export function ActionForm({
  action,
  children,
  submitLabel,
  pendingLabel,
  replaceOnSuccess = true,
  className,
  submitClassName,
}: {
  action: (state: ActionState, fd: FormData) => Promise<ActionState>;
  children: ReactNode;
  submitLabel: string;
  pendingLabel?: string;
  replaceOnSuccess?: boolean;
  className?: string;
  submitClassName?: string;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, null);
  if (state?.ok && replaceOnSuccess) {
    return (
      <div role="status" className="flex gap-3 rounded-2xl bg-[#eef8f2] p-5 text-ok">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <p className="text-sm font-medium">{state.message}</p>
      </div>
    );
  }
  return (
    <form action={formAction} className={cn("space-y-5", className)}>
      {children}
      {/* Honeypot for bots */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <FormMessage state={state} />
      <SubmitButton pendingLabel={pendingLabel} className={submitClassName}>{submitLabel}</SubmitButton>
    </form>
  );
}
