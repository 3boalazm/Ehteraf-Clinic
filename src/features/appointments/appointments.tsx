"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  CalendarCheck2,
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  CalendarSearch,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Plus,
  X,
} from "lucide-react";
import {
  appointmentSchema,
  type AppointmentFormValues,
} from "@/features/appointments/schemas/appointment.schema";
import { STATUS_TONE, TIME_SLOTS } from "@/features/appointments/status";
import { getBranchName, getServiceName, getTherapistName } from "@/lib/clinic-utils";
import { canBookAppointments } from "@/lib/config/roles";
import { addDays, addMonths, formatDate, formatTime, monthGrid, toISODate, weekDates } from "@/lib/dates";
import { BRANCHES } from "@/lib/mock/branches";
import { CLINIC_SERVICES, CLINIC_THERAPISTS, DEMO_TODAY } from "@/lib/mock/clinic-seed";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useClinicData } from "@/services/clinic-data-provider";
import { useApp } from "@/shell/use-app";
import {
  Avatar,
  Badge,
  Bubble,
  Button,
  Card,
  CardHead,
  cx,
  Empty,
  Field,
  IconButton,
  Input,
  PageHead,
  SearchBox,
  Select,
  StatCard,
  Tabs,
  Toast,
} from "@/ui";
import { MiniCalendar } from "@/ui/charts";
import type { AppointmentStatus, ClinicAppointment } from "@/types";

const PAGE_SIZE = 10;
const STATUSES: AppointmentStatus[] = [
  "booked",
  "confirmed",
  "checkedIn",
  "inSession",
  "completed",
  "cancelled",
  "noShow",
];
const NEXT_STEP: Partial<Record<AppointmentStatus, { to: AppointmentStatus; key: "checkIn" | "startSession" | "complete" }>> = {
  booked: { to: "checkedIn", key: "checkIn" },
  confirmed: { to: "checkedIn", key: "checkIn" },
  checkedIn: { to: "inSession", key: "startSession" },
  inSession: { to: "completed", key: "complete" },
};
const CLOSED: AppointmentStatus[] = ["completed", "cancelled", "noShow"];

function useScopedAppointments() {
  const app = useApp();
  const data = useClinicData();
  const scoped = useMemo(
    () => data.appointments.filter((item) => app.branchId === "all" || item.branchId === app.branchId),
    [data.appointments, app.branchId],
  );
  const patientName = (id: string) => {
    const patient = data.patients.find((item) => item.id === id);
    return patient ? app.pick(patient.nameAr, patient.nameEn) : id;
  };
  return { ...data, scoped, patientName };
}

/* ==========================================================================
   List
   ========================================================================== */
