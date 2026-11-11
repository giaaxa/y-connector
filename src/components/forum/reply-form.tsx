"use client";

import { useActionState, useEffect, useRef } from "react";
import { FormMessage, SubmitButton, Textarea } from "@/components/ui/form";
import { createReply, reportContent } from "@/lib/actions/member";
import type { ActionState } from "@/lib/actions/types";

export function ReplyForm({ postId }: { postId: string }) {
  const [state, action] = useActionState<ActionState, FormData>(createReply, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="postId" value={postId} />
      <label htmlFor="reply" className="sr-only">Your reply</label>
      <Textarea id="reply" name="body" rows={4} maxLength={5000} placeholder="Add to the conversation… (mention someone with @Name)" required />
      <div className="flex items-center justify-between gap-3">
        <FormMessage state={state?.ok ? null : state} />
        <SubmitButton size="sm" pendingLabel="Posting…" className="ml-auto">Reply</SubmitButton>
      </div>
    </form>
  );
}

export function ReportButton({ targetType, targetId }: { targetType: "post" | "reply"; targetId: string }) {
  const [state, action] = useActionState<ActionState, FormData>(reportContent, null);
  return (
    <details className="group relative">
      <summary className="cursor-pointer list-none rounded-full px-2.5 py-1 text-xs font-medium text-muted hover:bg-fog">Report</summary>
      <div className="absolute right-0 z-10 mt-2 w-72 rounded-2xl border border-line bg-white p-4 shadow-xl">
        {state?.ok ? (
          <p className="text-sm text-ok">{state.message}</p>
        ) : (
          <form action={action} className="space-y-3">
            <input type="hidden" name="targetType" value={targetType} />
            <input type="hidden" name="targetId" value={targetId} />
            <label htmlFor={`r-${targetId}`} className="text-sm font-medium">What&apos;s the problem?</label>
            <Textarea id={`r-${targetId}`} name="reason" rows={3} required minLength={3} className="min-h-0" />
            <FormMessage state={state} />
            <SubmitButton size="sm" variant="dark" pendingLabel="Sending…">Send report</SubmitButton>
          </form>
        )}
      </div>
    </details>
  );
}
