import Link from "next/link";
import { AdminHeader } from "@/components/admin/stat";
import { Badge, Card, EmptyState } from "@/components/ui/primitives";
import { moderatePost, moderateReply, resolveReport } from "@/lib/actions/admin";
import { requirePermission } from "@/lib/auth";
import { repo } from "@/lib/data";
import { timeAgo } from "@/lib/utils";

export default async function ModerationPage() {
  await requirePermission("moderate");
  const r = repo();
  const reports = await r.listReports();
  const open = reports.filter((x) => x.status === "open");
  const targets = await Promise.all(
    open.map(async (rep) => {
      if (rep.targetType === "post") {
        const p = await r.getPost(rep.targetId);
        return { rep, title: p?.title ?? "(deleted)", body: p?.body ?? "", postId: p?.id, removed: p?.isRemoved ?? false };
      }
      const c = await r.getReply(rep.targetId);
      return { rep, title: "Reply", body: c?.body ?? "(deleted)", postId: c?.postId, removed: c?.isRemoved ?? false };
    }),
  );
  const reporters = await r.getProfiles([...new Set(open.map((x) => x.reporterId))]);
  const publicPreview = await r.listPosts({ limit: 50 }).then((ps) => ps.filter((p) => p.isPublicPreview));

  return (
    <div>
      <AdminHeader title="Moderation" intro="Review reports, remove content and choose which threads appear in the public preview." />
      <h2 className="mb-4 text-xl font-bold">Open reports ({open.length})</h2>
      <div className="space-y-4">
        {targets.map(({ rep, title, body, postId, removed }) => (
          <Card key={rep.id} className="p-5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
              <Badge tone="warn">{rep.targetType}</Badge>
              <span>Reported by {reporters.find((p) => p.id === rep.reporterId)?.fullName ?? "member"} · {timeAgo(rep.createdAt)}</span>
              {removed && <Badge tone="bad">Removed</Badge>}
            </div>
            <p className="mt-3 font-semibold">{postId ? <Link href={`/forum/post/${postId}`} className="hover:underline">{title}</Link> : title}</p>
            <p className="mt-1 line-clamp-3 text-sm text-ink-soft">{body}</p>
            <p className="mt-3 rounded-xl bg-mist px-3 py-2 text-sm"><span className="font-medium">Reason:</span> {rep.reason}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <form action={rep.targetType === "post" ? moderatePost : moderateReply}>
                <input type="hidden" name="id" value={rep.targetId} />
                {rep.targetType === "post" && <input type="hidden" name="field" value="isRemoved" />}
                <input type="hidden" name="value" value={removed ? "0" : "1"} />
                <button className="rounded-full border border-bad/40 px-3 py-1.5 text-xs font-medium text-bad hover:bg-[#fdf1f0]">{removed ? "Restore content" : "Remove content"}</button>
              </form>
              <form action={resolveReport}><input type="hidden" name="id" value={rep.id} /><button name="status" value="resolved" className="rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-white">Mark resolved</button></form>
              <form action={resolveReport}><input type="hidden" name="id" value={rep.id} /><button name="status" value="dismissed" className="rounded-full border border-line px-3 py-1.5 text-xs font-medium">Dismiss</button></form>
            </div>
          </Card>
        ))}
        {open.length === 0 && <EmptyState title="No open reports" body="The community is behaving. 🎉" />}
      </div>

      <h2 className="mt-12 mb-2 text-xl font-bold">Public preview threads ({publicPreview.length})</h2>
      <p className="mb-4 text-sm text-muted">These titles appear on the public homepage and community page. Toggle from any thread&apos;s moderation bar.</p>
      <Card className="divide-y divide-line">
        {publicPreview.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-4 px-5 py-3">
            <Link href={`/forum/post/${p.id}`} className="text-sm font-medium hover:underline">{p.title}</Link>
            <form action={moderatePost}>
              <input type="hidden" name="id" value={p.id} /><input type="hidden" name="field" value="isPublicPreview" /><input type="hidden" name="value" value="0" />
              <button className="text-xs text-muted underline">Unpublish</button>
            </form>
          </div>
        ))}
        {publicPreview.length === 0 && <p className="px-5 py-4 text-sm text-muted">None. The public site shows labelled example threads instead.</p>}
      </Card>
    </div>
  );
}
