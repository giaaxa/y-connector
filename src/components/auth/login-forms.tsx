"use client";

import { useActionState, useState } from "react";
import { Field, FormMessage, Input, SubmitButton } from "@/components/ui/form";
import { requestPasswordReset, sendMagicLink, signIn, updatePassword } from "@/lib/actions/auth";
import type { ActionState } from "@/lib/actions/types";
import { cn } from "@/lib/utils";

export function LoginForm({ next }: { next: string }) {
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [pwState, pwAction] = useActionState<ActionState, FormData>(signIn, null);
  const [mlState, mlAction] = useActionState<ActionState, FormData>(sendMagicLink, null);
  return (
    <div>
      <div className="mb-6 inline-flex rounded-full bg-fog p-1 text-sm" role="tablist">
        {(["password", "magic"] as const).map((m) => (
          <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)} className={cn("rounded-full px-4 py-1.5 font-medium transition", mode === m ? "bg-white shadow-sm" : "text-muted")}>
            {m === "password" ? "Password" : "Email me a link"}
          </button>
        ))}
      </div>
      {mode === "password" ? (
        <form action={pwAction} className="space-y-5">
          <input type="hidden" name="next" value={next} />
          <Field label="Email" htmlFor="email">
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </Field>
          <Field label="Password" htmlFor="password" hint={<a href="/forgot-password" className="underline">Forgot your password?</a>}>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </Field>
          <FormMessage state={pwState} />
          <SubmitButton className="w-full" size="lg" pendingLabel="Signing in…">Log in</SubmitButton>
        </form>
      ) : (
        <form action={mlAction} className="space-y-5">
          <Field label="Email" htmlFor="ml-email" hint="We'll email you a secure one-time sign-in link.">
            <Input id="ml-email" name="email" type="email" autoComplete="email" required />
          </Field>
          <FormMessage state={mlState} />
          <SubmitButton className="w-full" size="lg" pendingLabel="Sending…">Send sign-in link</SubmitButton>
        </form>
      )}
    </div>
  );
}

export function ForgotForm() {
  const [state, action] = useActionState<ActionState, FormData>(requestPasswordReset, null);
  return (
    <form action={action} className="space-y-5">
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>
      <FormMessage state={state} />
      <SubmitButton className="w-full" size="lg" pendingLabel="Sending…">Send reset link</SubmitButton>
    </form>
  );
}

export function ResetForm() {
  const [state, action] = useActionState<ActionState, FormData>(updatePassword, null);
  return (
    <form action={action} className="space-y-5">
      <Field label="New password" htmlFor="password" hint="At least 10 characters.">
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required />
      </Field>
      <Field label="Confirm password" htmlFor="confirm">
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required />
      </Field>
      <FormMessage state={state} />
      <SubmitButton className="w-full" size="lg" pendingLabel="Saving…">Update password</SubmitButton>
    </form>
  );
}
