import { ModuleGate } from "@/components/modules/module-gate";
import { PatientEditor } from "@/components/patients/patient-editor";

export default async function EditPatientRoute({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  return (
    <ModuleGate module="patients" path={`patients/${patientId}/edit`}>
      <PatientEditor patientId={patientId} />
    </ModuleGate>
  );
}
