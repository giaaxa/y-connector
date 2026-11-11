import { ActionForm } from "@/components/ui/action-form";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/form";
import { saveCourse } from "@/lib/actions/admin";
import { COURSE_CATEGORIES, type Course } from "@/lib/types";
import { LessonsEditor } from "./lessons-editor";

export function CourseForm({ course }: { course?: Course }) {
  return (
    <ActionForm action={saveCourse} submitLabel="Save course" pendingLabel="Saving…" replaceOnSuccess={false}>
      {course && <input type="hidden" name="id" value={course.id} />}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Title" htmlFor="title" required><Input id="title" name="title" defaultValue={course?.title} required /></Field>
        <Field label="URL slug" htmlFor="slug" hint="Leave blank to generate"><Input id="slug" name="slug" defaultValue={course?.slug} pattern="[a-z0-9-]+" /></Field>
        <Field label="Category" htmlFor="category"><Select id="category" name="category" defaultValue={course?.category}>{COURSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Level" htmlFor="level"><Select id="level" name="level" defaultValue={course?.level}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></Select></Field>
        <Field label="Access" htmlFor="access" hint="Premium = possible future, separately priced package (not sold)">
          <Select id="access" name="access" defaultValue={course?.access ?? "included"}><option value="included">Included with membership</option><option value="premium">Future paid programme</option></Select>
        </Field>
        <Field label="Status" htmlFor="status"><Select id="status" name="status" defaultValue={course?.status ?? "draft"}><option value="draft">Draft</option><option value="published">Published</option></Select></Field>
      </div>
      <Field label="Summary" htmlFor="summary"><Textarea id="summary" name="summary" defaultValue={course?.summary} rows={2} className="min-h-0" /></Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Skill tags" htmlFor="skills" hint="Comma separated"><Input id="skills" name="skills" defaultValue={course?.skills.join(", ")} /></Field>
        <Field label="Linked event slugs" htmlFor="relatedEventSlugs" hint="Comma separated"><Input id="relatedEventSlugs" name="relatedEventSlugs" defaultValue={course?.relatedEventSlugs.join(", ")} /></Field>
      </div>
      <div>
        <p className="mb-3 text-sm font-semibold">Lessons</p>
        <LessonsEditor initial={course?.lessons ?? []} />
      </div>
      <Checkbox name="isSample" defaultChecked={course?.isSample} label="Mark as example content" />
    </ActionForm>
  );
}
