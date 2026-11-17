import { ModuleGate } from "@/components/modules/module-gate";
import { AppointmentsPage } from "@/components/appointments/appointments-page";

export default function AppointmentsRoute() {
  return (
    <ModuleGate module="appointments" path="appointments">
      <AppointmentsPage />
    </ModuleGate>
  );
}
