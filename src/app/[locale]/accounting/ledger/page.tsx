import { FeatureGate } from "@/shell/app-shell";
import { LedgerScreen } from "@/features/accounting/ledger";

export default function Route() {
  return (
    <FeatureGate module="finance">
      <LedgerScreen />
    </FeatureGate>
  );
}
