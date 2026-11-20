import { FeatureGate } from "@/shell/app-shell";
import { PatientProfile } from "@/features/patients/patients";

export default async function Route({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  return (
    <FeatureGate module="patients">
      <PatientProfile patientId={patientId} />
    </FeatureGate>
  );
}
