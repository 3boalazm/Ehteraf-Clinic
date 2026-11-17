"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CalendarPlus,
  Check,
  Clock3,
  Search,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { SelectField } from "@/components/ui/select-field";
import { PageHeading } from "@/components/shared/page-heading";
import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";
import { useClinicData } from "@/services/clinic-data-provider";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { canBookAppointments } from "@/lib/config/roles";
import { messages } from "@/lib/i18n/messages";
import { DEMO_TODAY } from "@/lib/mock/clinic-seed";
import { getBranchName, getServiceName, getTherapistName, formatClinicDate } from "@/lib/clinic-utils";
import { formatNumber } from "@/lib/utils";
import type { AppointmentStatus } from "@/types";

const PAGE_SIZE = 12;
type StatusFilter = AppointmentStatus | "all";

export function AppointmentsPage() {
  const router = useRouter();
  const { locale, branchId, role } = useWorkspace();
  const { patients, appointments, updateAppointmentStatus } = useClinicData();
  const t = messages[locale].clinic.appointments;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState("");
  const canManage = canBookAppointments(role);

  const branchAppointments = useMemo(
    () => appointments.filter((appointment) => branchId === "all" || appointment.branchId === branchId),
    [appointments, branchId],
  );
  const filteredAppointments = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    return branchAppointments
      .filter((appointment) => statusFilter === "all" || appointment.status === statusFilter)
      .filter((appointment) => !dateFilter || appointment.date === dateFilter)
      .filter((appointment) => {
        if (!normalizedSearch) return true;
        const patient = patients.find((item) => item.id === appointment.patientId);
        return [
          appointment.id,
          patient?.nameAr ?? "",
          patient?.nameEn ?? "",
          patient?.id ?? "",
          patient?.phone ?? "",
          getServiceName(appointment.serviceId, "ar"),
          getServiceName(appointment.serviceId, "en"),
          getTherapistName(appointment.therapistId, "ar"),
          getTherapistName(appointment.therapistId, "en"),
        ].some((value) => value.toLocaleLowerCase().includes(normalizedSearch));
      })
      .sort((left, right) => {
        const leftUpcoming = left.date >= DEMO_TODAY;
        const rightUpcoming = right.date >= DEMO_TODAY;
        if (leftUpcoming !== rightUpcoming) return leftUpcoming ? -1 : 1;
        const leftKey = `${left.date}${left.time}`;
        const rightKey = `${right.date}${right.time}`;
        return leftUpcoming ? leftKey.localeCompare(rightKey) : rightKey.localeCompare(leftKey);
      });
  }, [branchAppointments, dateFilter, patients, search, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredAppointments.length / PAGE_SIZE));
  const visibleAppointments = filteredAppointments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const todayCount = branchAppointments.filter((appointment) => appointment.date === DEMO_TODAY).length;
  const confirmedCount = branchAppointments.filter((appointment) => ["booked", "confirmed"].includes(appointment.status)).length;
  const numberFormat = (value: number) => formatNumber(value, locale);
  const statusOptions: AppointmentStatus[] = ["booked", "confirmed", "checkedIn", "inSession", "completed", "cancelled", "noShow"];
  const start = filteredAppointments.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const end = Math.min(page * PAGE_SIZE, filteredAppointments.length);

  function changeStatus(appointmentId: string, status: AppointmentStatus) {
    if (status === "cancelled" && !window.confirm(t.cancelConfirm)) return;
    updateAppointmentStatus(appointmentId, status);
    setNotice(t.statusUpdated);
  }

  function resetPage() {
    setPage(1);
  }

  return (
    <div className="feature-page">
      <PageHeading
        eyebrow={messages[locale].nav.appointments}
        title={t.title}
        description={t.subtitle}
        actions={(
          <>
            <Button variant="outline" onClick={() => router.push(`/${locale}/calendar`)}>
              <CalendarDays size={16} />
              {t.calendar}
            </Button>
            {canManage ? (
              <Button onClick={() => router.push(`/${locale}/appointments/new`)}>
                <CalendarPlus size={16} />
                {t.newAppointment}
              </Button>
            ) : null}
          </>
        )}
      />

      {notice ? <div className="inline-success" role="status">{notice}</div> : null}

      <div className="feature-stat-grid">
        <SummaryStat icon={<CalendarDays size={18} />} label={t.total} value={numberFormat(branchAppointments.length)} tone="teal" />
        <SummaryStat icon={<Clock3 size={18} />} label={t.todayCount} value={numberFormat(todayCount)} tone="blue" />
        <SummaryStat icon={<Check size={18} />} label={t.confirmedCount} value={numberFormat(confirmedCount)} tone="violet" />
      </div>

      <Panel className="data-panel">
        <div className="data-panel-toolbar">
          <label className="data-search">
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => { setSearch(event.target.value); resetPage(); }}
              placeholder={t.searchPlaceholder}
              aria-label={t.searchPlaceholder}
              dir="auto"
            />
          </label>
          <div className="data-filters">
            <SelectField
              className="data-filter-select"
              aria-label={t.status}
              value={statusFilter}
              onChange={(event) => { setStatusFilter(event.target.value as StatusFilter); resetPage(); }}
            >
              <option value="all">{t.allStatuses}</option>
              {statusOptions.map((status) => <option key={status} value={status}>{t[status]}</option>)}
            </SelectField>
            <label className="date-filter-field" title={t.dateFilter}>
              <CalendarDays size={15} />
              <input aria-label={t.dateFilter} type="date" value={dateFilter} onChange={(event) => { setDateFilter(event.target.value); resetPage(); }} />
            </label>
            {dateFilter ? <button className="clear-filter-button" type="button" onClick={() => { setDateFilter(""); resetPage(); }}>{messages[locale].clinic.common.reset}</button> : null}
          </div>
        </div>

        {visibleAppointments.length ? (
          <div className="table-scroll-area">
            <table className="data-table appointment-data-table">
              <thead>
                <tr>
                  <th>{t.patient}</th>
                  <th>{t.service}</th>
                  <th>{t.therapist}</th>
                  <th>{t.dateTime}</th>
                  <th>{t.branch}</th>
                  <th>{t.status}</th>
                  <th>{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {visibleAppointments.map((appointment) => {
                  const patient = patients.find((item) => item.id === appointment.patientId);
                  const displayName = patient ? (locale === "ar" ? patient.nameAr : patient.nameEn || patient.nameAr) : "—";
                  return (
                    <tr key={appointment.id}>
                      <td>
                        {patient ? (
                          <button className="table-person-link" type="button" onClick={() => router.push(`/${locale}/patients/${patient.id}`)}>
                            <span className="table-person-copy"><strong>{displayName}</strong><small>{patient.id}</small></span>
                          </button>
                        ) : <span>—</span>}
                      </td>
                      <td>
                        <span className="table-service"><Stethoscope size={14} /><span>{getServiceName(appointment.serviceId, locale)}</span></span>
                        <small className="table-subtext">{appointment.durationMinutes} {messages[locale].clinic.common.min}</small>
                      </td>
                      <td>{getTherapistName(appointment.therapistId, locale)}</td>
                      <td>
                        <span className="table-date-cell"><strong>{formatClinicDate(appointment.date, locale, { day: "numeric", month: "short", year: "numeric" })}</strong><small dir="ltr">{appointment.time}</small></span>
                      </td>
                      <td>
                        <span>{getBranchName(appointment.branchId, locale)}</span>
                        <small className="table-subtext">{appointment.visitType === "home" ? t.visitHome : t.visitClinic}</small>
                      </td>
                      <td><AppointmentStatusBadge status={appointment.status} locale={locale} /></td>
                      <td>
                        {canManage ? <AppointmentActions appointment={appointment} labels={t} onChange={changeStatus} onReschedule={(id) => router.push(`/${locale}/appointments/${id}/reschedule`)} /> : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-empty-state">
            <span className="empty-state-icon"><CalendarDays size={22} /></span>
            <strong>{branchAppointments.length ? t.noResults : t.emptyTitle}</strong>
            <p>{branchAppointments.length ? t.noResults : t.emptyDescription}</p>
            {canManage && !branchAppointments.length ? <Button size="sm" onClick={() => router.push(`/${locale}/appointments/new`)}><CalendarPlus size={15} />{t.newAppointment}</Button> : null}
          </div>
        )}

        <div className="table-pagination">
          <span>{messages[locale].clinic.patients.showing} {numberFormat(start)}–{numberFormat(end)} {messages[locale].clinic.patients.of} {numberFormat(filteredAppointments.length)}</span>
          <div className="pagination-controls">
            <span>{messages[locale].clinic.patients.page} {numberFormat(page)} / {numberFormat(pageCount)}</span>
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>{messages[locale].clinic.common.previous}</Button>
            <Button size="sm" variant="outline" disabled={page >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>{messages[locale].clinic.common.next}</Button>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function AppointmentActions({
  appointment,
  labels,
  onChange,
  onReschedule,
}: {
  appointment: { id: string; status: AppointmentStatus };
  labels: (typeof messages)["ar"]["clinic"]["appointments"] | (typeof messages)["en"]["clinic"]["appointments"];
  onChange: (id: string, status: AppointmentStatus) => void;
  onReschedule: (id: string) => void;
}) {
  if (["completed", "cancelled", "noShow"].includes(appointment.status)) return null;
  const nextStatus: Partial<Record<AppointmentStatus, { label: string; status: AppointmentStatus }>> = {
    booked: { label: labels.checkIn, status: "checkedIn" },
    confirmed: { label: labels.checkIn, status: "checkedIn" },
    checkedIn: { label: labels.startSession, status: "inSession" },
    inSession: { label: labels.complete, status: "completed" },
  };
  const next = nextStatus[appointment.status];
  return (
    <div className="appointment-row-actions">
      {next ? (
        <Button size="sm" variant={appointment.status === "inSession" ? "primary" : "secondary"} onClick={() => onChange(appointment.id, next.status)}>
          <Check size={13} />
          {next.label}
        </Button>
      ) : null}
      {["booked", "confirmed"].includes(appointment.status) ? (
        <button className="appointment-reschedule-action" type="button" onClick={() => onReschedule(appointment.id)}>
          <CalendarDays size={12} />
          {labels.reschedule}
        </button>
      ) : null}
      {appointment.status !== "inSession" ? (
        <button className="appointment-cancel-action" type="button" onClick={() => onChange(appointment.id, "cancelled")} aria-label={labels.cancelAppointment}>
          {labels.cancelAppointment}
        </button>
      ) : null}
    </div>
  );
}

function SummaryStat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) {
  return <Panel className="feature-stat-card"><span className={`feature-stat-icon stat-icon-${tone}`}>{icon}</span><span className="feature-stat-copy"><small>{label}</small><strong>{value}</strong></span></Panel>;
}
