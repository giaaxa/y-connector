import { notFound } from "next/navigation";
import { CourseForm } from "@/components/admin/course-form";
import { AdminHeader } from "@/components/admin/stat";
import { Card } from "@/components/ui/primitives";
import { requirePermission } from "@/lib/auth";
import { repo } from "@/lib/data";

export default async function EditCoursePage({ params }: { params: Promise<{ slug: string }> }) {
  await requirePermission("manageLearning");
  const { slug } = await params;
  const course = slug === "new" ? undefined : await repo().getCourse(slug);
  if (slug !== "new" && !course) notFound();
  return (
    <div className="max-w-3xl">
      <AdminHeader title={course ? `Edit: ${course.title}` : "New course"} />
      <Card className="p-6 sm:p-8"><CourseForm course={course ?? undefined} /></Card>
    </div>
  );
}
