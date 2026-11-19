"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Search,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { Button } from "@/design-system/button";
import { Card } from "@/design-system/card";
import { Badge } from "@/design-system/badge";
import { FieldFrame, Select, TextInput } from "@/design-system/fields";
import { EmptyState, SectionHeading, StatBlock } from "@/design-system/blocks";
import { Tabs } from "@/design-system/tabs";
import { useClinicData } from "@/services/clinic-data-provider";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { ROLE_BRANCH_SCOPE, canBookAppointments } from "@/lib/config/roles";
import {
  CLINIC_SERVICES,
  CLINIC_THERAPISTS,
  DEMO_TODAY,
} from "@/lib/mock/clinic-seed";
import { messages } from "@/lib/i18n/messages";
import {
  appointmentSchema,
  type AppointmentFormValues,
} from "@/features/appointments/schemas/appointment.schema";
import type {
  AppointmentStatus,
  BranchId,
  ClinicAppointment,
  NewAppointmentInput,
} from "@/types";

const TIMES = [
  "08:00",
  "08:45",
  "09:30",
  "10:15",
  "11:00",
  "11:45",
  "13:00",
  "13:45",
  "14:30",
  "15:15",
];
const STATUSES: AppointmentStatus[] = [
  "booked",
  "confirmed",
  "checkedIn",
  "inSession",
  "completed",
  "cancelled",
  "noShow",
];
const STATUS_TONE: Record<
  AppointmentStatus,
  "neutral" | "teal" | "success" | "warning" | "danger"
> = {
  booked: "neutral",
  confirmed: "teal",
  checkedIn: "warning",
  inSession: "teal",
  completed: "success",
  cancelled: "danger",
  noShow: "danger",
};
const statusLabel = (
  t:
    | (typeof messages)["ar"]["clinic"]["appointments"]
    | (typeof messages)["en"]["clinic"]["appointments"],
  status: AppointmentStatus,
) => t[status];
const dateLabel = (
  value: string,
  locale: "ar" | "en",
  options?: Intl.DateTimeFormatOptions,
) =>
  new Intl.DateTimeFormat(
    locale === "ar" ? "ar-SA" : "en-GB",
    options ?? { day: "numeric", month: "short", year: "numeric" },
  ).format(new Date(`${value}T12:00:00`));
const branchLabel = (id: BranchId, locale: "ar" | "en") => {
  const labels = messages[locale].branches;
  return id === "all" ? labels.all : labels[id];
};
const serviceLabel = (id: string, locale: "ar" | "en") => {
  const item = CLINIC_SERVICES.find((service) => service.id === id);
  return item ? (locale === "ar" ? item.nameAr : item.nameEn) : "—";
};
const therapistLabel = (id: string, locale: "ar" | "en") => {
  const item = CLINIC_THERAPISTS.find((therapist) => therapist.id === id);
  return item ? (locale === "ar" ? item.nameAr : item.nameEn) : "—";
};
const branchOptions: Exclude<BranchId, "all">[] = [
  "ghadeer",
  "darAlbaida",
  "quwayiyah",
];

