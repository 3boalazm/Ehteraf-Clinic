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
}

export interface BranchRevenue {
  branchId: Exclude<BranchId, "all">;
  branchName: string;
  invoiced: number;
  collected: number;
}

export interface BranchDashboardOverview extends BranchRevenue {
  appointments: number;
  noShowRate: number;
  occupancy: number;
  pendingReports: number;
}

export interface AppointmentTrendPoint {
  label: string;
  appointments: number;
  completed: number;
}

export interface RecentActivity {
  id: string;
  branchId: Exclude<BranchId, "all">;
  type: "payment" | "patient" | "appointment" | "report";
  accent: "teal" | "blue" | "violet" | "amber";
}

export type PatientStatus = "active" | "inactive";
export type PatientGender = "male" | "female";
export type AppointmentStatus =
  | "booked"
  | "confirmed"
  | "checkedIn"
  | "inSession"
  | "completed"
  | "cancelled"
  | "noShow";
export type VisitType = "clinic" | "home";

export interface TreatmentEpisode {
  id: string;
  labelAr: string;
  labelEn: string;
  diagnosisAr: string;
  diagnosisEn: string;
  startedAt: string;
  status: "active" | "discharged";
}

export interface ClinicPatient {
  id: string;
  nameAr: string;
  nameEn: string;
  phone: string;
  email: string;
  gender: PatientGender;
  dateOfBirth: string;
  branchId: Exclude<BranchId, "all">;
  status: PatientStatus;
  createdAt: string;
  lastVisit: string | null;
  sessionsTotal: number;
  sessionsRemaining: number;
  diagnosisAr: string;
  diagnosisEn: string;
  allergiesAr: string;
  allergiesEn: string;
  emergencyContact: string;
  episodes: TreatmentEpisode[];
}

export interface ClinicAppointment {
  id: string;
  patientId: string;
  branchId: Exclude<BranchId, "all">;
  serviceId: string;
  therapistId: string;
  date: string;
  time: string;
  durationMinutes: number;
  visitType: VisitType;
  status: AppointmentStatus;
  createdAt: string;
}

export interface ClinicService {
  id: string;
  nameAr: string;
  nameEn: string;
  categoryAr: string;
  categoryEn: string;
  durationMinutes: number;
  price: number;
}

export interface ClinicTherapist {
  id: string;
  nameAr: string;
  nameEn: string;
  branchId: Exclude<BranchId, "all">;
  specialtyAr: string;
  specialtyEn: string;
}

export type NewPatientInput = Omit<
  ClinicPatient,
  "id" | "createdAt" | "lastVisit" | "sessionsTotal" | "sessionsRemaining" | "episodes"
>;

export type NewAppointmentInput = Omit<
  ClinicAppointment,
  "id" | "createdAt" | "durationMinutes" | "status"
>;
