import type { Metadata } from "next";
import { CategoryScroller, ForumFeed } from "@/components/forum/forum-feed";
import { requireActiveMember } from "@/lib/auth";
import type { PostSort } from "@/lib/data/repo";

export const metadata: Metadata = { title: "Community forum" };

export default async function ForumPage({ searchParams }: { searchParams: Promise<{ sort?: string; q?: string; view?: string }> }) {
  const v = await requireActiveMember("/forum");
  const sp = await searchParams;
  const sort = (["new", "active", "top"].includes(sp.sort ?? "") ? sp.sort : "active") as PostSort;
  return (
    <>
      <CategoryScroller active={sp.view === "saved" ? "saved" : undefined} />
      <ForumFeed viewer={v} sort={sort} q={sp.q?.slice(0, 100)} bookmarks={sp.view === "saved"} />
    </>
  );
}
