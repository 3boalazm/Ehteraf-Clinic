"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, CalendarPlus, ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { PageHeading } from "@/components/shared/page-heading";
import { ModuleGate } from "@/components/modules/module-gate";
import { useClinicData } from "@/services/clinic-data-provider";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { canBookAppointments } from "@/lib/config/roles";
import { messages } from "@/lib/i18n/messages";
import { DEMO_TODAY } from "@/lib/mock/clinic-seed";
import { formatClinicDate, formatClinicMonth, getBranchName, getServiceName, getTherapistName } from "@/lib/clinic-utils";
import { formatNumber } from "@/lib/utils";
import type { ClinicAppointment, Locale } from "@/types";
import { cn } from "@/lib/utils";

type CalendarView = "day" | "week" | "month";

export function CalendarPage() {
  const router = useRouter();
  const { locale, branchId, role } = useWorkspace();
  const { appointments, patients } = useClinicData();
  const [selectedDate, setSelectedDate] = useState(DEMO_TODAY);
  const [view, setView] = useState<CalendarView>("week");
  const t = messages[locale].clinic.calendar;
  const branchAppointments = useMemo(
    () => appointments.filter((appointment) => branchId === "all" || appointment.branchId === branchId),
    [appointments, branchId],
  );
  useEffect(() => {
    const queryDate = new URLSearchParams(window.location.search).get("date");
    if (queryDate && /^\d{4}-\d{2}-\d{2}$/.test(queryDate)) {
      setSelectedDate(queryDate);
    }
  }, []);

  const appointmentByDate = useMemo(() => {
    const grouped = new Map<string, ClinicAppointment[]>();
    for (const appointment of branchAppointments) {
      const current = grouped.get(appointment.date) ?? [];
      current.push(appointment);
      grouped.set(appointment.date, current);
    }
    for (const items of grouped.values()) {
      items.sort((left, right) => left.time.localeCompare(right.time));
    }
    return grouped;
  }, [branchAppointments]);

  const weekDates = getWeekDates(selectedDate);
  const monthDates = getMonthDates(selectedDate);
  const todaysAppointments = appointmentByDate.get(selectedDate) ?? [];
  const canCreate = canBookAppointments(role);

  function shiftSelection(direction: -1 | 1) {
    if (view === "month") {
      const date = toDate(selectedDate);
      const nextMonth = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + direction, 1, 12));
      const lastDay = new Date(Date.UTC(nextMonth.getUTCFullYear(), nextMonth.getUTCMonth() + 1, 0, 12)).getUTCDate();
      nextMonth.setUTCDate(Math.min(date.getUTCDate(), lastDay));
      setSelectedDate(nextMonth.toISOString().slice(0, 10));
    } else {
      const date = toDate(selectedDate);
      date.setUTCDate(date.getUTCDate() + direction * (view === "week" ? 7 : 1));
      setSelectedDate(date.toISOString().slice(0, 10));
    }
  }

  function bookAppointment(date = selectedDate) {
    const query = date ? `?date=${encodeURIComponent(date)}` : "";
    router.push(`/${locale}/appointments/new${query}`);
  }

  const viewLabels: Record<CalendarView, string> = { day: t.day, week: t.week, month: t.month };
  const dateHeading = view === "month"
    ? formatClinicMonth(selectedDate, locale)
    : view === "week"
      ? `${formatClinicDate(weekDates[0], locale, { day: "numeric", month: "short" })} – ${formatClinicDate(weekDates[6], locale, { day: "numeric", month: "short", year: "numeric" })}`
      : formatClinicDate(selectedDate, locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <ModuleGate module="appointments" path="calendar">
      <div className="feature-page calendar-page">
        <PageHeading
          eyebrow={messages[locale].nav.calendar}
          title={t.title}
          description={t.subtitle}
          actions={canCreate ? <Button onClick={() => bookAppointment()}><CalendarPlus size={16} />{t.newAppointment}</Button> : null}
        />

        <Panel className="calendar-toolbar">
          <div className="calendar-date-controls">
            <Button size="icon" variant="outline" aria-label={t.previous} onClick={() => shiftSelection(-1)}>
              {locale === "ar" ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
            </Button>
            <Button size="icon" variant="outline" aria-label={t.next} onClick={() => shiftSelection(1)}>
              {locale === "ar" ? <ChevronLeft size={17} /> : <ChevronRight size={17} />}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setSelectedDate(DEMO_TODAY)}>{t.today}</Button>
            <strong className="calendar-date-heading">{dateHeading}</strong>
            <span className="calendar-branch-label"><span className="toolbar-status-dot" />{getBranchName(branchId, locale)}</span>
          </div>
          <div className="calendar-view-switch" role="tablist" aria-label={t.title}>
            {(["day", "week", "month"] as CalendarView[]).map((option) => (
              <button key={option} type="button" role="tab" aria-selected={view === option} className={cn("calendar-view-button", view === option && "calendar-view-active")} onClick={() => setView(option)}>
                {viewLabels[option]}
              </button>
            ))}
          </div>
        </Panel>

        {view === "day" ? (
          <DayView
            date={selectedDate}
            appointments={todaysAppointments}
            patients={patients}
            locale={locale}
            onBook={() => bookAppointment(selectedDate)}
            canCreate={canCreate}
          />
        ) : null}
        {view === "week" ? (
          <WeekView
            dates={weekDates}
            appointmentsByDate={appointmentByDate}
            patients={patients}
            locale={locale}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onBook={bookAppointment}
            canCreate={canCreate}
            labels={t}
          />
        ) : null}
        {view === "month" ? (
          <MonthView
            dates={monthDates}
            appointmentsByDate={appointmentByDate}
            patients={patients}
            locale={locale}
            selectedDate={selectedDate}
            onSelectDate={(date) => { setSelectedDate(date); setView("day"); }}
            onBook={bookAppointment}
            canCreate={canCreate}
            labels={t}
          />
        ) : null}
      </div>
    </ModuleGate>
  );
}

