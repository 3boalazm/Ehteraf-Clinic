"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowUpLeft,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  FileText,
  MapPin,
  Network,
  Stethoscope,
  UsersRound,
  Wallet,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import { Panel } from "@/components/ui/panel";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { useClinicData } from "@/services/clinic-data-provider";
import { canAccessModule, ROLE_BRANCH_SCOPE } from "@/lib/config/roles";
import { DEMO_TODAY } from "@/lib/mock/clinic-seed";
import { messages } from "@/lib/i18n/messages";
import { formatClinicDate, getBranchName, getServiceName, matchesServiceFilter } from "@/lib/clinic-utils";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import type {
  AppointmentStatus,
  BranchDashboardOverview,
  DashboardMetric,
  Locale,
  ModuleId,
  RoleId,
  ServiceFilter,
} from "@/types";

const NODE_POSITIONS = [
  { x: 18, y: 20 },
  { x: 82, y: 20 },
  { x: 50, y: 84 },
];

const BRANCH_CODES: Record<BranchDashboardOverview["branchId"], string> = {
  ghadeer: "01",
  darAlbaida: "02",
  quwayiyah: "03",
};

const ACTIVE_APPOINTMENT_STATUSES = new Set<AppointmentStatus>([
  "booked",
  "confirmed",
  "checkedIn",
  "inSession",
]);
const HIDDEN_APPOINTMENT_STATUSES = new Set<AppointmentStatus>(["cancelled", "noShow"]);

export function SpatialBranchNetwork({ data }: { data: BranchDashboardOverview[] }) {
  const { locale, role, branchId, setBranchId } = useWorkspace();
  const t = messages[locale].dashboard;
  const currentScope = getBranchName(branchId, locale);
  const canChangeScope = !ROLE_BRANCH_SCOPE[role];
  const positions = data.length === 1
    ? [{ x: 50, y: 20 }]
    : data.map((_, index) => {
        const position = NODE_POSITIONS[index] ?? { x: 50, y: 50 };
        return locale === "ar" ? { ...position, x: 100 - position.x } : position;
      });
  const branchCountLabel = branchId === "all" ? t.branchesInScope : t.branchInScope;

  return (
    <Panel className="dashboard-panel spatial-network-panel">
      <div className="spatial-panel-heading">
        <div>
          <span className="spatial-panel-kicker"><Network size={13} aria-hidden="true" />{branchId === "all" ? t.groupIntelligence : messages[locale].app.branchOverview}</span>
          <h2>{t.branchNetwork}</h2>
          <p>{t.branchNetworkHint}</p>
        </div>
        <span className="spatial-scope-chip"><MapPin size={13} aria-hidden="true" />{currentScope}</span>
      </div>

      <div className={cn("spatial-network-field", data.length === 1 && "has-single-node")} role="group" aria-label={t.branchNetwork}>
        <svg className="spatial-network-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {positions.map((point, index) => {
            const controlX = (50 + point.x) / 2;
            const controlY = (53 + point.y) / 2;
            return (
              <path
                d={`M 50 53 Q ${controlX} ${controlY} ${point.x} ${point.y}`}
                className="spatial-network-line"
                key={`${point.x}-${point.y}-${index}`}
              />
            );
          })}
          <circle cx="50" cy="53" r="1.1" className="spatial-network-hub-point" />
        </svg>

        <div className="spatial-network-hub" role="group" aria-label={`${t.currentScope}: ${currentScope}`}>
          <span className="spatial-hub-icon"><Activity size={17} aria-hidden="true" /></span>
          <span className="spatial-hub-copy">
            <small>{branchId === "all" ? t.groupIntelligence : t.currentScope}</small>
            <strong>{currentScope}</strong>
            <span>{formatNumber(data.length, locale)} {branchCountLabel}</span>
          </span>
        </div>

        {data.map((branch, index) => {
          const position = positions[index] ?? { x: 50, y: 50 };
          const selected = branchId === branch.branchId;
          const style = { left: `${position.x}%`, top: `${position.y}%` };
          const accessibleSummary = [
            `${t.invoiced}: ${formatCurrency(branch.invoiced, locale)}`,
            `${t.collected}: ${formatCurrency(branch.collected, locale)}`,
            `${t.branchAppointments}: ${formatNumber(branch.appointments, locale)}`,
            `${t.branchOccupancy}: ${branch.occupancy}%`,
          ].join(". ");

          return (
            <button
              className={cn("spatial-branch-node", selected && "is-selected")}
              type="button"
              key={branch.branchId}
              style={style}
              aria-label={`${branch.branchName}. ${accessibleSummary}${canChangeScope ? `. ${selected ? t.returnToGroupScope : t.focusBranch}` : ""}`}
              aria-pressed={selected}
              title={canChangeScope ? (selected ? t.returnToGroupScope : `${t.focusBranch}: ${branch.branchName}`) : branch.branchName}
              disabled={!canChangeScope}
              onClick={() => setBranchId(selected ? "all" : branch.branchId)}
            >
              <span className="spatial-node-heading">
                <span className="spatial-node-code" dir="ltr">{t.branch} {BRANCH_CODES[branch.branchId]}</span>
                <strong>{branch.branchName}</strong>
                <span className="spatial-node-selection" aria-hidden="true">{selected ? "✓" : ""}</span>
              </span>
              <span className="spatial-node-values">
                <span><small>{t.invoiced}</small><strong dir="ltr">{formatCurrency(branch.invoiced, locale)}</strong></span>
                <span><small>{t.collected}</small><strong dir="ltr">{formatCurrency(branch.collected, locale)}</strong></span>
              </span>
              <span className="spatial-node-operations">
                <span><CalendarDays size={12} aria-hidden="true" /><strong>{formatNumber(branch.appointments, locale)}</strong><small>{t.branchAppointments}</small></span>
                <span><Activity size={12} aria-hidden="true" /><strong dir="ltr">{branch.occupancy}%</strong><small>{t.branchOccupancy}</small></span>
              </span>
              {canChangeScope ? <span className="spatial-node-hint">{selected ? t.returnToGroupScope : t.focusBranch}</span> : null}
            </button>
          );
        })}
      </div>

      <div className="spatial-network-legend" aria-label={`${t.invoiced}, ${t.collected}`}>
        <span><i className="spatial-legend-invoiced" />{t.invoiced}</span>
        <span><i className="spatial-legend-collected" />{t.collected}</span>
        <span className="spatial-network-note"><span className="spatial-demo-dot" />{messages[locale].app.demoMode}</span>
      </div>
    </Panel>
  );
}

