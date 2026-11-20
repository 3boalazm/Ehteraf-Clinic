"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Pencil,
  Plus,
  RotateCcw,
  ShieldCheck,
  UserRoundSearch,
  UsersRound,
} from "lucide-react";
import { STATUS_TONE } from "@/features/appointments/status";
import { patientSchema, type PatientFormValues } from "@/features/patients/schemas/patient.schema";
import { getBranchName, getPatientAge, getServiceName, getTherapistName } from "@/lib/clinic-utils";
import { canManagePatients } from "@/lib/config/roles";
import { formatDate, formatTime } from "@/lib/dates";
import { BRANCHES } from "@/lib/mock/branches";
import { CLINIC_SERVICES, DEMO_TODAY } from "@/lib/mock/clinic-seed";
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
  Empty,
  Field,
  IconButton,
  Input,
  Notice,
  PageHead,
  Progress,
  SearchBox,
  Select,
  StatCard,
  Tabs,
  Textarea,
} from "@/ui";
import type { AppointmentStatus, PatientStatus } from "@/types";

const PAGE_SIZE = 10;

/* ==========================================================================
   Directory
   ========================================================================== */
export function PatientDirectory() {
  const app = useApp();
  const { t, locale } = app;
  const p = t.clinic.patients;
  const { patients, resetDemoData } = useClinicData();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | PatientStatus>("all");
  const [sort, setSort] = useState<"recent" | "name" | "lastVisit">("recent");
  const [page, setPage] = useState(1);
  const canManage = canManagePatients(app.role);

  const scoped = useMemo(
    () => patients.filter((item) => app.branchId === "all" || item.branchId === app.branchId),
    [patients, app.branchId],
  );

  const filtered = useMemo(() => {
    const needle = (query || app.searchQuery).trim().toLocaleLowerCase();
    const rows = scoped.filter((item) => {
      if (status !== "all" && item.status !== status) return false;
      if (!needle) return true;
      return `${item.nameAr} ${item.nameEn} ${item.id} ${item.phone}`
        .toLocaleLowerCase()
        .includes(needle);
    });
    const name = (item: (typeof rows)[number]) => (locale === "ar" ? item.nameAr : item.nameEn || item.nameAr);
    return [...rows].sort((a, b) => {
      if (sort === "name") return name(a).localeCompare(name(b), locale);
      if (sort === "lastVisit") return (b.lastVisit ?? "").localeCompare(a.lastVisit ?? "");
      return b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id);
    });
  }, [scoped, status, query, app.searchQuery, sort, locale]);

  useEffect(() => setPage(1), [query, app.searchQuery, status, sort, app.branchId]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const monthKey = DEMO_TODAY.slice(0, 7);

  const exportCsv = () => {
    const header = [p.patientId, p.patient, p.contact, p.branch, p.status, p.lastVisit];
    const lines = filtered.map((item) =>
      [
        item.id,
        app.pick(item.nameAr, item.nameEn),
        item.phone,
        getBranchName(item.branchId, locale),
        item.status === "active" ? p.activeStatus : p.inactiveStatus,
        item.lastVisit ?? "",
      ]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob([`﻿${[header.join(","), ...lines].join("\n")}`], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ehteraf-patients.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHead
        title={p.title}
        subtitle={p.subtitle}
        actions={
          <>
            <Button icon={<Download />} onClick={exportCsv}>
              {p.exportCsv}
            </Button>
            {canManage ? (
              <Button variant="ink" icon={<Plus />} href={app.href("/patients/new")}>
                {p.addPatient}
              </Button>
            ) : null}
          </>
        }
      />

      <div className="bento">
        <StatCard className="span-4" tone="lime" label={p.total} value={formatNumber(scoped.length, locale)} icon={<UsersRound />} />
        <StatCard
          className="span-4"
          tone="mint"
          label={p.active}
          value={formatNumber(scoped.filter((item) => item.status === "active").length, locale)}
          icon={<ShieldCheck />}
        />
        <StatCard
          className="span-4"
          tone="lilac"
          label={p.newThisMonth}
          value={formatNumber(scoped.filter((item) => item.createdAt.startsWith(monthKey)).length, locale)}
          icon={<Plus />}
        />

        <Card className="span-12">
          <div className="toolbar">
            <SearchBox value={query} onChange={setQuery} placeholder={p.searchPlaceholder} />
            <Tabs
              value={status}
              onChange={setStatus}
              label={p.status}
              options={[
                { value: "all", label: p.allStatuses },
                { value: "active", label: p.activeStatus },
                { value: "inactive", label: p.inactiveStatus },
              ]}
            />
            <div className="toolbar__end">
              <Select
                className="select--sm"
                style={{ width: "auto" }}
                aria-label={p.sortBy}
                value={sort}
                onChange={(event) => setSort(event.target.value as typeof sort)}
              >
                <option value="recent">{p.sortRecent}</option>
                <option value="name">{p.sortName}</option>
                <option value="lastVisit">{p.sortLastVisit}</option>
              </Select>
              <IconButton
                label={p.resetDemo}
                variant="soft"
                size="sm"
                onClick={() => {
                  if (window.confirm(p.resetConfirm)) resetDemoData();
                }}
              >
                <RotateCcw />
              </IconButton>
            </div>
          </div>

          {rows.length === 0 ? (
            <Empty
              icon={<UserRoundSearch />}
              title={scoped.length === 0 ? p.emptyTitle : p.noResults}
              description={scoped.length === 0 ? p.emptyDescription : undefined}
            />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>{p.patient}</th>
                    <th>{p.contact}</th>
                    <th>{p.branch}</th>
                    <th>{p.lastVisit}</th>
                    <th>{p.sessions}</th>
                    <th>{p.status}</th>
                    <th>
                      <span className="sr-only">{p.actions}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((item) => {
                    const name = app.pick(item.nameAr, item.nameEn);
                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="cell-main">
                            <Avatar name={name} />
                            <div>
                              <b>{name}</b>
                              <span>{item.id}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span dir="ltr">{item.phone}</span>
                          <span className="sub">{item.email}</span>
                        </td>
                        <td>{getBranchName(item.branchId, locale)}</td>
                        <td>{item.lastVisit ? formatDate(item.lastVisit, locale) : p.noVisit}</td>
                        <td>
                          {formatNumber(item.sessionsRemaining, locale)}
                          <span className="sub">{p.sessionsRemaining}</span>
                        </td>
                        <td>
                          <Badge tone={item.status === "active" ? "mint" : "sand"}>
                            {item.status === "active" ? p.activeStatus : p.inactiveStatus}
                          </Badge>
                        </td>
                        <td>
                          <div className="cell-actions">
                            <IconButton
                              label={p.viewProfile}
                              variant="ink"
                              size="sm"
                              href={app.href(`/patients/${item.id}`)}
                            >
                              <ArrowUpRight className="flip" />
                            </IconButton>
                          </div>
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
              {p.showing} {formatNumber(rows.length, locale)} {p.of} {formatNumber(filtered.length, locale)}{" "}
              {p.countLabel}
            </span>
            <div className="row">
              <IconButton
                label={p.previous}
                variant="soft"
                size="sm"
                disabled={current <= 1}
                onClick={() => setPage(current - 1)}
              >
                <ChevronLeft className="flip" />
              </IconButton>
              <span>
                {p.page} {formatNumber(current, locale)} / {formatNumber(pages, locale)}
              </span>
              <IconButton
                label={p.next}
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
    </>
  );
}

/* ==========================================================================
   Create / edit form
   ========================================================================== */
export function PatientForm({ patientId }: { patientId?: string }) {
  const app = useApp();
  const { t } = app;
  const f = t.clinic.patientForm;
  const errorsCopy = t.clinic.common as unknown as Record<string, string>;
  const router = useRouter();
  const { patients, hydrated, createPatient, updatePatient } = useClinicData();
  const existing = patientId ? patients.find((item) => item.id === patientId) : undefined;
  const scopedBranch = app.branchId === "all" ? undefined : app.branchId;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      nameAr: "",
      nameEn: "",
      phone: "",
      email: "",
      gender: undefined,
      dateOfBirth: "",
      branchId: scopedBranch,
      status: "active",
      emergencyContact: "",
      diagnosisAr: "",
      allergiesAr: "",
    },
  });

  useEffect(() => {
    if (!existing) return;
    reset({
      nameAr: existing.nameAr,
      nameEn: existing.nameEn,
      phone: existing.phone,
      email: existing.email,
      gender: existing.gender,
      dateOfBirth: existing.dateOfBirth,
      branchId: existing.branchId,
      status: existing.status,
      emergencyContact: existing.emergencyContact,
      diagnosisAr: existing.diagnosisAr,
      allergiesAr: existing.allergiesAr,
    });
    // Only re-seed the form when a different record is loaded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing?.id, hydrated]);

  const message = (key?: string) => (key ? errorsCopy[key] ?? key : undefined);

  if (!canManagePatients(app.role)) {
    return (
      <Card>
        <Empty icon={<ShieldCheck />} title={t.modules.accessDeniedTitle} description={t.modules.accessDenied} />
      </Card>
    );
  }
  if (patientId && hydrated && !existing) {
    return (
      <Card>
        <Empty
          icon={<UserRoundSearch />}
          title={f.notFound}
          action={<Button href={app.href("/patients")}>{t.clinic.profile.back}</Button>}
        />
      </Card>
    );
  }

  const onSubmit = handleSubmit((values) => {
    const digits = (value: string) => value.replace(/\D/g, "");
    const others = patients.filter((item) => item.id !== patientId);
    if (others.some((item) => digits(item.phone) === digits(values.phone))) {
      setError("phone", { message: "phoneDuplicate" });
      return;
    }
    if (values.email && others.some((item) => item.email.toLowerCase() === values.email.toLowerCase())) {
      setError("email", { message: "emailDuplicate" });
      return;
    }
    const diagnosis = values.diagnosisAr ?? "";
    const allergies = values.allergiesAr ?? "";
    const input = {
      nameAr: values.nameAr,
      nameEn: values.nameEn ?? "",
      phone: values.phone,
      email: values.email,
      gender: values.gender,
      dateOfBirth: values.dateOfBirth,
      branchId: values.branchId,
      status: values.status,
      emergencyContact: values.emergencyContact ?? "",
      diagnosisAr: diagnosis,
      diagnosisEn: existing && existing.diagnosisAr === diagnosis ? existing.diagnosisEn : diagnosis,
      allergiesAr: allergies,
      allergiesEn: existing && existing.allergiesAr === allergies ? existing.allergiesEn : allergies,
    };
    if (existing) {
      updatePatient(existing.id, input);
      router.push(app.href(`/patients/${existing.id}`));
    } else {
      const created = createPatient(input);
      router.push(app.href(`/patients/${created.id}`));
    }
  });

  const backHref = existing ? app.href(`/patients/${existing.id}`) : app.href("/patients");

  return (
    <>
      <PageHead
        eyebrow={
          <>
            <ArrowLeft className="flip" /> {t.clinic.patients.title}
          </>
        }
        title={existing ? f.editTitle : f.newTitle}
        subtitle={existing ? f.editSubtitle : f.newSubtitle}
      />
      <form className="bento" onSubmit={onSubmit} noValidate>
        <div className="span-8 stack" style={{ gap: 14 }}>
          <Card>
            <CardHead title={f.identitySection} />
            <div className="form-grid">
              <Field label={f.arabicName} error={message(errors.nameAr?.message)}>
                <Input dir="rtl" aria-invalid={Boolean(errors.nameAr)} {...register("nameAr")} />
              </Field>
              <Field label={f.englishName} optional={t.clinic.common.optional} error={message(errors.nameEn?.message)}>
                <Input dir="ltr" aria-invalid={Boolean(errors.nameEn)} {...register("nameEn")} />
              </Field>
              <Field label={f.gender} error={message(errors.gender?.message)}>
                <Select aria-invalid={Boolean(errors.gender)} defaultValue="" {...register("gender")}>
                  <option value="" disabled>
                    {f.selectGender}
                  </option>
                  <option value="male">{f.male}</option>
                  <option value="female">{f.female}</option>
                </Select>
              </Field>
              <Field label={f.dateOfBirth} error={message(errors.dateOfBirth?.message)}>
                <Input type="date" max={new Date().toISOString().slice(0, 10)} aria-invalid={Boolean(errors.dateOfBirth)} {...register("dateOfBirth")} />
              </Field>
            </div>
          </Card>

          <Card>
            <CardHead title={f.contactSection} />
            <div className="form-grid">
              <Field label={f.phone} error={message(errors.phone?.message)}>
                <Input type="tel" dir="ltr" placeholder="05XXXXXXXX" aria-invalid={Boolean(errors.phone)} {...register("phone")} />
              </Field>
              <Field label={f.email} optional={t.clinic.common.optional} error={message(errors.email?.message)}>
                <Input type="email" dir="ltr" aria-invalid={Boolean(errors.email)} {...register("email")} />
              </Field>
              <Field label={f.emergencyContact} optional={t.clinic.common.optional} error={message(errors.emergencyContact?.message)}>
                <Input type="tel" dir="ltr" aria-invalid={Boolean(errors.emergencyContact)} {...register("emergencyContact")} />
              </Field>
            </div>
          </Card>

          <Card>
            <CardHead title={f.careSection} />
            <div className="form-grid">
              <Field label={f.branch} error={message(errors.branchId?.message)}>
                <Select aria-invalid={Boolean(errors.branchId)} defaultValue={scopedBranch ?? ""} {...register("branchId")}>
                  <option value="" disabled>
                    {f.selectBranch}
                  </option>
                  {BRANCHES.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {app.pick(branch.nameAr, branch.nameEn)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={f.status} error={message(errors.status?.message)}>
                <Select {...register("status")}>
                  <option value="active">{f.active}</option>
                  <option value="inactive">{f.inactive}</option>
                </Select>
              </Field>
              <Field className="full" label={f.diagnosis} optional={t.clinic.common.optional} error={message(errors.diagnosisAr?.message)}>
                <Textarea aria-invalid={Boolean(errors.diagnosisAr)} {...register("diagnosisAr")} />
              </Field>
              <Field className="full" label={f.allergies} optional={t.clinic.common.optional} error={message(errors.allergiesAr?.message)}>
                <Input aria-invalid={Boolean(errors.allergiesAr)} {...register("allergiesAr")} />
              </Field>
            </div>
          </Card>
        </div>

        <div className="span-4 stack" style={{ gap: 14 }}>
          <Card tone="ink">
            <Bubble tone="lime">
              <ShieldCheck />
            </Bubble>
            <h2 className="t-title">{existing ? f.updatePatient : f.savePatient}</h2>
            <p className="t-label">{f.requiredNote}</p>
            <p className="t-label">{f.privacyNote}</p>
            <div className="card__grow" style={{ minHeight: 12 }} />
            <Button variant="lime" arrow type="submit" disabled={isSubmitting}>
              {existing ? f.updatePatient : f.savePatient}
            </Button>
            <Button variant="ghost" href={backHref}>
              {f.cancel}
            </Button>
          </Card>
        </div>
      </form>
    </>
  );
}

/* ==========================================================================
   Profile
   ========================================================================== */
type ProfileTab =
  | "overview"
  | "medicalRecord"
  | "treatmentPlans"
  | "appointments"
  | "packages"
  | "financial"
  | "documents";

export function PatientProfile({ patientId }: { patientId: string }) {
  const app = useApp();
  const { t, locale } = app;
  const c = t.clinic.profile;
  const { patients, appointments, hydrated } = useClinicData();
  const [tab, setTab] = useState<ProfileTab>("overview");
  const patient = patients.find((item) => item.id === patientId);
  const statusLabels = t.clinic.appointments as unknown as Record<AppointmentStatus, string>;

  if (!patient) {
    return (
      <Card>
        <Empty
          icon={<UserRoundSearch />}
          title={hydrated ? t.clinic.patientForm.notFound : t.clinic.common.loading}
          action={hydrated ? <Button href={app.href("/patients")}>{c.back}</Button> : undefined}
        />
      </Card>
    );
  }

  const name = app.pick(patient.nameAr, patient.nameEn);
  const history = appointments
    .filter((item) => item.patientId === patient.id)
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
  const used = Math.max(0, patient.sessionsTotal - patient.sessionsRemaining);
  const priceOf = (serviceId: string) => CLINIC_SERVICES.find((item) => item.id === serviceId)?.price ?? 0;
  const invoiced = history
    .filter((item) => item.status !== "cancelled" && item.status !== "noShow")
    .reduce((sum, item) => sum + priceOf(item.serviceId), 0);
  const collected = history
    .filter((item) => item.status === "completed")
    .reduce((sum, item) => sum + priceOf(item.serviceId), 0);
  const diagnosis = app.pick(patient.diagnosisAr, patient.diagnosisEn) || c.emptyValue;
  const allergies = app.pick(patient.allergiesAr, patient.allergiesEn) || c.noAllergies;

  const tabs: ProfileTab[] = [
    "overview",
    "medicalRecord",
    "treatmentPlans",
    "appointments",
    "packages",
    "financial",
    "documents",
  ];

  const appointmentList = (limit?: number) =>
    history.length === 0 ? (
      <Empty icon={<FileText />} title={c.noAppointments} />
    ) : (
      <div className="list">
        {history.slice(0, limit).map((item) => (
          <div key={item.id} className="list__row">
            <span className="list__time">{formatTime(item.time, locale)}</span>
            <div className="list__main">
              <b>{getServiceName(item.serviceId, locale)}</b>
              <span>
                {formatDate(item.date, locale)} · {getTherapistName(item.therapistId, locale)} ·{" "}
                {getBranchName(item.branchId, locale)}
              </span>
            </div>
            <Badge tone={STATUS_TONE[item.status]}>{statusLabels[item.status]}</Badge>
          </div>
        ))}
      </div>
    );

  const episodes =
    patient.episodes.length === 0 ? (
      <Empty icon={<FileText />} title={c.noEpisodes} />
    ) : (
      <div className="list">
        {patient.episodes.map((episode) => (
          <div key={episode.id} className="list__row">
            <Bubble tone={episode.status === "active" ? "lime" : undefined}>
              <FileText />
            </Bubble>
            <div className="list__main">
              <b>{app.pick(episode.labelAr, episode.labelEn)}</b>
              <span>
                {app.pick(episode.diagnosisAr, episode.diagnosisEn)} · {formatDate(episode.startedAt, locale)}
              </span>
            </div>
            <Badge tone={episode.status === "active" ? "mint" : "sand"}>
              {episode.status === "active" ? c.activeEpisode : c.dischargedEpisode}
            </Badge>
          </div>
        ))}
      </div>
    );

  return (
    <>
      <PageHead
        eyebrow={
          <>
            <ArrowLeft className="flip" /> {c.back}
          </>
        }
        title={name}
        subtitle={`${c.patientId}: ${patient.id}`}
        actions={
          <>
            <Button href={app.href("/patients")}>{c.back}</Button>
            {canManagePatients(app.role) ? (
              <Button variant="ink" icon={<Pencil />} href={app.href(`/patients/${patient.id}/edit`)}>
                {c.edit}
              </Button>
            ) : null}
          </>
        }
      />

      <div className="bento">
        <Card tone="sky" className="span-4">
          <div className="row">
            <Avatar name={name} size="lg" />
            <div className="grow">
              <h2 className="t-title truncate">{name}</h2>
              <span className="t-label">
                {formatNumber(getPatientAge(patient.dateOfBirth), locale)} {t.clinic.common.years} ·{" "}
                {patient.gender === "male" ? t.clinic.patients.male : t.clinic.patients.female}
              </span>
            </div>
          </div>
          <div className="row row--wrap">
            <Badge tone={patient.status === "active" ? "lime" : "sand"}>
              {patient.status === "active" ? c.active : c.inactive}
            </Badge>
            <Badge tone="outline" plain>
              {getBranchName(patient.branchId, locale)}
            </Badge>
          </div>
        </Card>
        <StatCard className="span-3 lg-6" label={c.totalSessions} value={formatNumber(patient.sessionsTotal, locale)} />
        <StatCard className="span-3 lg-6" tone="lime" label={c.remainingSessions} value={formatNumber(patient.sessionsRemaining, locale)} />
        <StatCard
          className="span-3 lg-6"
          tone="lilac"
          label={c.appointments}
          value={formatNumber(history.length, locale)}
          unit={c.visitCount}
        />

        <div className="span-12">
          <Tabs
            value={tab}
            onChange={setTab}
            options={tabs.map((value) => ({ value, label: c[value] }))}
          />
        </div>

        {tab === "overview" ? (
          <>
            <Card className="span-6">
              <CardHead title={c.contactDetails} />
              <dl className="dl">
                <div>
                  <dt>{c.phone}</dt>
                  <dd dir="ltr" style={{ textAlign: "start" }}>
                    {patient.phone}
                  </dd>
                </div>
                <div>
                  <dt>{c.email}</dt>
                  <dd>{patient.email || c.emptyValue}</dd>
                </div>
                <div>
                  <dt>{c.dateOfBirth}</dt>
                  <dd>{formatDate(patient.dateOfBirth, locale)}</dd>
                </div>
                <div>
                  <dt>{c.emergencyContact}</dt>
                  <dd dir="ltr" style={{ textAlign: "start" }}>
                    {patient.emergencyContact || c.emptyValue}
                  </dd>
                </div>
                <div>
                  <dt>{c.branch}</dt>
                  <dd>{getBranchName(patient.branchId, locale)}</dd>
                </div>
                <div>
                  <dt>{t.clinic.patients.lastVisit}</dt>
                  <dd>{patient.lastVisit ? formatDate(patient.lastVisit, locale) : t.clinic.patients.noVisit}</dd>
                </div>
              </dl>
            </Card>
            <Card tone="mint" className="span-6">
              <CardHead title={c.medicalOverview} />
              <dl className="dl">
                <div>
                  <dt>{c.diagnosis}</dt>
                  <dd>{diagnosis}</dd>
                </div>
                <div>
                  <dt>{c.allergies}</dt>
                  <dd>{allergies}</dd>
                </div>
              </dl>
              <div className="card__grow" />
              <div className="stack" style={{ gap: 8 }}>
                <div className="row row--between t-small">
                  <span>{c.packageUsage}</span>
                  <b>
                    {formatNumber(used, locale)} / {formatNumber(patient.sessionsTotal, locale)}
                  </b>
                </div>
                <Progress value={patient.sessionsTotal ? (used / patient.sessionsTotal) * 100 : 0} />
              </div>
            </Card>
            <Card className="span-12">
              <CardHead title={c.appointmentsHeading} />
              {appointmentList(4)}
            </Card>
          </>
        ) : null}

        {tab === "medicalRecord" ? (
          <>
            <Card tone="mint" className="span-6">
              <CardHead title={c.medicalOverview} />
              <dl className="dl">
                <div>
                  <dt>{c.diagnosis}</dt>
                  <dd>{diagnosis}</dd>
                </div>
                <div>
                  <dt>{c.allergies}</dt>
                  <dd>{allergies}</dd>
                </div>
                <div>
                  <dt>{c.age}</dt>
                  <dd>
                    {formatNumber(getPatientAge(patient.dateOfBirth), locale)} {t.clinic.common.years}
                  </dd>
                </div>
                <div>
                  <dt>{c.gender}</dt>
                  <dd>{patient.gender === "male" ? t.clinic.patients.male : t.clinic.patients.female}</dd>
                </div>
              </dl>
            </Card>
            <Card className="span-6">
              <CardHead title={c.treatmentEpisodes} />
              {episodes}
            </Card>
          </>
        ) : null}

        {tab === "treatmentPlans" ? (
          <Card className="span-12">
            <CardHead title={c.episodes} />
            {episodes}
          </Card>
        ) : null}

        {tab === "appointments" ? (
          <Card className="span-12">
            <CardHead title={c.appointmentsHeading} />
            {appointmentList()}
          </Card>
        ) : null}

        {tab === "packages" ? (
          <Card tone="lilac" className="span-6">
            <CardHead title={c.packagesHeading} hint={c.packageName} />
            <div className="num">
              {formatNumber(patient.sessionsRemaining, locale)}
              <small>{t.clinic.patients.sessionsRemaining}</small>
            </div>
            <div className="stack" style={{ gap: 8 }}>
              <div className="row row--between t-small">
                <span>{c.packageUsage}</span>
                <b>
                  {formatNumber(used, locale)} / {formatNumber(patient.sessionsTotal, locale)}
                </b>
              </div>
              <Progress value={patient.sessionsTotal ? (used / patient.sessionsTotal) * 100 : 0} />
            </div>
          </Card>
        ) : null}

        {tab === "financial" ? (
          <>
            <StatCard className="span-4" label={c.totalInvoiced} value={formatCurrency(invoiced, locale)} hint={c.financialHeading} />
            <StatCard className="span-4" tone="mint" label={c.totalCollected} value={formatCurrency(collected, locale)} />
            <StatCard className="span-4" tone="peach" label={c.balance} value={formatCurrency(invoiced - collected, locale)} />
          </>
        ) : null}

        {tab === "documents" ? (
          <Card className="span-12">
            <CardHead title={c.documentsHeading} />
            <div className="list">
              {[c.documentAssessment, c.documentConsent].map((title) => (
                <div key={title} className="list__row">
                  <Bubble>
                    <FileText />
                  </Bubble>
                  <div className="list__main">
                    <b>{title}</b>
                    <span>
                      {c.documentDate} {formatDate(patient.createdAt, locale)}
                    </span>
                  </div>
                  <Badge tone="outline" plain>
                    {c.viewDocument}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        ) : null}
      </div>

      <Notice icon={<ShieldCheck />}>{t.clinic.patientForm.privacyNote}</Notice>
    </>
  );
}
