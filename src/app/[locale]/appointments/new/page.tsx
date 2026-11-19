import { FeatureGate } from "@/shell/app-shell";
import { AppointmentBooking } from "@/features/appointments/appointments";

export default function Route() {
  return (
    <FeatureGate module="appointments">
      <AppointmentBooking />
    </FeatureGate>
  );
}
