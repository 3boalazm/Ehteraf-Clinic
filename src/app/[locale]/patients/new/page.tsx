import { FeatureGate } from "@/components/layout/feature-gate";
import { PatientEditor } from "@/features/patients/patient-pages";

export default function NewPatientRoute() {
  return (
    <FeatureGate module="patients">
      <PatientEditor />
    </FeatureGate>
  );
}
