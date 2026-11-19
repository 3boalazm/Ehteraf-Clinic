"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldPath } from "react-hook-form";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Download,
  FileText,
  HeartPulse,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  Search,
  ShieldCheck,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { Badge } from "@/design-system/badge";
import {
  DataTableFrame,
  EmptyState,
  SectionHeading,
  StatBlock,
} from "@/design-system/blocks";
import { Button } from "@/design-system/button";
import { Card } from "@/design-system/card";
import {
  FieldFrame,
  Select,
  TextArea,
  TextInput,
} from "@/design-system/fields";
import { Tabs } from "@/design-system/tabs";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { useClinicData } from "@/services/clinic-data-provider";
import { messages } from "@/lib/i18n/messages";
import { BRANCHES } from "@/lib/mock/branches";
import { DEMO_TODAY } from "@/lib/mock/clinic-seed";
import {
  canBookAppointments,
  canManagePatients,
  ROLE_BRANCH_SCOPE,
} from "@/lib/config/roles";
import {
  formatClinicDate,
  getBranchName,
  getInitials,
  getPatientAge,
  getServiceName,
  getTherapistName,
} from "@/lib/clinic-utils";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  patientSchema,
  type PatientFormValues,
} from "@/features/patients/schemas/patient.schema";
import type {
  ClinicAppointment,
  NewPatientInput,
  PatientStatus,
} from "@/types";

const PAGE_SIZE = 10;
type PatientSort = "recent" | "name" | "lastVisit";
type ProfileTab =
  | "overview"
  | "medical"
  | "treatmentPlans"
  | "appointments"
  | "packages"
  | "financial"
  | "documents";
const softCard = "rounded-2xl border border-line bg-surface shadow-card";

