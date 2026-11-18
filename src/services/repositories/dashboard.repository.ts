import type {
  BranchDashboardOverview,
  BranchId,
  BranchRevenue,
  DateRange,
  DashboardMetric,
  Locale,
  ServiceFilter,
} from "@/types";
import {
  APPOINTMENT_TRENDS,
  BRANCH_STATS,
  getBranchRevenue,
} from "@/lib/mock/dashboard-data";
import { messages } from "@/lib/i18n/messages";

export interface DashboardQuery {
  branchId: BranchId;
  range: DateRange;
  service: ServiceFilter;
  locale: Locale;
}

export interface DashboardSnapshot {
  metrics: DashboardMetric[];
  noShowRate: number;
  occupancy: number;
  pendingReports: number;
  branchRevenue: BranchRevenue[];
  branchOverview: BranchDashboardOverview[];
  appointmentTrend: Array<{
    label: string;
    appointments: number;
    completed: number;
  }>;
}

export interface DashboardRepository {
  getOverview(query: DashboardQuery): DashboardSnapshot;
}

export const mockDashboardRepository: DashboardRepository = {
  getOverview({ branchId, locale }) {
    const selectedBranches =
      branchId === "all"
        ? Object.values(BRANCH_STATS)
        : [BRANCH_STATS[branchId]];

    const base = selectedBranches.reduce(
      (totals, branch) => ({
        revenue: totals.revenue + branch.revenue,
        collected: totals.collected + branch.collected,
        appointments: totals.appointments + branch.appointments,
        newPatients: totals.newPatients + branch.newPatients,
        returningPatients: totals.returningPatients + branch.returningPatients,
        pendingReports: totals.pendingReports + branch.pendingReports,
        noShowWeighted: totals.noShowWeighted + branch.noShowRate * branch.appointments,
        occupancyWeighted: totals.occupancyWeighted + branch.occupancy * branch.appointments,
      }),
      {
        revenue: 0,
        collected: 0,
        appointments: 0,
        newPatients: 0,
        returningPatients: 0,
        pendingReports: 0,
        noShowWeighted: 0,
        occupancyWeighted: 0,
      },
    );

    const noShowRate = base.appointments
      ? base.noShowWeighted / base.appointments
      : 0;
    const occupancy = base.appointments
      ? base.occupancyWeighted / base.appointments
      : 0;

    const metrics: DashboardMetric[] = [
      { id: "revenue", value: base.revenue },
      { id: "collected", value: base.collected },
      { id: "appointments", value: base.appointments },
      { id: "newPatients", value: base.newPatients },
      { id: "returningPatients", value: base.returningPatients },
    ];

    const branchOverview: BranchDashboardOverview[] = getBranchRevenue(locale)
      .filter((item) => branchId === "all" || item.branchId === branchId)
      .map((item) => {
        const branch = BRANCH_STATS[item.branchId];
        return {
          ...item,
          appointments: branch.appointments,
          noShowRate: branch.noShowRate,
          occupancy: branch.occupancy,
          pendingReports: branch.pendingReports,
        };
      });
    const branchRevenue: BranchRevenue[] = branchOverview.map((item) => ({
      branchId: item.branchId,
      branchName: item.branchName,
      invoiced: item.invoiced,
      collected: item.collected,
    }));

    const monthLabels = messages[locale].dashboard.months;
    const appointmentTrend = APPOINTMENT_TRENDS.map((point, index) => ({
      label: monthLabels[index],
      appointments: point.appointments,
      completed: point.completed,
    }));

    return {
      metrics,
      noShowRate: Number(noShowRate.toFixed(1)),
      occupancy: Math.round(occupancy),
      pendingReports: base.pendingReports,
      branchRevenue,
      branchOverview,
      appointmentTrend,
    };
  },
};
