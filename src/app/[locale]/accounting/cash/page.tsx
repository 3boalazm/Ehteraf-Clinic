import { FeatureGate } from "@/shell/app-shell";
import { CashScreen } from "@/features/accounting/cash-assets";

export default function Route() {
  return (
    <FeatureGate module="finance">
      <CashScreen />
    </FeatureGate>
  );
}
