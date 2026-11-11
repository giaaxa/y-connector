import { Lock, MessageSquare, Pin, Plus, Search } from "lucide-react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Avatar, EmptyState, SampleTag } from "@/components/ui/primitives";
import { repo } from "@/lib/data";
import type { PostSort } from "@/lib/data/repo";
import type { Viewer } from "@/lib/types";
import { cn, timeAgo } from "@/lib/utils";
import { BookmarkButton, VoteButtons } from "./vote-buttons";

export async function ForumFeed({
  viewer,
  category,
  sort = "active",
  q,
  bookmarks = false,
}: {
  viewer: Viewer;
  category?: string;
  sort?: PostSort;
  q?: string;
  bookmarks?: boolean;
}) {
  const r = repo();
  const [cats, bookmarkIds] = await Promise.all([r.listCategories(), r.listBookmarkIds(viewer.id)]);
  const posts = await r.listPosts({ category, sort, q, ids: bookmarks ? bookmarkIds : undefined });
  const [authors, votes] = await Promise.all([
    r.getProfiles([...new Set(posts.map((p) => p.authorId))]),
    r.getUserVotes(viewer.id, posts.map((p) => p.id)),
  ]);
  const saved = new Set(bookmarkIds);
  const current = cats.find((c) => c.slug === category);
  const base = category ? `/forum/c/${category}` : "/forum";
  const qs = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams(Object.entries({ sort, q, view: bookmarks ? "saved" : undefined, ...patch }).filter(([, v]) => v) as [string, string][]);
    return `${base}${p.size ? `?${p}` : ""}`;
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_260px]">
      <div className="min-w-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-muted">Community forum</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.03em]">{bookmarks ? "Saved threads" : (current?.name ?? "All discussions")}</h1>
            {current && <p className="mt-1 text-sm text-muted">{current.description}</p>}
          </div>
          <ButtonLink href={`/forum/new${category ? `?category=${category}` : ""}`} className="shrink-0"><Plus className="h-4 w-4" /> New post</ButtonLink>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex rounded-full bg-white p-1 ring-1 ring-line" role="tablist" aria-label="Sort">
            {(["active", "new", "top"] as const).map((s) => (
              <Link key={s} href={qs({ sort: s })} role="tab" aria-selected={sort === s} className={cn("rounded-full px-4 py-1.5 text-sm font-medium", sort === s ? "bg-ink text-white" : "text-muted hover:text-ink")}>
                {s === "active" ? "Active" : s === "new" ? "Newest" : "Popular"}
              </Link>
            ))}
          </div>
          <form action={base} className="relative sm:w-64" role="search">
            <input type="hidden" name="sort" value={sort} />
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input name="q" defaultValue={q} placeholder="Search posts" aria-label="Search posts" className="h-10 w-full rounded-full border border-line bg-white pr-4 pl-9 text-sm focus:border-ink focus:outline-none" />
          </form>
        </div>
        {q && <p className="mt-4 text-sm text-muted">Results for “{q}” · <Link href={qs({ q: undefined })} className="underline">clear</Link></p>}

        <ul className="mt-6 space-y-3">
          {posts.map((p) => {
            const author = authors.find((a) => a.id === p.authorId);
            return (
              <li key={p.id} className="group flex gap-3 rounded-2xl border border-line bg-white p-4 transition hover:border-ink/30 sm:gap-4 sm:p-5">
                <VoteButtons id={p.id} type="post" score={p.score} myVote={votes[p.id] ?? 0} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                    {p.isPinned && <span className="inline-flex items-center gap-1 font-semibold text-ink"><Pin className="h-3 w-3" /> Pinned</span>}
                    <Link href={`/forum/c/${p.categorySlug}`} className="rounded-full bg-sun-soft px-2 py-0.5 font-medium text-ink hover:bg-sun">{cats.find((c) => c.slug === p.categorySlug)?.name}</Link>
                    <Link href={`/members/${p.authorId}`} className="inline-flex items-center gap-1.5 hover:text-ink">
                      <Avatar name={author?.fullName ?? "?"} size={18} /> {author?.fullName ?? "Member"}
                    </Link>
                    <span>· {timeAgo(p.createdAt)}</span>
                    {p.isLocked && <Lock className="h-3 w-3" aria-label="Locked" />}
                    {p.isSample && <SampleTag />}
                  </div>
                  <Link href={`/forum/post/${p.id}`} className="mt-1.5 block text-lg leading-snug font-semibold tracking-tight hover:underline hover:decoration-sun hover:decoration-2">
                    {p.title}
                  </Link>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{p.body}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Link href={`/forum/post/${p.id}`} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-muted hover:bg-fog">
                      <MessageSquare className="h-3.5 w-3.5" /> {p.replyCount} {p.replyCount === 1 ? "reply" : "replies"}
                    </Link>
                    <BookmarkButton postId={p.id} saved={saved.has(p.id)} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {posts.length === 0 && (
          <EmptyState
            title={bookmarks ? "No saved threads yet" : q ? "No posts match your search" : "No posts here yet"}
            body={bookmarks ? "Tap Save on any thread to keep it here." : "Why not start the conversation?"}
            action={!bookmarks ? <ButtonLink href={`/forum/new${category ? `?category=${category}` : ""}`} size="sm">Write the first post</ButtonLink> : undefined}
          />
        )}
      </div>

      <aside className="hidden xl:block">
        <nav aria-label="Categories" className="sticky top-24 rounded-2xl border border-line bg-white p-3">
          <Link href="/forum" className={cn("block rounded-lg px-3 py-2 text-sm font-medium", !category && !bookmarks ? "bg-ink text-white" : "hover:bg-fog")}>All discussions</Link>
          <Link href="/forum?view=saved" className={cn("block rounded-lg px-3 py-2 text-sm font-medium", bookmarks ? "bg-ink text-white" : "hover:bg-fog")}>Saved</Link>
          <div className="my-2 border-t border-line" />
          {cats.map((c) => (
            <Link key={c.slug} href={`/forum/c/${c.slug}`} className={cn("block rounded-lg px-3 py-1.5 text-sm", category === c.slug ? "bg-sun font-semibold" : "text-ink/75 hover:bg-fog")}>
              {c.name}
            </Link>
          ))}
        </nav>
      </aside>
    </div>
  );
}

/** Horizontal category scroller for small screens. */
export async function CategoryScroller({ active }: { active?: string }) {
  const cats = await repo().listCategories();
  return (
    <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 xl:hidden">
      <Link href="/forum" className={cn("shrink-0 rounded-full border px-3 py-1.5 text-sm", !active ? "border-ink bg-ink text-white" : "border-line bg-white")}>All</Link>
      <Link href="/forum?view=saved" className={cn("shrink-0 rounded-full border px-3 py-1.5 text-sm", active === "saved" ? "border-ink bg-ink text-white" : "border-line bg-white")}>Saved</Link>
      {cats.map((c) => (
        <Link key={c.slug} href={`/forum/c/${c.slug}`} className={cn("shrink-0 rounded-full border px-3 py-1.5 text-sm whitespace-nowrap", active === c.slug ? "border-ink bg-ink text-white" : "border-line bg-white")}>
          {c.name}
        </Link>
      ))}
    </div>
  );
}
