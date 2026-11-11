import type { Metadata } from "next";
import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import { Checkbox, ChipCheckbox, Field, Input, Select, Textarea } from "@/components/ui/form";
import { Badge, Card } from "@/components/ui/primitives";
import { submitStartup } from "@/lib/actions/member";
import { requireActiveMember } from "@/lib/auth";
import { repo } from "@/lib/data";

export const metadata: Metadata = { title: "My projects" };

const THEMES = ["AI-powered startups", "Digital marketing tools", "Peer-to-peer platforms", "Credit and microfinance innovation", "Digital payments", "Digital twins of payment ecosystems", "Data and automation products"];

export default async function ProjectsPage() {
  const v = await requireActiveMember("/projects");
  const mine = await repo().listStartups({ approval: "all", submittedBy: v.id });
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <p className="eyebrow text-muted">Built by the community</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.03em]">Showcase what you&apos;re building</h1>
        <p className="mt-2 max-w-xl text-muted">Submissions are reviewed by an admin before appearing on the public Startups page. Only share founder names with their consent.</p>
        <Card className="mt-8 p-6 sm:p-8">
          <ActionForm action={submitStartup} submitLabel="Submit for review" pendingLabel="Submitting…">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Project name" htmlFor="name" required><Input id="name" name="name" required maxLength={80} /></Field>
              <Field label="Industry" htmlFor="industry"><Input id="industry" name="industry" placeholder="e.g. FinTech · Payments" /></Field>
            </div>
            <Field label="One-line description" htmlFor="tagline"><Input id="tagline" name="tagline" maxLength={140} /></Field>
            <Field label="Description" htmlFor="description"><Textarea id="description" name="description" rows={5} maxLength={2000} /></Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Stage" htmlFor="stage">
                <Select id="stage" name="stage" defaultValue="exploring">
                  {["exploring", "building", "pilot", "launched", "growing"].map((s) => <option key={s} value={s} className="capitalize">{s[0].toUpperCase() + s.slice(1)}</option>)}
                </Select>
              </Field>
              <Field label="Website" htmlFor="website"><Input id="website" name="website" type="url" placeholder="https://" /></Field>
            </div>
            <Field label="Team needs" htmlFor="teamNeeds" hint="One per line, e.g. “Technical co-founder”"><Textarea id="teamNeeds" name="teamNeeds" rows={3} className="min-h-0" /></Field>
            <Field label="Milestones" htmlFor="milestones" hint="One per line"><Textarea id="milestones" name="milestones" rows={3} className="min-h-0" /></Field>
            <Field label="How is it connected to Y Connector?" htmlFor="communityConnection" hint="e.g. “Team formed at the Startup Lab”"><Input id="communityConnection" name="communityConnection" /></Field>
            <div>
              <p className="mb-3 text-sm font-medium">Themes</p>
              <div className="flex flex-wrap gap-2">{THEMES.map((t) => <ChipCheckbox key={t} name="themes" value={t} />)}</div>
            </div>
            <Checkbox name="showFounder" label="Show my name as a founder on the public listing" />
          </ActionForm>
        </Card>
      </div>
      <aside>
        <Card className="p-6 lg:sticky lg:top-24">
          <p className="font-semibold">Your submissions</p>
          <ul className="mt-4 space-y-3">
            {mine.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2 text-sm">
                <Link href={`/startups/${s.slug}`} className="font-medium hover:underline">{s.name}</Link>
                <Badge tone={s.approval === "approved" ? "ok" : s.approval === "pending" ? "warn" : "bad"}>{s.approval}</Badge>
              </li>
            ))}
            {mine.length === 0 && <li className="text-sm text-muted">Nothing submitted yet.</li>}
          </ul>
        </Card>
      </aside>
    </div>
  );
}
