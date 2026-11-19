import { FeatureGate } from "@/components/layout/feature-gate";
import { AppointmentListPage } from "@/features/appointments/appointment-pages";

export default function AppointmentsRoute() {
  return (
    <FeatureGate module="appointments">
      <AppointmentListPage />
    </FeatureGate>
  );
}