const METRIC_ICON: Record<DashboardMetric["id"], LucideIcon> = {
  revenue: Wallet,
  collected: CreditCard,
  appointments: CalendarDays,
  newPatients: UsersRound,
  returningPatients: UsersRound,
};

const METRIC_DESTINATION: Record<DashboardMetric["id"], { module: ModuleId; path: string }> = {
  revenue: { module: "finance", path: "/finance/invoices" },
  collected: { module: "finance", path: "/finance/invoices" },
  appointments: { module: "appointments", path: "/appointments" },
  newPatients: { module: "patients", path: "/patients" },
  returningPatients: { module: "patients", path: "/patients" },
};

type MetricLabels = {
  revenue: string;
  collected: string;
  appointments: string;
  newPatients: string;
  returningPatients: string;
  revenueDescription: string;
  collectedDescription: string;
  appointmentsDescription: string;
  newPatientsDescription: string;
  returningPatientsDescription: string;
};

export function SpatialMetricCluster({
  metrics,
  labels,
  role,
  locale,
}: {
  metrics: DashboardMetric[];
  labels: MetricLabels;
  role: RoleId;
  locale: Locale;
}) {
  const { branchId } = useWorkspace();
  const scopeLabel = branchId === "all"
    ? messages[locale].dashboard.groupIntelligence
    : messages[locale].app.branchOverview;
  const titles = {
    revenue: labels.revenue,
    collected: labels.collected,
    appointments: labels.appointments,
    newPatients: labels.newPatients,
    returningPatients: labels.returningPatients,
  };
  const descriptions = {
    revenue: labels.revenueDescription,
    collected: labels.collectedDescription,
    appointments: labels.appointmentsDescription,
    newPatients: labels.newPatientsDescription,
    returningPatients: labels.returningPatientsDescription,
  };
  const financialMetrics = metrics.filter((metric) => metric.id === "revenue" || metric.id === "collected");
  const operationalMetrics = metrics.filter((metric) => metric.id !== "revenue" && metric.id !== "collected");

  function renderMetric(metric: DashboardMetric, financial: boolean) {
    const Icon = METRIC_ICON[metric.id];
    const destination = METRIC_DESTINATION[metric.id];
    const value = metric.id === "revenue" || metric.id === "collected"
      ? formatCurrency(metric.value, locale)
      : formatNumber(metric.value, locale);
    const content = (
      <>
        <span className="spatial-metric-topline">
          <span className="spatial-metric-icon"><Icon size={15} strokeWidth={1.8} aria-hidden="true" /></span>
          <span className="spatial-metric-label">{titles[metric.id]}</span>
        </span>
        <strong className="spatial-metric-value" dir="auto">{value}</strong>
        <span className="spatial-metric-description">{descriptions[metric.id]}</span>
      </>
    );
    const className = cn("spatial-metric-entry", financial && "is-financial");

    return canAccessModule(role, destination.module) ? (
      <Link
        className={className}
        key={metric.id}
        href={`/${locale}${destination.path}`}
        aria-label={`${titles[metric.id]}: ${value}`}
      >
        {content}
      </Link>
    ) : (
      <div className={className} key={metric.id}>{content}</div>
    );
  }

  return (
    <aside className="spatial-metric-cluster" aria-label={scopeLabel}>
      <div className="spatial-financial-flow">
        <span className="spatial-flow-kicker"><Activity size={13} aria-hidden="true" />{messages[locale].dashboard.financialFlow}</span>
        <div className="spatial-financial-metrics">
          {financialMetrics.map((metric) => renderMetric(metric, true))}
        </div>
      </div>
      <div className="spatial-operational-flow">
        {operationalMetrics.map((metric) => renderMetric(metric, false))}
      </div>
    </aside>
  );
}

