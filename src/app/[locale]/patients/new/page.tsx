import { FeatureGate } from "@/shell/app-shell";
import { PatientForm } from "@/features/patients/patients";

export default function Route() {
  return (
    <FeatureGate module="patients">
      <PatientForm />
    </FeatureGate>
  );
}
