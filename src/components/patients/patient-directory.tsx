"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Download,
  RotateCcw,
  Search,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { SelectField } from "@/components/ui/select-field";
import { PageHeading } from "@/components/shared/page-heading";
import { useClinicData } from "@/services/clinic-data-provider";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { messages } from "@/lib/i18n/messages";
import { DEMO_TODAY } from "@/lib/mock/clinic-seed";
import { formatClinicDate, getBranchName, getInitials } from "@/lib/clinic-utils";
import { formatNumber } from "@/lib/utils";
import { canManagePatients } from "@/lib/config/roles";
import type { PatientStatus } from "@/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

type StatusFilter = "all" | PatientStatus;
type PatientSort = "recent" | "name" | "lastVisit";

export function PatientDirectory() {
  const router = useRouter();
  const { locale, branchId, role } = useWorkspace();
  const { patients, resetDemoData } = useClinicData();
  const t = messages[locale].clinic.patients;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<PatientSort>("recent");
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState("");
  const canAdd = canManagePatients(role);
  const canReset = role === "owner";

  const branchPatients = useMemo(
    () => patients.filter((patient) => branchId === "all" || patient.branchId === branchId),
    [branchId, patients],
  );
  const filteredPatients = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    const result = branchPatients
      .filter((patient) => statusFilter === "all" || patient.status === statusFilter)
      .filter((patient) => {
        if (!normalizedSearch) return true;
        return [patient.id, patient.nameAr, patient.nameEn, patient.phone, patient.email]
          .some((value) => value.toLocaleLowerCase().includes(normalizedSearch));
      });
    return result.sort((left, right) => {
      if (sortBy === "name") {
        return (locale === "ar" ? left.nameAr : left.nameEn).localeCompare(locale === "ar" ? right.nameAr : right.nameEn, locale);
      }
      if (sortBy === "lastVisit") {
        return (right.lastVisit ?? "").localeCompare(left.lastVisit ?? "");
      }
      return right.createdAt.localeCompare(left.createdAt);
    });
  }, [branchPatients, locale, search, sortBy, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredPatients.length / PAGE_SIZE));
  const visiblePatients = filteredPatients.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activeCount = branchPatients.filter((patient) => patient.status === "active").length;
  const newCount = branchPatients.filter((patient) => patient.createdAt.slice(0, 7) === DEMO_TODAY.slice(0, 7)).length;
  const numberFormat = (value: number) => formatNumber(value, locale);

  function exportCsv() {
    const rows = [
      [t.patientId, t.patient, t.contact, t.branch, t.status, t.lastVisit],
      ...filteredPatients.map((patient) => [
        patient.id,
        locale === "ar" ? patient.nameAr : patient.nameEn,
        patient.phone,
        getBranchName(patient.branchId, locale),
        patient.status === "active" ? t.activeStatus : t.inactiveStatus,
        patient.lastVisit ? formatClinicDate(patient.lastVisit, locale) : t.noVisit,
      ]),
    ];
    const csv = `\uFEFF${rows
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\r\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "ehteraf-patients-demo.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function resetData() {
    if (!window.confirm(t.resetConfirm)) return;
    resetDemoData();
    setSearch("");
    setStatusFilter("all");
    setSortBy("recent");
    setPage(1);
    setNotice(t.resetDemo);
  }

  const start = filteredPatients.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const end = Math.min(page * PAGE_SIZE, filteredPatients.length);

  return (
    <div className="feature-page">
      <PageHeading
        eyebrow={messages[locale].nav.patients}
        title={t.title}
        description={t.subtitle}
        actions={(
          <>
            <Button variant="outline" onClick={exportCsv}>
              <Download size={16} />
              {t.exportCsv}
            </Button>
            {canReset ? (
              <Button variant="ghost" onClick={resetData} title={t.resetDemo}>
                <RotateCcw size={16} />
                <span className="desktop-action-label">{t.resetDemo}</span>
              </Button>
            ) : null}
            {canAdd ? (
              <Button onClick={() => router.push(`/${locale}/patients/new`)}>
                <UserPlus size={16} />
                {t.addPatient}
              </Button>
            ) : null}
          </>
        )}
      />

      {notice ? <div className="inline-success" role="status">{notice}</div> : null}

      <div className="feature-stat-grid">
        <SummaryCard icon={<UsersRound size={18} />} label={t.total} value={numberFormat(branchPatients.length)} tone="teal" />
        <SummaryCard icon={<Activity size={18} />} label={t.active} value={numberFormat(activeCount)} tone="blue" />
        <SummaryCard icon={<UserPlus size={18} />} label={t.newThisMonth} value={numberFormat(newCount)} tone="violet" />
      </div>

      <Panel className="data-panel">
        <div className="data-panel-toolbar">
          <label className="data-search">
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
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
              onChange={(event) => {
                setStatusFilter(event.target.value as StatusFilter);
                setPage(1);
              }}
            >
              <option value="all">{t.allStatuses}</option>
              <option value="active">{t.activeStatus}</option>
              <option value="inactive">{t.inactiveStatus}</option>
            </SelectField>
            <SelectField
              className="data-filter-select patient-sort-select"
              aria-label={t.sortBy}
              value={sortBy}
              onChange={(event) => { setSortBy(event.target.value as PatientSort); setPage(1); }}
            >
              <option value="recent">{t.sortRecent}</option>
              <option value="name">{t.sortName}</option>
              <option value="lastVisit">{t.sortLastVisit}</option>
            </SelectField>
            {branchId === "all" ? (
              <span className="branch-filter-note">{t.allBranches}</span>
            ) : (
              <span className="branch-filter-note">{getBranchName(branchId, locale)}</span>
            )}
          </div>
        </div>

        {visiblePatients.length ? (
          <div className="table-scroll-area">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t.patient}</th>
                  <th>{t.contact}</th>
                  <th>{t.branch}</th>
                  <th>{t.lastVisit}</th>
                  <th>{t.sessions}</th>
                  <th>{t.status}</th>
                  <th><span className="sr-only">{t.actions}</span></th>
                </tr>
              </thead>
              <tbody>
                {visiblePatients.map((patient) => {
                  const displayName = locale === "ar" ? patient.nameAr : patient.nameEn || patient.nameAr;
                  return (
                    <tr
                      className="patient-table-row"
                      key={patient.id}
                      onClick={() => router.push(`/${locale}/patients/${patient.id}`)}
                    >
                      <td>
                        <div className="table-person">
                          <span className={cn("table-avatar", patient.gender === "female" ? "avatar-violet" : "avatar-teal")}>
                            {getInitials(displayName)}
                          </span>
                          <span className="table-person-copy">
                            <strong>{displayName}</strong>
                            <small>{patient.id}</small>
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="table-contact">
                          <strong dir="ltr">{patient.phone}</strong>
                          <small dir="ltr">{patient.email}</small>
                        </span>
                      </td>
                      <td>{getBranchName(patient.branchId, locale)}</td>
                      <td>{patient.lastVisit ? formatClinicDate(patient.lastVisit, locale) : t.noVisit}</td>
                      <td>
                        <span className="session-pill">
                          {numberFormat(patient.sessionsRemaining)} {t.sessionsRemaining}
                        </span>
                      </td>
                      <td>
                        <span className={cn("record-status", patient.status === "active" ? "record-status-active" : "record-status-inactive")}>
                          <span />
                          {patient.status === "active" ? t.activeStatus : t.inactiveStatus}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="table-open-button"
                          aria-label={`${t.viewProfile}: ${displayName}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            router.push(`/${locale}/patients/${patient.id}`);
                          }}
                        >
                          {locale === "ar" ? <ChevronLeft size={17} /> : <ChevronRight size={17} />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-empty-state">
            <span className="empty-state-icon"><UsersRound size={22} /></span>
            <strong>{search || statusFilter !== "all" ? t.noResults : t.emptyTitle}</strong>
            <p>{search || statusFilter !== "all" ? t.noResults : t.emptyDescription}</p>
            {!search && statusFilter === "all" && canAdd ? (
              <Button size="sm" onClick={() => router.push(`/${locale}/patients/new`)}>
                <UserPlus size={15} />
                {t.addPatient}
              </Button>
            ) : null}
          </div>
        )}

        <div className="table-pagination">
          <span>{t.showing} {numberFormat(start)}–{numberFormat(end)} {t.of} {numberFormat(filteredPatients.length)} {t.countLabel}</span>
          <div className="pagination-controls">
            <span>{t.page} {numberFormat(page)} / {numberFormat(pageCount)}</span>
            <Button
              size="icon"
              variant="outline"
              aria-label={t.previous}
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              {locale === "ar" ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </Button>
            <Button
              size="icon"
              variant="outline"
              aria-label={t.next}
              disabled={page >= pageCount}
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
            >
              {locale === "ar" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </Button>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "teal" | "blue" | "violet";
}) {
  return (
    <Panel className="feature-stat-card">
      <span className={`feature-stat-icon stat-icon-${tone}`}>{icon}</span>
      <span className="feature-stat-copy">
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
    </Panel>
  );
}
