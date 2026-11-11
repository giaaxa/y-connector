"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/ui/form";
import { resendUniversityEmail } from "@/lib/actions/auth";
import type { ActionState } from "@/lib/actions/types";

export function ResendUniEmail() {
  const [state, action] = useActionState<ActionState, FormData>(resendUniversityEmail, null);
  return (
    <form action={action} className="space-y-2">
      <SubmitButton variant="outline" size="sm" pendingLabel="Sending…">Send verification email</SubmitButton>
      {state?.message && <p className="text-xs text-muted">{state.message}</p>}
      {state?.data?.link && (
        <a href={state.data.link} className="block text-xs font-semibold underline decoration-sun decoration-2">
          Preview mode: open the verification link
        </a>
      )}
    </form>
  );
}
