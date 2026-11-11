import { ArrowRight, Bookmark, Flag, Lock, MessagesSquare, Search, Sparkles, UserRoundSearch } from "lucide-react";
import type { Metadata } from "next";
import { PostPreview } from "@/components/forum/post-preview";
import { PageHero } from "@/components/site/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Avatar, Badge, Container, SampleTag, SectionHeading } from "@/components/ui/primitives";
import { repo } from "@/lib/data";
import { getPublicPreviewThreads } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Community",
  description: "A members-only forum, talent directory and founder network for young builders.",
};

export default async function CommunityPage() {
  const [threads, categories] = await Promise.all([getPublicPreviewThreads(5), repo().listCategories()]);
  const features = [
    { icon: MessagesSquare, t: "Threads & replies", b: "Ask questions, start discussions and reply in context." },
    { icon: Sparkles, t: "Upvotes", b: "The most helpful answers rise to the top." },
    { icon: Search, t: "Search & sort", b: "Find anything by newest, most active or most popular." },
    { icon: Bookmark, t: "Bookmarks", b: "Save threads to come back to." },
    { icon: Flag, t: "Moderated", b: "Clear guidelines, reporting and active moderators." },
    { icon: UserRoundSearch, t: "Talent directory", b: "Opt-in profiles to find collaborators and mentors." },
  ];
  return (
    <>
      <PageHero
        eyebrow="Community"
        title={<>Find your people. <span className="font-serif font-normal italic">Then build with them.</span></>}
        intro="Inside Y Connector you'll find a members-only discussion forum, a searchable talent pool and a network of people who want the same thing you do: to make something real."
      >
        <ButtonLink href="/join" size="lg">Join the Conversation <ArrowRight className="h-4 w-4" /></ButtonLink>
      </PageHero>

      <section className="py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">From the forum</h2>
              {threads.some((t) => t.isSample) ? <SampleTag label="Example discussions" /> : <Badge>Public preview</Badge>}
            </div>
            <div className="mt-5 divide-y divide-line rounded-2xl border border-line">
              {threads.map((t) => (
                <PostPreview key={t.id} title={t.title} category={t.category} author={t.author} score={t.score} replies={t.replies} createdAt={t.createdAt} />
              ))}
            </div>
            <div className="relative mt-4 overflow-hidden rounded-2xl border border-line">
              <div className="space-y-3 p-5 blur-[3px] select-none" aria-hidden>
                <div className="h-4 w-3/4 rounded bg-fog" />
                <div className="h-4 w-1/2 rounded bg-fog" />
                <div className="h-4 w-2/3 rounded bg-fog" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-white/60 text-sm font-semibold">
                <Lock className="h-4 w-4" /> Full discussions are for members
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {categories.map((c) => (
                <li key={c.slug} className="rounded-xl border border-line p-4">
                  <p className="font-semibold">{c.name}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{c.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="border-t border-line bg-mist py-16 sm:py-20" id="directory">
        <Container>
          <SectionHeading eyebrow="How it works inside" title="Built for useful conversations, not noise." />
          <div className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.t} className="bg-white p-7">
                <f.icon className="h-5 w-5" aria-hidden />
                <p className="mt-4 font-semibold">{f.t}</p>
                <p className="mt-1 text-sm text-muted">{f.b}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 grid grid-cols-1 items-center gap-10 rounded-3xl bg-ink p-8 text-white sm:p-12 lg:grid-cols-2">
            <div>
              <p className="eyebrow text-sun">Talent pool</p>
              <h3 className="mt-3 text-3xl font-bold tracking-tight">Looking for a co-founder? Start here.</h3>
              <p className="mt-4 text-white/70">
                Members can opt in to a professional directory filtered by skills like AI, engineering, data, design,
                marketing and finance. Express interest in collaborating without sharing your contact details until both sides agree.
              </p>
            </div>
            <div className="space-y-3" aria-hidden>
              {[
                ["Kofi A.", "Full-stack engineer · looking for a commercial co-founder", "Software engineering"],
                ["Priya S.", "Growth marketer · open to mentoring", "Digital marketing"],
                ["Amara O.", "Data science · ML for credit risk", "Data science"],
              ].map(([n, h, s]) => (
                <div key={n} className="flex items-center gap-4 rounded-2xl bg-white/5 p-4">
                  <Avatar name={n} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{n}</p>
                    <p className="truncate text-sm text-white/60">{h}</p>
                  </div>
                  <span className="hidden rounded-full bg-sun px-2.5 py-1 text-xs font-medium text-ink sm:inline">{s}</span>
                </div>
              ))}
              <SampleTag label="Example profiles" className="border-white/30 text-white/50" />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
