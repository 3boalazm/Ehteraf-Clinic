import { ModuleGate } from "@/components/modules/module-gate";
import { BookingForm } from "@/components/appointments/booking-form";

export default function NewAppointmentRoute() {
  return (
    <ModuleGate module="appointments" path="appointments/new">
      <BookingForm />
    </ModuleGate>
  );
}
