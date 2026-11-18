"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, CalendarDays, CalendarPlus, Info, MapPin, Network, ShieldCheck, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { AppointmentTrendChart } from "@/components/dashboard/appointment-trend-chart";
import { TodayClinicians } from "@/components/dashboard/appointment-overview";
import { OperationsSummary } from "@/components/dashboard/operations-summary";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments";
import {
  DashboardWorkspaces,
  SpatialBranchNetwork,
  SpatialMetricCluster,
  SpatialSessionTimeline,
} from "@/components/dashboard/spatial-command-center";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { useClinicData } from "@/services/clinic-data-provider";
import { DEMO_TODAY, SEED_APPOINTMENTS } from "@/lib/mock/clinic-seed";
import { canAccessModule } from "@/lib/config/roles";
import { messages } from "@/lib/i18n/messages";
import { getBranchName } from "@/lib/clinic-utils";
import { mockDashboardRepository } from "@/services/repositories/dashboard.repository";
import type { DateRange, ServiceFilter } from "@/types";

export function DashboardPage() {
  const router = useRouter();
  const { locale, role, branchId } = useWorkspace();
  const { appointments } = useClinicData();
  const t = messages[locale].dashboard;
  const [range, setRange] = useState<DateRange>("month");
  const [service, setService] = useState<ServiceFilter>("all");
  const snapshot = useMemo(
    () => mockDashboardRepository.getOverview({ branchId, range, service, locale }),
    [branchId, locale, range, service],
  );
  const liveMetrics = useMemo(() => {
    const branchMatches = (id: string) => branchId === "all" || id === branchId;
    const inDemoMonth = (date: string) => date.startsWith(`${DEMO_TODAY.slice(0, 7)}-`);
    const appointmentDelta = appointments.filter((item) => inDemoMonth(item.date) && branchMatches(item.branchId)).length -
      SEED_APPOINTMENTS.filter((item) => inDemoMonth(item.date) && branchMatches(item.branchId)).length;
    return snapshot.metrics.map((metric) => ({
      ...metric,
      value: metric.id === "appointments"
        ? Math.max(0, metric.value + appointmentDelta)
        : metric.value,
    }));
  }, [appointments, branchId, snapshot.metrics]);
  const liveBranchOverview = useMemo(() => {
    const countByBranch = new Map<string, number>();
    const seedCountByBranch = new Map<string, number>();
    for (const appointment of appointments) {
      if (!appointment.date.startsWith(`${DEMO_TODAY.slice(0, 7)}-`)) continue;
      countByBranch.set(appointment.branchId, (countByBranch.get(appointment.branchId) ?? 0) + 1);
    }
    for (const appointment of SEED_APPOINTMENTS) {
      if (!appointment.date.startsWith(`${DEMO_TODAY.slice(0, 7)}-`)) continue;
      seedCountByBranch.set(appointment.branchId, (seedCountByBranch.get(appointment.branchId) ?? 0) + 1);
    }
    return snapshot.branchOverview.map((branch) => ({
      ...branch,
      appointments: Math.max(
        0,
        branch.appointments +
          (countByBranch.get(branch.branchId) ?? 0) -
          (seedCountByBranch.get(branch.branchId) ?? 0),
      ),
    }));
  }, [appointments, snapshot.branchOverview]);
  const currentBranch = getBranchName(branchId, locale);

  return (
    <div className="dashboard-page spatial-dashboard">
      <header className="spatial-page-heading">
        <div className="spatial-heading-copy">
          <span className="spatial-page-kicker"><Network size={14} aria-hidden="true" />{t.spatialBrand}</span>
          <h1>{branchId === "all" ? t.groupCommandCenter : t.branchCommandCenter}</h1>
          <p>{branchId === "all" ? t.groupCommandCenterHint : t.branchCommandCenterHint}</p>
        </div>
        <div className="spatial-heading-actions">
          {canAccessModule(role, "reports") ? (
            <Button variant="outline" className="spatial-action-secondary" onClick={() => router.push(`/${locale}/reports`)}>
              <BarChart3 size={15} aria-hidden="true" />{t.viewReports}
            </Button>
          ) : null}
          {canAccessModule(role, "appointments") ? (
            <Button onClick={() => router.push(`/${locale}/appointments`)}>
              <CalendarPlus size={15} aria-hidden="true" />{t.newAppointment}
            </Button>
          ) : null}
        </div>
      </header>

      <section className="spatial-filter-bar" aria-label={t.filterContext}>
        <div className="spatial-scope-summary">
          <span className="spatial-scope-icon"><MapPin size={14} aria-hidden="true" /></span>
          <span className="spatial-scope-copy">
            <small>{branchId === "all" ? messages[locale].app.groupOverview : messages[locale].app.branchOverview}</small>
            <strong>{currentBranch}</strong>
          </span>
          <span className="spatial-divider" aria-hidden="true" />
          <span className="spatial-demo-tag"><span aria-hidden="true" />{messages[locale].app.demoMode}</span>
        </div>
        <div className="spatial-filter-controls">
          <div className="spatial-filter-control">
            <CalendarDays size={14} aria-hidden="true" />
            <SelectField
              compact
              aria-label={t.dateRange}
              value={range}
              onChange={(event) => setRange(event.target.value as DateRange)}
            >
              <option value="week">{t.thisWeek}</option>
              <option value="month">{t.thisMonth}</option>
              <option value="quarter">{t.thisQuarter}</option>
            </SelectField>
          </div>
          <span className="spatial-filter-separator" aria-hidden="true" />
          <div className="spatial-filter-control">
            <Stethoscope size={14} aria-hidden="true" />
            <SelectField
              compact
              className="spatial-service-filter"
              aria-label={t.serviceType}
              value={service}
              onChange={(event) => setService(event.target.value as ServiceFilter)}
            >
              <option value="all">{t.allServices}</option>
              <option value="orthopedic">{t.orthopedic}</option>
              <option value="sports">{t.sports}</option>
              <option value="neurological">{t.neurological}</option>
            </SelectField>
          </div>
          {canAccessModule(role, "appointments") ? (
            <Button
              variant="ghost"
              className="spatial-calendar-link"
              onClick={() => router.push(`/${locale}/calendar`)}
              aria-label={t.viewSchedule}
              title={t.viewSchedule}
            >
              <CalendarDays size={14} aria-hidden="true" />
              <span>{t.viewSchedule}</span>
            </Button>
          ) : null}
        </div>
      </section>

      {range !== "month" || service !== "all" ? (
        <p className="spatial-filter-notice" role="status" aria-live="polite">
          <Info size={14} aria-hidden="true" />
          <span>{t.filterDataUnavailable}</span>
        </p>
      ) : null}

      <section
        className="spatial-overview-grid"
        aria-label={branchId === "all" ? t.groupIntelligence : messages[locale].app.branchOverview}
      >
        <SpatialBranchNetwork data={liveBranchOverview} />
        <SpatialMetricCluster
          metrics={liveMetrics}
          role={role}
          locale={locale}
          labels={{
            revenue: t.totalRevenue,
            collected: t.collectedPayments,
            appointments: t.appointments,
            newPatients: t.newPatients,
            returningPatients: t.returningPatients,
            revenueDescription: t.revenueDescription,
            collectedDescription: t.collectedDescription,
            appointmentsDescription: t.appointmentsDescription,
            newPatientsDescription: t.newPatientsDescription,
            returningPatientsDescription: t.returningPatientsDescription,
          }}
        />
      </section>

      <section className="spatial-intelligence-grid" aria-label={t.operationsHealth}>
        <AppointmentTrendChart
          data={snapshot.appointmentTrend}
          locale={locale}
          title={t.appointmentTrend}
          description={t.appointmentTrendHint}
          appointmentsLabel={t.totalAppointments}
          completedLabel={t.completed}
        />
        <OperationsSummary
          noShowRate={snapshot.noShowRate}
          occupancy={snapshot.occupancy}
          pendingReports={snapshot.pendingReports}
          locale={locale}
          labels={{
            title: t.operationsHealth,
            hint: t.operationsHealthHint,
            noShowRate: t.noShowRate,
            noShowDescription: t.noShowDescription,
            therapistOccupancy: t.therapistOccupancy,
            occupancyDescription: t.occupancyDescription,
            pendingReports: t.pendingReports,
            pendingReportsDescription: t.pendingReportsDescription,
          }}
        />
      </section>

      <section className="spatial-workbench-grid" aria-label={t.dailyOperations}>
        <SpatialSessionTimeline service={service} />
        <div className="spatial-workbench-stack">
          <UpcomingAppointments range={range} service={service} />
          <RecentActivity />
        </div>
        <TodayClinicians service={service} />
      </section>

      <DashboardWorkspaces />

      <div className="demo-banner spatial-demo-banner" role="note">
        <ShieldCheck size={15} aria-hidden="true" />
        <span><strong>{messages[locale].app.demoMode}</strong> — {messages[locale].app.demoModeDescription}</span>
      </div>
    </div>
  );
}
