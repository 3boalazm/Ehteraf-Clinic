import { FeatureGate } from "@/shell/app-shell";
import { AssetsScreen } from "@/features/accounting/cash-assets";

export default function Route() {
  return (
    <FeatureGate module="finance">
      <AssetsScreen />
    </FeatureGate>
  );
}
