import type { Metadata } from "next";
import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Card } from "@/components/ui/primitives";
import { createPost } from "@/lib/actions/member";
import { requireActiveMember } from "@/lib/auth";
import { repo } from "@/lib/data";

export const metadata: Metadata = { title: "New post" };

export default async function NewPostPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  await requireActiveMember("/forum/new");
  const { category } = await searchParams;
  const cats = await repo().listCategories();
  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/forum" className="text-sm text-muted hover:text-ink">← Back to forum</Link>
      <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.03em]">Start a discussion</h1>
      <p className="mt-2 text-muted">Ask a question, share what you&apos;re building or find collaborators. Mention people with @Name.</p>
      <Card className="mt-8 p-6 sm:p-8">
        <ActionForm action={createPost} submitLabel="Publish post" pendingLabel="Publishing…" replaceOnSuccess={false}>
          <Field label="Category" htmlFor="category" required>
            <Select id="category" name="category" defaultValue={category ?? ""} required>
              <option value="" disabled>Choose a category</option>
              {cats.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </Select>
          </Field>
          <Field label="Title" htmlFor="title" required hint="Be specific. Good titles get better answers.">
            <Input id="title" name="title" minLength={5} maxLength={200} required />
          </Field>
          <Field label="Post" htmlFor="body" required hint="Plain text. Use blank lines for paragraphs, “- ” for lists.">
            <Textarea id="body" name="body" rows={10} maxLength={10000} required />
          </Field>
          <p className="text-xs text-muted">
            By posting you agree to the <Link href="/legal/community-guidelines" className="underline">community guidelines</Link>. No investment solicitation.
          </p>
        </ActionForm>
      </Card>
    </div>
  );
}