function DayView({
  date,
  appointments,
  patients,
  locale,
  onBook,
  canCreate,
}: {
  date: string;
  appointments: ClinicAppointment[];
  patients: ReturnType<typeof useClinicData>["patients"];
  locale: Locale;
  onBook: () => void;
  canCreate: boolean;
}) {
  const t = messages[locale].clinic.calendar;
  return (
    <Panel className="calendar-day-panel">
      <div className="calendar-section-heading">
        <div><h2>{t.appointments}</h2><p>{formatNumber(appointments.length, locale)} {t.appointments} · {formatClinicDate(date, locale)}</p></div>
      </div>
      {appointments.length ? (
        <div className="day-agenda-list">
          {appointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} patients={patients} locale={locale} compact={false} />
          ))}
        </div>
      ) : (
        <div className="calendar-empty-state">
          <span className="empty-state-icon"><CalendarDays size={22} /></span>
          <strong>{t.noAppointments}</strong>
          {canCreate ? <Button size="sm" onClick={onBook}><CalendarPlus size={14} />{t.newAppointment}</Button> : null}
        </div>
      )}
    </Panel>
  );
}

function WeekView({
  dates,
  appointmentsByDate,
  patients,
  locale,
  selectedDate,
  onSelectDate,
  onBook,
  canCreate,
  labels,
}: {
  dates: string[];
  appointmentsByDate: Map<string, ClinicAppointment[]>;
  patients: ReturnType<typeof useClinicData>["patients"];
  locale: Locale;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onBook: (date: string) => void;
  canCreate: boolean;
  labels: (typeof messages)["ar"]["clinic"]["calendar"] | (typeof messages)["en"]["clinic"]["calendar"];
}) {
  return (
    <div className="week-calendar-grid">
      {dates.map((date, index) => {
        const items = appointmentsByDate.get(date) ?? [];
        const dateObject = toDate(date);
        const isSelected = date === selectedDate;
        return (
          <Panel className={cn("week-day-card", isSelected && "week-day-card-selected")} key={date}>
            <button className="week-day-header" type="button" onClick={() => onSelectDate(date)}>
              <span>{labels.daysShort[index]}</span>
              <strong>{formatNumber(dateObject.getUTCDate(), locale)}</strong>
            </button>
            <span className="week-day-count">{formatNumber(items.length, locale)} {labels.appointments}</span>
            <div className="week-day-appointments">
              {items.slice(0, 3).map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} patients={patients} locale={locale} compact />
              ))}
              {items.length > 3 ? <button className="more-appointments-button" type="button" onClick={() => onSelectDate(date)}>+{formatNumber(items.length - 3, locale)} {labels.more}</button> : null}
              {!items.length ? <span className="week-day-empty">—</span> : null}
            </div>
            {canCreate ? <button className="week-day-add" type="button" onClick={() => onBook(date)} aria-label={`${labels.newAppointment} ${formatClinicDate(date, locale)}`}><CalendarPlus size={13} />{labels.newAppointment}</button> : null}
          </Panel>
        );
      })}
    </div>
  );
}

