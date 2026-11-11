import { AdminHeader } from "@/components/admin/stat";
import { EventForm } from "@/components/admin/event-form";
import { Card } from "@/components/ui/primitives";
import { requirePermission } from "@/lib/auth";

export default async function NewEventPage() {
  await requirePermission("manageEvents");
  return (
    <div className="max-w-3xl">
      <AdminHeader title="New event" />
      <Card className="p-6 sm:p-8"><EventForm /></Card>
    </div>
  );
}
