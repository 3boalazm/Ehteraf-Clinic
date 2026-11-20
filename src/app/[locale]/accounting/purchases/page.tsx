import { FeatureGate } from "@/shell/app-shell";
import { PurchasesScreen } from "@/features/accounting/purchases";

export default function Route() {
  return (
    <FeatureGate module="finance">
      <PurchasesScreen />
    </FeatureGate>
  );
}
