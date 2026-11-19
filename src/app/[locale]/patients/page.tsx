import { FeatureGate } from "@/shell/app-shell";
import { PatientDirectory } from "@/features/patients/patients";

export default function Route() {
  return (
    <FeatureGate module="patients">
      <PatientDirectory />
    </FeatureGate>
  );
}
