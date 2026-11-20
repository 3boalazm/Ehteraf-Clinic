import { FeatureGate } from "@/shell/app-shell";
import { AttendanceScreen } from "@/features/hr/attendance";

export default function Route() {
  return (
    <FeatureGate module="employees">
      <AttendanceScreen />
    </FeatureGate>
  );
}
