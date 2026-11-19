import { FeatureGate } from "@/components/layout/feature-gate";
import { PatientDirectory } from "@/features/patients/patient-pages";

export default function PatientsRoute() {
  return (
    <FeatureGate module="patients">
      <PatientDirectory />
    </FeatureGate>
  );
}
