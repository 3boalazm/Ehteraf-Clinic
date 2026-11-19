"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Check,
  CircleCheck,
  Download,
  FlaskConical,
  Inbox,
  Plus,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { getBranchName } from "@/lib/clinic-utils";
import { ROLE_BRANCH_SCOPE, ROLE_IDS } from "@/lib/config/roles";
import { workspaceCopy, type WorkspaceKey } from "@/lib/i18n/workspace-copy";
import { BRANCHES } from "@/lib/mock/branches";
import { DEMO_TODAY } from "@/lib/mock/clinic-seed";
import { BRANCH_STATS } from "@/lib/mock/dashboard-data";
import {
  getWorkspaceRecords,
  type WorkspaceRecord,
  type WorkspaceStatus,
} from "@/lib/mock/workspace-data";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useClinicData } from "@/services/clinic-data-provider";
import { useApp } from "@/shell/use-app";
import {
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
  Switch,
  Tabs,
  Toast,
  type Tone,
} from "@/ui";
import type { BranchId, Locale, RoleId } from "@/types";

const PATH_KEYS: Record<string, WorkspaceKey> = {
  branches: "branches",
  clinical: "clinical",
  "treatment-plans": "treatmentPlans",
  services: "services",
  packages: "packages",
  finance: "finance",
  inventory: "inventory",
  procurement: "procurement",
  employees: "employees",
  hr: "employees",
  reports: "reports",
  marketing: "marketing",
  notifications: "notifications",
  settings: "settings",
};

const STATUS_TONES: Record<WorkspaceStatus, Tone | "outline"> = {
  active: "mint",
  pending: "sky",
  review: "lilac",
  completed: "sand",
  draft: "outline",
  attention: "peach",
  unread: "lime",
  read: "sand",
  scheduled: "sky",
  inProgress: "lime",
  lowStock: "peach",
};
const LIVE: WorkspaceStatus[] = ["active", "inProgress", "pending", "scheduled", "unread"];
const NEEDS_ATTENTION: WorkspaceStatus[] = ["attention", "review", "lowStock", "unread"];
const STAT_TONES: Array<Tone | undefined> = ["lime", undefined, "lilac", "mint"];

export function WorkspacePage({ path }: { path: string }) {
  const key = PATH_KEYS[path.split("/")[0]] ?? "reports";
  if (key === "branches") return <BranchesWorkspace />;
  if (key === "settings") return <SettingsWorkspace />;
  return <RecordsWorkspace workspaceKey={key} />;
}

function useCopy() {
  const app = useApp();
  return { app, copy: workspaceCopy[app.locale] };
}

function useToast() {
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);
  return [toast, setToast] as const;
}

function Eyebrow() {
  const { copy } = useCopy();
  return (
    <>
      <FlaskConical /> {copy.suiteLabel} · {copy.demoBadge}
    </>
  );
}

/* ==========================================================================
   Generic records workspace
   ========================================================================== */