function MonthView({
  dates,
  appointmentsByDate,
  patients,
  locale,
  selectedDate,
  onSelectDate,
  onBook,
  canCreate,
  labels,
}: {
  dates: Array<string | null>;
  appointmentsByDate: Map<string, ClinicAppointment[]>;
  patients: ReturnType<typeof useClinicData>["patients"];
  locale: Locale;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onBook: (date: string) => void;
  canCreate: boolean;
  labels: (typeof messages)["ar"]["clinic"]["calendar"] | (typeof messages)["en"]["clinic"]["calendar"];
}) {
  return (
    <Panel className="month-calendar-panel">
      <div className="month-weekday-row">
        {labels.daysShort.map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
      </div>
      <div className="month-date-grid">
        {dates.map((date, index) => {
          if (!date) return <div className="month-date-cell month-date-empty" key={`empty-${index}`} />;
          const items = appointmentsByDate.get(date) ?? [];
          const selectedMonth = selectedDate.slice(0, 7);
          const outsideMonth = date.slice(0, 7) !== selectedMonth;
          const isSelected = date === selectedDate;
          return (
            <div className={cn("month-date-cell", outsideMonth && "month-date-outside", isSelected && "month-date-selected")} key={date}>
              <button type="button" className="month-date-number" onClick={() => onSelectDate(date)}>{formatNumber(toDate(date).getUTCDate(), locale)}</button>
              <div className="month-date-events">
                {items.slice(0, 2).map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} patients={patients} locale={locale} compact />)}
                {items.length > 2 ? <button type="button" className="month-more-link" onClick={() => onSelectDate(date)}>+{formatNumber(items.length - 2, locale)}</button> : null}
              </div>
              {canCreate ? <button className="month-add-event" type="button" onClick={() => onBook(date)} aria-label={`${labels.newAppointment} ${formatClinicDate(date, locale)}`}><CalendarPlus size={12} /></button> : null}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function AppointmentCard({
  appointment,
  patients,
  locale,
  compact,
}: {
  appointment: ClinicAppointment;
  patients: ReturnType<typeof useClinicData>["patients"];
  locale: Locale;
  compact: boolean;
}) {
  const router = useRouter();
  const patient = patients.find((item) => item.id === appointment.patientId);
  const statusColor = appointment.status === "cancelled" || appointment.status === "noShow" ? "event-muted" : appointment.status === "completed" ? "event-done" : appointment.status === "inSession" ? "event-session" : "event-confirmed";
  const patientName = patient ? (locale === "ar" ? patient.nameAr : patient.nameEn || patient.nameAr) : "—";
  return (
    <button
      type="button"
      className={cn("calendar-event", statusColor, compact && "calendar-event-compact")}
      onClick={() => patient && router.push(`/${locale}/patients/${patient.id}`)}
      title={`${appointment.time} · ${patientName} · ${getServiceName(appointment.serviceId, locale)}`}
    >
      <span className="calendar-event-time"><Clock3 size={11} />{appointment.time}</span>
      <strong>{patientName}</strong>
      {!compact ? <small>{getServiceName(appointment.serviceId, locale)} · {getTherapistName(appointment.therapistId, locale)} · {getBranchName(appointment.branchId, locale)}</small> : null}
    </button>
  );
}

function toDate(value: string): Date {
  return new Date(`${value.slice(0, 10)}T12:00:00.000Z`);
}

function getWeekDates(value: string): string[] {
  const date = toDate(value);
  const day = date.getUTCDay();
  date.setUTCDate(date.getUTCDate() - day);
  return Array.from({ length: 7 }, (_, index) => {
    const current = new Date(date);
    current.setUTCDate(date.getUTCDate() + index);
    return current.toISOString().slice(0, 10);
  });
}

function getMonthDates(value: string): Array<string | null> {
  const date = toDate(value);
  const firstDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 12));
  const weekdayOffset = firstDay.getUTCDay();
  const daysInMonth = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 12)).getUTCDate();
  const cellCount = Math.ceil((weekdayOffset + daysInMonth) / 7) * 7;
  return Array.from({ length: cellCount }, (_, index) => {
    const dayNumber = index - weekdayOffset + 1;
    if (dayNumber < 1 || dayNumber > daysInMonth) return null;
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), dayNumber, 12)).toISOString().slice(0, 10);
  });
}
