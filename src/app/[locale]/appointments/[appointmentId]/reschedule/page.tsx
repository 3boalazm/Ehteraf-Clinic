import { FeatureGate } from "@/shell/app-shell";
import { AppointmentBooking } from "@/features/appointments/appointments";

export default async function Route({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) {
  const { appointmentId } = await params;
  return (
    <FeatureGate module="appointments">
      <AppointmentBooking appointmentId={appointmentId} />
    </FeatureGate>
  );
}