function metricsFor(key: WorkspaceKey, rows: WorkspaceRecord[], locale: Locale): string[] {
  const n = (value: number) => formatNumber(Math.round(value * 10) / 10, locale);
  const count = (...statuses: WorkspaceStatus[]) => rows.filter((row) => statuses.includes(row.status)).length;
  const sum = (field: "amount" | "metric" | "units" | "audience", list = rows) =>
    list.reduce((total, row) => total + (row[field] ?? 0), 0);
  const avg = (field: "amount" | "metric") => (rows.length ? sum(field) / rows.length : 0);
  const unique = (pick: (row: WorkspaceRecord) => string | undefined) => new Set(rows.map(pick).filter(Boolean)).size;
  const category = (word: string) => rows.filter((row) => row.categoryEn.toLowerCase().includes(word)).length;

  switch (key) {
    case "clinical":
      return [n(rows.length), n(count("review", "pending")), n(count("completed")), n(count("attention"))];
    case "treatmentPlans":
      return [n(rows.length), n(count("inProgress")), n(count("review")), n(sum("units"))];
    case "services":
      return [n(rows.length), n(count("active")), n(avg("metric")), formatCurrency(avg("amount"), locale)];
    case "packages":
      return [n(rows.length), n(count("active")), n(sum("metric")), formatCurrency(avg("amount"), locale)];
    case "finance":
      return [
        n(rows.length),
        n(count("pending", "review")),
        formatCurrency(sum("amount", rows.filter((row) => row.status === "completed")), locale),
        n(count("attention")),
      ];
    case "inventory":
      return [n(rows.length), n(count("lowStock")), n(sum("metric")), n(count("pending"))];
    case "procurement":
      return [n(rows.length), n(count("review")), n(count("completed")), formatCurrency(sum("amount"), locale)];
    case "employees":
      return [n(rows.length), n(unique((row) => row.categoryEn)), n(count("active")), n(unique((row) => row.branchId))];
    case "reports":
      return [n(rows.length), n(count("active", "completed")), n(count("scheduled")), n(count("completed"))];
    case "marketing":
      return [n(rows.length), n(count("active")), n(sum("audience")), `${n(avg("metric"))}%`];
    case "notifications":
      return [n(rows.length), n(count("unread")), n(category("appointment")), n(category("task"))];
    default:
      return [n(rows.length), n(count(...LIVE)), n(count(...NEEDS_ATTENTION)), n(count("completed"))];
  }
}

