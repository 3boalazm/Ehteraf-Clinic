import type {
  AppointmentTrendPoint,
  BranchId,
  BranchRevenue,
  RecentActivity,
  UpcomingAppointment,
} from "@/types";
import { BRANCHES } from "@/lib/mock/branches";

export interface BranchDashboardStats {
  revenue: number;
  collected: number;
  appointments: number;
  newPatients: number;
  returningPatients: number;
  noShowRate: number;
  occupancy: number;
  pendingReports: number;
}

export const BRANCH_STATS: Record<Exclude<BranchId, "all">, BranchDashboardStats> = {
  ghadeer: {
    revenue: 112_400,
    collected: 96_800,
    appointments: 312,
    newPatients: 39,
    returningPatients: 151,
    noShowRate: 5.2,
    occupancy: 82,
    pendingReports: 4,
  },
  darAlbaida: {
    revenue: 78_500,
    collected: 68_400,
    appointments: 226,
    newPatients: 29,
    returningPatients: 101,
    noShowRate: 7.1,
    occupancy: 76,
    pendingReports: 5,
  },
  quwayiyah: {
    revenue: 57_600,
    collected: 49_000,
    appointments: 146,
    newPatients: 18,
    returningPatients: 60,
    noShowRate: 8.1,
    occupancy: 73,
    pendingReports: 3,
  },
};

export const APPOINTMENT_TRENDS: AppointmentTrendPoint[] = [
  { label: "Jun", appointments: 412, completed: 361 },
  { label: "Jul", appointments: 468, completed: 419 },
  { label: "Aug", appointments: 446, completed: 395 },
  { label: "Sep", appointments: 531, completed: 482 },
  { label: "Oct", appointments: 602, completed: 551 },
  { label: "Nov", appointments: 684, completed: 621 },
];

export const UPCOMING_APPOINTMENTS: UpcomingAppointment[] = [
  {
    id: "apt-2041",
    patient: "أحمد محمد",
    patientEn: "Ahmed Mohammed",
    initials: "أم",
    initialsEn: "AM",
    service: "جلسة علاج طبيعي",
    serviceEn: "Physical therapy",
    therapist: "د. خالد العتيبي",
    therapistEn: "Dr. Khalid Al-Otaibi",
    time: "09:30",
    branchId: "ghadeer",
    status: "checkedIn",
    accent: "teal",
  },
  {
    id: "apt-2042",
    patient: "سارة عبدالله",
    patientEn: "Sara Abdullah",
    initials: "سع",
    initialsEn: "SA",
    service: "علاج إصابة رياضية",
    serviceEn: "Sports injury therapy",
    therapist: "أ. نورة السالم",
    therapistEn: "Noura Al-Salem",
    time: "10:00",
    branchId: "darAlbaida",
    status: "confirmed",
    accent: "violet",
  },
  {
    id: "apt-2043",
    patient: "محمد الحربي",
    patientEn: "Mohammed Al-Harbi",
    initials: "مح",
    initialsEn: "MH",
    service: "جلسة علاج طبيعي",
    serviceEn: "Physical therapy",
    therapist: "د. خالد العتيبي",
    therapistEn: "Dr. Khalid Al-Otaibi",
    time: "10:30",
    branchId: "ghadeer",
    status: "inSession",
    accent: "blue",
  },
  {
    id: "apt-2044",
    patient: "ريم القحطاني",
    patientEn: "Reem Al-Qahtani",
    initials: "رق",
    initialsEn: "RQ",
    service: "تأهيل ما بعد الجراحة",
    serviceEn: "Post-surgery rehabilitation",
    therapist: "أ. ليان المطيري",
    therapistEn: "Layan Al-Mutairi",
    time: "11:15",
    branchId: "quwayiyah",
    status: "confirmed",
    accent: "amber",
  },
  {
    id: "apt-2045",
    patient: "عبدالرحمن فهد",
    patientEn: "Abdulrahman Fahd",
    initials: "عف",
    initialsEn: "AF",
    service: "جلسة علاج طبيعي",
    serviceEn: "Physical therapy",
    therapist: "أ. نورة السالم",
    therapistEn: "Noura Al-Salem",
    time: "12:00",
    branchId: "darAlbaida",
    status: "confirmed",
    accent: "teal",
  },
];

export const RECENT_ACTIVITIES: RecentActivity[] = [
  {
    id: "activity-1",
    branchId: "ghadeer",
    type: "payment",
    titleAr: "تم تسجيل دفعة جديدة",
    titleEn: "A new payment was recorded",
    detailAr: "فاتورة رقم ٢٤٨١ · الغدير",
    detailEn: "Invoice #2481 · Al Ghadeer",
    timeAr: "منذ ٥ دقائق",
    timeEn: "5 min ago",
    initials: "ر.س",
    initialsEn: "SR",
    accent: "teal",
  },
  {
    id: "activity-2",
    branchId: "darAlbaida",
    type: "patient",
    titleAr: "تم إنشاء ملف مريض جديد",
    titleEn: "A new patient profile was created",
    detailAr: "سارة عبدالله · الدار البيضاء",
    detailEn: "Sara Abdullah · Al Dar Al Baida",
    timeAr: "منذ ١٨ دقيقة",
    timeEn: "18 min ago",
    initials: "سع",
    initialsEn: "SA",
    accent: "violet",
  },
  {
    id: "activity-3",
    branchId: "ghadeer",
    type: "appointment",
    titleAr: "تم تأكيد موعد علاجي",
    titleEn: "A therapy appointment was confirmed",
    detailAr: "أحمد محمد · جلسة علاج طبيعي",
    detailEn: "Ahmed Mohammed · Physical therapy",
    timeAr: "منذ ٤٢ دقيقة",
    timeEn: "42 min ago",
    initials: "أم",
    initialsEn: "AM",
    accent: "blue",
  },
  {
    id: "activity-4",
    branchId: "quwayiyah",
    type: "report",
    titleAr: "تم اعتماد تقرير طبي",
    titleEn: "A medical report was approved",
    detailAr: "تقرير التقييم الأولي · القويعية",
    detailEn: "Initial assessment · Al Quwayiyah",
    timeAr: "منذ ساعة",
    timeEn: "1 hour ago",
    initials: "ط",
    initialsEn: "MR",
    accent: "amber",
  },
];

export function branchLabel(branchId: Exclude<BranchId, "all">, locale: "ar" | "en") {
  const branch = BRANCHES.find((item) => item.id === branchId);
  if (!branch) return "";
  return locale === "ar" ? branch.nameAr : branch.nameEn;
}

export function getBranchRevenue(locale: "ar" | "en"): BranchRevenue[] {
  return BRANCHES.map((branch) => {
    const stats = BRANCH_STATS[branch.id];
    return {
      branchId: branch.id,
      branchName: locale === "ar" ? branch.nameAr : branch.nameEn,
      invoiced: stats.revenue,
      collected: stats.collected,
    };
  });
}
