"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarPlus,
  ClipboardList,
  CreditCard,
  FileText,
  HeartPulse,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { PageHeading } from "@/components/shared/page-heading";
import { useClinicData } from "@/services/clinic-data-provider";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { ROLE_BRANCH_SCOPE, canBookAppointments, canManagePatients } from "@/lib/config/roles";
import { messages } from "@/lib/i18n/messages";
import { getBranchName, getInitials, getServiceName, getTherapistName, getPatientAge, formatClinicDate } from "@/lib/clinic-utils";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { ClinicAppointment } from "@/types";
import { cn } from "@/lib/utils";

type ProfileTab = "overview" | "medical" | "treatmentPlans" | "appointments" | "packages" | "financial" | "documents";

export function PatientProfile({ patientId }: { patientId: string }) {
  const router = useRouter();
  const { locale, role } = useWorkspace();
  const { patients, appointments, hydrated } = useClinicData();
  const scopedBranch = ROLE_BRANCH_SCOPE[role];
  const patient = patients.find(
    (item) => item.id === patientId && (!scopedBranch || item.branchId === scopedBranch),
  );
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
  const t = messages[locale].clinic.profile;
  const formT = messages[locale].clinic.patientForm;
  const appT = messages[locale].clinic.appointments;
  const tabs: Array<{ id: ProfileTab; label: string }> = [
    { id: "overview", label: t.overview },
    { id: "medical", label: t.medicalRecord },
    { id: "treatmentPlans", label: t.treatmentPlans },
    { id: "appointments", label: t.appointments },
    { id: "packages", label: t.packages },
    { id: "financial", label: t.financial },
    { id: "documents", label: t.documents },
  ];
  const patientAppointments = useMemo(
    () => appointments
      .filter((appointment) => appointment.patientId === patientId)
      .sort((left, right) => `${right.date}${right.time}`.localeCompare(`${left.date}${left.time}`)),
    [appointments, patientId],
  );

  if (!patient && !hydrated) {
    return <div className="feature-page"><div className="page-loading">{messages[locale].clinic.common.loading}</div></div>;
  }

  if (!patient) {
    return (
      <div className="feature-page">
        <PageHeading title={messages[locale].clinic.patientForm.notFound} />
        <Button variant="outline" onClick={() => router.push(`/${locale}/patients`)}>
          {t.back}
        </Button>
      </div>
    );
  }

  const displayName = locale === "ar" ? patient.nameAr : patient.nameEn || patient.nameAr;
  const diagnosis = locale === "ar" ? patient.diagnosisAr : patient.diagnosisEn || patient.diagnosisAr;
  const allergies = locale === "ar" ? patient.allergiesAr : patient.allergiesEn || patient.allergiesAr;
  const ArrowBack = locale === "ar" ? ArrowRight : ArrowLeft;
  const statusText = patient.status === "active" ? t.active : t.inactive;
  const financial = {
    invoiced: 1250 + patient.sessionsTotal * 250,
    collected: 900 + Math.max(0, patient.sessionsTotal - patient.sessionsRemaining) * 220,
  };
  const balance = Math.max(0, financial.invoiced - financial.collected);

  return (
    <div className="feature-page patient-profile-page">
      <button type="button" className="back-link" onClick={() => router.push(`/${locale}/patients`)}>
        <ArrowBack size={15} />
        {t.back}
      </button>

      <Panel className="patient-hero-card">
        <div className="patient-hero-main">
          <span className={cn("patient-hero-avatar", patient.gender === "female" ? "avatar-violet" : "avatar-teal")}>
            {getInitials(displayName)}
          </span>
          <div className="patient-hero-copy">
            <div className="patient-title-row">
              <h1>{displayName}</h1>
              <span className={cn("record-status", patient.status === "active" ? "record-status-active" : "record-status-inactive")}>
                <span />
                {statusText}
              </span>
            </div>
            <div className="patient-hero-meta">
              <span>{t.patientId}: <strong dir="ltr">{patient.id}</strong></span>
              <span className="meta-dot">·</span>
              <span>{getBranchName(patient.branchId, locale)}</span>
              <span className="meta-dot">·</span>
              <span>{formatNumber(getPatientAge(patient.dateOfBirth), locale)} {messages[locale].clinic.common.years}</span>
            </div>
          </div>
        </div>
        <div className="patient-hero-actions">
          {canManagePatients(role) ? (
            <Button variant="outline" onClick={() => router.push(`/${locale}/patients/${patient.id}/edit`)}>
              <UserRound size={16} />
              {t.edit}
            </Button>
          ) : null}
          {canBookAppointments(role) && patient.status === "active" ? (
            <Button onClick={() => router.push(`/${locale}/appointments/new?patientId=${encodeURIComponent(patient.id)}`)}>
              <CalendarPlus size={16} />
              {messages[locale].clinic.appointments.newAppointment}
            </Button>
          ) : null}
        </div>
      </Panel>

      <div className="profile-stat-grid">
        <ProfileStat icon={<UsersRound size={18} />} label={t.totalSessions} value={formatNumber(patient.sessionsTotal, locale)} tone="teal" />
        <ProfileStat icon={<CalendarPlus size={18} />} label={t.remainingSessions} value={formatNumber(patient.sessionsRemaining, locale)} tone="blue" />
        <ProfileStat icon={<ClipboardList size={18} />} label={t.treatmentEpisodes} value={formatNumber(patient.episodes.length, locale)} tone="violet" />
      </div>

      <div className="profile-tabs" role="tablist" aria-label={locale === "ar" ? "أقسام ملف المريض" : "Patient profile sections"}>
        {tabs.map((tab) => (
          <button
            className={cn("profile-tab", activeTab === tab.id && "profile-tab-active")}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" ? (
        <div className="profile-content-grid">
          <Panel className="profile-detail-panel">
            <PanelHeading icon={<UserRound size={17} />} title={t.contactDetails} />
            <div className="profile-info-grid">
              <InfoItem icon={<Phone size={15} />} label={t.phone} value={patient.phone} dir="ltr" />
              <InfoItem icon={<Mail size={15} />} label={t.email} value={patient.email || t.emptyValue} dir="ltr" />
              <InfoItem icon={<MapPin size={15} />} label={t.branch} value={getBranchName(patient.branchId, locale)} />
              <InfoItem icon={<UserRound size={15} />} label={t.gender} value={patient.gender === "female" ? formT.female : formT.male} />
              <InfoItem icon={<ClipboardList size={15} />} label={t.dateOfBirth} value={formatClinicDate(patient.dateOfBirth, locale)} />
              <InfoItem icon={<Phone size={15} />} label={t.emergencyContact} value={patient.emergencyContact || t.emptyValue} dir="ltr" />
            </div>
          </Panel>

          <Panel className="profile-detail-panel">
            <PanelHeading icon={<HeartPulse size={17} />} title={t.medicalOverview} />
            <div className="health-summary-block">
              <span className="health-summary-label">{t.diagnosis}</span>
              <strong>{diagnosis || t.emptyValue}</strong>
            </div>
            <div className="health-summary-block health-summary-allergy">
              <span className="health-summary-label">{t.allergies}</span>
              <strong>{allergies === "لا يوجد" || allergies === "None reported" ? t.noAllergies : allergies}</strong>
            </div>
            <div className="profile-disclaimer">
              <ShieldCheck size={15} />
              <span>{messages[locale].app.demoModeDescription}</span>
            </div>
          </Panel>

          <Panel className="profile-detail-panel profile-episodes-panel">
            <PanelHeading icon={<ClipboardList size={17} />} title={t.episodes} />
            <EpisodeList patient={patient} locale={locale} labels={t} />
          </Panel>
        </div>
      ) : null}

      {activeTab === "medical" ? (
        <div className="profile-content-grid">
          <Panel className="profile-detail-panel">
            <PanelHeading icon={<HeartPulse size={17} />} title={t.medicalOverview} />
            <div className="medical-record-callout">
              <span className="medical-record-icon"><HeartPulse size={19} /></span>
              <div>
                <strong>{diagnosis || t.emptyValue}</strong>
                <p>{locale === "ar" ? "ملخص تجريبي للملف الطبي. استكمل التقييم من مساحة العمل السريرية عند تفعيلها." : "Demo medical overview. Continue the assessment in Clinical Workspace when that module is enabled."}</p>
              </div>
            </div>
            <div className="profile-info-grid profile-info-grid-compact">
              <InfoItem icon={<UserRound size={15} />} label={t.gender} value={patient.gender === "female" ? formT.female : formT.male} />
              <InfoItem icon={<ClipboardList size={15} />} label={t.dateOfBirth} value={formatClinicDate(patient.dateOfBirth, locale)} />
              <InfoItem icon={<ShieldCheck size={15} />} label={t.allergies} value={allergies || t.emptyValue} />
            </div>
          </Panel>
          <Panel className="profile-detail-panel">
            <PanelHeading icon={<ClipboardList size={17} />} title={t.episodes} />
            <EpisodeList patient={patient} locale={locale} labels={t} />
          </Panel>
        </div>
      ) : null}

      {activeTab === "treatmentPlans" ? (
        <Panel className="profile-detail-panel">
          <PanelHeading icon={<ClipboardList size={17} />} title={t.episodes} />
          <EpisodeList patient={patient} locale={locale} labels={t} expanded />
        </Panel>
      ) : null}

      {activeTab === "appointments" ? (
        <Panel className="profile-detail-panel">
          <PanelHeading icon={<CalendarPlus size={17} />} title={t.appointmentsHeading} />
          {patientAppointments.length ? (
            <div className="patient-appointment-list">
              {patientAppointments.map((appointment) => (
                <PatientAppointmentRow key={appointment.id} appointment={appointment} locale={locale} labels={appT} />
              ))}
            </div>
          ) : <div className="tab-empty-state">{t.noAppointments}</div>}
        </Panel>
      ) : null}

      {activeTab === "packages" ? (
        <Panel className="profile-detail-panel">
          <PanelHeading icon={<UsersRound size={17} />} title={t.packagesHeading} />
          {patient.sessionsTotal > 0 ? (
            <div className="package-summary-card">
              <div className="package-summary-head">
                <span className="package-icon"><UsersRound size={18} /></span>
                <div><strong>{t.packageName}</strong><small>{patient.id} · {getBranchName(patient.branchId, locale)}</small></div>
                <span className="package-active-status">{t.active}</span>
              </div>
              <div className="package-progress-labels"><span>{t.totalSessions}: {formatNumber(patient.sessionsTotal, locale)}</span><span>{t.remainingSessions}: {formatNumber(patient.sessionsRemaining, locale)}</span></div>
              <div className="operation-progress"><div className="operation-progress-bar" style={{ width: `${Math.max(0, ((patient.sessionsTotal - patient.sessionsRemaining) / patient.sessionsTotal) * 100)}%` }} /></div>
              <p>{formatNumber(patient.sessionsTotal - patient.sessionsRemaining, locale)} {t.packageUsage}</p>
            </div>
          ) : <div className="tab-empty-state">{messages[locale].app.demoModeDescription}</div>}
        </Panel>
      ) : null}

      {activeTab === "financial" ? (
        <Panel className="profile-detail-panel">
          <PanelHeading icon={<CreditCard size={17} />} title={t.financialHeading} />
          <div className="financial-summary-grid">
            <FinancialStat label={t.totalInvoiced} value={formatCurrency(financial.invoiced, locale)} />
            <FinancialStat label={t.totalCollected} value={formatCurrency(financial.collected, locale)} />
            <FinancialStat label={t.balance} value={formatCurrency(balance, locale)} />
          </div>
          <p className="profile-footnote">{messages[locale].app.demoModeDescription}</p>
        </Panel>
      ) : null}

      {activeTab === "documents" ? (
        <Panel className="profile-detail-panel">
          <PanelHeading icon={<FileText size={17} />} title={t.documentsHeading} />
          <div className="document-list">
            <DocumentRow title={t.documentAssessment} date={formatClinicDate(patient.createdAt, locale)} view={t.viewDocument} />
            <DocumentRow title={t.documentConsent} date={formatClinicDate(patient.createdAt, locale)} view={t.viewDocument} />
          </div>
        </Panel>
      ) : null}
    </div>
  );
}

function ProfileStat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) {
  return (
    <Panel className="profile-stat-card">
      <span className={`feature-stat-icon stat-icon-${tone}`}>{icon}</span>
      <span className="feature-stat-copy"><small>{label}</small><strong>{value}</strong></span>
    </Panel>
  );
}

function PanelHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return <div className="profile-panel-heading"><span>{icon}</span><h2>{title}</h2></div>;
}

function InfoItem({ icon, label, value, dir }: { icon: React.ReactNode; label: string; value: string; dir?: "ltr" }) {
  return (
    <div className="profile-info-item">
      <span className="profile-info-icon">{icon}</span>
      <span><small>{label}</small><strong dir={dir}>{value}</strong></span>
    </div>
  );
}

function EpisodeList({
  patient,
  locale,
  labels,
  expanded = false,
}: {
  patient: NonNullable<ReturnType<typeof useClinicData>["patients"][number]>;
  locale: "ar" | "en";
  labels: (typeof messages)["ar"]["clinic"]["profile"] | (typeof messages)["en"]["clinic"]["profile"];
  expanded?: boolean;
}) {
  if (!patient.episodes.length) return <div className="tab-empty-state">{labels.noEpisodes}</div>;
  return (
    <div className="episode-list">
      {patient.episodes.slice(0, expanded ? undefined : 2).map((episode) => (
        <div className="episode-row" key={episode.id}>
          <span className={cn("episode-icon", episode.status === "active" ? "episode-icon-active" : "episode-icon-done")}><HeartPulse size={16} /></span>
          <div className="episode-copy">
            <strong>{locale === "ar" ? episode.labelAr : episode.labelEn}</strong>
            <span>{locale === "ar" ? episode.diagnosisAr : episode.diagnosisEn}</span>
          </div>
          <div className="episode-side">
            <span className={cn("episode-status", episode.status === "active" ? "episode-status-active" : "episode-status-done")}>
              {episode.status === "active" ? labels.activeEpisode : labels.dischargedEpisode}
            </span>
            <small>{formatClinicDate(episode.startedAt, locale)}</small>
          </div>
        </div>
      ))}
    </div>
  );
}

