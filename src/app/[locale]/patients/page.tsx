import { ModuleGate } from "@/components/modules/module-gate";
import { PatientDirectory } from "@/components/patients/patient-directory";

export default function PatientsRoute() {
  return (
    <ModuleGate module="patients" path="patients">
      <PatientDirectory />
    </ModuleGate>
  );
}
