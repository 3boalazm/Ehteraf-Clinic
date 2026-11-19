import { FeatureGate } from "@/components/layout/feature-gate";
import { AppointmentCalendarPage } from "@/features/appointments/appointment-pages";

export default function CalendarRoute() {
  return (
    <FeatureGate module="appointments">
      <AppointmentCalendarPage />
    </FeatureGate>
  );
}
