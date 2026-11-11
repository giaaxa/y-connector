import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import { Checkbox, ChipCheckbox, Field, Input, Select, Textarea } from "@/components/ui/form";
import { Card } from "@/components/ui/primitives";
import { signOut } from "@/lib/actions/auth";
import { updateProfile } from "@/lib/actions/member";
import { requireViewer } from "@/lib/auth";
import { INTEREST_OPTIONS, SKILL_OPTIONS } from "@/lib/constants";
import { can } from "@/lib/policy";

export const metadata: Metadata = { title: "Profile settings" };

export default async function AccountPage() {
  const v = await requireViewer("/account");
  const p = v.profile;
  const mobileLinks = [
    { href: "/connections", label: "Connections" },
    { href: "/projects", label: "My projects" },
    { href: "/referrals", label: "Invite friends" },
    { href: "/events", label: "Events" },
    ...(can(v.roles, "viewMetrics") ? [{ href: "/admin", label: "Admin" }] : []),
  ];
  return (
    <div className="space-y-8">
      {/* Mobile shortcuts to sections not in the bottom tab bar */}
      <Card className="divide-y divide-line lg:hidden">
        {mobileLinks.map((l) => (
          <Link key={l.href} href={l.href} className="flex items-center justify-between px-5 py-3.5 text-sm font-medium">
            {l.label} <ChevronRight className="h-4 w-4 text-subtle" />
          </Link>
        ))}
        <form action={signOut}><button className="w-full px-5 py-3.5 text-left text-sm font-medium text-bad">Sign out</button></form>
      </Card>

      <Card className="p-6 sm:p-8">
        <ActionForm action={updateProfile} submitLabel="Save profile" pendingLabel="Saving…" replaceOnSuccess={false}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" htmlFor="fullName"><Input id="fullName" name="fullName" defaultValue={p.fullName} maxLength={120} /></Field>
            <Field label="Professional headline" htmlFor="headline"><Input id="headline" name="headline" defaultValue={p.headline} maxLength={140} placeholder="e.g. Data scientist · building in FinTech" /></Field>
            <Field label="University" htmlFor="university"><Input id="university" name="university" defaultValue={p.university} /></Field>
            <Field label="City" htmlFor="city"><Input id="city" name="city" defaultValue={p.city} /></Field>
          </div>
          <Field label="Short bio" htmlFor="bio" hint="Optional · max 1,200 characters"><Textarea id="bio" name="bio" defaultValue={p.bio} maxLength={1200} /></Field>
          <div>
            <p className="mb-3 text-sm font-medium">Skills</p>
            <div className="flex flex-wrap gap-2">{SKILL_OPTIONS.map((s) => <ChipCheckbox key={s} name="skills" value={s} defaultChecked={p.skills.includes(s)} />)}</div>
          </div>
          <div>
            <p className="mb-3 text-sm font-medium">Interests</p>
            <div className="flex flex-wrap gap-2">{INTEREST_OPTIONS.map((s) => <ChipCheckbox key={s} name="interests" value={s} defaultChecked={p.interests.includes(s)} />)}</div>
          </div>
          <Field label="Current projects" htmlFor="currentProjects"><Textarea id="currentProjects" name="currentProjects" defaultValue={p.currentProjects} maxLength={600} className="min-h-20" /></Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Startup stage" htmlFor="startupStage">
              <Select id="startupStage" name="startupStage" defaultValue={p.startupStage ?? ""}>
                <option value="">Not applicable</option>
                {["idea", "exploring", "building", "pilot", "launched", "growing"].map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
              </Select>
            </Field>
            <Field label="LinkedIn or portfolio URL" htmlFor="websiteUrl"><Input id="websiteUrl" name="websiteUrl" type="url" defaultValue={p.websiteUrl} placeholder="https://" /></Field>
          </div>
          <div className="space-y-3 rounded-2xl bg-mist p-5">
            <p className="text-sm font-semibold">Discoverability & contact</p>
            <Checkbox name="lookingForCollaborators" defaultChecked={p.lookingForCollaborators} label="I'm looking for collaborators" />
            <Checkbox name="availableForMentoring" defaultChecked={p.availableForMentoring} label="I'm available for mentoring" />
            <Checkbox name="discoverable" defaultChecked={p.discoverable} label="Show my profile in the members-only talent directory" />
            <Checkbox name="allowContact" defaultChecked={p.allowContact} label="Allow members to send me collaboration requests (my email is only shared if I accept)" />
          </div>
        </ActionForm>
      </Card>
    </div>
  );
}
