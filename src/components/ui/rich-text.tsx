import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Safe, minimal text renderer (no HTML injection): paragraphs, "## " headings,
 * "- " bullet lists, https:// links and @mentions (linked to directory search).
 */
export function RichText({ text, className }: { text: string; className?: string }) {
  const blocks: ReactNode[] = [];
  const lines = text.replace(/\r/g, "").split("\n");
  let para: string[] = [];
  let list: string[] = [];
  const flushPara = () => {
    if (para.length) blocks.push(<p key={blocks.length}>{inline(para.join(" "))}</p>);
    para = [];
  };
  const flushList = () => {
    if (list.length) blocks.push(<ul key={blocks.length}>{list.map((l, i) => <li key={i}>{inline(l)}</li>)}</ul>);
    list = [];
  };
  for (const line of lines) {
    if (line.startsWith("## ")) {
      flushPara();
      flushList();
      blocks.push(<h2 key={blocks.length}>{inline(line.slice(3))}</h2>);
    } else if (line.startsWith("- ")) {
      flushPara();
      list.push(line.slice(2));
    } else if (!line.trim()) {
      flushPara();
      flushList();
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();
  return <div className={cn("prose-yc", className)}>{blocks}</div>;
}

function inline(s: string): ReactNode {
  const parts = s.split(/(https:\/\/[^\s)]+|@[A-Za-z][A-Za-z.'-]{1,30})/g);
  return parts.map((p, i) => {
    if (p.startsWith("https://"))
      return <a key={i} href={p} target="_blank" rel="noopener noreferrer nofollow">{p}</a>;
    if (p.startsWith("@"))
      return (
        <Link key={i} href={`/directory?q=${encodeURIComponent(p.slice(1))}`} className="rounded bg-sun-soft px-1 font-medium no-underline!">
          {p}
        </Link>
      );
    return <Fragment key={i}>{p}</Fragment>;
  });
}
