import { ArrowBigUp, MessageSquare } from "lucide-react";
import { Avatar } from "@/components/ui/primitives";
import { timeAgo } from "@/lib/utils";

/** Read-only, non-interactive post row for public previews. */
export function PostPreview({
  title,
  category,
  author,
  score,
  replies,
  createdAt,
  dark = false,
}: {
  title: string;
  category: string;
  author: string;
  score: number;
  replies: number;
  createdAt: string;
  dark?: boolean;
}) {
  return (
    <div className={`flex gap-4 rounded-xl px-4 py-3.5 transition ${dark ? "hover:bg-white/5" : "hover:bg-mist"}`}>
      <div className={`flex w-10 shrink-0 flex-col items-center pt-0.5 ${dark ? "text-white/70" : "text-muted"}`}>
        <ArrowBigUp className={`h-5 w-5 ${dark ? "text-sun" : ""}`} aria-hidden />
        <span className="text-sm font-semibold tabular-nums">{score}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className={`flex flex-wrap items-center gap-2 text-xs ${dark ? "text-white/50" : "text-muted"}`}>
          <span className={`rounded-full px-2 py-0.5 font-medium ${dark ? "bg-white/10 text-sun" : "bg-sun-soft text-ink"}`}>{category}</span>
          <span className="inline-flex items-center gap-1.5">
            <Avatar name={author} size={16} /> {author}
          </span>
          <span>· {timeAgo(createdAt)}</span>
        </div>
        <p className={`mt-1.5 font-semibold leading-snug ${dark ? "text-white" : ""}`}>{title}</p>
        <p className={`mt-1.5 inline-flex items-center gap-1.5 text-xs ${dark ? "text-white/50" : "text-muted"}`}>
          <MessageSquare className="h-3.5 w-3.5" aria-hidden /> {replies} {replies === 1 ? "reply" : "replies"}
        </p>
      </div>
    </div>
  );
}
