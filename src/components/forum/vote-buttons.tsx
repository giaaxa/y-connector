"use client";

import { ArrowBigDown, ArrowBigUp, Bookmark } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { castVote, toggleBookmark } from "@/lib/actions/member";
import { cn } from "@/lib/utils";

export function VoteButtons({
  id,
  type,
  score,
  myVote,
  horizontal = false,
}: {
  id: string;
  type: "post" | "reply";
  score: number;
  myVote: number;
  horizontal?: boolean;
}) {
  const [, start] = useTransition();
  const [state, setState] = useOptimistic({ score, myVote });
  const vote = (dir: 1 | -1) => {
    const next = state.myVote === dir ? 0 : dir;
    start(async () => {
      setState({ score: state.score - state.myVote + next, myVote: next });
      const fd = new FormData();
      fd.set("id", id);
      fd.set("type", type);
      fd.set("value", String(next));
      await castVote(fd);
    });
  };
  return (
    <div className={cn("flex items-center gap-0.5", horizontal ? "flex-row" : "flex-col")}>
      <button
        type="button"
        onClick={() => vote(1)}
        aria-label="Upvote"
        aria-pressed={state.myVote === 1}
        className={cn("rounded-md p-1 transition hover:bg-sun-soft", state.myVote === 1 ? "text-ink" : "text-subtle")}
      >
        <ArrowBigUp className={cn("h-5 w-5", state.myVote === 1 && "fill-sun")} />
      </button>
      <span className="min-w-6 text-center text-sm font-semibold tabular-nums" aria-live="polite">{state.score}</span>
      <button
        type="button"
        onClick={() => vote(-1)}
        aria-label="Downvote"
        aria-pressed={state.myVote === -1}
        className={cn("rounded-md p-1 transition hover:bg-fog", state.myVote === -1 ? "text-ink" : "text-subtle")}
      >
        <ArrowBigDown className={cn("h-5 w-5", state.myVote === -1 && "fill-ink")} />
      </button>
    </div>
  );
}

export function BookmarkButton({ postId, saved }: { postId: string; saved: boolean }) {
  const [, start] = useTransition();
  const [on, setOn] = useOptimistic(saved);
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() =>
        start(async () => {
          setOn(!on);
          const fd = new FormData();
          fd.set("postId", postId);
          await toggleBookmark(fd);
        })
      }
      className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition hover:bg-fog", on ? "text-ink" : "text-muted")}
    >
      <Bookmark className={cn("h-3.5 w-3.5", on && "fill-sun")} /> {on ? "Saved" : "Save"}
    </button>
  );
}
