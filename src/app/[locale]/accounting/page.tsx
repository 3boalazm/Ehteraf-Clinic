import { FeatureGate } from "@/shell/app-shell";
import { AccountingOverview } from "@/features/accounting/overview";

export default function Route() {
  return (
    <FeatureGate module="finance">
      <AccountingOverview />
    </FeatureGate>
  );
}
