import { FeatureGate } from "@/components/layout/feature-gate";
import { PatientProfile } from "@/features/patients/patient-pages";

export default async function PatientProfileRoute({
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
