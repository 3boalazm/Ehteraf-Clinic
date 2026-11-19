import { FeatureGate } from "@/components/layout/feature-gate";
import { AppointmentBookingPage } from "@/features/appointments/appointment-pages";

export default function NewAppointmentRoute() {
  return (
    <FeatureGate module="appointments">
      <AppointmentBookingPage />
    </FeatureGate>
  );
}
