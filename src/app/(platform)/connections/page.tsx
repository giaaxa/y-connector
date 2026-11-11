import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, Badge, Card, EmptyState } from "@/components/ui/primitives";
import { respondCollab } from "@/lib/actions/member";
import { requireActiveMember } from "@/lib/auth";
import { repo } from "@/lib/data";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Connections" };

export default async function ConnectionsPage() {
  const v = await requireActiveMember("/connections");
  const list = await repo().listCollabRequests(v.id);
  const people = await repo().getProfiles([...new Set(list.flatMap((c) => [c.fromId, c.toId]))]);
  const name = (id: string) => people.find((p) => p.id === id)?.fullName ?? "Member";
  return (
    <div className="mx-auto max-w-3xl">
      <p className="eyebrow text-muted">Connections</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.03em]">Collaboration requests</h1>
      <p className="mt-2 text-muted">Contact emails are only shared once a request is accepted.</p>
      <div className="mt-8 space-y-3">
        {list.map((c) => {
          const incoming = c.toId === v.id;
          const other = incoming ? c.fromId : c.toId;
          return (
            <Card key={c.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <Avatar name={name(other)} size={44} />
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  {incoming ? "From " : "To "}
                  <Link href={`/members/${other}`} className="font-semibold underline">{name(other)}</Link>
                  <span className="text-muted"> · {timeAgo(c.createdAt)}</span>
                </p>
                <p className="mt-1 text-sm text-ink-soft">“{c.message}”</p>
                {c.status === "accepted" && c.sharedContact && (
                  <p className="mt-2 text-sm">Contact: <a className="font-semibold underline" href={`mailto:${c.sharedContact}`}>{c.sharedContact}</a></p>
                )}
                {c.status === "accepted" && incoming && <p className="mt-2 text-xs text-muted">You shared your email with {name(other)}.</p>}
              </div>
              {incoming && c.status === "pending" ? (
                <form action={respondCollab} className="flex gap-2">
                  <input type="hidden" name="id" value={c.id} />
                  <Button name="decision" value="accept" size="sm" variant="dark">Accept</Button>
                  <Button name="decision" value="decline" size="sm" variant="ghost">Decline</Button>
                </form>
              ) : (
                <Badge tone={c.status === "accepted" ? "ok" : c.status === "pending" ? "warn" : "neutral"}>{c.status}</Badge>
              )}
            </Card>
          );
        })}
        {list.length === 0 && <EmptyState title="No requests yet" body="Find people in the directory and send a short note to start collaborating." />}
      </div>
    </div>
  );
}
