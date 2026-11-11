import { ArrowLeft, Lock, Pin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReplyForm, ReportButton } from "@/components/forum/reply-form";
import { BookmarkButton, VoteButtons } from "@/components/forum/vote-buttons";
import { Avatar, Badge, Card, Notice, SampleTag } from "@/components/ui/primitives";
import { RichText } from "@/components/ui/rich-text";
import { moderatePost, moderateReply } from "@/lib/actions/admin";
import { requireActiveMember } from "@/lib/auth";
import { repo } from "@/lib/data";
import { can } from "@/lib/policy";
import { timeAgo } from "@/lib/utils";

type P = Promise<{ id: string }>;
export async function generateMetadata({ params }: { params: P }): Promise<Metadata> {
  const p = await repo().getPost((await params).id).catch(() => null);
  return { title: p?.title ?? "Discussion", robots: { index: false } };
}

export default async function PostPage({ params }: { params: P }) {
  const { id } = await params;
  const v = await requireActiveMember(`/forum/post/${id}`);
  const r = repo();
  const isMod = can(v.roles, "moderate");
  const post = await r.getPost(id);
  if (!post || (post.isRemoved && !isMod)) notFound();
  const [replies, cats, bookmarks] = await Promise.all([r.listReplies(id, isMod), r.listCategories(), r.listBookmarkIds(v.id)]);
  const [people, votes] = await Promise.all([
    r.getProfiles([...new Set([post.authorId, ...replies.map((x) => x.authorId)])]),
    r.getUserVotes(v.id, [post.id, ...replies.map((x) => x.id)]),
  ]);
  const who = (uid: string) => people.find((p) => p.id === uid);
  const author = who(post.authorId);
  const cat = cats.find((c) => c.slug === post.categorySlug);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={`/forum/c/${post.categorySlug}`} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> {cat?.name}
      </Link>

      <Card className="mt-4 p-5 sm:p-7">
        {post.isRemoved && <Notice tone="bad" className="mb-4">Removed by moderators. Only staff can see this.</Notice>}
        <div className="flex gap-4">
          <VoteButtons id={post.id} type="post" score={post.score} myVote={votes[post.id] ?? 0} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
              {post.isPinned && <Badge tone="dark"><Pin className="h-3 w-3" /> Pinned</Badge>}
              {post.isLocked && <Badge><Lock className="h-3 w-3" /> Locked</Badge>}
              {post.isPublicPreview && <Badge tone="sun">Public preview</Badge>}
              {post.isSample && <SampleTag label="Example discussion" />}
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-balance sm:text-3xl">{post.title}</h1>
            <Link href={`/members/${post.authorId}`} className="mt-3 inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
              <Avatar name={author?.fullName ?? "?"} size={24} />
              <span className="font-medium text-ink">{author?.fullName}</span>
              {author?.headline && <span className="hidden truncate sm:inline">· {author.headline}</span>}
              <span>· {timeAgo(post.createdAt)}</span>
            </Link>
            <RichText text={post.body} className="mt-5 text-[16px] text-ink-soft" />
            <div className="mt-5 flex flex-wrap items-center gap-1 border-t border-line pt-4">
              <BookmarkButton postId={post.id} saved={bookmarks.includes(post.id)} />
              <ReportButton targetType="post" targetId={post.id} />
            </div>
          </div>
        </div>
        {isMod && (
          <div className="mt-5 flex flex-wrap gap-2 rounded-xl bg-mist p-3 text-xs">
            <span className="eyebrow mr-2 self-center text-muted">Moderate</span>
            {(
              [
                ["isPinned", post.isPinned, "Pin", "Unpin"],
                ["isLocked", post.isLocked, "Lock", "Unlock"],
                ["isPublicPreview", post.isPublicPreview, "Publish as public preview", "Remove public preview"],
                ["isRemoved", post.isRemoved, "Remove", "Restore"],
              ] as const
            ).map(([field, on, a, b]) => (
              <form key={field} action={moderatePost}>
                <input type="hidden" name="id" value={post.id} />
                <input type="hidden" name="field" value={field} />
                <input type="hidden" name="value" value={on ? "0" : "1"} />
                <button className={`rounded-full border px-3 py-1 font-medium hover:border-ink ${field === "isRemoved" && !on ? "border-bad/40 text-bad" : "border-line bg-white"}`}>{on ? b : a}</button>
              </form>
            ))}
          </div>
        )}
      </Card>

      <h2 className="mt-10 mb-4 text-lg font-bold">{replies.filter((x) => !x.isRemoved).length} {replies.length === 1 ? "reply" : "replies"}</h2>
      <ul className="space-y-3">
        {replies.map((c) => {
          const a = who(c.authorId);
          return (
            <li key={c.id} className={`flex gap-3 rounded-2xl border border-line bg-white p-4 sm:p-5 ${c.isRemoved ? "opacity-50" : ""}`}>
              <VoteButtons id={c.id} type="reply" score={c.score} myVote={votes[c.id] ?? 0} />
              <div className="min-w-0 flex-1">
                <Link href={`/members/${c.authorId}`} className="inline-flex items-center gap-2 text-sm hover:underline">
                  <Avatar name={a?.fullName ?? "?"} size={22} />
                  <span className="font-semibold">{a?.fullName}</span>
                  <span className="text-muted">· {timeAgo(c.createdAt)}</span>
                </Link>
                <RichText text={c.body} className="mt-2 text-[15px] text-ink-soft" />
                <div className="mt-2 flex gap-1">
                  <ReportButton targetType="reply" targetId={c.id} />
                  {isMod && (
                    <form action={moderateReply}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="value" value={c.isRemoved ? "0" : "1"} />
                      <button className="rounded-full px-2.5 py-1 text-xs font-medium text-bad hover:bg-[#fdf1f0]">{c.isRemoved ? "Restore" : "Remove"}</button>
                    </form>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <Card className="mt-6 p-5">
        {post.isLocked ? <p className="flex items-center gap-2 text-sm text-muted"><Lock className="h-4 w-4" /> This thread is locked to new replies.</p> : <ReplyForm postId={post.id} />}
      </Card>
    </div>
  );
}
