import { FeatureGate } from "@/shell/app-shell";
import { ReportsScreen } from "@/features/accounting/reports";

export default function Route() {
  return (
    <FeatureGate module="finance">
      <ReportsScreen />
    </FeatureGate>
  );
}
