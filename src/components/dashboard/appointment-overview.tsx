"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { useClinicData } from "@/services/clinic-data-provider";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { messages } from "@/lib/i18n/messages";
import { CLINIC_THERAPISTS, DEMO_TODAY } from "@/lib/mock/clinic-seed";
import { formatClinicDate, formatClinicMonth, getInitials, getServiceName, getTherapistName } from "@/lib/clinic-utils";
import { formatNumber } from "@/lib/utils";
import type { Locale } from "@/types";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Clock3, UsersRound } from "lucide-react";

const ACTIVE_STATUSES = new Set(["booked", "confirmed", "checkedIn", "inSession"]);
const NON_VISIT_STATUSES = new Set(["cancelled", "noShow"]);

export function AppointmentOverview() {
  const { locale, branchId } = useWorkspace();
  const { appointments, patients } = useClinicData();
  const [selectedDate, setSelectedDate] = useState(DEMO_TODAY);
  const [displayedMonth, setDisplayedMonth] = useState(`${DEMO_TODAY.slice(0, 7)}-01`);
  const t = messages[locale];
  const dashboardT = t.dashboard;
  const calendarT = t.clinic.calendar;
  const dates = getMonthCells(displayedMonth);
  const selectedAppointments = useMemo(
    () => appointments
      .filter((appointment) => appointment.date === selectedDate)
      .filter((appointment) => branchId === "all" || appointment.branchId === branchId)
      .filter((appointment) => !NON_VISIT_STATUSES.has(appointment.status))
      .sort((left, right) => left.time.localeCompare(right.time)),
    [appointments, branchId, selectedDate],
  );
  const completedCount = selectedAppointments.filter((appointment) => appointment.status === "completed").length;
  const activeCount = selectedAppointments.filter((appointment) => ACTIVE_STATUSES.has(appointment.status)).length;
  const weekdays = useMemo(() => getWeekdayLabels(locale), [locale]);

  function shiftMonth(direction: -1 | 1) {
    const current = parseDate(displayedMonth);
    const next = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + direction, 1, 12));
    const nextIso = next.toISOString().slice(0, 10);
    setDisplayedMonth(nextIso);
    setSelectedDate(nextIso);
  }

  return (
    <Panel className="dashboard-panel appointment-overview-panel">
      <div className="panel-heading appointment-overview-heading">
        <div className="panel-title-block">
          <h2 className="panel-title">{dashboardT.appointmentOverview}</h2>
          <p className="panel-description">{dashboardT.appointmentOverviewHint}</p>
        </div>
        <div className="appointment-month-controls">
          <Button
            size="icon"
            variant="ghost"
            className="calendar-month-button"
            aria-label={dashboardT.previousMonth}
            title={dashboardT.previousMonth}
            onClick={() => shiftMonth(-1)}
          >
            {locale === "ar" ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </Button>
          <strong>{formatClinicMonth(displayedMonth, locale)}</strong>
          <Button
            size="icon"
            variant="ghost"
            className="calendar-month-button"
            aria-label={dashboardT.nextMonth}
            title={dashboardT.nextMonth}
            onClick={() => shiftMonth(1)}
          >
            {locale === "ar" ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
          </Button>
        </div>
      </div>

      <div className="dashboard-mini-calendar" role="group" aria-label={formatClinicMonth(displayedMonth, locale)}>
        {weekdays.map((day, index) => (
          <span className="mini-calendar-weekday" aria-hidden="true" key={`${day}-${index}`}>{day}</span>
        ))}
        {dates.map((date, index) => {
          if (!date) return <span className="mini-calendar-blank" aria-hidden="true" key={`blank-${index}`} />;
          const count = appointments.filter((appointment) =>
            appointment.date === date &&
            (branchId === "all" || appointment.branchId === branchId) &&
            !NON_VISIT_STATUSES.has(appointment.status),
          ).length;
          const isSelected = date === selectedDate;
          const isToday = date === DEMO_TODAY;
          return (
            <button
              className={cn(
                "mini-calendar-day",
                isSelected && "mini-calendar-day-selected",
                isToday && "mini-calendar-day-today",
              )}
              type="button"
              aria-pressed={isSelected}
              aria-label={`${formatClinicDate(date, locale)}${count ? ` · ${formatNumber(count, locale)} ${calendarT.appointments}` : ""}`}
              key={date}
              onClick={() => setSelectedDate(date)}
            >
              <span>{formatNumber(parseDate(date).getUTCDate(), locale)}</span>
              {count ? <i aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>

      <div className="appointment-day-heading">
        <span className="appointment-day-heading-copy">
          <strong>{formatClinicDate(selectedDate, locale, { weekday: "long", day: "numeric", month: "long" })}</strong>
          <small>{branchId === "all" ? t.branches.all : undefined}</small>
        </span>
        <Link href={`/${locale}/calendar?date=${encodeURIComponent(selectedDate)}`}>
          <span>{dashboardT.viewDayAppointments}</span>
          {locale === "ar" ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </Link>
      </div>

      <div className="appointment-day-stats">
        <DayStat label={selectedDate === DEMO_TODAY ? dashboardT.dayAppointments : calendarT.appointments} value={selectedAppointments.length} tone="teal" locale={locale} />
        <DayStat label={dashboardT.completedToday} value={completedCount} tone="blue" locale={locale} />
        <DayStat label={dashboardT.remainingToday} value={activeCount} tone="lime" locale={locale} />
      </div>

      {selectedAppointments.length ? (
        <div className="appointment-overview-list">
          {selectedAppointments.slice(0, 3).map((appointment) => {
            const patient = patients.find((item) => item.id === appointment.patientId);
            const name = patient ? (locale === "ar" ? patient.nameAr : patient.nameEn || patient.nameAr) : "—";
            return (
              <Link
                href={patient ? `/${locale}/patients/${patient.id}` : `/${locale}/appointments`}
                className="appointment-overview-row"
                key={appointment.id}
              >
                <span className="mini-appointment-time"><Clock3 size={12} />{appointment.time}</span>
                <span className="mini-appointment-avatar">{getInitials(name)}</span>
                <span className="mini-appointment-copy">
                  <strong>{name}</strong>
                  <small>{getServiceName(appointment.serviceId, locale)} · {getTherapistName(appointment.therapistId, locale)}</small>
                </span>
                <span className={cn("mini-appointment-indicator", `mini-status-${appointment.status}`)} />
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="appointment-overview-empty">{dashboardT.noAppointmentsOnDate}</div>
      )}
    </Panel>
  );
}

export function TodayClinicians() {
  const { locale, branchId } = useWorkspace();
  const { appointments } = useClinicData();
  const t = messages[locale].dashboard;
  const todayCounts = new Map<string, number>();
  for (const appointment of appointments) {
    if (appointment.date !== DEMO_TODAY || NON_VISIT_STATUSES.has(appointment.status)) continue;
    if (branchId !== "all" && appointment.branchId !== branchId) continue;
    todayCounts.set(appointment.therapistId, (todayCounts.get(appointment.therapistId) ?? 0) + 1);
  }
  const clinicians = CLINIC_THERAPISTS
    .filter((therapist) => branchId === "all" || therapist.branchId === branchId)
    .map((therapist) => ({ therapist, count: todayCounts.get(therapist.id) ?? 0 }))
    .sort((left, right) => right.count - left.count || left.therapist.nameEn.localeCompare(right.therapist.nameEn))
    .slice(0, 3);

  return (
    <Panel className="dashboard-panel clinicians-panel">
      <div className="panel-heading">
        <div className="panel-title-block">
          <h2 className="panel-title">{t.todayClinicians}</h2>
          <p className="panel-description">{t.scheduleHint}</p>
        </div>
        <span className="clinicians-heading-icon"><UsersRound size={16} /></span>
      </div>
      <div className="clinician-list">
        {clinicians.map(({ therapist, count }, index) => {
          const name = locale === "ar" ? therapist.nameAr : therapist.nameEn;
          return (
            <div className="clinician-row" key={therapist.id}>
              <span className={cn("clinician-avatar", `clinician-avatar-${index + 1}`)}>{getInitials(name)}</span>
              <span className="clinician-copy">
                <strong>{name}</strong>
                <small>{locale === "ar" ? therapist.specialtyAr : therapist.specialtyEn}</small>
              </span>
              <span className="clinician-count"><strong>{formatNumber(count, locale)}</strong><small>{t.scheduledToday}</small></span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function DayStat({
  label,
  value,
  tone,
  locale,
}: {
  label: string;
  value: number;
  tone: "teal" | "blue" | "lime";
  locale: Locale;
}) {
  return (
    <div className={`appointment-day-stat appointment-day-stat-${tone}`}>
      <strong>{formatNumber(value, locale)}</strong>
      <small>{label}</small>
    </div>
  );
}

function parseDate(value: string): Date {
  return new Date(`${value.slice(0, 10)}T12:00:00.000Z`);
}

function getMonthCells(value: string): Array<string | null> {
  const month = parseDate(value);
  const firstDayOffset = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1, 12)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0, 12)).getUTCDate();
  const totalCells = Math.ceil((firstDayOffset + daysInMonth) / 7) * 7;
  return Array.from({ length: totalCells }, (_, index) => {
    const day = index - firstDayOffset + 1;
    if (day < 1 || day > daysInMonth) return null;
    return new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), day, 12)).toISOString().slice(0, 10);
  });
}

function getWeekdayLabels(locale: Locale): string[] {
  const formatter = new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", { weekday: "short" });
  return Array.from({ length: 7 }, (_, index) => formatter.format(new Date(Date.UTC(2023, 0, index + 1, 12))));
}
