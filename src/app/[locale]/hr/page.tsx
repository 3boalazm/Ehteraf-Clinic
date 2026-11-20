import { FeatureGate } from "@/shell/app-shell";
import { HrOverview } from "@/features/hr/overview";

export default function Route() {
  return (
    <FeatureGate module="employees">
      <HrOverview />
    </FeatureGate>
  );
}
