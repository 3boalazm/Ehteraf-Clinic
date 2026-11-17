"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldPath } from "react-hook-form";
import { Check, Clock3, MapPin, UserRound, CalendarDays, CalendarPlus, Stethoscope, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { SelectField } from "@/components/ui/select-field";
import { PageHeading } from "@/components/shared/page-heading";
import { AccessDeniedNotice } from "@/components/modules/access-denied-notice";
import { useClinicData } from "@/services/clinic-data-provider";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { ROLE_BRANCH_SCOPE, canBookAppointments } from "@/lib/config/roles";
import { CLINIC_SERVICES, CLINIC_THERAPISTS, DEMO_TODAY } from "@/lib/mock/clinic-seed";
import { messages } from "@/lib/i18n/messages";
import { formatClinicDate, getBranchName, getServiceName, getTherapistName } from "@/lib/clinic-utils";
import { formatCurrency } from "@/lib/utils";
import { appointmentSchema, type AppointmentFormValues } from "@/features/appointments/schemas/appointment.schema";
import type { BranchId, NewAppointmentInput } from "@/types";
import { cn } from "@/lib/utils";

const TIME_SLOTS = ["08:00", "08:45", "09:30", "10:15", "11:00", "11:45", "13:00", "13:45", "14:30", "15:15"];

export function BookingForm({ appointmentId }: { appointmentId?: string }) {
  const router = useRouter();
  const { locale, role, branchId } = useWorkspace();
  const { patients, appointments, hydrated, createAppointment, updateAppointment } = useClinicData();
  const assignedBranch = ROLE_BRANCH_SCOPE[role];
  const appointment = appointmentId
    ? appointments.find((item) => item.id === appointmentId && (!assignedBranch || item.branchId === assignedBranch))
    : undefined;
  const isReschedule = Boolean(appointmentId);
  const t = messages[locale].clinic.booking;
  const common = messages[locale].clinic.common as Record<string, string>;
  const [createdAppointment, setCreatedAppointment] = useState<string | null>(null);
  const BackIcon = locale === "ar" ? ArrowRight : ArrowLeft;

  const defaults = useMemo<AppointmentFormValues>(() => ({
    patientId: appointment?.patientId ?? "",
    branchId: assignedBranch ?? appointment?.branchId ?? (branchId === "all" ? "ghadeer" : branchId),
    serviceId: appointment?.serviceId ?? "",
    therapistId: appointment?.therapistId ?? "",
    date: appointment?.date ?? DEMO_TODAY,
    time: appointment?.time ?? "",
    visitType: appointment?.visitType ?? "clinic",
  }), [appointment, assignedBranch, branchId]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: defaults,
  });

  const selectedPatientId = watch("patientId");
  const selectedBranch = watch("branchId");
  const selectedServiceId = watch("serviceId");
  const selectedTherapistId = watch("therapistId");
  const selectedDate = watch("date");
  const selectedTime = watch("time");
  const patient = patients.find((item) => item.id === selectedPatientId);
  const service = CLINIC_SERVICES.find((item) => item.id === selectedServiceId);
  const therapist = CLINIC_THERAPISTS.find((item) => item.id === selectedTherapistId);
  const branchTherapists = useMemo(
    () => CLINIC_THERAPISTS.filter((item) => item.branchId === selectedBranch),
    [selectedBranch],
  );
  const slots = TIME_SLOTS.map((time) => {
    const conflict = appointments.some((appointment) =>
      appointment.id !== appointmentId &&
      appointment.date === selectedDate &&
      appointment.time === time &&
      appointment.therapistId === selectedTherapistId &&
      !["cancelled", "noShow"].includes(appointment.status),
    );
    return { time, conflict };
  });

  useEffect(() => {
    if (appointmentId) return;
    const params = new URLSearchParams(window.location.search);
    const patientId = params.get("patientId");
    const date = params.get("date");
      if (patientId && patients.some((item) => item.id === patientId && item.status === "active")) {
        setValue("patientId", patientId);
      }
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setValue("date", date);
    }
  }, [appointmentId, patients, setValue]);

  useEffect(() => {
    if (appointment) reset(defaults);
  }, [appointment, defaults, reset]);

  useEffect(() => {
    if (!appointmentId && patient && !assignedBranch) {
      setValue("branchId", patient.branchId);
    }
  }, [appointmentId, assignedBranch, patient, setValue]);

  useEffect(() => {
    if (!branchTherapists.some((item) => item.id === selectedTherapistId)) {
      setValue("therapistId", "");
      setValue("time", "");
    }
  }, [branchTherapists, selectedTherapistId, setValue]);

  if (!canBookAppointments(role)) {
    return <AccessDeniedNotice title={t.title} />;
  }

  function errorFor(field: FieldPath<AppointmentFormValues>) {
    const message = errors[field]?.message;
    return typeof message === "string" ? common[message] ?? t.slotUnavailable : undefined;
  }

  function onSubmit(values: AppointmentFormValues) {
    const conflict = appointments.some((appointment) =>
      appointment.id !== appointmentId &&
      appointment.date === values.date &&
      appointment.time === values.time &&
      appointment.therapistId === values.therapistId &&
      !["cancelled", "noShow"].includes(appointment.status),
    );
    if (conflict) {
      setError("time", { type: "manual", message: "slotUnavailable" });
      return;
    }

    const input: NewAppointmentInput = {
      patientId: values.patientId,
      branchId: assignedBranch ?? values.branchId,
      serviceId: values.serviceId,
      therapistId: values.therapistId,
      date: values.date,
      time: values.time,
      visitType: values.visitType,
    };
    if (appointmentId) {
      updateAppointment(appointmentId, input);
      setCreatedAppointment(appointmentId);
    } else {
      const created = createAppointment(input);
      setCreatedAppointment(created.id);
    }
  }

  if (appointmentId && !appointment && !hydrated) {
    return <div className="feature-page"><div className="page-loading">{messages[locale].clinic.common.loading}</div></div>;
  }

  if (appointmentId && !appointment && hydrated) {
    return <div className="feature-page"><PageHeading title={messages[locale].clinic.common.noData} /><Button variant="outline" onClick={() => router.push(`/${locale}/appointments`)}>{messages[locale].clinic.appointments.title}</Button></div>;
  }

  if (createdAppointment) {
    const successTitle = isReschedule ? t.updatedSuccessTitle : t.successTitle;
    const successDescription = isReschedule ? t.updatedSuccessDescription : t.successDescription;
    return (
      <div className="feature-page">
        <PageHeading eyebrow={messages[locale].nav.appointments} title={successTitle} description={successDescription} />
        <Panel className="booking-success-panel">
          <span className="booking-success-icon"><Check size={24} /></span>
          <div className="booking-success-copy">
            <h2>{successTitle}</h2>
            <p>{successDescription}</p>
            <span className="booking-created-id" dir="ltr">{createdAppointment}</span>
          </div>
          <div className="booking-success-actions">
            <Button onClick={() => router.push(`/${locale}/appointments`)}>{t.viewAppointments}</Button>
            <Button variant="outline" onClick={() => router.push(`/${locale}/calendar?date=${encodeURIComponent(selectedDate)}`)}>{t.viewCalendar}</Button>
            {!isReschedule ? <Button variant="ghost" onClick={() => { setCreatedAppointment(null); reset(defaults); }}>{t.title}</Button> : null}
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="feature-page feature-form-page">
      <button className="back-link" type="button" onClick={() => router.push(`/${locale}/appointments`)}>
        <BackIcon size={15} />
        {messages[locale].clinic.appointments.title}
      </button>
      <PageHeading
        eyebrow={messages[locale].nav.appointments}
        title={isReschedule ? t.rescheduleTitle : t.title}
        description={isReschedule ? t.rescheduleSubtitle : t.subtitle}
      />

      <form className="booking-layout" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="booking-form-column">
          <Panel className="form-panel">
            <div className="form-section-heading">
              <span className="form-section-number">01</span>
              <div><h2>{t.patientSection}</h2><p>{locale === "ar" ? "اربط الموعد بملف مريض موجود." : "Link the appointment to an existing patient profile."}</p></div>
            </div>
            <div className="form-grid">
              <div className="form-field form-field-wide">
                <SelectField label={`${t.patient} *`} aria-invalid={Boolean(errors.patientId)} {...register("patientId")}>
                  <option value="">{t.selectPatient}</option>
                  {patients
                    .filter((item) => (item.status === "active" || (isReschedule && item.id === selectedPatientId)) && (!assignedBranch || item.branchId === assignedBranch))
                    .map((item) => (
                      <option key={item.id} value={item.id}>{locale === "ar" ? item.nameAr : item.nameEn} · {item.id}</option>
                    ))}
                </SelectField>
                {errorFor("patientId") ? <span className="form-error">{errorFor("patientId")}</span> : null}
                {!patients.length ? <span className="form-hint form-hint-warning">{t.noPatients}</span> : null}
              </div>
            </div>
          </Panel>

          <Panel className="form-panel">
            <div className="form-section-heading">
              <span className="form-section-number">02</span>
              <div><h2>{t.scheduleSection}</h2><p>{t.noShowNote}</p></div>
            </div>
            <div className="form-grid">
              <div className="form-field">
                <SelectField
                  label={`${t.branch} *`}
                  disabled={Boolean(assignedBranch)}
                  aria-invalid={Boolean(errors.branchId)}
                  {...register("branchId", { onChange: () => { setValue("therapistId", ""); setValue("time", ""); } })}
                >
                  {assignedBranch ? null : <option value="">{t.selectBranch}</option>}
                  {CLINIC_THERAPISTS.reduce<string[]>((branches, item) => {
                    if (!branches.includes(item.branchId)) branches.push(item.branchId);
                    return branches;
                  }, []).map((id) => (
                    <option key={id} value={id}>{getBranchName(id as BranchId, locale)}</option>
                  ))}
                </SelectField>
                {errorFor("branchId") ? <span className="form-error">{errorFor("branchId")}</span> : null}
              </div>

              <div className="form-field">
                <SelectField label={`${t.service} *`} aria-invalid={Boolean(errors.serviceId)} {...register("serviceId")}>
                  <option value="">{t.selectService}</option>
                  {CLINIC_SERVICES.map((item) => <option key={item.id} value={item.id}>{locale === "ar" ? item.nameAr : item.nameEn}</option>)}
                </SelectField>
                {errorFor("serviceId") ? <span className="form-error">{errorFor("serviceId")}</span> : null}
              </div>

              <div className="form-field">
                <SelectField label={`${t.therapist} *`} aria-invalid={Boolean(errors.therapistId)} {...register("therapistId", { onChange: () => { setValue("time", ""); } })}>
                  <option value="">{t.selectTherapist}</option>
                  {branchTherapists.map((item) => <option key={item.id} value={item.id}>{locale === "ar" ? item.nameAr : item.nameEn}</option>)}
                </SelectField>
                {errorFor("therapistId") ? <span className="form-error">{errorFor("therapistId")}</span> : null}
                {!branchTherapists.length ? <span className="form-hint form-hint-warning">{t.noTherapists}</span> : null}
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="appointment-date">{t.date} *</label>
                <input id="appointment-date" className={cn("form-input", errors.date && "form-input-error")} type="date" min={DEMO_TODAY} aria-invalid={Boolean(errors.date)} {...register("date")} />
                {errorFor("date") ? <span className="form-error">{errorFor("date")}</span> : null}
              </div>

              <div className="form-field">
                <SelectField label={`${t.time} *`} aria-invalid={Boolean(errors.time)} disabled={!selectedTherapistId} {...register("time", { onChange: () => clearErrors("time") })}>
                  <option value="">{t.selectTime}</option>
                  {slots.map(({ time, conflict }) => (
                    <option key={time} value={time} disabled={conflict}>{time}{conflict ? ` · ${t.unavailable}` : ""}</option>
                  ))}
                </SelectField>
                {errorFor("time") ? <span className="form-error">{errorFor("time")}</span> : null}
                {selectedTherapistId ? <span className="form-hint">{t.conflict}</span> : null}
              </div>

              <div className="form-field">
                <SelectField label={`${t.visitType} *`} {...register("visitType")}>
                  <option value="clinic">{t.clinicVisit}</option>
                  <option value="home">{t.homeVisit}</option>
                </SelectField>
              </div>
            </div>
          </Panel>

          <div className="form-footer-note"><ShieldCheck size={16} /><span>{messages[locale].app.demoModeDescription}</span></div>
          <div className="form-actions">
            <Button type="submit" disabled={isSubmitting || !patients.length}><CalendarPlus size={16} />{isReschedule ? t.update : t.create}</Button>
            <Button type="button" variant="outline" onClick={() => router.push(`/${locale}/appointments`)}>{t.cancel}</Button>
          </div>
        </div>

        <aside className="booking-summary-column">
          <Panel className="booking-summary-card">
            <div className="booking-summary-heading"><span><CalendarDays size={17} /></span><h2>{t.summaryTitle}</h2></div>
            {patient && service ? (
              <>
                <div className="booking-summary-patient"><span className="summary-avatar">{patient.nameAr.slice(0, 1)}</span><div><strong>{locale === "ar" ? patient.nameAr : patient.nameEn}</strong><small>{patient.id}</small></div></div>
                <div className="booking-summary-lines">
                  <SummaryLine icon={<Stethoscope size={15} />} label={t.service} value={getServiceName(service.id, locale)} />
                  <SummaryLine icon={<MapPin size={15} />} label={t.branch} value={getBranchName(selectedBranch as BranchId, locale)} />
                  <SummaryLine icon={<UserRound size={15} />} label={t.therapist} value={therapist ? getTherapistName(therapist.id, locale) : t.selectTherapist} />
                  <SummaryLine icon={<CalendarDays size={15} />} label={t.date} value={formatClinicDate(selectedDate, locale)} />
                  <SummaryLine icon={<Clock3 size={15} />} label={t.time} value={selectedTime || t.selectTime} />
                </div>
                <div className="booking-summary-total"><span>{t.duration}</span><strong>{service.durationMinutes} {messages[locale].clinic.common.min}</strong></div>
                <div className="booking-summary-total booking-summary-price"><span>{t.price}</span><strong>{formatCurrency(service.price, locale)}</strong></div>
                <p className="booking-summary-note">{t.noShowNote}</p>
              </>
            ) : (
              <div className="booking-summary-empty"><span className="empty-state-icon"><CalendarDays size={22} /></span><p>{t.summaryEmpty}</p></div>
            )}
          </Panel>
        </aside>
      </form>
    </div>
  );
}

function SummaryLine({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="booking-summary-line"><span className="summary-line-icon">{icon}</span><span><small>{label}</small><strong>{value}</strong></span></div>;
}
