import { FeatureGate } from "@/shell/app-shell";
import { EmployeesScreen } from "@/features/hr/employees";

export default function Route() {
  return (
    <FeatureGate module="employees">
      <EmployeesScreen />
    </FeatureGate>
  );
}
