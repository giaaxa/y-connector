import { ActionForm } from "@/components/ui/action-form";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/form";
import { saveEvent } from "@/lib/actions/admin";
import { EVENT_CATEGORIES, type YCEvent } from "@/lib/types";

/** datetime-local value in UK time. */
function local(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(d);
  const g = (t: string) => parts.find((p) => p.type === t)?.value;
  return `${g("year")}-${g("month")}-${g("day")}T${g("hour")}:${g("minute")}`;
}

export function EventForm({ event }: { event?: YCEvent }) {
  return (
    <ActionForm action={saveEvent} submitLabel="Save event" pendingLabel="Saving…" replaceOnSuccess={false}>
      {event && <input type="hidden" name="id" value={event.id} />}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Title" htmlFor="title" required><Input id="title" name="title" defaultValue={event?.title} required /></Field>
        <Field label="URL slug" htmlFor="slug" hint="Leave blank to generate"><Input id="slug" name="slug" defaultValue={event?.slug} pattern="[a-z0-9-]+" /></Field>
        <Field label="Category" htmlFor="category"><Select id="category" name="category" defaultValue={event?.category}>{EVENT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Format" htmlFor="format"><Select id="format" name="format" defaultValue={event?.format}><option value="in_person">In person</option><option value="online">Online</option><option value="hybrid">Hybrid</option></Select></Field>
        <Field label="Starts (UK time)" htmlFor="startsAt" required hint="Europe/London (handles GMT/BST)"><Input id="startsAt" name="startsAt" type="datetime-local" defaultValue={local(event?.startsAt)} required /></Field>
        <Field label="Ends (UK time)" htmlFor="endsAt" required><Input id="endsAt" name="endsAt" type="datetime-local" defaultValue={local(event?.endsAt)} required /></Field>
        <Field label="Location" htmlFor="location"><Input id="location" name="location" defaultValue={event?.location} placeholder="Venue, city or “Online”" /></Field>
        <Field label="Capacity" htmlFor="capacity" hint="Blank = unlimited. Extra sign-ups go to the waitlist."><Input id="capacity" name="capacity" type="number" min={1} defaultValue={event?.capacity ?? ""} /></Field>
        <Field label="Who can register" htmlFor="access"><Select id="access" name="access" defaultValue={event?.access ?? "members"}><option value="members">Active members only</option><option value="public">Anyone (public)</option></Select></Field>
        <Field label="Price note" htmlFor="priceNote" hint="Be explicit, e.g. “Included with membership”"><Input id="priceNote" name="priceNote" defaultValue={event?.priceNote} /></Field>
      </div>
      <Field label="Summary" htmlFor="summary"><Input id="summary" name="summary" defaultValue={event?.summary} maxLength={300} /></Field>
      <Field label="Description" htmlFor="description"><Textarea id="description" name="description" rows={6} defaultValue={event?.description} /></Field>
      <fieldset className="space-y-4 rounded-2xl bg-mist p-5">
        <legend className="text-sm font-semibold">Principal speaker (optional)</legend>
        <p className="text-xs text-muted">Only add a speaker once they have confirmed and agreed to be listed.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="speakerName"><Input id="speakerName" name="speakerName" defaultValue={event?.speaker?.name} /></Field>
          <Field label="Title / organisation" htmlFor="speakerTitle"><Input id="speakerTitle" name="speakerTitle" defaultValue={event?.speaker?.title} /></Field>
        </div>
        <Field label="Biography" htmlFor="speakerBio"><Textarea id="speakerBio" name="speakerBio" rows={3} defaultValue={event?.speaker?.bio} /></Field>
      </fieldset>
      <div className="flex flex-wrap items-end gap-6">
        <Field label="Status" htmlFor="status"><Select id="status" name="status" defaultValue={event?.status ?? "draft"}><option value="draft">Draft</option><option value="published">Published</option><option value="cancelled">Cancelled</option><option value="archived">Archived</option></Select></Field>
        <Checkbox name="isSample" defaultChecked={event?.isSample} label="Mark as example content" />
      </div>
    </ActionForm>
  );
}
