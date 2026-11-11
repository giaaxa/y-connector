"use client";

import { CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { Checkbox, Field, FormMessage, Input, SubmitButton } from "@/components/ui/form";
import { rsvpToEvent } from "@/lib/actions/member";
import type { ActionState } from "@/lib/actions/types";

export function RsvpForm({ eventId, signedIn, full }: { eventId: string; signedIn: boolean; full: boolean }) {
  const [state, action] = useActionState<ActionState, FormData>(rsvpToEvent, null);
  if (state?.ok) {
    const waitlist = state.data?.status === "waitlist";
    return (
      <div role="status" className="rounded-2xl bg-[#eef8f2] p-5 text-ok">
        <div className="flex items-center gap-2 font-semibold">
          {waitlist ? <Clock className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
          {waitlist ? "You're on the waitlist" : "Booking confirmed"}
        </div>
        <p className="mt-1 text-sm text-ink-soft">{state.message}</p>
      </div>
    );
  }
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="eventId" value={eventId} />
      {!signedIn && (
        <>
          <Field label="Full name" htmlFor="rsvp-name" required>
            <Input id="rsvp-name" name="name" autoComplete="name" required />
          </Field>
          <Field label="Email" htmlFor="rsvp-email" required>
            <Input id="rsvp-email" name="email" type="email" autoComplete="email" required />
          </Field>
          <Checkbox name="consent" required label={<>I agree to Y Connector using these details to manage my registration, as described in the <Link className="underline" href="/legal/privacy">privacy policy</Link>.</>} />
        </>
      )}
      <FormMessage state={state} />
      <SubmitButton className="w-full" size="lg" pendingLabel="Reserving…">
        {full ? "Join the waitlist" : "Reserve my place"}
      </SubmitButton>
    </form>
  );
}
