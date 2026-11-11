import { ArrowLeft, ExternalLink, Lock, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/ui/action-form";
import { Field, Textarea } from "@/components/ui/form";
import { ButtonLink } from "@/components/ui/button";
import { Avatar, Badge, Card, Notice } from "@/components/ui/primitives";
import { sendCollabRequest } from "@/lib/actions/member";
import { requireActiveMember } from "@/lib/auth";
import { repo } from "@/lib/data";
import { ROLE_LABELS } from "@/lib/policy";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Member profile", robots: { index: false } };

export default async function MemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const v = await requireActiveMember(`/members/${id}`);
  const r = repo();
  const p = await r.getProfile(id);
  if (!p) notFound();
  const isSelf = p.id === v.id;
  // Non-discoverable members show a minimal card (name only) to other members.
  const limited = !p.discoverable && !isSelf && !v.isStaff;
  const [posts, collabs] = await Promise.all([r.listPosts({ authorId: p.id, sort: "new", limit: 5 }), r.listCollabRequests(v.id)]);
  const existing = collabs.find((c) => (c.fromId === v.id && c.toId === p.id) || (c.toId === v.id && c.fromId === p.id));
  const specialRoles = p.roles.filter((x) => x === "mentor" || x === "moderator");

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/directory" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"><ArrowLeft className="h-4 w-4" /> Directory</Link>
      <Card className="mt-4 overflow-hidden">
        <div className="h-24 bg-ink bg-[radial-gradient(circle_at_85%_-20%,#ffcc00_0,transparent_45%)]" />
        <div className="px-6 pb-6 sm:px-8">
          <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="rounded-full ring-4 ring-white"><Avatar name={p.fullName} size={84} /></div>
            {isSelf && <ButtonLink href="/account" variant="outline" size="sm">Edit profile</ButtonLink>}
          </div>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">{p.fullName}</h1>
          {!limited && <p className="mt-1 text-lg text-ink-soft">{p.headline}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted">
            {!limited && p.university && <span>{p.university}</span>}
            {!limited && p.city && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {p.city}</span>}
            {specialRoles.map((x) => <Badge key={x} tone="dark">{ROLE_LABELS[x]}</Badge>)}
            {!limited && p.lookingForCollaborators && <Badge tone="sun">Open to collaborate</Badge>}
            {!limited && p.availableForMentoring && <Badge tone="outline">Available to mentor</Badge>}
          </div>
        </div>
      </Card>

      {limited ? (
        <Notice tone="neutral" className="mt-6"><Lock className="mr-1 inline h-3.5 w-3.5" /> This member keeps their profile private.</Notice>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {p.bio && <Card className="p-6"><p className="eyebrow text-muted">About</p><p className="mt-3 leading-relaxed whitespace-pre-line">{p.bio}</p></Card>}
            {p.currentProjects && (
              <Card className="p-6">
                <p className="eyebrow text-muted">Currently building</p>
                <p className="mt-3 leading-relaxed">{p.currentProjects}</p>
                {p.startupStage && <p className="mt-3 text-sm text-muted">Stage: <span className="capitalize">{p.startupStage}</span></p>}
              </Card>
            )}
            <Card className="p-6">
              <p className="eyebrow text-muted">Recent posts</p>
              <ul className="mt-3 divide-y divide-line">
                {posts.map((x) => (
                  <li key={x.id} className="py-3">
                    <Link href={`/forum/post/${x.id}`} className="font-medium hover:underline">{x.title}</Link>
                    <p className="text-xs text-muted">{timeAgo(x.createdAt)} · {x.replyCount} replies</p>
                  </li>
                ))}
                {posts.length === 0 && <li className="py-3 text-sm text-muted">No posts yet.</li>}
              </ul>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="p-6">
              <p className="eyebrow text-muted">Skills</p>
              <div className="mt-3 flex flex-wrap gap-1.5">{p.skills.map((s) => <span key={s} className="rounded-md bg-fog px-2 py-1 text-sm">{s}</span>)}</div>
              {p.interests.length > 0 && (
                <>
                  <p className="eyebrow mt-6 text-muted">Interests</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">{p.interests.map((s) => <span key={s} className="rounded-md border border-line px-2 py-1 text-sm">{s}</span>)}</div>
                </>
              )}
              {p.websiteUrl && (
                <a href={p.websiteUrl} target="_blank" rel="noopener noreferrer nofollow" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold underline decoration-sun decoration-2 underline-offset-4">
                  LinkedIn / portfolio <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </Card>
            {!isSelf && (
              <Card className="p-6">
                <p className="font-semibold">Collaborate with {p.fullName.split(" ")[0]}</p>
                {existing ? (
                  <div className="mt-3 text-sm">
                    <Badge tone={existing.status === "accepted" ? "ok" : existing.status === "pending" ? "warn" : "neutral"}>{existing.status}</Badge>
                    {existing.status === "accepted" && existing.sharedContact && (
                      <p className="mt-3">Contact: <a href={`mailto:${existing.sharedContact}`} className="font-semibold underline">{existing.sharedContact}</a></p>
                    )}
                    <Link href="/connections" className="mt-3 block text-muted underline">View connections</Link>
                  </div>
                ) : p.allowContact ? (
                  <ActionForm action={sendCollabRequest} submitLabel="Send request" pendingLabel="Sending…" className="mt-3" submitClassName="w-full">
                    <input type="hidden" name="toId" value={p.id} />
                    <Field label="Short note" htmlFor="msg" hint="Your email stays private unless they accept.">
                      <Textarea id="msg" name="message" rows={3} required minLength={5} maxLength={1000} className="min-h-0" />
                    </Field>
                  </ActionForm>
                ) : (
                  <p className="mt-2 text-sm text-muted">Not accepting collaboration requests right now.</p>
                )}
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
