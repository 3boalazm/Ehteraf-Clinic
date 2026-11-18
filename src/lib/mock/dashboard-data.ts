import type {
  AppointmentTrendPoint,
  BranchId,
  BranchRevenue,
  RecentActivity,
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

export const RECENT_ACTIVITIES: RecentActivity[] = [
  {
    id: "activity-1",
    branchId: "ghadeer",
    type: "payment",
    accent: "teal",
  },
  {
    id: "activity-2",
    branchId: "darAlbaida",
    type: "patient",
    accent: "violet",
  },
  {
    id: "activity-3",
    branchId: "ghadeer",
    type: "appointment",
    accent: "blue",
  },
  {
    id: "activity-4",
    branchId: "quwayiyah",
    type: "report",
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
