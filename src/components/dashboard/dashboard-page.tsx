"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, ArrowUpLeft, ArrowUpRight, CalendarCheck2, CalendarDays, CalendarPlus, FileDown, MapPin, ShieldCheck, Sparkles, Stethoscope, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { AppointmentTrendChart } from "@/components/dashboard/appointment-trend-chart";
import { AppointmentOverview, TodayClinicians } from "@/components/dashboard/appointment-overview";
import { MetricGrid } from "@/components/dashboard/metric-grid";
import { OperationsSummary } from "@/components/dashboard/operations-summary";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { useClinicData } from "@/services/clinic-data-provider";
import { DEMO_TODAY, SEED_APPOINTMENTS, SEED_PATIENTS } from "@/lib/mock/clinic-seed";
import { canAccessModule } from "@/lib/config/roles";
import { BRANCHES } from "@/lib/mock/branches";
import { messages } from "@/lib/i18n/messages";
import { mockDashboardRepository } from "@/services/repositories/dashboard.repository";
import type { DateRange, ServiceFilter } from "@/types";
import { formatNumber } from "@/lib/utils";

export function DashboardPage() {
  const router = useRouter();
  const { locale, role, branchId } = useWorkspace();
  const { appointments, patients } = useClinicData();
  const t = messages[locale].dashboard;
  const [range, setRange] = useState<DateRange>("month");
  const [service, setService] = useState<ServiceFilter>("all");
  const snapshot = useMemo(
    () => mockDashboardRepository.getOverview({ branchId, range, service, locale }),
    [branchId, locale, range, service],
  );
  const liveMetrics = useMemo(() => {
    const branchMatches = (id: string) => branchId === "all" || id === branchId;
    const appointmentDelta = appointments.filter((item) => branchMatches(item.branchId)).length -
      SEED_APPOINTMENTS.filter((item) => branchMatches(item.branchId)).length;
    const patientDelta = patients.filter((item) => branchMatches(item.branchId)).length -
      SEED_PATIENTS.filter((item) => branchMatches(item.branchId)).length;
    return snapshot.metrics.map((metric) => ({
      ...metric,
      value: metric.id === "appointments"
        ? Math.max(0, metric.value + appointmentDelta)
        : metric.id === "newPatients"
          ? Math.max(0, metric.value + patientDelta)
          : metric.value,
    }));
  }, [appointments, branchId, patients, snapshot.metrics]);
  const heroOverview = useMemo(() => {
    const branchMatches = (id: string) => branchId === "all" || id === branchId;
    return {
      appointments: appointments.filter((item) =>
        item.date === DEMO_TODAY &&
        branchMatches(item.branchId) &&
        !["cancelled", "noShow"].includes(item.status),
      ).length,
      patients: patients.filter((item) => branchMatches(item.branchId)).length,
    };
  }, [appointments, branchId, patients]);
  const HeroDirectionArrow = locale === "ar" ? ArrowUpLeft : ArrowUpRight;
  const currentBranch =
    branchId === "all"
      ? messages[locale].branches.all
      : (() => {
          const branch = BRANCHES.find((item) => item.id === branchId);
          return branch ? (locale === "ar" ? branch.nameAr : branch.nameEn) : "";
        })();

  return (
    <div className="dashboard-page">
      <div className="dashboard-heading">
        <div className="dashboard-title-block">
          <div className="dashboard-eyebrow">
            <span className="eyebrow-dot" />
            {t.eyebrow}
          </div>
          <h1>{t.title}</h1>
          <p className="dashboard-subtitle">{t.subtitle}</p>
        </div>
        <div className="dashboard-heading-actions">
          {canAccessModule(role, "reports") ? (
            <Button
              variant="outline"
              className="button-report"
              onClick={() => router.push(`/${locale}/reports`)}
            >
              <FileDown size={16} />
              {t.export}
            </Button>
          ) : null}
          {canAccessModule(role, "appointments") ? (
            <Button onClick={() => router.push(`/${locale}/appointments`)}>
              <CalendarPlus size={16} />
              {t.newAppointment}
            </Button>
          ) : null}
        </div>
      </div>

      <section className="dashboard-visual-hero" aria-labelledby="dashboard-visual-title">
        <div className="dashboard-visual-content">
          <div className="dashboard-visual-overline">
            <span className="dashboard-visual-pulse" />
            <Sparkles size={14} aria-hidden="true" />
            {t.heroBadge}
          </div>
          <h2 id="dashboard-visual-title">{t.heroTitle}</h2>
          <p className="dashboard-visual-description">{t.heroDescription}</p>
          <div className="dashboard-visual-context">
            <span className="dashboard-visual-branch"><MapPin size={14} aria-hidden="true" />{currentBranch}</span>
            {canAccessModule(role, "appointments") ? (
              <Link className="dashboard-visual-link" href={`/${locale}/calendar`}>
                {t.viewSchedule}
                <HeroDirectionArrow size={14} aria-hidden="true" />
              </Link>
            ) : null}
          </div>
          <div className="dashboard-visual-stats">
            <div className="dashboard-visual-stat">
              <span className="dashboard-visual-stat-label"><CalendarCheck2 size={14} aria-hidden="true" />{t.heroAppointmentsLabel}</span>
              <strong dir="auto">{formatNumber(heroOverview.appointments, locale)}</strong>
            </div>
            <div className="dashboard-visual-stat">
              <span className="dashboard-visual-stat-label"><UsersRound size={14} aria-hidden="true" />{t.heroPatientsLabel}</span>
              <strong dir="auto">{formatNumber(heroOverview.patients, locale)}</strong>
            </div>
          </div>
        </div>
        <div className="dashboard-visual-media">
          <Image
            src="/images/ehteraf-dashboard-doctor.jpg"
            alt=""
            fill
            priority
            sizes="(max-width: 760px) 100vw, 45vw"
            className="dashboard-visual-image"
          />
          <span className="dashboard-visual-image-shade" aria-hidden="true" />
          <div className="dashboard-visual-caption">
            <span className="dashboard-visual-caption-icon"><Activity size={16} aria-hidden="true" /></span>
            <span><strong>{t.heroMediaTitle}</strong><small>{t.heroMediaNote}</small></span>
          </div>
          <span className="dashboard-visual-image-code" aria-hidden="true">EH / CARE SERIES</span>
        </div>
      </section>

      <div className="dashboard-toolbar">
        <div className="toolbar-context">
          <span className="toolbar-status-dot" />
          <strong>{branchId === "all" ? messages[locale].app.groupOverview : messages[locale].app.branchOverview}</strong>
          <span aria-hidden="true">·</span>
          <span>{currentBranch}</span>
          <span className="toolbar-context-updated">{t.updated}</span>
        </div>
        <div className="toolbar-filters">
          <div className="toolbar-filter-select">
            <CalendarDays size={15} aria-hidden="true" />
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
          <span className="toolbar-separator" aria-hidden="true" />
          <div className="toolbar-filter-select service-filter">
            <Stethoscope size={15} aria-hidden="true" />
            <SelectField
              compact
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
        </div>
      </div>

      <MetricGrid
        metrics={liveMetrics}
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
          vsLastPeriod: t.vsLastPeriod,
        }}
      />

      <div className="dashboard-widget-grid dashboard-widget-grid-overview">
        <RevenueChart
          data={snapshot.branchRevenue}
          locale={locale}
          title={t.revenueByBranch}
          description={t.revenueByBranchHint}
          invoicedLabel={t.invoiced}
          collectedLabel={t.collected}
        />
        <AppointmentOverview />
      </div>

      <div className="dashboard-widget-grid dashboard-widget-grid-secondary">
        <AppointmentTrendChart
          data={snapshot.appointmentTrend}
          locale={locale}
          title={t.appointmentTrend}
          description={t.appointmentTrendHint}
          appointmentsLabel={t.totalAppointments}
          completedLabel={t.completed}
        />
        <UpcomingAppointments />
      </div>

      <div className="dashboard-widget-grid dashboard-widget-grid-tertiary">
        <OperationsSummary
          noShowRate={snapshot.noShowRate}
          occupancy={snapshot.occupancy}
          pendingReports={snapshot.pendingReports}
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
        <RecentActivity />
        <TodayClinicians />
      </div>

      <div className="demo-banner">
        <ShieldCheck size={15} />
        <span>
          <strong>{messages[locale].app.demoMode}</strong> — {messages[locale].app.demoModeDescription}
        </span>
      </div>
    </div>
  );
}
