import type { AppointmentStatus, Locale } from "@/types";
import { messages } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils";

export function AppointmentStatusBadge({
  status,
  locale,
}: {
  status: AppointmentStatus;
  locale: Locale;
}) {
  const label = messages[locale].clinic.appointments[status];
  return (
    <span className={cn("record-status", `record-status-${status}`)}>
      <span />
      {label}
    </span>
  );
}
