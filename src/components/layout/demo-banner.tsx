import { FlaskConical } from "lucide-react";

export function DemoBanner() {
  return (
    <div
      className="flex items-center justify-center gap-2 bg-peach/50 px-4 py-1.5 text-sm font-medium text-ink dark:text-foreground"
      role="status"
    >
      <FlaskConical className="size-4" aria-hidden />
      Demo Mode — this workspace uses isolated sample data. Changes won&apos;t affect real accounts.
    </div>
  );
}
