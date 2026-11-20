import { FeatureGate } from "@/shell/app-shell";
import { SalesScreen } from "@/features/accounting/sales";

export default function Route() {
  return (
    <FeatureGate module="finance">
      <SalesScreen />
    </FeatureGate>
  );
}
