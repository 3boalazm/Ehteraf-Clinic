import { ModuleGate } from "@/components/modules/module-gate";
import { PatientProfile } from "@/components/patients/patient-profile";

export default async function PatientProfileRoute({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  return (
    <ModuleGate module="patients" path={`patients/${patientId}`}>
      <PatientProfile patientId={patientId} />
    </ModuleGate>
  );
}