function PatientAppointmentRow({
  appointment,
  locale,
  labels,
}: {
  appointment: ClinicAppointment;
  locale: "ar" | "en";
  labels: (typeof messages)["ar"]["clinic"]["appointments"] | (typeof messages)["en"]["clinic"]["appointments"];
}) {
  const patient = useClinicData().patients.find((item) => item.id === appointment.patientId);
  const statusLabel = labels[appointment.status];
  return (
    <div className="patient-appointment-row">
      <span className="appointment-date-block"><strong>{formatClinicDate(appointment.date, locale, { day: "numeric" })}</strong><small>{formatClinicDate(appointment.date, locale, { month: "short" })}</small></span>
      <div className="patient-appointment-copy"><strong>{getServiceName(appointment.serviceId, locale)}</strong><small>{getTherapistName(appointment.therapistId, locale)} · {getBranchName(appointment.branchId, locale)}</small></div>
      <span className="appointment-time">{appointment.time}</span>
      <span className={cn("status-badge", `status-${appointment.status === "booked" ? "confirmed" : appointment.status}`)}>{statusLabel}</span>
      {patient ? <span className="sr-only">{locale === "ar" ? patient.nameAr : patient.nameEn}</span> : null}
    </div>
  );
}

function FinancialStat({ label, value }: { label: string; value: string }) {
  return <div className="financial-stat"><small>{label}</small><strong dir="auto">{value}</strong></div>;
}

function DocumentRow({ title, date, view }: { title: string; date: string; view: string }) {
  return (
    <div className="document-row">
      <span className="document-icon"><FileText size={17} /></span>
      <span className="document-copy"><strong>{title}</strong><small>{date}</small></span>
      <span className="document-demo-label">{view}</span>
    </div>
  );
}
