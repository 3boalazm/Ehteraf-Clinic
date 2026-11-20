import { FeatureGate } from "@/shell/app-shell";
import { StructureScreen } from "@/features/hr/structure";

export default function Route() {
  return (
    <FeatureGate module="employees">
      <StructureScreen />
    </FeatureGate>
  );
}
