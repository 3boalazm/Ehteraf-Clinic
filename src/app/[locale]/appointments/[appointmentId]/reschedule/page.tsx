import { ModuleGate } from "@/components/modules/module-gate";
import { BookingForm } from "@/components/appointments/booking-form";

export default async function RescheduleAppointmentRoute({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) {
  const { appointmentId } = await params;
  return (
    <ModuleGate module="appointments" path={`appointments/${appointmentId}/reschedule`}>
      <BookingForm appointmentId={appointmentId} />
    </ModuleGate>
  );
}
