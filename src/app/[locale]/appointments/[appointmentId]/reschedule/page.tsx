import { FeatureGate } from "@/components/layout/feature-gate";
import { AppointmentBookingPage } from "@/features/appointments/appointment-pages";

export default async function RescheduleAppointmentRoute({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) {
  const { appointmentId } = await params;
  return (
    <FeatureGate module="appointments">
      <AppointmentBookingPage appointmentId={appointmentId} />
    </FeatureGate>
  );
}
