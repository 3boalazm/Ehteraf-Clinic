import { FeatureGate } from "@/shell/app-shell";
import { PayrollScreen } from "@/features/hr/payroll";

export default function Route() {
  return (
    <FeatureGate module="employees">
      <PayrollScreen />
    </FeatureGate>
  );
}