export function AppointmentsList() {
  const app = useApp();
  const { t, locale } = app;
  const a = t.clinic.appointments;
  const labels = a as unknown as Record<AppointmentStatus, string>;
  const { scoped, patientName, updateAppointmentStatus } = useScopedAppointments();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | AppointmentStatus>("all");
  const [when, setWhen] = useState<"today" | "all">("today");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(false);
  const canBook = canBookAppointments(app.role);

  const filtered = useMemo(() => {
    const needle = (query || app.searchQuery).trim().toLocaleLowerCase();
    const rows = scoped.filter((item) => {
      if (status !== "all" && item.status !== status) return false;
      if (when === "today" && item.date !== DEMO_TODAY) return false;
      if (!needle) return true;
      return [
        patientName(item.patientId),
        getTherapistName(item.therapistId, locale),
        getServiceName(item.serviceId, locale),
        item.id,
      ]
        .join(" ")
        .toLocaleLowerCase()
        .includes(needle);
    });
    const key = (item: ClinicAppointment) => `${item.date}${item.time}`;
    const upcoming = rows.filter((item) => item.date >= DEMO_TODAY).sort((x, y) => key(x).localeCompare(key(y)));
    const past = rows.filter((item) => item.date < DEMO_TODAY).sort((x, y) => key(y).localeCompare(key(x)));
    return [...upcoming, ...past];
    // patientName is derived from provider data already covered by `scoped`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scoped, status, when, query, app.searchQuery, locale]);

  useEffect(() => setPage(1), [query, app.searchQuery, status, when, app.branchId]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(false), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const setStatusFor = (id: string, next: AppointmentStatus) => {
    updateAppointmentStatus(id, next);
    setToast(true);
  };

  return (
    <>
      <PageHead
        title={a.title}
        subtitle={a.subtitle}
        actions={
          <>
            <Button icon={<CalendarDays />} href={app.href("/calendar")}>
              {a.calendar}
            </Button>
            {canBook ? (
              <Button variant="ink" icon={<Plus />} href={app.href("/appointments/new")}>
                {a.newAppointment}
              </Button>
            ) : null}
          </>
        }
      />

      <div className="bento">
        <StatCard
          className="span-4"
          tone="sky"
          label={a.todayCount}
          value={formatNumber(scoped.filter((item) => item.date === DEMO_TODAY && item.status !== "cancelled").length, locale)}
          icon={<CalendarCheck2 />}
          hint={formatDate(DEMO_TODAY, locale, { weekday: "long", day: "numeric", month: "long" })}
        />
        <StatCard
          className="span-4"
          tone="lime"
          label={a.confirmedCount}
          value={formatNumber(scoped.filter((item) => item.status === "confirmed").length, locale)}
          icon={<CircleCheck />}
        />
        <StatCard className="span-4" label={a.total} value={formatNumber(scoped.length, locale)} icon={<CalendarDays />} />

        <Card className="span-12">
          <div className="toolbar">
            <SearchBox value={query} onChange={setQuery} placeholder={a.searchPlaceholder} />
            <Tabs
              filled
              value={when}
              onChange={setWhen}
              label={a.dateFilter}
              options={[
                { value: "today", label: a.today },
                { value: "all", label: a.allDates },
              ]}
            />
            <div className="toolbar__end">
              <Select
                className="select--sm"
                style={{ width: "auto" }}
                aria-label={a.status}
                value={status}
                onChange={(event) => setStatus(event.target.value as typeof status)}
              >
                <option value="all">{a.allStatuses}</option>
                {STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {labels[value]}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {rows.length === 0 ? (
            <Empty
              icon={<CalendarSearch />}
              title={scoped.length === 0 ? a.emptyTitle : a.noResults}
              description={scoped.length === 0 ? a.emptyDescription : undefined}
            />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>{a.patient}</th>
                    <th>{a.service}</th>
                    <th>{a.dateTime}</th>
                    <th>{a.branch}</th>
                    <th>{a.status}</th>
                    <th>
                      <span className="sr-only">{a.actions}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((item) => {
                    const name = patientName(item.patientId);
                    const step = NEXT_STEP[item.status];
                    const open = !CLOSED.includes(item.status);
                    return (
                      <tr key={item.id}>
                        <td>
                          <Link className="cell-main" href={app.href(`/patients/${item.patientId}`)} title={a.viewPatient}>
                            <Avatar name={name} />
                            <div>
                              <b>{name}</b>
                              <span>{getTherapistName(item.therapistId, locale)}</span>
                            </div>
                          </Link>
                        </td>
                        <td>
                          {getServiceName(item.serviceId, locale)}
                          <span className="sub">
                            {item.visitType === "home" ? a.visitHome : a.visitClinic} ·{" "}
                            {formatNumber(item.durationMinutes, locale)} {t.clinic.common.min}
                          </span>
                        </td>
                        <td>
                          <b style={{ fontWeight: 550 }}>{formatTime(item.time, locale)}</b>
                          <span className="sub">{formatDate(item.date, locale)}</span>
                        </td>
                        <td>{getBranchName(item.branchId, locale)}</td>
                        <td>
                          <Badge tone={STATUS_TONE[item.status]}>{labels[item.status]}</Badge>
                        </td>
                        <td>
                          {canBook && open ? (
                            <div className="cell-actions">
                              {step ? (
                                <Button
                                  size="sm"
                                  variant="ink"
                                  icon={<Check />}
                                  onClick={() => setStatusFor(item.id, step.to)}
                                >
                                  {a[step.key]}
                                </Button>
                              ) : null}
                              <IconButton
                                label={a.reschedule}
                                size="sm"
                                href={app.href(`/appointments/${item.id}/reschedule`)}
                              >
                                <CalendarClock />
                              </IconButton>
                              <IconButton
                                label={a.cancelAppointment}
                                size="sm"
                                onClick={() => {
                                  if (window.confirm(a.cancelConfirm)) setStatusFor(item.id, "cancelled");
                                }}
                              >
                                <X />
                              </IconButton>
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="pager">
            <span>
              {t.clinic.patients.showing} {formatNumber(rows.length, locale)} {t.clinic.patients.of}{" "}
              {formatNumber(filtered.length, locale)}
            </span>
            <div className="row">
              <IconButton
                label={t.clinic.common.previous}
                variant="soft"
                size="sm"
                disabled={current <= 1}
                onClick={() => setPage(current - 1)}
              >
                <ChevronLeft className="flip" />
              </IconButton>
              <span>
                {formatNumber(current, locale)} / {formatNumber(pages, locale)}
              </span>
              <IconButton
                label={t.clinic.common.next}
                variant="soft"
                size="sm"
                disabled={current >= pages}
                onClick={() => setPage(current + 1)}
              >
                <ChevronRight className="flip" />
              </IconButton>
            </div>
          </div>
        </Card>
      </div>
      {toast ? (
        <Toast>
          <CircleCheck size={16} /> {a.statusUpdated}
        </Toast>
      ) : null}
    </>
  );
}

/* ==========================================================================
   Booking / reschedule
   ========================================================================== */
export function AppointmentBooking({ appointmentId }: { appointmentId?: string }) {
  const app = useApp();
  const { t, locale } = app;
  const b = t.clinic.booking;
  const errorsCopy = t.clinic.common as unknown as Record<string, string>;
  const { patients, appointments, hydrated, createAppointment, updateAppointment } = useClinicData();
  const existing = appointmentId ? appointments.find((item) => item.id === appointmentId) : undefined;
  const [done, setDone] = useState(false);
  const scopedBranch = app.branchId === "all" ? undefined : app.branchId;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientId: "",
      branchId: scopedBranch,
      serviceId: "",
      therapistId: "",
      date: DEMO_TODAY,
      time: "",
      visitType: "clinic",
    },
  });

  useEffect(() => {
    if (!existing) return;
    reset({
      patientId: existing.patientId,
      branchId: existing.branchId,
      serviceId: existing.serviceId,
      therapistId: existing.therapistId,
      date: existing.date,
      time: existing.time,
      visitType: existing.visitType,
    });
    // Only re-seed the form when a different record is loaded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing?.id, hydrated]);

  const values = watch();
  const message = (key?: string) => (key ? errorsCopy[key] ?? key : undefined);
  const therapists = CLINIC_THERAPISTS.filter((item) => item.branchId === values.branchId);
  const service = CLINIC_SERVICES.find((item) => item.id === values.serviceId);
  const patient = patients.find((item) => item.id === values.patientId);
  const branchPatients = patients.filter((item) => item.status === "active" || item.id === values.patientId);
  const slots = [...new Set([...TIME_SLOTS, ...(existing ? [existing.time] : [])])].sort();

  const taken = (time: string) =>
    Boolean(values.therapistId) &&
    appointments.some(
      (item) =>
        item.id !== appointmentId &&
        item.therapistId === values.therapistId &&
        item.date === values.date &&
        item.time === time &&
        item.status !== "cancelled" &&
        item.status !== "noShow",
    );

  if (!canBookAppointments(app.role)) {
    return (
      <Card>
        <Empty icon={<CalendarSearch />} title={t.modules.accessDeniedTitle} description={t.modules.accessDenied} />
      </Card>
    );
  }
  if (appointmentId && hydrated && !existing) {
    return (
      <Card>
        <Empty
          icon={<CalendarSearch />}
          title={t.clinic.appointments.noResults}
          action={<Button href={app.href("/appointments")}>{b.viewAppointments}</Button>}
        />
      </Card>
    );
  }

  if (done) {
    return (
      <Card tone="lime">
        <Empty
          icon={<CircleCheck />}
          title={existing ? b.updatedSuccessTitle : b.successTitle}
          description={existing ? b.updatedSuccessDescription : b.successDescription}
          action={
            <div className="row row--wrap" style={{ justifyContent: "center", marginTop: 10 }}>
              <Button variant="ink" arrow href={app.href("/appointments")}>
                {b.viewAppointments}
              </Button>
              <Button href={app.href("/calendar")}>{b.viewCalendar}</Button>
            </div>
          }
        />
      </Card>
    );
  }

  const onSubmit = handleSubmit((form) => {
    if (taken(form.time)) {
      setError("time", { message: "slotUnavailable" });
      return;
    }
    if (existing) updateAppointment(existing.id, form);
    else createAppointment(form);
    setDone(true);
  });

  return (
    <>
      <PageHead
        eyebrow={
          <>
            <ArrowLeft className="flip" /> {t.clinic.appointments.title}
          </>
        }
        title={existing ? b.rescheduleTitle : b.title}
        subtitle={existing ? b.rescheduleSubtitle : b.subtitle}
      />
      <form className="bento" onSubmit={onSubmit} noValidate>
        <div className="span-8 stack" style={{ gap: 14 }}>
          <Card>
            <CardHead title={b.patientSection} />
            <div className="form-grid">
              <Field label={b.patient} error={message(errors.patientId?.message)}>
                <Select aria-invalid={Boolean(errors.patientId)} {...register("patientId")}>
                  <option value="">{b.selectPatient}</option>
                  {branchPatients.map((item) => (
                    <option key={item.id} value={item.id}>
                      {app.pick(item.nameAr, item.nameEn)} · {item.id}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={b.branch} error={message(errors.branchId?.message)}>
                <Select
                  aria-invalid={Boolean(errors.branchId)}
                  {...register("branchId", {
                    onChange: () => {
                      setValue("therapistId", "");
                      setValue("time", "");
                    },
                  })}
                >
                  <option value="">{b.selectBranch}</option>
                  {BRANCHES.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {app.pick(branch.nameAr, branch.nameEn)}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </Card>

          <Card>
            <CardHead title={b.scheduleSection} hint={b.noShowNote} />
            <div className="form-grid">
              <Field label={b.service} error={message(errors.serviceId?.message)}>
                <Select aria-invalid={Boolean(errors.serviceId)} {...register("serviceId")}>
                  <option value="">{b.selectService}</option>
                  {CLINIC_SERVICES.map((item) => (
                    <option key={item.id} value={item.id}>
                      {app.pick(item.nameAr, item.nameEn)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field
                label={b.therapist}
                error={
                  message(errors.therapistId?.message) ??
                  (values.branchId && therapists.length === 0 ? b.noTherapists : undefined)
                }
              >
                <Select
                  aria-invalid={Boolean(errors.therapistId)}
                  disabled={!values.branchId}
                  {...register("therapistId", { onChange: () => setValue("time", "") })}
                >
                  <option value="">{b.selectTherapist}</option>
                  {therapists.map((item) => (
                    <option key={item.id} value={item.id}>
                      {app.pick(item.nameAr, item.nameEn)} · {app.pick(item.specialtyAr, item.specialtyEn)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={b.date} error={message(errors.date?.message)}>
                <Input
                  type="date"
                  aria-invalid={Boolean(errors.date)}
                  {...register("date", { onChange: () => setValue("time", "") })}
                />
              </Field>
              <div className="field">
                <span className="field__label">{b.visitType}</span>
                <div className="choices">
                  {(["clinic", "home"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      className="choice"
                      aria-pressed={values.visitType === type}
                      onClick={() => setValue("visitType", type)}
                    >
                      {type === "clinic" ? b.clinicVisit : b.homeVisit}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field full">
                <span className="field__label">{b.time}</span>
                <div className="choices" role="group" aria-label={b.time}>
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      className="choice"
                      disabled={taken(slot)}
                      title={taken(slot) ? b.unavailable : b.available}
                      aria-pressed={values.time === slot}
                      onClick={() => {
                        setValue("time", slot);
                        clearErrors("time");
                      }}
                    >
                      {formatTime(slot, locale)}
                    </button>
                  ))}
                </div>
                {errors.time ? (
                  <span className="field__error" role="alert">
                    {errors.time.message === "slotUnavailable" ? b.slotUnavailable : message(errors.time.message)}
                  </span>
                ) : null}
              </div>
            </div>
          </Card>
        </div>

        <div className="span-4">
          <Card tone="ink" className="sticky-card">
            <Bubble tone="lime">
              <CalendarPlus />
            </Bubble>
            <h2 className="t-title">{b.summaryTitle}</h2>
            {patient && service ? (
              <dl className="dl" style={{ gridTemplateColumns: "1fr" }}>
                <div>
                  <dt>{b.patient}</dt>
                  <dd>{app.pick(patient.nameAr, patient.nameEn)}</dd>
                </div>
                <div>
                  <dt>{b.service}</dt>
                  <dd>{app.pick(service.nameAr, service.nameEn)}</dd>
                </div>
                <div>
                  <dt>{b.date}</dt>
                  <dd>
                    {formatDate(values.date, locale, { weekday: "short", day: "numeric", month: "long" })}
                    {values.time ? ` · ${formatTime(values.time, locale)}` : ""}
                  </dd>
                </div>
                <div>
                  <dt>{b.duration}</dt>
                  <dd>
                    {formatNumber(service.durationMinutes, locale)} {t.clinic.common.min}
                  </dd>
                </div>
                <div>
                  <dt>{b.price}</dt>
                  <dd className="num num--md">{formatCurrency(service.price, locale)}</dd>
                </div>
              </dl>
            ) : (
              <p className="t-label">{patients.length === 0 ? b.noPatients : b.summaryEmpty}</p>
            )}
            <div className="card__grow" style={{ minHeight: 12 }} />
            <Button variant="lime" arrow type="submit">
              {existing ? b.update : b.create}
            </Button>
            <Button variant="ghost" href={app.href("/appointments")}>
              {b.cancel}
            </Button>
          </Card>
        </div>
      </form>
    </>
  );
}

/* ==========================================================================
   Calendar
   ========================================================================== */
type CalendarView = "day" | "week" | "month";

export function AppointmentCalendar() {
  const app = useApp();
  const { t, locale } = app;
  const c = t.clinic.calendar;
  const labels = t.clinic.appointments as unknown as Record<AppointmentStatus, string>;
  const { scoped, patientName } = useScopedAppointments();
  const [view, setView] = useState<CalendarView>("month");
  const [selected, setSelected] = useState(DEMO_TODAY);
  const month = selected.slice(0, 7);

  const byDate = useMemo(() => {
    const map: Record<string, ClinicAppointment[]> = {};
    for (const item of scoped) {
      if (item.status === "cancelled") continue;
      (map[item.date] ??= []).push(item);
    }
    for (const list of Object.values(map)) list.sort((x, y) => x.time.localeCompare(y.time));
    return map;
  }, [scoped]);
  const counts = useMemo(
    () => Object.fromEntries(Object.entries(byDate).map(([date, list]) => [date, list.length])),
    [byDate],
  );

  const move = (direction: 1 | -1) => {
    if (view === "day") setSelected(addDays(selected, direction));
    else if (view === "week") setSelected(addDays(selected, 7 * direction));
    else setSelected(`${addMonths(month, direction)}-01`);
  };

  const heading =
    view === "day"
      ? formatDate(selected, locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      : view === "week"
        ? `${formatDate(weekDates(selected)[0], locale, { day: "numeric", month: "short" })} — ${formatDate(weekDates(selected)[6], locale, { day: "numeric", month: "short", year: "numeric" })}`
        : formatDate(`${month}-01`, locale, { month: "long", year: "numeric" });

  const cells = view === "week" ? weekDates(selected) : monthGrid(month).map(toISODate);
  const dayNumber = new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US");
  const dayList = byDate[selected] ?? [];
  const maxEvents = view === "week" ? 6 : 2;

  const dayItems = (items: ClinicAppointment[]) =>
    items.length === 0 ? (
      <Empty icon={<CalendarSearch />} title={c.noAppointments} />
    ) : (
      <div className="list">
        {items.map((item) => (
          <div key={item.id} className="list__row">
            <span className="list__time">{formatTime(item.time, locale)}</span>
            <div className="list__main">
              <b>{patientName(item.patientId)}</b>
              <span>
                {getServiceName(item.serviceId, locale)} · {getTherapistName(item.therapistId, locale)}
              </span>
            </div>
            <Badge tone={STATUS_TONE[item.status]}>{labels[item.status]}</Badge>
          </div>
        ))}
      </div>
    );

  return (
    <>
      <PageHead
        title={c.title}
        subtitle={c.subtitle}
        actions={
          <>
            <Button href={app.href("/appointments")}>{t.clinic.appointments.list}</Button>
            {canBookAppointments(app.role) ? (
              <Button variant="ink" icon={<Plus />} href={app.href("/appointments/new")}>
                {c.newAppointment}
              </Button>
            ) : null}
          </>
        }
      />

      <div className="bento">
        <Card className="span-8">
          <div className="toolbar">
            <IconButton label={c.previous} variant="soft" size="sm" onClick={() => move(-1)}>
              <ChevronLeft className="flip" />
            </IconButton>
            <IconButton label={c.next} variant="soft" size="sm" onClick={() => move(1)}>
              <ChevronRight className="flip" />
            </IconButton>
            <h2 className="t-title">{heading}</h2>
            <div className="toolbar__end">
              <Button size="sm" variant="soft" onClick={() => setSelected(DEMO_TODAY)}>
                {c.today}
              </Button>
              <Tabs
                filled
                value={view}
                onChange={setView}
                options={[
                  { value: "day", label: c.day },
                  { value: "week", label: c.week },
                  { value: "month", label: c.month },
                ]}
              />
            </div>
          </div>

          {view === "day" ? (
            dayItems(dayList)
          ) : (
            <div className="bigcal">
              {c.daysShort.map((day) => (
                <span key={day} className="bigcal__dow">
                  {day}
                </span>
              ))}
              {cells.map((date) => {
                const items = byDate[date] ?? [];
                return (
                  <button
                    key={date}
                    type="button"
                    className={cx(
                      "bigcal__cell",
                      view === "month" && date.slice(0, 7) !== month && "bigcal__cell--out",
                      date === DEMO_TODAY && "bigcal__cell--today",
                    )}
                    style={view === "week" ? { minHeight: 280 } : undefined}
                    aria-pressed={date === selected}
                    onClick={() => setSelected(date)}
                  >
                    <span className="row row--between">
                      <span className="bigcal__date">{dayNumber.format(Number(date.slice(8)))}</span>
                      {items.length > 0 ? (
                        <span className="t-small t-muted">{formatNumber(items.length, locale)}</span>
                      ) : null}
                    </span>
                    {items.slice(0, maxEvents).map((item) => (
                      <span key={item.id} className={`event event--${STATUS_TONE[item.status]}`}>
                        {formatTime(item.time, locale)}
                        {view === "week" ? ` · ${patientName(item.patientId)}` : ""}
                      </span>
                    ))}
                    {items.length > maxEvents ? (
                      <span className="event event--more">
                        +{formatNumber(items.length - maxEvents, locale)} {c.more}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        <div className="span-4 stack" style={{ gap: 14 }}>
          <Card>
            <MiniCalendar
              month={month}
              selected={selected}
              today={DEMO_TODAY}
              counts={counts}
              locale={locale}
              dayLabels={c.daysShort}
              onSelect={setSelected}
              onMonthChange={(next) => setSelected(`${next}-01`)}
              labels={{ previous: c.previous, next: c.next }}
            />
          </Card>
          {view !== "day" ? (
            <Card tone="sand">
              <CardHead
                title={formatDate(selected, locale, { weekday: "long", day: "numeric", month: "long" })}
                hint={`${formatNumber(dayList.length, locale)} ${c.appointments}`}
              />
              {dayItems(dayList.slice(0, 6))}
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}
