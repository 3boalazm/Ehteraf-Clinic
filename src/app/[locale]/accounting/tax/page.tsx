import { FeatureGate } from "@/shell/app-shell";
import { TaxScreen } from "@/features/accounting/tax";

export default function Route() {
  return (
    <FeatureGate module="finance">
      <TaxScreen />
    </FeatureGate>
  );
}
