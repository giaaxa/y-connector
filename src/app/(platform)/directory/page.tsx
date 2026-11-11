import { Search, Sparkles, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Avatar, Badge, EmptyState, Notice } from "@/components/ui/primitives";
import { requireActiveMember } from "@/lib/auth";
import { SKILL_OPTIONS } from "@/lib/constants";
import { repo } from "@/lib/data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Talent directory" };

export default async function DirectoryPage({ searchParams }: { searchParams: Promise<{ q?: string; skill?: string; collab?: string; mentor?: string }> }) {
  const v = await requireActiveMember("/directory");
  const sp = await searchParams;
  const people = await repo().searchDirectory({ q: sp.q?.slice(0, 80), skill: sp.skill, collaborators: sp.collab === "1", mentors: sp.mentor === "1" });
  const qs = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams(Object.entries({ ...sp, ...patch }).filter(([, x]) => x) as [string, string][]);
    return `/directory${p.size ? `?${p}` : ""}`;
  };
  return (
    <div>
      <p className="eyebrow text-muted">Talent pool</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.03em]">Find collaborators, co-founders and mentors.</h1>
      {!v.profile.discoverable && (
        <Notice className="mt-6" title="You're not in the directory yet">
          Your profile is private. <Link href="/account" className="font-semibold underline">Opt in from your profile settings</Link> so others can find you.
        </Notice>
      )}
      <form action="/directory" className="relative mt-6" role="search">
        {sp.skill && <input type="hidden" name="skill" value={sp.skill} />}
        <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-subtle" />
        <input name="q" defaultValue={sp.q} placeholder="Search by name, skill, university or project" aria-label="Search the directory" className="h-12 w-full rounded-full border border-line bg-white pr-4 pl-11 focus:border-ink focus:outline-none" />
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={qs({ skill: undefined })} className={chip(!sp.skill)}>All skills</Link>
        {SKILL_OPTIONS.map((s) => <Link key={s} href={qs({ skill: s })} className={chip(sp.skill === s)}>{s}</Link>)}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href={qs({ collab: sp.collab ? undefined : "1" })} className={chip(sp.collab === "1")}><Users className="h-3.5 w-3.5" /> Open to collaborate</Link>
        <Link href={qs({ mentor: sp.mentor ? undefined : "1" })} className={chip(sp.mentor === "1")}><Sparkles className="h-3.5 w-3.5" /> Available to mentor</Link>
      </div>

      <p className="mt-8 text-sm text-muted">{people.length} {people.length === 1 ? "member" : "members"}</p>
      <ul className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {people.map((p) => (
          <li key={p.id}>
            <Link href={`/members/${p.id}`} className="flex h-full flex-col rounded-2xl border border-line bg-white p-5 transition hover:-translate-y-0.5 hover:border-ink/40">
              <div className="flex items-center gap-3">
                <Avatar name={p.fullName} size={48} />
                <div className="min-w-0">
                  <p className="font-semibold">{p.fullName}{p.id === v.id && <span className="text-muted"> (you)</span>}</p>
                  <p className="truncate text-xs text-muted">{p.university}{p.city && ` · ${p.city}`}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-snug">{p.headline}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.skills.slice(0, 4).map((s) => <span key={s} className="rounded-md bg-fog px-2 py-0.5 text-xs">{s}</span>)}
              </div>
              <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                {p.lookingForCollaborators && <Badge tone="sun">Open to collaborate</Badge>}
                {p.availableForMentoring && <Badge tone="dark">Mentor</Badge>}
                {p.startupStage && <Badge tone="outline">{p.startupStage}</Badge>}
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {people.length === 0 && <EmptyState title="No members match" body="Try a different skill or search term." />}
    </div>
  );
}

function chip(active: boolean) {
  return cn("inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition", active ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink");
}
