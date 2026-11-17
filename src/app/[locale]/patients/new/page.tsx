import { ModuleGate } from "@/components/modules/module-gate";
import { PatientEditor } from "@/components/patients/patient-editor";

export default function NewPatientRoute() {
  return (
    <ModuleGate module="patients" path="patients/new">
      <PatientEditor />
    </ModuleGate>
  );
}