function appointmentStatusLabel(status: AppointmentStatus, locale: Locale): string {
  const t = messages[locale].dashboard;
  if (status === "checkedIn") return t.checkedIn;
  if (status === "inSession") return t.inSession;
  if (status === "completed") return t.completed;
  return t.confirmed;
}

export function SpatialSessionTimeline({ service }: { service: ServiceFilter }) {
  const { locale, branchId, role } = useWorkspace();
  const { appointments } = useClinicData();
  const t = messages[locale].dashboard;
  const [selectedDate, setSelectedDate] = useState(DEMO_TODAY);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const dayAppointments = useMemo(
    () => appointments
      .filter((appointment) => appointment.date === selectedDate)
      .filter((appointment) => branchId === "all" || appointment.branchId === branchId)
      .filter((appointment) => matchesServiceFilter(appointment.serviceId, service))
      .filter((appointment) => !HIDDEN_APPOINTMENT_STATUSES.has(appointment.status))
      .sort((left, right) => left.time.localeCompare(right.time)),
    [appointments, branchId, selectedDate, service],
  );
  const timeGroups = useMemo(() => {
    const groups = new Map<string, typeof dayAppointments>();
    for (const appointment of dayAppointments) {
      const current = groups.get(appointment.time) ?? [];
      groups.set(appointment.time, [...current, appointment]);
    }
    return Array.from(groups, ([time, items]) => ({ time, items }));
  }, [dayAppointments]);
  const selectedGroup = timeGroups.find((group) => group.time === selectedTime) ?? timeGroups[0];
  const selectedAppointment = selectedGroup?.items.find((appointment) => appointment.id === selectedAppointmentId)
    ?? selectedGroup?.items[0];
  const completedCount = dayAppointments.filter((appointment) => appointment.status === "completed").length;
  const activeCount = dayAppointments.filter((appointment) => ACTIVE_APPOINTMENT_STATUSES.has(appointment.status)).length;
  const scheduledClinicianCount = new Set(dayAppointments.map((appointment) => appointment.therapistId)).size;
  const dayLabel = formatClinicDate(selectedDate, locale, { weekday: "long", day: "numeric", month: "long" });
  const PreviousDateIcon = locale === "ar" ? ChevronRight : ChevronLeft;
  const NextDateIcon = locale === "ar" ? ChevronLeft : ChevronRight;
  const DirectionArrow = locale === "ar" ? ArrowUpLeft : ArrowUpRight;
  const canOpenSchedule = canAccessModule(role, "appointments");

  function shiftDate(offset: -1 | 1) {
    const date = new Date(`${selectedDate}T12:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() + offset);
    setSelectedDate(date.toISOString().slice(0, 10));
    setSelectedTime(null);
    setSelectedAppointmentId(null);
  }

  function changeDate(value: string) {
    if (!value) return;
    setSelectedDate(value);
    setSelectedTime(null);
    setSelectedAppointmentId(null);
  }

  return (
    <Panel className="dashboard-panel spatial-sessions-panel">
      <div className="spatial-panel-heading">
        <div>
          <span className="spatial-panel-kicker"><Clock3 size={13} aria-hidden="true" />{t.dailyOperations}</span>
          <h2>{t.appointmentOverview}</h2>
          <p>{t.sessionsTodayHint}</p>
        </div>
        <div className="spatial-day-context">
          <strong>{dayLabel}</strong>
          <span>{branchId === "all" ? messages[locale].branches.all : getBranchName(branchId, locale)}</span>
          <div className="spatial-day-picker" role="group" aria-label={t.chooseDate}>
            <button type="button" aria-label={t.previousDay} title={t.previousDay} onClick={() => shiftDate(-1)}>
              <PreviousDateIcon size={15} aria-hidden="true" />
            </button>
            <label className="spatial-date-picker">
              <CalendarDays size={14} aria-hidden="true" />
              <input type="date" aria-label={t.chooseDate} value={selectedDate} onChange={(event) => changeDate(event.target.value)} />
            </label>
            <button type="button" aria-label={t.nextDay} title={t.nextDay} onClick={() => shiftDate(1)}>
              <NextDateIcon size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className="spatial-day-summary" role="group" aria-label={t.dailyOperations}>
        <span><strong>{formatNumber(dayAppointments.length, locale)}</strong><small>{t.appointments}</small></span>
        <span><strong>{formatNumber(completedCount, locale)}</strong><small>{t.completed}</small></span>
        <span><strong>{formatNumber(activeCount, locale)}</strong><small>{t.activeAppointments}</small></span>
        <span><strong>{formatNumber(scheduledClinicianCount, locale)}</strong><small>{t.scheduledClinicians}</small></span>
      </div>

      {timeGroups.length ? (
        <>
          <div className="spatial-time-ribbon" role="group" aria-label={t.appointments}>
            <span className="spatial-time-ribbon-line" aria-hidden="true" />
            {timeGroups.map((group) => {
              const isSelected = group.time === selectedGroup?.time;
              return (
                <button
                  className={cn("spatial-time-group", isSelected && "is-selected")}
                  type="button"
                  key={group.time}
                  onClick={() => {
                    setSelectedTime(group.time);
                    setSelectedAppointmentId(null);
                  }}
                  aria-pressed={isSelected}
                  aria-label={`${group.time}, ${formatNumber(group.items.length, locale)} ${t.appointments}`}
                >
                  <span className="spatial-time-marker"><Clock3 size={13} aria-hidden="true" /></span>
                  <strong dir="ltr">{group.time}</strong>
                  <small>{formatNumber(group.items.length, locale)}</small>
                </button>
              );
            })}
          </div>

          <div className="spatial-session-content">
            <div className="spatial-session-list" role="group" aria-label={t.dailyOperations}>
              {selectedGroup?.items.map((appointment) => {
                const isSelected = appointment.id === selectedAppointment?.id;
                return (
                  <button
                    className={cn("spatial-session-row", isSelected && "is-selected")}
                    type="button"
                    key={appointment.id}
                    onClick={() => setSelectedAppointmentId(appointment.id)}
                    aria-pressed={isSelected}
                  >
                    <span className="spatial-session-time" dir="ltr">{appointment.time}</span>
                    <span className="spatial-session-copy">
                      <strong>{getServiceName(appointment.serviceId, locale)}</strong>
                      <small>{getBranchName(appointment.branchId, locale)} · {formatNumber(appointment.durationMinutes, locale)} {locale === "ar" ? "دقيقة" : "min"}</small>
                    </span>
                    <span className={cn("spatial-session-status", `is-${appointment.status}`)}>
                      <i aria-hidden="true" />{appointmentStatusLabel(appointment.status, locale)}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedAppointment ? (
              <div className="spatial-session-detail" aria-live="polite">
                <span className="spatial-detail-kicker"><MapPin size={12} aria-hidden="true" />{t.sessionDetails}</span>
                <strong>{getServiceName(selectedAppointment.serviceId, locale)}</strong>
                <span>{getBranchName(selectedAppointment.branchId, locale)} · <bdi dir="ltr">{selectedAppointment.time}</bdi></span>
                <span>{t.sessionDuration}: {formatNumber(selectedAppointment.durationMinutes, locale)} {locale === "ar" ? "دقيقة" : "min"}</span>
                {canOpenSchedule ? (
                  <Link href={`/${locale}/calendar?date=${encodeURIComponent(selectedDate)}`}>
                    {t.viewDayAppointments}<DirectionArrow size={13} aria-hidden="true" />
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <div className="spatial-session-empty">
          <CalendarDays size={17} aria-hidden="true" />
          <span>{t.sessionEmpty}</span>
        </div>
      )}
    </Panel>
  );
}

interface WorkspaceCard {
  path: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export function DashboardWorkspaces() {
  const { locale, role } = useWorkspace();
  const t = messages[locale].dashboard;
  const workspaces: WorkspaceCard[] = [];

  if (canAccessModule(role, "appointments")) {
    workspaces.push({
      path: "/calendar",
      title: t.healthcareWorkspace,
      description: t.healthcareWorkspaceHint,
      icon: Stethoscope,
    });
  }
  if (canAccessModule(role, "finance")) {
    workspaces.push({
      path: "/finance/invoices",
      title: t.financialWorkspace,
      description: t.financialWorkspaceHint,
      icon: CreditCard,
    });
  }
  if (canAccessModule(role, "inventory")) {
    workspaces.push({
      path: "/inventory",
      title: t.supplyWorkspace,
      description: t.supplyWorkspaceHint,
      icon: Warehouse,
    });
  }
  if (canAccessModule(role, "reports")) {
    workspaces.push({
      path: "/reports",
      title: t.reportsWorkspace,
      description: t.reportsWorkspaceHint,
      icon: BarChart3,
    });
  }

  if (!workspaces.length) return null;
  const DirectionArrow = locale === "ar" ? ArrowUpLeft : ArrowUpRight;

  return (
    <section className="dashboard-panel spatial-workspaces" aria-labelledby="spatial-workspaces-heading">
      <div className="spatial-panel-heading">
        <div>
          <span className="spatial-panel-kicker"><Network size={13} aria-hidden="true" />{t.spatialBrand}</span>
          <h2 id="spatial-workspaces-heading">{t.workspaces}</h2>
          <p>{t.workspaceHubHint}</p>
        </div>
      </div>
      <div className="spatial-workspace-grid">
        {workspaces.map((workspace) => {
          const Icon = workspace.icon;
          return (
            <Link
              className="spatial-workspace-card"
              href={`/${locale}${workspace.path}`}
              key={workspace.path}
              aria-label={`${workspace.title}. ${workspace.description}. ${t.openWorkspace}`}
            >
              <span className="spatial-workspace-icon"><Icon size={17} aria-hidden="true" /></span>
              <span className="spatial-workspace-copy">
                <span className="spatial-workspace-status">{t.demoWorkspaceStatus}</span>
                <strong>{workspace.title}</strong>
                <small>{workspace.description}</small>
              </span>
              <span className="spatial-workspace-open">{t.openWorkspace}<DirectionArrow size={13} aria-hidden="true" /></span>
            </Link>
          );
        })}
      </div>
      <p className="spatial-planned-note"><FileText size={14} aria-hidden="true" />{t.plannedAccountingNotice}</p>
    </section>
  );
}