const minutesFromClock = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export function AppointmentListPage() {
  const { locale, branchId, role } = useWorkspace();
  const { patients, appointments, hydrated, updateAppointmentStatus } =
    useClinicData();
  const router = useRouter();
  const a = messages[locale].clinic.appointments;
  const common = messages[locale].clinic.common;
  const scope = ROLE_BRANCH_SCOPE[role];
  const canManage = canBookAppointments(role);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<AppointmentStatus | "all">("all");
  const [date, setDate] = useState("");
  const [notice, setNotice] = useState("");
  const list = useMemo(
    () =>
      appointments
        .filter(
          (item) =>
            ((!scope && branchId === "all") ||
              item.branchId === (scope ?? branchId)) &&
            (!status || status === "all" || item.status === status) &&
            (!date || item.date === date) &&
            (() => {
              const patient = patients.find(
                (person) => person.id === item.patientId,
              );
              const needle = query.trim().toLocaleLowerCase();
              return (
                !needle ||
                [
                  item.id,
                  patient?.id,
                  patient?.nameAr,
                  patient?.nameEn,
                  patient?.phone,
                  serviceLabel(item.serviceId, "ar"),
                  serviceLabel(item.serviceId, "en"),
                  therapistLabel(item.therapistId, "ar"),
                  therapistLabel(item.therapistId, "en"),
                ].some((value) => value?.toLocaleLowerCase().includes(needle))
              );
            })(),
        )
        .sort((x, y) =>
          `${x.date}${x.time}`.localeCompare(`${y.date}${y.time}`),
        ),
    [appointments, branchId, date, patients, query, scope, status],
  );
  const todayCount = list.filter((item) => item.date === DEMO_TODAY).length;
  const confirmedCount = list.filter((item) =>
    ["booked", "confirmed"].includes(item.status),
  ).length;
  function advance(item: ClinicAppointment, next: AppointmentStatus) {
    const allowed: Partial<Record<AppointmentStatus, AppointmentStatus[]>> = {
      booked: ["checkedIn", "cancelled"],
      confirmed: ["checkedIn", "cancelled"],
      checkedIn: ["inSession", "cancelled"],
      inSession: ["completed"],
    };
    if (!allowed[item.status]?.includes(next)) return;
    if (next === "cancelled" && !window.confirm(a.cancelConfirm)) return;
    updateAppointmentStatus(item.id, next);
    setNotice(a.statusUpdated);
  }
  return (
    <main
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8"
    >
      <SectionHeading
        eyebrow={messages[locale].nav.appointments}
        title={a.title}
        description={a.subtitle}
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/${locale}/calendar`)}
            >
              <CalendarDays size={16} />
              {a.calendar}
            </Button>
            {canManage && (
              <Button
                onClick={() => router.push(`/${locale}/appointments/new`)}
              >
                <CalendarPlus size={16} />
                {a.newAppointment}
              </Button>
            )}
          </div>
        }
      />
      {!hydrated ? (
        <Card className="p-8 text-center text-[var(--muted)]">
          {common.loading}
        </Card>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatBlock
              label={a.total}
              value={String(list.length)}
              icon={<CalendarDays size={17} />}
              tone="teal"
            />
            <StatBlock
              label={a.todayCount}
              value={String(todayCount)}
              icon={<Clock3 size={17} />}
              tone="brass"
            />
            <StatBlock
              label={a.confirmedCount}
              value={String(confirmedCount)}
              icon={<Check size={17} />}
              tone="ink"
            />
          </div>
          {notice && (
            <p
              className="rounded-xl border border-[var(--line)] bg-[var(--teal-soft)] p-3 text-sm"
              role="status"
            >
              {notice}
            </p>
          )}
          <Card className="space-y-4 p-4 sm:p-6">
            <div className="grid gap-3 md:grid-cols-[minmax(14rem,1fr)_repeat(2,minmax(10rem,14rem))]">
              <FieldFrame label={a.searchPlaceholder}>
                <span className="relative block">
                  <Search
                    aria-hidden
                    size={16}
                    className="absolute start-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                  />
                  <TextInput
                    className="ps-9"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={a.searchPlaceholder}
                  />
                </span>
              </FieldFrame>
              <FieldFrame label={a.status}>
                <Select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as AppointmentStatus | "all")
                  }
                >
                  <option value="all">{a.allStatuses}</option>
                  {STATUSES.map((value) => (
                    <option key={value} value={value}>
                      {statusLabel(a, value)}
                    </option>
                  ))}
                </Select>
              </FieldFrame>
              <FieldFrame label={a.dateFilter}>
                <TextInput
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </FieldFrame>
            </div>
            {list.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] border-collapse text-start text-sm">
                  <thead>
                    <tr className="border-b border-[var(--line)] text-xs uppercase tracking-wide text-[var(--muted)]">
                      {[
                        a.patient,
                        a.service,
                        a.therapist,
                        a.dateTime,
                        a.branch,
                        a.status,
                        a.actions,
                      ].map((label) => (
                        <th key={label} className="px-3 py-3 font-medium">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-[var(--line)] last:border-0"
                      >
                        <td className="px-3 py-4">
                          <strong>
                            {patients.find((p) => p.id === item.patientId)?.[
                              locale === "ar" ? "nameAr" : "nameEn"
                            ] ?? "—"}
                          </strong>
                          <small
                            className="block text-[var(--muted)]"
                            dir="ltr"
                          >
                            {item.patientId}
                          </small>
                        </td>
                        <td className="px-3 py-4">
                          {serviceLabel(item.serviceId, locale)}
                          <small className="block text-[var(--muted)]">
                            {item.durationMinutes} {common.min}
                          </small>
                        </td>
                        <td className="px-3 py-4">
                          {therapistLabel(item.therapistId, locale)}
                        </td>
                        <td className="px-3 py-4">
                          <strong>{dateLabel(item.date, locale)}</strong>
                          <small className="block" dir="ltr">
                            {item.time}
                          </small>
                        </td>
                        <td className="px-3 py-4">
                          {branchLabel(item.branchId, locale)}
                          <small className="block text-[var(--muted)]">
                            {item.visitType === "home"
                              ? a.visitHome
                              : a.visitClinic}
                          </small>
                        </td>
                        <td className="px-3 py-4">
                          <Badge tone={STATUS_TONE[item.status]}>
                            {statusLabel(a, item.status)}
                          </Badge>
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex min-w-36 flex-col items-start gap-1">
                            {(canManage && item.status === "booked") ||
                            (canManage && item.status === "confirmed") ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => advance(item, "checkedIn")}
                                >
                                  {a.checkIn}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    router.push(
                                      `/${locale}/appointments/${item.id}/reschedule`,
                                    )
                                  }
                                >
                                  {a.reschedule}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => advance(item, "cancelled")}
                                >
                                  {a.cancelAppointment}
                                </Button>
                              </>
                            ) : null}
                            {canManage && item.status === "checkedIn" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => advance(item, "inSession")}
                                >
                                  {a.startSession}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => advance(item, "cancelled")}
                                >
                                  {a.cancelAppointment}
                                </Button>
                              </>
                            )}
                            {canManage && item.status === "inSession" && (
                              <Button
                                size="sm"
                                onClick={() => advance(item, "completed")}
                              >
                                {a.complete}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title={appointments.length ? a.noResults : a.emptyTitle}
                description={
                  appointments.length ? a.noResults : a.emptyDescription
                }
                action={
                  canManage && !appointments.length ? (
                    <Link href={`/${locale}/appointments/new`}>
                      {a.newAppointment}
                    </Link>
                  ) : undefined
                }
              />
            )}
          </Card>
        </>
      )}
    </main>
  );
}

export function AppointmentBookingPage({
  appointmentId,
}: {
  appointmentId?: string;
}) {
  const { locale, branchId, role } = useWorkspace();
  const {
    patients,
    appointments,
    hydrated,
    createAppointment,
    updateAppointment,
  } = useClinicData();
  const router = useRouter();
  const b = messages[locale].clinic.booking;
  const a = messages[locale].clinic.appointments;
  const common = messages[locale].clinic.common;
  const assigned = ROLE_BRANCH_SCOPE[role];
  const current = appointmentId
    ? appointments.find(
        (item) =>
          item.id === appointmentId &&
          (!assigned || item.branchId === assigned),
      )
    : undefined;
  const reschedule = Boolean(appointmentId);
  const [values, setValues] = useState<AppointmentFormValues>({
    patientId: current?.patientId ?? "",
    branchId:
      assigned ??
      current?.branchId ??
      (branchId === "all" ? "ghadeer" : branchId),
    serviceId: current?.serviceId ?? "",
    therapistId: current?.therapistId ?? "",
    date: current?.date ?? DEMO_TODAY,
    time: current?.time ?? "",
    visitType: current?.visitType ?? "clinic",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof AppointmentFormValues, string>>
  >({});
  const [saved, setSaved] = useState("");
  useEffect(() => {
    if (appointmentId && current) {
      setValues({
        patientId: current.patientId,
        branchId: current.branchId,
        serviceId: current.serviceId,
        therapistId: current.therapistId,
        date: current.date,
        time: current.time,
        visitType: current.visitType,
      });
      return;
    }
    if (!appointmentId) {
      const params = new URLSearchParams(window.location.search);
      const dateParam = params.get("date");
      const patientParam = params.get("patientId");
      setValues((old) => ({
        ...old,
        ...(dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
          ? { date: dateParam }
          : {}),
        ...(patientParam &&
        patients.some(
          (patient) =>
            patient.id === patientParam && patient.status === "active",
        )
          ? { patientId: patientParam }
          : {}),
      }));
    }
  }, [appointmentId, current, patients]);
  const set = <K extends keyof AppointmentFormValues>(
    key: K,
    value: AppointmentFormValues[K],
  ) => setValues((old) => ({ ...old, [key]: value }));
  const activePatients = patients.filter(
    (patient) =>
      (patient.status === "active" || patient.id === values.patientId) &&
      (!assigned || patient.branchId === assigned),
  );
  const therapists = CLINIC_THERAPISTS.filter(
    (item) => item.branchId === values.branchId,
  );
  const service = CLINIC_SERVICES.find((item) => item.id === values.serviceId);
  const conflicts = (time: string) => {
    const candidateStart = minutesFromClock(time);
    const candidateEnd = candidateStart + (service?.durationMinutes ?? 45);

    return appointments.some((item) => {
      if (
        item.id === appointmentId ||
        item.date !== values.date ||
        item.therapistId !== values.therapistId ||
        ["cancelled", "noShow"].includes(item.status)
      ) {
        return false;
      }

      const existingStart = minutesFromClock(item.time);
      const existingService = CLINIC_SERVICES.find(
        (clinicService) => clinicService.id === item.serviceId,
      );
      const existingEnd =
        existingStart +
        (item.durationMinutes ?? existingService?.durationMinutes ?? 45);

      return candidateStart < existingEnd && existingStart < candidateEnd;
    });
  };
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = appointmentSchema.safeParse(values);
    const next: Partial<Record<keyof AppointmentFormValues, string>> = {};
    if (!parsed.success)
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof AppointmentFormValues;
        next[key] = issue.message;
      }
    if (parsed.success && conflicts(values.time)) next.time = "slotUnavailable";
    setErrors(next);
    if (Object.keys(next).length) return;
    const input: NewAppointmentInput = {
      ...values,
      branchId: assigned ?? values.branchId,
    };
    const result = appointmentId
      ? (updateAppointment(appointmentId, input), appointmentId)
      : createAppointment(input).id;
    setSaved(result);
  }
  const msg = (key: string) =>
    key === "dateInvalid"
      ? common.dateInvalid
      : key === "slotUnavailable"
        ? b.slotUnavailable
        : common.required;
  if (!hydrated)
    return (
      <main
        dir={locale === "ar" ? "rtl" : "ltr"}
        className="mx-auto max-w-5xl p-6"
      >
        <Card className="p-8 text-center">{common.loading}</Card>
      </main>
    );
  if (appointmentId && !current)
    return (
      <main
        dir={locale === "ar" ? "rtl" : "ltr"}
        className="mx-auto max-w-5xl space-y-5 p-6"
      >
        <SectionHeading title={common.noData} />
        <Button
          variant="outline"
          onClick={() => router.push(`/${locale}/appointments`)}
        >
          {a.title}
        </Button>
      </main>
    );
  if (saved)
    return (
      <main
        dir={locale === "ar" ? "rtl" : "ltr"}
        className="mx-auto max-w-4xl space-y-6 p-6"
      >
        <SectionHeading
          eyebrow={messages[locale].nav.appointments}
          title={reschedule ? b.updatedSuccessTitle : b.successTitle}
          description={
            reschedule ? b.updatedSuccessDescription : b.successDescription
          }
        />
        <Card className="space-y-4 p-6">
          <Badge tone="success">{saved}</Badge>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => router.push(`/${locale}/appointments`)}>
              {b.viewAppointments}
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `/${locale}/calendar?date=${encodeURIComponent(values.date)}`,
                )
              }
            >
              {b.viewCalendar}
            </Button>
          </div>
        </Card>
      </main>
    );
  if (!canBookAppointments(role))
    return (
      <main
        dir={locale === "ar" ? "rtl" : "ltr"}
        className="mx-auto max-w-4xl p-6"
      >
        <Card className="p-6">{messages[locale].modules.accessDenied}</Card>
      </main>
    );
  const input = (
    key: keyof AppointmentFormValues,
    label: string,
    children: React.ReactNode,
    hint?: string,
  ) => (
    <FieldFrame
      label={label}
      required
      error={errors[key] ? msg(errors[key]!) : undefined}
      hint={hint}
    >
      {children}
    </FieldFrame>
  );
  return (
    <main
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6"
    >
      <Link
        className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--ink)]"
        href={`/${locale}/appointments`}
      >
        {locale === "ar" ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
        {a.title}
      </Link>
      <SectionHeading
        eyebrow={messages[locale].nav.appointments}
        title={reschedule ? b.rescheduleTitle : b.title}
        description={reschedule ? b.rescheduleSubtitle : b.subtitle}
      />
      <form
        onSubmit={submit}
        noValidate
        className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(16rem,.8fr)]"
      >
        <div className="space-y-5">
          <Card className="space-y-5 p-5 sm:p-7">
            <SectionHeading eyebrow="01" title={b.patientSection} />
            <div className="grid gap-4 sm:grid-cols-2">
              {input(
                "patientId",
                b.patient,
                <Select
                  value={values.patientId}
                  onChange={(e) => set("patientId", e.target.value)}
                >
                  <option value="">{b.selectPatient}</option>
                  {activePatients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {locale === "ar" ? p.nameAr : p.nameEn} · {p.id}
                    </option>
                  ))}
                </Select>,
                activePatients.length ? undefined : b.noPatients,
              )}
            </div>
          </Card>
          <Card className="space-y-5 p-5 sm:p-7">
            <SectionHeading
              eyebrow="02"
              title={b.scheduleSection}
              description={b.noShowNote}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {input(
                "branchId",
                b.branch,
                <Select
                  value={values.branchId}
                  disabled={Boolean(assigned)}
                  onChange={(e) => {
                    set(
                      "branchId",
                      e.target.value as AppointmentFormValues["branchId"],
                    );
                    set("therapistId", "");
                    set("time", "");
                  }}
                >
                  {branchOptions.map((id) => (
                    <option key={id} value={id}>
                      {branchLabel(id, locale)}
                    </option>
                  ))}
                </Select>,
              )}
              {input(
                "serviceId",
                b.service,
                <Select
                  value={values.serviceId}
                  onChange={(e) => set("serviceId", e.target.value)}
                >
                  <option value="">{b.selectService}</option>
                  {CLINIC_SERVICES.map((item) => (
                    <option key={item.id} value={item.id}>
                      {locale === "ar" ? item.nameAr : item.nameEn}
                    </option>
                  ))}
                </Select>,
              )}
              {input(
                "therapistId",
                b.therapist,
                <Select
                  value={values.therapistId}
                  onChange={(e) => {
                    set("therapistId", e.target.value);
                    set("time", "");
                  }}
                >
                  <option value="">{b.selectTherapist}</option>
                  {therapists.map((item) => (
                    <option key={item.id} value={item.id}>
                      {locale === "ar" ? item.nameAr : item.nameEn}
                    </option>
                  ))}
                </Select>,
                therapists.length ? undefined : b.noTherapists,
              )}
              {input(
                "date",
                b.date,
                <TextInput
                  type="date"
                  value={values.date}
                  onChange={(e) => set("date", e.target.value)}
                />,
              )}
              {input(
                "time",
                b.time,
                <Select
                  disabled={!values.therapistId}
                  value={values.time}
                  onChange={(e) => set("time", e.target.value)}
                >
                  <option value="">{b.selectTime}</option>
                  {TIMES.map((time) => (
                    <option key={time} value={time} disabled={conflicts(time)}>
                      {time}
                      {conflicts(time) ? ` · ${b.unavailable}` : ""}
                    </option>
                  ))}
                </Select>,
                values.therapistId ? b.conflict : undefined,
              )}
              {input(
                "visitType",
                b.visitType,
                <Select
                  value={values.visitType}
                  onChange={(e) =>
                    set("visitType", e.target.value as "clinic" | "home")
                  }
                >
                  <option value="clinic">{b.clinicVisit}</option>
                  <option value="home">{b.homeVisit}</option>
                </Select>,
              )}
            </div>
          </Card>
          <div className="flex flex-wrap gap-2">
            <Button type="submit">
              <CalendarPlus size={16} />
              {reschedule ? b.update : b.create}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/${locale}/appointments`)}
            >
              {b.cancel}
            </Button>
          </div>
        </div>
        <aside>
          <Card className="space-y-4 p-5 lg:sticky lg:top-6">
            <SectionHeading title={b.summaryTitle} />
            {values.patientId && service ? (
              <>
                <p className="flex items-center gap-2 font-medium">
                  <UserRound size={16} />
                  {
                    activePatients.find((p) => p.id === values.patientId)?.[
                      locale === "ar" ? "nameAr" : "nameEn"
                    ]
                  }
                </p>
                <p className="flex items-center gap-2 text-sm">
                  <Stethoscope size={16} />
                  {locale === "ar" ? service.nameAr : service.nameEn}
                </p>
                <p className="flex items-center gap-2 text-sm">
                  <CalendarDays size={16} />
                  {branchLabel(values.branchId, locale)} ·{" "}
                  {dateLabel(values.date, locale)} ·{" "}
                  <bdi dir="ltr">{values.time || b.selectTime}</bdi>
                </p>
                <p className="border-t border-[var(--line)] pt-3 text-sm">
                  {b.duration}: {service.durationMinutes} {common.min}
                </p>
              </>
            ) : (
              <p className="text-sm text-[var(--muted)]">{b.summaryEmpty}</p>
            )}
          </Card>
        </aside>
      </form>
    </main>
  );
}

