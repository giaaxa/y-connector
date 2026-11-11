import { FileText, MailCheck, MailWarning } from "lucide-react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/stat";
import { Button } from "@/components/ui/button";
import { Badge, Card, EmptyState } from "@/components/ui/primitives";
import { reviewApplication } from "@/lib/actions/admin";
import { requirePermission } from "@/lib/auth";
import { repo } from "@/lib/data";
import { ageOn, checkEligibility, isEssexUniversity } from "@/lib/policy";
import type { ApplicationStatus } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

const TABS: { key: ApplicationStatus | "all"; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "more_info", label: "More info" },
  { key: "verified", label: "Verified" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
];
const TONE = { pending: "warn", more_info: "sun", verified: "ok", rejected: "bad" } as const;

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requirePermission("reviewApplications");
  const { status = "pending" } = await searchParams;
  const settings = await repo().getSettings();
  const all = await repo().listApplications();
  const list = status === "all" ? all : all.filter((a) => a.status === status);

  return (
    <div>
      <AdminHeader title="Membership applications" intro="Verify eligibility before members can pay. Date of birth and documents are private. Never share them." />
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link key={t.key} href={`/admin/applications?status=${t.key}`} className={cn("rounded-full border px-3.5 py-1.5 text-sm", status === t.key ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink")}>
            {t.label} <span className="opacity-60">({t.key === "all" ? all.length : all.filter((a) => a.status === t.key).length})</span>
          </Link>
        ))}
      </div>
      <div className="space-y-4">
        {list.map((a) => {
          const problems = checkEligibility(a, settings);
          const essex = isEssexUniversity(a.university, settings) && a.studentStatus === "alumni";
          return (
            <Card key={a.id} className="p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">{a.fullName}</p>
                  <p className="text-sm text-muted">{a.email} · submitted {formatDate(a.submittedAt)}</p>
                </div>
                <Badge tone={TONE[a.status]}>{a.status.replace("_", " ")}</Badge>
              </div>
              <dl className="mt-5 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div><dt className="text-muted">Age</dt><dd className="font-medium">{ageOn(a.dateOfBirth)}</dd></div>
                <div><dt className="text-muted">University</dt><dd className="font-medium">{a.university}</dd></div>
                <div><dt className="text-muted">Status</dt><dd className="font-medium capitalize">{a.studentStatus}{a.graduationYear ? ` · ${a.graduationYear}` : ""}</dd></div>
                <div><dt className="text-muted">Location</dt><dd className="font-medium">{a.location}</dd></div>
                <div className="sm:col-span-2">
                  <dt className="text-muted">University email</dt>
                  <dd className="flex items-center gap-1.5 font-medium">
                    {a.universityEmail ? (
                      <>{a.universityEmailVerified ? <MailCheck className="h-4 w-4 text-ok" /> : <MailWarning className="h-4 w-4 text-warn" />}{a.universityEmail} <span className="text-xs text-muted">({a.universityEmailVerified ? "confirmed" : "unconfirmed"})</span></>
                    ) : "—"}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-muted">Proof of status</dt>
                  <dd className="font-medium">
                    {a.proofPath ? (
                      a.proofPath.startsWith("demo-not-stored/") ? <span className="text-muted">Uploaded (preview mode: file not retained)</span> : (
                        <a href={`/api/admin/proof?user=${a.userId}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1 underline"><FileText className="h-4 w-4" /> View document (60-second link)</a>
                      )
                    ) : "—"}
                  </dd>
                </div>
              </dl>
              {a.professionalInterests && <p className="mt-4 rounded-xl bg-mist p-3 text-sm text-ink-soft">“{a.professionalInterests}”</p>}
              {problems.length > 0 && <p className="mt-3 text-sm font-medium text-bad">Policy check: {problems.join(" ")}</p>}

              <form action={reviewApplication} className="mt-5 grid gap-3 border-t border-line pt-5 sm:grid-cols-[auto_auto_1fr_auto] sm:items-end">
                <input type="hidden" name="id" value={a.id} />
                <label className="text-sm">
                  <span className="mb-1 block text-xs text-muted">Decision</span>
                  <select name="status" defaultValue={a.status === "pending" ? "verified" : a.status} className="h-10 rounded-xl border border-line bg-white px-3">
                    <option value="verified">Verify</option>
                    <option value="more_info">Request more info</option>
                    <option value="rejected">Reject</option>
                    <option value="pending">Back to pending</option>
                  </select>
                </label>
                <label className="text-sm">
                  <span className="mb-1 block text-xs text-muted">Tier {essex && "(Essex match)"}</span>
                  <select name="tier" defaultValue={a.tier} className="h-10 rounded-xl border border-line bg-white px-3">
                    <option value="essex_alumni">Essex Alumni (£{settings.priceEssexPence / 100})</option>
                    <option value="standard">Eligible Member (£{settings.priceStandardPence / 100})</option>
                  </select>
                </label>
                <label className="text-sm">
                  <span className="mb-1 block text-xs text-muted">Note to applicant (emailed)</span>
                  <input name="note" defaultValue={a.reviewerNote} className="h-10 w-full rounded-xl border border-line px-3" />
                </label>
                <Button size="sm" variant="dark" className="h-10">Save decision</Button>
              </form>
            </Card>
          );
        })}
        {list.length === 0 && <EmptyState title="Nothing in this queue" body="New applications will appear here." />}
      </div>
    </div>
  );
}