/** Responsive, local-data patient register. */
export function PatientDirectory() {
  const router = useRouter();
  const { locale, branchId, setBranchId, role } = useWorkspace();
  const { patients, resetDemoData } = useClinicData();
  const t = messages[locale].clinic.patients;
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | PatientStatus>("all");
  const [sort, setSort] = useState<PatientSort>("recent");
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState("");
  const scoped = ROLE_BRANCH_SCOPE[role];
  const currentBranch = scoped ?? branchId;
  const rows = useMemo(
    () =>
      patients
        .filter((p) => currentBranch === "all" || p.branchId === currentBranch)
        .filter((p) => status === "all" || p.status === status)
        .filter((p) => {
          const q = query.trim().toLocaleLowerCase();
          return (
            !q ||
            [p.id, p.nameAr, p.nameEn, p.phone, p.email].some((v) =>
              v.toLocaleLowerCase().includes(q),
            )
          );
        })
        .sort((a, b) =>
          sort === "name"
            ? (locale === "ar" ? a.nameAr : a.nameEn).localeCompare(
                locale === "ar" ? b.nameAr : b.nameEn,
                locale,
              )
            : sort === "lastVisit"
              ? (b.lastVisit ?? "").localeCompare(a.lastVisit ?? "")
              : b.createdAt.localeCompare(a.createdAt),
        ),
    [currentBranch, locale, patients, query, sort, status],
  );
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const visible = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const scopedPatients = patients.filter(
    (p) => currentBranch === "all" || p.branchId === currentBranch,
  );
  const number = (n: number) => formatNumber(n, locale);
  const direction = locale === "ar" ? "rtl" : "ltr";

  function exportCsv() {
    const data = [
      [t.patientId, t.patient, t.contact, t.branch, t.status, t.lastVisit],
      ...rows.map((p) => [
        p.id,
        locale === "ar" ? p.nameAr : p.nameEn,
        p.phone,
        getBranchName(p.branchId, locale),
        p.status === "active" ? t.activeStatus : t.inactiveStatus,
        p.lastVisit ? formatClinicDate(p.lastVisit, locale) : t.noVisit,
      ]),
    ];
    const csv = `\uFEFF${data.map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\r\n")}`;
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "ehteraf-patients-demo.csv";
    link.click();
    URL.revokeObjectURL(url);
  }
  function resetDemo() {
    if (!window.confirm(t.resetConfirm)) return;
    resetDemoData();
    setQuery("");
    setStatus("all");
    setSort("recent");
    setPage(1);
    setNotice(t.resetDemo);
  }
  const start = rows.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const end = Math.min(page * PAGE_SIZE, rows.length);
  const statusLabel = (value: PatientStatus) =>
    value === "active" ? t.activeStatus : t.inactiveStatus;

  return (
    <main
      dir={direction}
      className="mx-auto w-full max-w-[1440px] space-y-7 px-4 py-6 sm:px-7 lg:px-10 lg:py-9"
    >
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div className="max-w-2xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[.18em] text-teal">
            EH / CARE DIRECTORY
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {t.title}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
            {t.subtitle}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportCsv}>
            <Download size={16} />
            {t.exportCsv}
          </Button>
          {role === "owner" && (
            <Button variant="ghost" onClick={resetDemo}>
              <RotateCcw size={16} />
              {t.resetDemo}
            </Button>
          )}
          {canManagePatients(role) && (
            <Button onClick={() => router.push(`/${locale}/patients/new`)}>
              <UserPlus size={16} />
              {t.addPatient}
            </Button>
          )}
        </div>
      </div>
      {notice && (
        <p
          role="status"
          className="rounded-xl border border-teal/20 bg-teal-soft px-4 py-3 text-sm text-teal-deep"
        >
          {notice}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatBlock
          label={t.total}
          value={number(scopedPatients.length)}
          icon={<UsersRound size={18} />}
          tone="teal"
        />
        <StatBlock
          label={t.active}
          value={number(
            scopedPatients.filter((p) => p.status === "active").length,
          )}
          icon={<Activity size={18} />}
          tone="ink"
        />
        <StatBlock
          label={t.newThisMonth}
          value={number(
            scopedPatients.filter(
              (p) => p.createdAt.slice(0, 7) === DEMO_TODAY.slice(0, 7),
            ).length,
          )}
          icon={<CalendarDays size={18} />}
          tone="brass"
        />
      </div>
      <Card className={`${softCard} overflow-hidden`}>
        <div className="grid gap-3 border-b border-line p-4 sm:grid-cols-2 lg:grid-cols-4 lg:p-5">
          <label className="relative sm:col-span-2">
            <Search
              size={17}
              className="absolute start-3 top-3.5 text-muted"
              aria-hidden="true"
            />
            <TextInput
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder={t.searchPlaceholder}
              aria-label={t.searchPlaceholder}
              className="ps-10"
              dir="auto"
            />
          </label>
          <Select
            aria-label={t.status}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as "all" | PatientStatus);
              setPage(1);
            }}
          >
            <option value="all">{t.allStatuses}</option>
            <option value="active">{t.activeStatus}</option>
            <option value="inactive">{t.inactiveStatus}</option>
          </Select>
          <Select
            aria-label={t.sortBy}
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as PatientSort);
              setPage(1);
            }}
          >
            <option value="recent">{t.sortRecent}</option>
            <option value="name">{t.sortName}</option>
            <option value="lastVisit">{t.sortLastVisit}</option>
          </Select>
          {scoped ? (
            <div className="flex items-center gap-2 rounded-xl bg-canvas px-3 text-sm text-muted">
              <MapPin size={15} />
              {getBranchName(scoped, locale)}
            </div>
          ) : (
            <Select
              aria-label={t.branch}
              value={branchId}
              onChange={(e) => {
                setBranchId(e.target.value as typeof branchId);
                setPage(1);
              }}
            >
              <option value="all">{t.allBranches}</option>
              {BRANCHES.map((b) => (
                <option key={b.id} value={b.id}>
                  {locale === "ar" ? b.nameAr : b.nameEn}
                </option>
              ))}
            </Select>
          )}
        </div>
        {visible.length ? (
          <>
            <DataTableFrame className="max-h-[64vh] overflow-auto">
              <table className="w-full min-w-[850px] border-collapse text-start text-sm">
                <thead className="sticky top-0 z-10 bg-canvas text-xs uppercase tracking-wide text-muted">
                  <tr>
                    {[
                      t.patient,
                      t.patientId,
                      t.contact,
                      t.branch,
                      t.lastVisit,
                      t.sessions,
                      t.status,
                      t.actions,
                    ].map((x) => (
                      <th key={x} className="px-4 py-3 font-medium">
                        {x}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {visible.map((p) => (
                    <tr
                      key={p.id}
                      className="transition-colors hover:bg-canvas/70"
                    >
                      <td className="px-4 py-3">
                        <button
                          className="flex items-center gap-3 text-start"
                          onClick={() =>
                            router.push(`/${locale}/patients/${p.id}`)
                          }
                        >
                          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-teal-soft text-xs font-semibold text-teal-deep">
                            {getInitials(locale === "ar" ? p.nameAr : p.nameEn)}
                          </span>
                          <span>
                            <strong className="block font-medium text-ink">
                              {locale === "ar" ? p.nameAr : p.nameEn}
                            </strong>
                            <small className="text-muted">
                              {t.gender}:{" "}
                              {p.gender === "female"
                                ? messages[locale].clinic.patientForm.female
                                : messages[locale].clinic.patientForm.male}
                            </small>
                          </span>
                        </button>
                      </td>
                      <td
                        className="px-4 py-3 font-mono text-xs text-muted"
                        dir="ltr"
                      >
                        {p.id}
                      </td>
                      <td className="px-4 py-3">
                        <bdi dir="ltr">{p.phone}</bdi>
                        <span className="block max-w-44 truncate text-xs text-muted">
                          {p.email}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {getBranchName(p.branchId, locale)}
                      </td>
                      <td className="px-4 py-3">
                        {p.lastVisit
                          ? formatClinicDate(p.lastVisit, locale)
                          : t.noVisit}
                      </td>
                      <td className="px-4 py-3">
                        {number(p.sessionsRemaining)}{" "}
                        <span className="text-xs text-muted">
                          {t.sessionsRemaining}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          tone={p.status === "active" ? "success" : "neutral"}
                        >
                          {statusLabel(p.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`${t.viewProfile}: ${locale === "ar" ? p.nameAr : p.nameEn}`}
                          onClick={() =>
                            router.push(`/${locale}/patients/${p.id}`)
                          }
                        >
                          {t.viewProfile}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DataTableFrame>
            <div className="flex flex-col gap-3 border-t border-line px-4 py-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
              <span>
                {t.showing} {number(start)}–{number(end)} {t.of}{" "}
                {number(rows.length)} {t.countLabel}
              </span>
              <div className="flex items-center gap-3">
                <span>
                  {t.page} {number(page)} / {number(pageCount)}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={t.previous}
                  disabled={page <= 1}
                  onClick={() => setPage((v) => Math.max(1, v - 1))}
                >
                  {locale === "ar" ? (
                    <ChevronRight size={16} />
                  ) : (
                    <ChevronLeft size={16} />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={t.next}
                  disabled={page >= pageCount}
                  onClick={() => setPage((v) => Math.min(pageCount, v + 1))}
                >
                  {locale === "ar" ? (
                    <ChevronLeft size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-8">
            <EmptyState
              title={
                scopedPatients.length === 0 && !query && status === "all"
                  ? t.emptyTitle
                  : t.noResults
              }
              description={
                scopedPatients.length === 0 && !query && status === "all"
                  ? t.emptyDescription
                  : t.noResults
              }
              action={
                scopedPatients.length === 0 && canManagePatients(role) ? (
                  <Button
                    onClick={() => router.push(`/${locale}/patients/new`)}
                  >
                    <UserPlus size={16} />
                    {t.addPatient}
                  </Button>
                ) : undefined
              }
            />
          </div>
        )}
      </Card>
      <p className="flex items-start gap-2 text-xs leading-5 text-muted">
        <ShieldCheck size={15} className="mt-0.5 shrink-0 text-teal" />
        {messages[locale].app.demoModeDescription}
      </p>
    </main>
  );
}

/** Patient create/edit form backed by the existing schema and local provider. */
export function PatientEditor({ patientId }: { patientId?: string }) {
  const router = useRouter();
  const { locale, role, branchId } = useWorkspace();
  const { patients, hydrated, createPatient, updatePatient } = useClinicData();
  const assigned = ROLE_BRANCH_SCOPE[role];
  const patient = patientId
    ? patients.find(
        (p) => p.id === patientId && (!assigned || p.branchId === assigned),
      )
    : undefined;
  const edit = Boolean(patientId);
  const t = messages[locale].clinic.patientForm;
  const c = messages[locale].clinic.common as Record<string, string>;
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      nameAr: patient?.nameAr ?? "",
      nameEn: patient?.nameEn ?? "",
      phone: patient?.phone ?? "",
      email: patient?.email ?? "",
      gender: patient?.gender ?? "female",
      dateOfBirth: patient?.dateOfBirth ?? "",
      branchId:
        patient?.branchId ??
        assigned ??
        (branchId === "all" ? "ghadeer" : branchId),
      status: patient?.status ?? "active",
      emergencyContact: patient?.emergencyContact ?? "",
      diagnosisAr: patient?.diagnosisAr ?? "",
      allergiesAr:
        patient?.allergiesAr === "لا يوجد" ||
        patient?.allergiesEn === "None reported"
          ? ""
          : (patient?.allergiesAr ?? ""),
    },
  });
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = form;
  const goBack = () =>
    router.push(
      patient ? `/${locale}/patients/${patient.id}` : `/${locale}/patients`,
    );
  if (!canManagePatients(role))
    return (
      <main dir={locale} className="mx-auto max-w-3xl p-8">
        <EmptyState title={messages[locale].modules.accessDenied} />
      </main>
    );
  if (edit && !patient && !hydrated)
    return (
      <main dir={locale} className="p-8 text-muted">
        {messages[locale].clinic.common.loading}
      </main>
    );
  if (edit && !patient)
    return (
      <main dir={locale} className="mx-auto max-w-3xl space-y-5 p-6">
        <h1 className="text-3xl font-semibold text-ink">{t.notFound}</h1>
        <Button variant="outline" onClick={goBack}>
          {messages[locale].clinic.profile.back}
        </Button>
      </main>
    );
  const error = (field: FieldPath<PatientFormValues>) => {
    const key = errors[field]?.message;
    return typeof key === "string" ? (c[key] ?? c.required) : undefined;
  };
  function submit(values: PatientFormValues) {
    const email = values.email.trim().toLocaleLowerCase();
    if (
      patients.some(
        (p) =>
          p.id !== patientId &&
          p.phone.replace(/\D/g, "") === values.phone.replace(/\D/g, ""),
      )
    ) {
      setError("phone", { type: "manual", message: "phoneDuplicate" });
      return;
    }
    if (
      email &&
      patients.some(
        (p) => p.id !== patientId && p.email.toLocaleLowerCase() === email,
      )
    ) {
      setError("email", { type: "manual", message: "emailDuplicate" });
      return;
    }
    const input: NewPatientInput = {
      nameAr: values.nameAr.trim(),
      nameEn: values.nameEn?.trim() || values.nameAr.trim(),
      phone: values.phone.trim(),
      email,
      gender: values.gender,
      dateOfBirth: values.dateOfBirth,
      branchId: assigned ?? values.branchId,
      status: values.status,
      emergencyContact: values.emergencyContact?.trim() || "",
      diagnosisAr: values.diagnosisAr?.trim() || "غير مسجل",
      diagnosisEn: values.diagnosisAr?.trim() || "Not recorded",
      allergiesAr: values.allergiesAr?.trim() || "لا يوجد",
      allergiesEn: values.allergiesAr?.trim() || "None reported",
    };
    if (patient) {
      updatePatient(patient.id, input);
      router.push(`/${locale}/patients/${patient.id}`);
    } else {
      const created = createPatient(input);
      router.push(`/${locale}/patients/${created.id}`);
    }
  }
  const inputField = (
    name: FieldPath<PatientFormValues>,
    label: string,
    props: React.ComponentProps<typeof TextInput> = {},
    required = false,
  ) => (
    <FieldFrame label={label} required={required} error={error(name)}>
      <TextInput
        id={`patient-${name}`}
        aria-label={label}
        aria-invalid={Boolean(errors[name])}
        {...props}
        {...register(name)}
      />
    </FieldFrame>
  );
  return (
    <main
      dir={locale}
      className="mx-auto w-full max-w-5xl space-y-7 px-4 py-7 sm:px-7 lg:px-10"
    >
      <header className="max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[.18em] text-teal">
          EH / PATIENT RECORD
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {edit ? t.editTitle : t.newTitle}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          {edit ? t.editSubtitle : t.newSubtitle}
        </p>
      </header>
      <form onSubmit={handleSubmit(submit)} noValidate className="space-y-5">
        <Card className={`${softCard} p-5 sm:p-7`}>
          <SectionHeading
            eyebrow="01"
            title={t.identitySection}
            description={t.requiredNote}
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {inputField("nameAr", t.arabicName, { dir: "rtl" }, true)}
            {inputField("nameEn", t.englishName, { dir: "ltr" })}
            {inputField(
              "dateOfBirth",
              t.dateOfBirth,
              { type: "date", max: new Date().toISOString().slice(0, 10) },
              true,
            )}
            <FieldFrame label={t.gender} required error={error("gender")}>
              <Select
                aria-label={t.gender}
                aria-invalid={Boolean(errors.gender)}
                {...register("gender")}
              >
                <option value="">{t.selectGender}</option>
                <option value="female">{t.female}</option>
                <option value="male">{t.male}</option>
              </Select>
            </FieldFrame>
          </div>
        </Card>
        <Card className={`${softCard} p-5 sm:p-7`}>
          <SectionHeading
            eyebrow="02"
            title={t.contactSection}
            description={
              locale === "ar"
                ? "وسيلة تواصل أساسية وتفاصيل للطوارئ."
                : "A primary contact method and emergency details."
            }
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {inputField(
              "phone",
              t.phone,
              { type: "tel", dir: "ltr", placeholder: "05xxxxxxxx" },
              true,
            )}
            {inputField("email", t.email, { type: "email", dir: "ltr" })}
            {inputField("emergencyContact", t.emergencyContact, {
              type: "tel",
              dir: "ltr",
              placeholder: "05xxxxxxxx",
            })}
          </div>
        </Card>
        <Card className={`${softCard} p-5 sm:p-7`}>
          <SectionHeading
            eyebrow="03"
            title={t.careSection}
            description={
              locale === "ar"
                ? "معلومات تنظيمية وصحية أولية فقط."
                : "Administrative and introductory health details only."
            }
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <FieldFrame label={t.branch} required error={error("branchId")}>
              <Select
                aria-label={t.branch}
                disabled={Boolean(assigned)}
                aria-invalid={Boolean(errors.branchId)}
                {...register("branchId")}
              >
                {BRANCHES.filter((b) => !assigned || b.id === assigned).map(
                  (b) => (
                    <option key={b.id} value={b.id}>
                      {locale === "ar" ? b.nameAr : b.nameEn}
                    </option>
                  ),
                )}
              </Select>
            </FieldFrame>
            {edit && (
              <FieldFrame label={t.status} required error={error("status")}>
                <Select aria-label={t.status} {...register("status")}>
                  <option value="active">{t.active}</option>
                  <option value="inactive">{t.inactive}</option>
                </Select>
              </FieldFrame>
            )}
            <FieldFrame label={t.diagnosis} error={error("diagnosisAr")}>
              <TextArea
                aria-label={t.diagnosis}
                rows={2}
                {...register("diagnosisAr")}
              />
            </FieldFrame>
            <FieldFrame label={t.allergies} error={error("allergiesAr")}>
              <TextArea
                aria-label={t.allergies}
                rows={2}
                {...register("allergiesAr")}
              />
            </FieldFrame>
          </div>
        </Card>
        <p className="flex gap-2 rounded-xl border border-brass/30 bg-brass/10 p-4 text-sm leading-6 text-ink">
          <ShieldCheck size={17} className="mt-0.5 shrink-0 text-brass" />
          {t.privacyNote}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {edit ? t.updatePatient : t.savePatient}
          </Button>
          <Button type="button" variant="outline" onClick={goBack}>
            {t.cancel}
          </Button>
        </div>
      </form>
    </main>
  );
}

/** Patient 360 view. All clinical, package, document and financial details are illustrative only. */
export function PatientProfile({ patientId }: { patientId: string }) {
  const router = useRouter();
  const { locale, role } = useWorkspace();
  const { patients, appointments, hydrated } = useClinicData();
  const scoped = ROLE_BRANCH_SCOPE[role];
  const patient = patients.find(
    (p) => p.id === patientId && (!scoped || p.branchId === scoped),
  );
  const [tab, setTab] = useState<ProfileTab>("overview");
  const t = messages[locale].clinic.profile;
  const f = messages[locale].clinic.patientForm;
  const appT = messages[locale].clinic.appointments;
  const patientAppointments = useMemo(
    () =>
      appointments
        .filter((a) => a.patientId === patientId)
        .sort((a, b) =>
          `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`),
        ),
    [appointments, patientId],
  );
  if (!patient && !hydrated)
    return (
      <main dir={locale} className="p-8 text-muted">
        {messages[locale].clinic.common.loading}
      </main>
    );
  if (!patient)
    return (
      <main dir={locale} className="mx-auto max-w-3xl space-y-5 p-6">
        <h1 className="text-3xl font-semibold text-ink">{f.notFound}</h1>
        <Button
          variant="outline"
          onClick={() => router.push(`/${locale}/patients`)}
        >
          {t.back}
        </Button>
      </main>
    );
  const name =
    locale === "ar" ? patient.nameAr : patient.nameEn || patient.nameAr;
  const diagnosis =
    locale === "ar"
      ? patient.diagnosisAr
      : patient.diagnosisEn || patient.diagnosisAr;
  const allergies =
    locale === "ar"
      ? patient.allergiesAr
      : patient.allergiesEn || patient.allergiesAr;
  const tabs: Array<{ id: ProfileTab; label: string }> = [
    { id: "overview", label: t.overview },
    { id: "medical", label: t.medicalRecord },
    { id: "treatmentPlans", label: t.treatmentPlans },
    { id: "appointments", label: t.appointments },
    { id: "packages", label: t.packages },
    { id: "financial", label: t.financial },
    { id: "documents", label: t.documents },
  ];
  const invoiced = 1250 + patient.sessionsTotal * 250;
  const collected =
    900 + Math.max(0, patient.sessionsTotal - patient.sessionsRemaining) * 220;
  const noData = messages[locale].clinic.common.noData;
  const emptyNote =
    locale === "ar"
      ? "عرض توضيحي فقط؛ لا يمثل سجلاً طبياً أو نظاماً مالياً حقيقياً."
      : "Illustrative demo only; this is not a real health record or financial system.";
  const panelTitle = (icon: React.ReactNode, title: string) => (
    <SectionHeading
      title={title}
      action={<span className="text-teal">{icon}</span>}
    />
  );
  const episodeList = (expanded = false) =>
    patient.episodes.length ? (
      <div className="divide-y divide-line">
        {patient.episodes.slice(0, expanded ? undefined : 2).map((ep) => (
          <div key={ep.id} className="flex flex-wrap items-center gap-3 py-4">
            <span className="grid size-10 place-items-center rounded-xl bg-teal-soft text-teal">
              <HeartPulse size={18} />
            </span>
            <div className="min-w-40 flex-1">
              <strong className="block text-sm text-ink">
                {locale === "ar" ? ep.labelAr : ep.labelEn}
              </strong>
              <span className="text-sm text-muted">
                {locale === "ar" ? ep.diagnosisAr : ep.diagnosisEn}
              </span>
            </div>
            <div className="text-end">
              <Badge tone={ep.status === "active" ? "teal" : "neutral"}>
                {ep.status === "active" ? t.activeEpisode : t.dischargedEpisode}
              </Badge>
              <small className="mt-1 block text-muted">
                {formatClinicDate(ep.startedAt, locale)}
              </small>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="py-5 text-sm text-muted">{t.noEpisodes}</p>
    );
  const contactItem = (
    icon: React.ReactNode,
    label: string,
    value: string,
    dir?: "ltr",
  ) => (
    <div className="flex gap-3 py-3">
      <span className="mt-0.5 text-teal">{icon}</span>
      <span className="min-w-0">
        <small className="block text-muted">{label}</small>
        <strong className="break-words text-sm font-medium text-ink" dir={dir}>
          {value || t.emptyValue}
        </strong>
      </span>
    </div>
  );
  const appointmentRows = (list: ClinicAppointment[]) =>
    list.length ? (
      <div className="divide-y divide-line">
        {list.map((a) => (
          <div key={a.id} className="flex flex-wrap items-center gap-3 py-4">
            <span className="grid size-11 place-items-center rounded-xl bg-canvas text-center">
              <strong className="text-sm text-ink">
                {formatClinicDate(a.date, locale, { day: "numeric" })}
              </strong>
            </span>
            <div className="min-w-44 flex-1">
              <strong className="block text-sm text-ink">
                {getServiceName(a.serviceId, locale)}
              </strong>
              <small className="text-muted">
                {getTherapistName(a.therapistId, locale)} ·{" "}
                {getBranchName(a.branchId, locale)}
              </small>
            </div>
            <bdi className="text-sm text-ink" dir="ltr">
              {a.time}
            </bdi>
            <Badge
              tone={
                a.status === "completed"
                  ? "success"
                  : a.status === "cancelled" || a.status === "noShow"
                    ? "neutral"
                    : "teal"
              }
            >
              {appT[a.status]}
            </Badge>
          </div>
        ))}
      </div>
    ) : (
      <EmptyState title={t.noAppointments} />
    );
  return (
    <main
      dir={locale}
      className="mx-auto w-full max-w-[1440px] space-y-6 px-4 py-6 sm:px-7 lg:px-10 lg:py-8"
    >
      <button
        type="button"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink"
        onClick={() => router.push(`/${locale}/patients`)}
      >
        {locale === "ar" ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
        {t.back}
      </button>
      <Card className={`${softCard} overflow-hidden`}>
        <div className="h-1.5 bg-gradient-to-r from-teal via-teal-soft to-brass" />
        <div className="flex flex-col gap-5 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-teal-soft text-lg font-semibold text-teal-deep">
              {getInitials(name)}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                  {name}
                </h1>
                <Badge
                  tone={patient.status === "active" ? "success" : "neutral"}
                >
                  {patient.status === "active" ? t.active : t.inactive}
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted">
                <span>
                  {t.patientId}: <bdi dir="ltr">{patient.id}</bdi>
                </span>
                <span>·</span>
                <span>{getBranchName(patient.branchId, locale)}</span>
                <span>·</span>
                <span>
                  {numberAge(getPatientAge(patient.dateOfBirth), locale)}{" "}
                  {messages[locale].clinic.common.years}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {canManagePatients(role) && (
              <Button
                variant="outline"
                onClick={() =>
                  router.push(`/${locale}/patients/${patient.id}/edit`)
                }
              >
                {messages[locale].clinic.common.edit}
              </Button>
            )}
            {canBookAppointments(role) && patient.status === "active" && (
              <Button
                onClick={() =>
                  router.push(
                    `/${locale}/appointments/new?patientId=${encodeURIComponent(patient.id)}`,
                  )
                }
              >
                <CalendarPlus size={16} />
                {appT.newAppointment}
              </Button>
            )}
          </div>
        </div>
      </Card>
      <div className="grid gap-3 sm:grid-cols-3">
        <StatBlock
          label={t.totalSessions}
          value={formatNumber(patient.sessionsTotal, locale)}
          icon={<UsersRound size={17} />}
          tone="teal"
        />
        <StatBlock
          label={t.remainingSessions}
          value={formatNumber(patient.sessionsRemaining, locale)}
          icon={<CalendarDays size={17} />}
          tone="ink"
        />
        <StatBlock
          label={t.treatmentEpisodes}
          value={formatNumber(patient.episodes.length, locale)}
          icon={<ClipboardList size={17} />}
          tone="brass"
        />
      </div>
      <Tabs
        items={tabs}
        value={tab}
        onChange={(v) => setTab(v as ProfileTab)}
        label={
          locale === "ar" ? "أقسام ملف المريض" : "Patient profile sections"
        }
      />
      {tab === "overview" && (
        <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
          <Card className={`${softCard} p-5 sm:p-7`}>
            {panelTitle(<UsersRound size={17} />, t.contactDetails)}
            <div className="mt-3 grid gap-x-6 sm:grid-cols-2">
              {contactItem(<Phone size={16} />, t.phone, patient.phone, "ltr")}
              {contactItem(<Mail size={16} />, t.email, patient.email, "ltr")}
              {contactItem(
                <MapPin size={16} />,
                t.branch,
                getBranchName(patient.branchId, locale),
              )}
              {contactItem(
                <UsersRound size={16} />,
                t.gender,
                patient.gender === "female" ? f.female : f.male,
              )}
              {contactItem(
                <CalendarDays size={16} />,
                t.dateOfBirth,
                formatClinicDate(patient.dateOfBirth, locale),
              )}
              {contactItem(
                <Phone size={16} />,
                t.emergencyContact,
                patient.emergencyContact,
                "ltr",
              )}
            </div>
          </Card>
          <Card className={`${softCard} p-5 sm:p-7`}>
            {panelTitle(<HeartPulse size={17} />, t.medicalOverview)}
            <div className="mt-4 space-y-4">
              <div className="rounded-xl bg-canvas p-4">
                <small className="text-muted">{t.diagnosis}</small>
                <p className="mt-1 font-medium text-ink">
                  {diagnosis || t.emptyValue}
                </p>
              </div>
              <div className="rounded-xl bg-canvas p-4">
                <small className="text-muted">{t.allergies}</small>
                <p className="mt-1 font-medium text-ink">
                  {allergies === "لا يوجد" || allergies === "None reported"
                    ? t.noAllergies
                    : allergies || t.emptyValue}
                </p>
              </div>
              <p className="flex gap-2 text-xs leading-5 text-muted">
                <ShieldCheck size={15} className="shrink-0 text-teal" />
                {emptyNote}
              </p>
            </div>
          </Card>
          <Card className={`${softCard} p-5 sm:p-7 xl:col-span-2`}>
            {panelTitle(<ClipboardList size={17} />, t.episodes)}
            {episodeList()}
          </Card>
        </div>
      )}
      {tab === "medical" && (
        <Card className={`${softCard} p-5 sm:p-7`}>
          <SectionHeading
            title={t.medicalOverview}
            description={emptyNote}
            action={<HeartPulse size={18} className="text-teal" />}
          />
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <InfoTile label={t.diagnosis} value={diagnosis || t.emptyValue} />
            <InfoTile
              label={t.allergies}
              value={
                allergies === "لا يوجد" || allergies === "None reported"
                  ? t.noAllergies
                  : allergies || t.emptyValue
              }
            />
            <InfoTile
              label={t.gender}
              value={patient.gender === "female" ? f.female : f.male}
            />
          </div>
          <div className="mt-6">{episodeList(true)}</div>
        </Card>
      )}
      {tab === "treatmentPlans" && (
        <Card className={`${softCard} p-5 sm:p-7`}>
          <SectionHeading
            title={t.episodes}
            description={emptyNote}
            action={<ClipboardList size={18} className="text-teal" />}
          />
          {episodeList(true)}
        </Card>
      )}
      {tab === "appointments" && (
        <Card className={`${softCard} p-5 sm:p-7`}>
          <SectionHeading
            title={t.appointmentsHeading}
            action={<CalendarDays size={18} className="text-teal" />}
          />
          {appointmentRows(patientAppointments)}
        </Card>
      )}
      {tab === "packages" && (
        <Card className={`${softCard} p-5 sm:p-7`}>
          <SectionHeading
            title={t.packagesHeading}
            description={emptyNote}
            action={<UsersRound size={18} className="text-teal" />}
          />
          {patient.sessionsTotal > 0 ? (
            <div className="mt-5 max-w-2xl rounded-2xl border border-line bg-canvas p-5">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <strong className="text-ink">{t.packageName}</strong>
                  <small className="mt-1 block text-muted">
                    {patient.id} · {getBranchName(patient.branchId, locale)}
                  </small>
                </div>
                <Badge tone="teal">{t.active}</Badge>
              </div>
              <div className="mt-6 flex justify-between text-sm text-muted">
                <span>
                  {t.totalSessions}:{" "}
                  {formatNumber(patient.sessionsTotal, locale)}
                </span>
                <span>
                  {t.remainingSessions}:{" "}
                  {formatNumber(patient.sessionsRemaining, locale)}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-teal"
                  style={{
                    width: `${Math.max(0, ((patient.sessionsTotal - patient.sessionsRemaining) / patient.sessionsTotal) * 100)}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-muted">
                {formatNumber(
                  patient.sessionsTotal - patient.sessionsRemaining,
                  locale,
                )}{" "}
                {t.packageUsage}
              </p>
            </div>
          ) : (
            <p className="mt-5 text-sm text-muted">{noData}</p>
          )}
        </Card>
      )}
      {tab === "financial" && (
        <Card className={`${softCard} p-5 sm:p-7`}>
          <SectionHeading
            title={t.financialHeading}
            description={emptyNote}
            action={<CreditCard size={18} className="text-teal" />}
          />
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <InfoTile
              label={t.totalInvoiced}
              value={formatCurrency(invoiced, locale)}
            />
            <InfoTile
              label={t.totalCollected}
              value={formatCurrency(collected, locale)}
            />
            <InfoTile
              label={t.balance}
              value={formatCurrency(Math.max(0, invoiced - collected), locale)}
            />
          </div>
        </Card>
      )}
      {tab === "documents" && (
        <Card className={`${softCard} p-5 sm:p-7`}>
          <SectionHeading
            title={t.documentsHeading}
            description={emptyNote}
            action={<FileText size={18} className="text-teal" />}
          />
          <div className="mt-5 divide-y divide-line">
            {[t.documentAssessment, t.documentConsent].map((title) => (
              <div key={title} className="flex items-center gap-3 py-4">
                <span className="grid size-10 place-items-center rounded-xl bg-teal-soft text-teal">
                  <FileText size={17} />
                </span>
                <span className="flex-1">
                  <strong className="block text-sm text-ink">{title}</strong>
                  <small className="text-muted">
                    {t.documentDate}:{" "}
                    {formatClinicDate(patient.createdAt, locale)}
                  </small>
                </span>
                <Badge tone="neutral">{t.viewDocument}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
      <p className="flex items-start gap-2 rounded-xl border border-brass/30 bg-brass/10 p-4 text-xs leading-5 text-ink">
        <ShieldCheck size={15} className="mt-0.5 shrink-0 text-brass" />
        {emptyNote} {messages[locale].app.demoModeDescription}
      </p>
    </main>
  );
}
function numberAge(value: number, locale: "ar" | "en") {
  return formatNumber(value, locale);
}
function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-canvas p-4">
      <small className="block text-muted">{label}</small>
      <strong className="mt-1 block text-sm font-medium text-ink">
        {value}
      </strong>
    </div>
  );
}