function RecordsWorkspace({ workspaceKey }: { workspaceKey: WorkspaceKey }) {
  const { app, copy } = useCopy();
  const { locale } = app;
  const page = copy.pages[workspaceKey];
  const isInbox = workspaceKey === "notifications";
  const [records, setRecords] = useState<WorkspaceRecord[]>(() => getWorkspaceRecords(workspaceKey));
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "live" | "attention">("all");
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ name: "", detail: "", category: "" });
  const [toast, setToast] = useToast();

  const scoped = useMemo(
    () => records.filter((row) => app.branchId === "all" || !row.branchId || row.branchId === app.branchId),
    [records, app.branchId],
  );
  const rows = useMemo(() => {
    const needle = (query || app.searchQuery).trim().toLocaleLowerCase();
    return scoped.filter((row) => {
      if (filter === "live" && !LIVE.includes(row.status)) return false;
      if (filter === "attention" && !NEEDS_ATTENTION.includes(row.status)) return false;
      if (!needle) return true;
      return `${row.id} ${row.titleAr} ${row.titleEn} ${row.categoryAr} ${row.categoryEn} ${copy.statuses[row.status]}`
        .toLocaleLowerCase()
        .includes(needle);
    });
  }, [scoped, filter, query, app.searchQuery, copy.statuses]);

  const metrics = metricsFor(workspaceKey, scoped, locale);
  const attention = scoped.filter((row) => NEEDS_ATTENTION.includes(row.status));
  const doneShare = scoped.length
    ? (scoped.filter((row) => ["completed", "read", "active"].includes(row.status)).length / scoped.length) * 100
    : 0;

  const valueOf = (row: WorkspaceRecord) =>
    row.amount !== undefined
      ? formatCurrency(row.amount, locale)
      : app.pick(row.valueAr ?? "", row.valueEn ?? "") || (row.metric !== undefined ? formatNumber(row.metric, locale) : "—");

  const advance = (row: WorkspaceRecord) => {
    const next: WorkspaceStatus = isInbox
      ? row.status === "unread"
        ? "read"
        : "unread"
      : row.status === "completed"
        ? "active"
        : "completed";
    setRecords((current) => current.map((item) => (item.id === row.id ? { ...item, status: next } : item)));
  };
  const actionLabel = (row: WorkspaceRecord) =>
    isInbox
      ? row.status === "unread"
        ? copy.markRead
        : copy.markUnread
      : row.status === "completed"
        ? copy.activateItem
        : copy.markDone;

  const exportCsv = () => {
    const header = [copy.reference, copy.record, copy.category, copy.branch, copy.value, copy.status];
    const lines = rows.map((row) =>
      [
        row.id,
        app.pick(row.titleAr, row.titleEn),
        app.pick(row.categoryAr, row.categoryEn),
        row.branchId ? getBranchName(row.branchId, locale) : "",
        valueOf(row),
        copy.statuses[row.status],
      ]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob([`﻿${[header.join(","), ...lines].join("\n")}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ehteraf-${workspaceKey}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setToast(copy.exportReady);
  };

  const create = () => {
    if (!draft.name.trim()) return;
    const record: WorkspaceRecord = {
      id: `NEW-${String(records.length + 1).padStart(3, "0")}`,
      titleAr: draft.name.trim(),
      titleEn: draft.name.trim(),
      detailAr: draft.detail.trim(),
      detailEn: draft.detail.trim(),
      categoryAr: draft.category.trim() || "—",
      categoryEn: draft.category.trim() || "—",
      status: isInbox ? "unread" : "draft",
      branchId: app.branchId === "all" ? undefined : app.branchId,
    };
    setRecords((current) => [record, ...current]);
    setDraft({ name: "", detail: "", category: "" });
    setCreating(false);
  };

  return (
    <>
      <PageHead
        eyebrow={<Eyebrow />}
        title={page.heading}
        subtitle={page.description}
        actions={
          <>
            <Button icon={<Download />} onClick={exportCsv}>
              {copy.exportView}
            </Button>
            <Button variant="ink" icon={<Plus />} onClick={() => setCreating(true)}>
              {page.addLabel}
            </Button>
          </>
        }
      />

      <div className="bento">
        {page.metricLabels.map((label, index) => (
          <StatCard key={label} className="span-3" tone={STAT_TONES[index]} label={label} value={metrics[index]} />
        ))}

        <Card className="span-8">
          <CardHead title={page.sectionTitle} hint={page.sectionDescription} />
          <div className="toolbar">
            <SearchBox value={query} onChange={setQuery} placeholder={copy.searchPlaceholder} />
            <div className="toolbar__end">
              <Tabs
                filled
                value={filter}
                onChange={setFilter}
                options={[
                  { value: "all", label: copy.filterAll },
                  { value: "live", label: isInbox ? copy.notificationsUnreadOnly : copy.filterActive },
                  { value: "attention", label: copy.filterAttention },
                ]}
              />
              {isInbox ? (
                <IconButton
                  label={copy.notificationsMarkAll}
                  variant="soft"
                  size="sm"
                  onClick={() =>
                    setRecords((current) =>
                      current.map((row) => (row.status === "unread" ? { ...row, status: "read" } : row)),
                    )
                  }
                >
                  <Check />
                </IconButton>
              ) : null}
              <IconButton
                label={app.t.clinic.common.reset}
                variant="soft"
                size="sm"
                onClick={() => setRecords(getWorkspaceRecords(workspaceKey))}
              >
                <RotateCcw />
              </IconButton>
            </div>
          </div>

          {rows.length === 0 ? (
            <Empty icon={<Inbox />} title={copy.noResultsTitle} description={copy.noResultsDescription} />
          ) : (
            <div className="table-wrap">
              <table className="table" style={{ minWidth: 540 }}>
                <thead>
                  <tr>
                    <th>{copy.record}</th>
                    <th>{copy.category}</th>
                    <th>{copy.value}</th>
                    <th>{copy.status}</th>
                    <th>
                      <span className="sr-only">{copy.actions}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <div className="cell-main">
                          <div>
                            <b>{app.pick(row.titleAr, row.titleEn)}</b>
                            <span>
                              {row.id} · {app.pick(row.detailAr, row.detailEn)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        {app.pick(row.categoryAr, row.categoryEn)}
                        {row.branchId ? <span className="sub">{getBranchName(row.branchId, locale)}</span> : null}
                      </td>
                      <td>
                        <b style={{ fontWeight: 550 }}>{valueOf(row)}</b>
                      </td>
                      <td>
                        <Badge tone={STATUS_TONES[row.status]}>{copy.statuses[row.status]}</Badge>
                      </td>
                      <td>
                        <div className="cell-actions">
                          <IconButton label={actionLabel(row)} size="sm" onClick={() => advance(row)}>
                            {row.status === "completed" || row.status === "read" ? <RotateCcw /> : <Check />}
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="pager">
            <span>
              {copy.totalLabel}: {formatNumber(rows.length, locale)} {copy.totalRecords}
            </span>
          </div>
        </Card>

        <div className="span-4 stack" style={{ gap: 14 }}>
          <Card tone="ink">
            <Bubble tone="lime">
              <Sparkles />
            </Bubble>
            <h2 className="t-title">{page.insightTitle}</h2>
            <p className="t-label">{page.insightDescription}</p>
            <div className="stack" style={{ gap: 8 }}>
              <div className="row row--between t-small">
                <span>{copy.progressLabel}</span>
                <b>{formatNumber(Math.round(doneShare), locale)}%</b>
              </div>
              <div className="progress progress--lime" style={{ background: "rgba(255,255,255,.14)" }}>
                <i style={{ width: `${doneShare}%` }} />
              </div>
            </div>
          </Card>
          <Card tone="peach">
            <CardHead title={copy.attentionTitle} />
            {attention.length === 0 ? (
              <p className="t-label">{copy.attentionEmpty}</p>
            ) : (
              <div className="list">
                {attention.slice(0, 4).map((row) => (
                  <div key={row.id} className="list__row" style={{ borderColor: "rgba(20,21,22,.1)" }}>
                    <div className="list__main">
                      <b>{app.pick(row.titleAr, row.titleEn)}</b>
                      <span style={{ color: "inherit", opacity: 0.65 }}>{copy.statuses[row.status]}</span>
                    </div>
                    <IconButton label={actionLabel(row)} size="sm" variant="ink" onClick={() => advance(row)}>
                      <Check />
                    </IconButton>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <Notice icon={<FlaskConical />}>{copy.demoNotice}</Notice>

      {creating ? (
        <div className="modal" role="dialog" aria-modal="true" aria-label={copy.createDialogTitle}>
          <Card className="modal__panel">
            <CardHead
              title={copy.createDialogTitle}
              hint={copy.createDialogDescription}
              actions={
                <IconButton label={copy.cancelButton} size="sm" variant="soft" onClick={() => setCreating(false)}>
                  <X />
                </IconButton>
              }
            />
            <Field label={copy.nameField}>
              <Input autoFocus value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
            </Field>
            <Field label={copy.detailField}>
              <Input value={draft.detail} onChange={(event) => setDraft({ ...draft, detail: event.target.value })} />
            </Field>
            <Field label={copy.categoryField}>
              <Input value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} />
            </Field>
            <div className="row" style={{ justifyContent: "flex-end" }}>
              <Button variant="soft" onClick={() => setCreating(false)}>
                {copy.cancelButton}
              </Button>
              <Button variant="ink" arrow disabled={!draft.name.trim()} onClick={create}>
                {copy.createButton}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}

      {toast ? (
        <Toast>
          <CircleCheck size={16} /> {toast}
        </Toast>
      ) : null}
    </>
  );
}

/* ==========================================================================
   Branches
   ========================================================================== */
function BranchesWorkspace() {
  const { app, copy } = useCopy();
  const { locale } = app;
  const page = copy.pages.branches;
  const { patients, appointments } = useClinicData();
  const scopedBranch = ROLE_BRANCH_SCOPE[app.role];
  const branches = BRANCHES.filter((branch) => app.branchId === "all" || branch.id === app.branchId);
  const tones: Tone[] = ["mint", "sky", "lilac"];
  const todayCount = (id: string) =>
    appointments.filter((item) => item.branchId === id && item.date === DEMO_TODAY && item.status !== "cancelled").length;
  const patientCount = (id: string) => patients.filter((item) => item.branchId === id).length;
  const occupancy = branches.length
    ? branches.reduce((total, branch) => total + BRANCH_STATS[branch.id].occupancy, 0) / branches.length
    : 0;

  const metrics = [
    formatNumber(branches.length, locale),
    formatNumber(branches.reduce((total, branch) => total + patientCount(branch.id), 0), locale),
    formatNumber(branches.reduce((total, branch) => total + todayCount(branch.id), 0), locale),
    `${formatNumber(Math.round(occupancy), locale)}%`,
  ];

  return (
    <>
      <PageHead eyebrow={<Eyebrow />} title={page.heading} subtitle={page.description} />
      <div className="bento">
        {page.metricLabels.map((label, index) => (
          <StatCard key={label} className="span-3" tone={STAT_TONES[index]} label={label} value={metrics[index]} />
        ))}
        {branches.map((branch, index) => {
          const stats = BRANCH_STATS[branch.id];
          const focused = app.branchId === branch.id;
          return (
            <Card key={branch.id} tone={tones[index % tones.length]} className="span-4">
              <div className="row row--between">
                <Bubble tone="glass">
                  <Building2 />
                </Bubble>
                <Badge tone={focused ? "ink" : "outline"} plain>
                  {focused ? copy.branchScope : copy.branchActive}
                </Badge>
              </div>
              <div>
                <h2 className="t-title">{app.pick(branch.nameAr, branch.nameEn)}</h2>
                <span className="t-label">
                  {app.pick(branch.cityAr, branch.cityEn)} · {copy.branchPreview}
                </span>
              </div>
              <div className="stat-row">
                <div>
                  <b>{formatNumber(patientCount(branch.id), locale)}</b>
                  <span>{copy.patientsLabel}</span>
                </div>
                <div>
                  <b>{formatNumber(todayCount(branch.id), locale)}</b>
                  <span>{copy.appointmentsTodayLabel}</span>
                </div>
              </div>
              <div className="stack" style={{ gap: 8 }}>
                <div className="row row--between t-small">
                  <span>{app.t.dashboard.branchOccupancy}</span>
                  <b>{formatNumber(stats.occupancy, locale)}%</b>
                </div>
                <Progress value={stats.occupancy} />
              </div>
              <div className="row row--between t-small">
                <span>{app.t.dashboard.collected}</span>
                <b>
                  {formatCurrency(stats.collected, locale)} / {formatCurrency(stats.revenue, locale)}
                </b>
              </div>
              {!scopedBranch ? (
                <Button
                  variant="ink"
                  arrow={!focused}
                  onClick={() => app.setBranchId(focused ? "all" : branch.id)}
                >
                  {focused ? app.t.dashboard.returnToGroupScope : copy.viewBranch}
                </Button>
              ) : null}
            </Card>
          );
        })}
      </div>
      <Notice icon={<FlaskConical />}>{copy.branchAssignmentNotice}</Notice>
    </>
  );
}

/* ==========================================================================
   Settings
   ========================================================================== */
function SettingsWorkspace() {
  const { app, copy } = useCopy();
  const page = copy.pages.settings;
  const pathname = usePathname() ?? "";
  const [digest, setDigest] = useState(true);
  const [alerts, setAlerts] = useState(true);
  const [toast, setToast] = useToast();
  const roleLabels = app.t.roles as Record<RoleId, string>;
  const scopedBranch = ROLE_BRANCH_SCOPE[app.role];
  const otherLocale: Locale = app.ar ? "en" : "ar";
  const switchHref = `/${[otherLocale, ...pathname.split("/").filter(Boolean).slice(1)].join("/")}`;

  const metrics = [
    app.ar ? "العربية" : "English",
    app.theme === "dark" ? copy.themeDark : copy.themeLight,
    roleLabels[app.role],
    getBranchName(app.branchId, app.locale),
  ];

  const toggleRow = (label: string, checked: boolean, onChange: (value: boolean) => void) => (
    <div className="pill-row">
      <span className="grow" style={{ paddingInlineStart: 8 }}>
        {label}
      </span>
      <span className="t-small t-muted">{checked ? copy.enabled : copy.disabled}</span>
      <Switch checked={checked} onChange={onChange} label={label} />
    </div>
  );

  return (
    <>
      <PageHead
        eyebrow={<Eyebrow />}
        title={page.heading}
        subtitle={page.description}
        actions={
          <Button variant="ink" icon={<Check />} onClick={() => setToast(copy.settingsSaved)}>
            {copy.savePreferences}
          </Button>
        }
      />
      <div className="bento">
        {page.metricLabels.map((label, index) => (
          <Card key={label} tone={STAT_TONES[index]} className="span-3">
            <span className="t-label">{label}</span>
            <div className="card__grow" style={{ minHeight: 20 }} />
            <b className="t-title">{metrics[index]}</b>
          </Card>
        ))}

        <Card className="span-6">
          <CardHead title={copy.settingsAppearance} />
          <div className="field">
            <span className="field__label">{copy.settingsLanguage}</span>
            <div className="choices">
              <button type="button" className="choice" aria-pressed>
                {app.ar ? "العربية" : "English"}
              </button>
              <Link className="choice" href={switchHref} style={{ display: "inline-flex", alignItems: "center" }}>
                {app.ar ? "English" : "العربية"}
              </Link>
            </div>
          </div>
          <div className="field">
            <span className="field__label">{copy.settingsTheme}</span>
            <Tabs
              filled
              value={app.theme}
              onChange={app.setTheme}
              options={[
                { value: "light", label: copy.themeLight },
                { value: "dark", label: copy.themeDark },
              ]}
            />
          </div>
          {toggleRow(copy.settingsCompactSidebar, app.sidebarCollapsed, app.setSidebarCollapsed)}
        </Card>

        <Card className="span-6">
          <CardHead title={copy.settingsWorkspace} />
          <div className="form-grid">
            <Field label={copy.settingsRole}>
              <Select
                value={app.role}
                onChange={(event) => {
                  const role = event.target.value as RoleId;
                  app.setRole(role);
                  const scope = ROLE_BRANCH_SCOPE[role];
                  if (scope) app.setBranchId(scope);
                }}
              >
                {ROLE_IDS.map((role) => (
                  <option key={role} value={role}>
                    {roleLabels[role]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={copy.branchScope}>
              <Select
                value={app.branchId}
                disabled={Boolean(scopedBranch)}
                onChange={(event) => app.setBranchId(event.target.value as BranchId)}
              >
                <option value="all">{app.t.app.allBranches}</option>
                {BRANCHES.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {app.pick(branch.nameAr, branch.nameEn)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <p className="t-small t-muted">{page.insightDescription}</p>
        </Card>

        <Card className="span-6">
          <CardHead title={copy.settingsNotifications} />
          {toggleRow(copy.settingsWeeklyDigest, digest, setDigest)}
          {toggleRow(copy.settingsAppointmentAlerts, alerts, setAlerts)}
        </Card>

        <Card tone="ink" className="span-6">
          <Bubble tone="lime">
            <Sparkles />
          </Bubble>
          <h2 className="t-title">{copy.settingsPrivacy}</h2>
          <p className="t-label">{copy.settingsDataNote}</p>
          <div className="card__grow" />
          <Button variant="lime" arrow href={app.href("/dashboard")}>
            {app.t.app.backToDashboard}
          </Button>
        </Card>
      </div>
      {toast ? (
        <Toast>
          <CircleCheck size={16} /> {toast}
        </Toast>
      ) : null}
    </>
  );
}
