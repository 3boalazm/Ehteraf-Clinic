export type Locale = "ar" | "en";
export type ThemeMode = "light" | "dark";
export type BranchId = "all" | "ghadeer" | "darAlbaida" | "quwayiyah";
export type RoleId =
  | "owner"
  | "branchManager"
  | "receptionist"
  | "therapist"
  | "medicalSupervisor"
  | "accountant"
  | "hrManager"
  | "inventoryManager"
  | "marketing";
export type DateRange = "week" | "month" | "quarter";
export type ServiceFilter = "all" | "orthopedic" | "sports" | "neurological";

export type ModuleId =
  | "branches"
  | "appointments"
  | "patients"
  | "clinical"
  | "services"
  | "finance"
  | "inventory"
  | "employees"
  | "reports"
  | "marketing"
  | "notifications"
  | "settings";

export interface Branch {
  id: Exclude<BranchId, "all">;
  nameAr: string;
  nameEn: string;
  cityAr: string;
  cityEn: string;
}

export interface DashboardMetric {
  id: "revenue" | "collected" | "appointments" | "newPatients" | "returningPatients";
  value: number;
  change: number;
}

export interface BranchRevenue {
  branchId: Exclude<BranchId, "all">;
  branchName: string;
  invoiced: number;
  collected: number;
}

export interface AppointmentTrendPoint {
  label: string;
  appointments: number;
  completed: number;
}

export interface UpcomingAppointment {
  id: string;
  patient: string;
  patientEn: string;
  initials: string;
  initialsEn: string;
  service: string;
  serviceEn: string;
  therapist: string;
  therapistEn: string;
  time: string;
  branchId: Exclude<BranchId, "all">;
  status: "confirmed" | "checkedIn" | "inSession";
  accent: "teal" | "blue" | "violet" | "amber";
}

export interface RecentActivity {
  id: string;
  branchId: Exclude<BranchId, "all">;
  type: "payment" | "patient" | "appointment" | "report";
  titleAr: string;
  titleEn: string;
  detailAr: string;
  detailEn: string;
  timeAr: string;
  timeEn: string;
  initials: string;
  initialsEn: string;
  accent: "teal" | "blue" | "violet" | "amber";
}
