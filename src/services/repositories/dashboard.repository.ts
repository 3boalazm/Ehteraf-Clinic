import type {
  BranchId,
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
  branchRevenue: ReturnType<typeof getBranchRevenue>;
  appointmentTrend: Array<{
    label: string;
    appointments: number;
    completed: number;
  }>;
}

export interface DashboardRepository {
  getOverview(query: DashboardQuery): DashboardSnapshot;
}

const rangeMultiplier: Record<DateRange, number> = {
  week: 0.26,
  month: 1,
  quarter: 2.72,
};

const serviceMultiplier: Record<ServiceFilter, number> = {
  all: 1,
  orthopedic: 0.57,
  sports: 0.26,
  neurological: 0.17,
};

function round(value: number): number {
  return Math.round(value);
}

export const mockDashboardRepository: DashboardRepository = {
  getOverview({ branchId, range, service, locale }) {
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

    const scopeFactor = rangeMultiplier[range] * serviceMultiplier[service];
    const noShowRate = base.appointments
      ? base.noShowWeighted / base.appointments
      : 0;
    const occupancy = base.appointments
      ? base.occupancyWeighted / base.appointments
      : 0;

    const metrics: DashboardMetric[] = [
      { id: "revenue", value: round(base.revenue * scopeFactor), change: 12.8 },
      { id: "collected", value: round(base.collected * scopeFactor), change: 8.4 },
      {
        id: "appointments",
        value: round(base.appointments * scopeFactor),
        change: 6.2,
      },
      {
        id: "newPatients",
        value: round(base.newPatients * scopeFactor),
        change: 11.3,
      },
      {
        id: "returningPatients",
        value: round(base.returningPatients * scopeFactor),
        change: 9.1,
      },
    ];

    const branchRevenue = getBranchRevenue(locale)
      .filter((item) => branchId === "all" || item.branchId === branchId)
      .map((item) => ({
        ...item,
        invoiced: round(item.invoiced * scopeFactor),
        collected: round(item.collected * scopeFactor),
      }));

    const branchFactor =
      branchId === "all"
        ? 1
        : BRANCH_STATS[branchId].appointments / BRANCH_STATS.ghadeer.appointments;
    const monthLabels = messages[locale].dashboard.months;
    const appointmentTrend = APPOINTMENT_TRENDS.map((point, index) => ({
      label: monthLabels[index],
      appointments: round(point.appointments * branchFactor * serviceMultiplier[service]),
      completed: round(point.completed * branchFactor * serviceMultiplier[service]),
    }));

    return {
      metrics,
      noShowRate: Number(noShowRate.toFixed(1)),
      occupancy: Math.round(occupancy),
      pendingReports: base.pendingReports,
      branchRevenue,
      appointmentTrend,
    };
  },
};
