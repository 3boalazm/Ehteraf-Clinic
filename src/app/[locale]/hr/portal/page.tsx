import { FeatureGate } from "@/shell/app-shell";
import { PortalScreen } from "@/features/hr/portal";

export default function Route() {
  return (
    <FeatureGate module="employees">
      <PortalScreen />
    </FeatureGate>
  );
}