export function AppointmentCalendarPage() {
  const { locale, branchId, role } = useWorkspace();
  const { appointments, patients, hydrated } = useClinicData();
  const router = useRouter();
  const t = messages[locale].clinic.calendar;
  const [date, setDate] = useState(DEMO_TODAY);
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const scope = ROLE_BRANCH_SCOPE[role];
  const scoped = appointments.filter(
    (item) =>
      (!scope && branchId === "all") || item.branchId === (scope ?? branchId),
  );
  const selected = new Date(`${date}T12:00:00Z`);
  const shift = (dir: -1 | 1) => {
    const d = new Date(selected);
    if (view === "month") d.setUTCMonth(d.getUTCMonth() + dir);
    else d.setUTCDate(d.getUTCDate() + dir * (view === "week" ? 7 : 1));
    setDate(d.toISOString().slice(0, 10));
  };
  const days =
    view === "day"
      ? [date]
      : view === "week"
        ? (() => {
            const d = new Date(selected);
            d.setUTCDate(d.getUTCDate() - d.getUTCDay());
            return Array.from({ length: 7 }, (_, i) => {
              const x = new Date(d);
              x.setUTCDate(d.getUTCDate() + i);
              return x.toISOString().slice(0, 10);
            });
          })()
        : (() => {
            const first = new Date(
              Date.UTC(
                selected.getUTCFullYear(),
                selected.getUTCMonth(),
                1,
                12,
              ),
            );
            const offset = first.getUTCDay();
            const count =
              Math.ceil(
                (offset +
                  new Date(
                    Date.UTC(
                      selected.getUTCFullYear(),
                      selected.getUTCMonth() + 1,
                      0,
                      12,
                    ),
                  ).getUTCDate()) /
                  7,
              ) * 7;
            return Array.from({ length: count }, (_, i) => {
              const n = i - offset + 1;
              return n < 1 ||
                n >
                  new Date(
                    Date.UTC(
                      selected.getUTCFullYear(),
                      selected.getUTCMonth() + 1,
                      0,
                      12,
                    ),
                  ).getUTCDate()
                ? ""
                : new Date(
                    Date.UTC(
                      selected.getUTCFullYear(),
                      selected.getUTCMonth(),
                      n,
                      12,
                    ),
                  )
                    .toISOString()
                    .slice(0, 10);
            });
          })();
  const monthHeading = new Intl.DateTimeFormat(
    locale === "ar" ? "ar-SA" : "en-GB",
    { month: "long", year: "numeric" },
  ).format(selected);
  const dateHeading =
    view === "month"
      ? monthHeading
      : view === "week"
        ? `${dateLabel(days[0], locale)} — ${dateLabel(days[6], locale)}`
        : dateLabel(date, locale, {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          });
  const canCreate = canBookAppointments(role);
  const book = (day: string) =>
    router.push(`/${locale}/appointments/new?date=${encodeURIComponent(day)}`);
  const dateNames = t.daysShort;
  const grouped = (day: string) =>
    scoped
      .filter((item) => item.date === day)
      .sort((x, y) => x.time.localeCompare(y.time));
  return (
    <main
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8"
    >
      <SectionHeading
        eyebrow={messages[locale].nav.calendar}
        title={t.title}
        description={t.subtitle}
        action={
          canCreate && (
            <Button onClick={() => book(date)}>
              <CalendarPlus size={16} />
              {t.newAppointment}
            </Button>
          )
        }
      />
      {!hydrated ? (
        <Card className="p-8 text-center">
          {messages[locale].clinic.common.loading}
        </Card>
      ) : (
        <>
          <Card className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                aria-label={t.previous}
                onClick={() => shift(-1)}
              >
                {locale === "ar" ? (
                  <ChevronRight size={16} />
                ) : (
                  <ChevronLeft size={16} />
                )}
              </Button>
              <Button
                size="icon"
                variant="outline"
                aria-label={t.next}
                onClick={() => shift(1)}
              >
                {locale === "ar" ? (
                  <ChevronLeft size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDate(DEMO_TODAY)}
              >
                {t.today}
              </Button>
              <strong className="px-2 text-lg">{dateHeading}</strong>
              <Badge tone="teal">
                {branchLabel(scope ?? branchId, locale)}
              </Badge>
            </div>
            <Tabs
              label={t.title}
              value={view}
              onChange={(value) => setView(value as "day" | "week" | "month")}
              items={[
                { id: "day", label: t.day },
                { id: "week", label: t.week },
                { id: "month", label: t.month },
              ]}
            />
          </Card>
          {view === "month" && (
            <div className="grid grid-cols-7 gap-2">
              {dateNames.map((name, i) => (
                <div
                  key={`${name}-${i}`}
                  className="p-2 text-center text-xs font-medium text-[var(--muted)]"
                >
                  {name}
                </div>
              ))}
              {days.map((day, i) =>
                day ? (
                  <Card
                    key={day}
                    className={`min-h-28 p-2 sm:min-h-36 ${day === date ? "ring-1 ring-[var(--teal)]" : ""}`}
                  >
                    <button
                      className="mb-2 font-semibold"
                      onClick={() => {
                        setDate(day);
                        setView("day");
                      }}
                    >
                      {new Date(`${day}T12:00:00Z`).getUTCDate()}
                    </button>
                    <div className="space-y-1">
                      {grouped(day)
                        .slice(0, 2)
                        .map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setDate(day)}
                            className="block w-full truncate rounded-md bg-[var(--teal-soft)] px-2 py-1 text-start text-xs"
                          >
                            <bdi dir="ltr">{item.time}</bdi> ·{" "}
                            {
                              patients.find((p) => p.id === item.patientId)?.[
                                locale === "ar" ? "nameAr" : "nameEn"
                              ]
                            }
                          </button>
                        ))}
                    </div>
                    {canCreate && (
                      <button
                        className="mt-2 text-xs text-[var(--teal-deep)]"
                        onClick={() => book(day)}
                      >
                        <CalendarPlus size={13} className="inline" />{" "}
                        {t.newAppointment}
                      </button>
                    )}
                  </Card>
                ) : (
                  <div key={`blank-${i}`} className="min-h-28" />
                ),
              )}
            </div>
          )}
          {view !== "month" && (
            <div
              className={
                view === "week"
                  ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
                  : "space-y-3"
              }
            >
              {days.map((day) => (
                <Card key={day} className="space-y-3 p-4">
                  <div className="flex items-center justify-between">
                    <button className="text-start" onClick={() => setDate(day)}>
                      <span className="block text-xs text-[var(--muted)]">
                        {view === "week"
                          ? dateNames[new Date(`${day}T12:00:00Z`).getUTCDay()]
                          : t.selectedDate}
                      </span>
                      <strong>
                        {dateLabel(day, locale, {
                          day: "numeric",
                          month: "short",
                          year: view === "day" ? "numeric" : undefined,
                        })}
                      </strong>
                    </button>
                    <Badge tone="neutral">
                      {grouped(day).length} {t.appointments}
                    </Badge>
                  </div>
                  {grouped(day).length ? (
                    grouped(day).map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-[var(--line)] border-s-[3px] border-s-[var(--teal)] p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <strong dir="ltr">{item.time}</strong>
                          <Badge tone={STATUS_TONE[item.status]}>
                            {statusLabel(
                              messages[locale].clinic.appointments,
                              item.status,
                            )}
                          </Badge>
                        </div>
                        <p className="mt-1 font-medium">
                          {patients.find((p) => p.id === item.patientId)?.[
                            locale === "ar" ? "nameAr" : "nameEn"
                          ] ?? "—"}
                        </p>
                        <p className="text-xs text-[var(--muted)]">
                          {serviceLabel(item.serviceId, locale)} ·{" "}
                          {therapistLabel(item.therapistId, locale)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="py-3 text-sm text-[var(--muted)]">
                      {t.noAppointmentsShort}
                    </p>
                  )}
                  {canCreate && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => book(day)}
                    >
                      <CalendarPlus size={14} />
                      {t.newAppointment}
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
