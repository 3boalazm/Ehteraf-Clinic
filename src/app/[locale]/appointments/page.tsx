import { FeatureGate } from "@/shell/app-shell";
import { AppointmentsList } from "@/features/appointments/appointments";

export default function Route() {
  return (
    <FeatureGate module="appointments">
      <AppointmentsList />
    </FeatureGate>
  );
}
