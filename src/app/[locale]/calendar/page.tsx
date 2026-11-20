import { FeatureGate } from "@/shell/app-shell";
import { AppointmentCalendar } from "@/features/appointments/appointments";

export default function Route() {
  return (
    <FeatureGate module="appointments">
      <AppointmentCalendar />
    </FeatureGate>
  );
}
