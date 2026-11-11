import { notFound } from "next/navigation";
import { CategoryScroller, ForumFeed } from "@/components/forum/forum-feed";
import { requireActiveMember } from "@/lib/auth";
import { repo } from "@/lib/data";
import type { PostSort } from "@/lib/data/repo";

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ sort?: string; q?: string }> }) {
  const { slug } = await params;
  const v = await requireActiveMember(`/forum/c/${slug}`);
  if (!(await repo().listCategories()).some((c) => c.slug === slug)) notFound();
  const sp = await searchParams;
  const sort = (["new", "active", "top"].includes(sp.sort ?? "") ? sp.sort : "active") as PostSort;
  return (
    <>
      <CategoryScroller active={slug} />
      <ForumFeed viewer={v} category={slug} sort={sort} q={sp.q?.slice(0, 100)} />
    </>
  );
}
