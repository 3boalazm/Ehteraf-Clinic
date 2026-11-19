import { FeatureGate } from "@/components/layout/feature-gate";
import { PatientEditor } from "@/features/patients/patient-pages";

export default async function EditPatientRoute({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  return (
    <FeatureGate module="patients">
      <PatientEditor patientId={patientId} />
    </FeatureGate>
  );
}
