"use client";

import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  ArrowDownToLine,
  Bell,
  Building2,
  Check,
  CheckCheck,
  ChevronRight,
  ClipboardList,
  FileText,
  Filter,
  HeartPulse,
  Languages,
  Megaphone,
  Package,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
  Wallet,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { useClinicData } from "@/services/clinic-data-provider";
import { BRANCHES } from "@/lib/mock/branches";
import { DEMO_TODAY } from "@/lib/mock/clinic-seed";
import {
  getWorkspaceRecords,
  type WorkspaceRecord,
  type WorkspaceStatus,
} from "@/lib/mock/workspace-data";
import {
  canAccessModule,
  ROLE_BRANCH_SCOPE,
  ROLE_IDS,
} from "@/lib/config/roles";
import { messages } from "@/lib/i18n/messages";
import {
  workspaceCopy,
  type WorkspaceKey,
  type WorkspaceLocaleCopy,
} from "@/lib/i18n/workspace-copy";
import type { BranchId, Locale, ModuleId, RoleId } from "@/types";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Button } from "@/design-system/button";
import { Card } from "@/design-system/card";
import { Badge } from "@/design-system/badge";
import { FieldFrame, Select, TextInput } from "@/design-system/fields";
import {
  DataTableFrame,
  EmptyState,
  SectionHeading,
  StatBlock,
} from "@/design-system/blocks";
import { Tabs } from "@/design-system/tabs";

const MODULES: Record<WorkspaceKey, { icon: LucideIcon; module: ModuleId }> = {
  branches: { icon: Building2, module: "branches" },
  clinical: { icon: HeartPulse, module: "clinical" },
  treatmentPlans: { icon: ClipboardList, module: "clinical" },
  services: { icon: Stethoscope, module: "services" },
  packages: { icon: Package, module: "services" },
  finance: { icon: Wallet, module: "finance" },
  inventory: { icon: Warehouse, module: "inventory" },
  procurement: { icon: ArrowDownToLine, module: "inventory" },
  employees: { icon: Users, module: "employees" },
  reports: { icon: FileText, module: "reports" },
  marketing: { icon: Megaphone, module: "marketing" },
  notifications: { icon: Bell, module: "notifications" },
  settings: { icon: Settings2, module: "settings" },
};
const ACTIVE = new Set<WorkspaceStatus>(["active", "inProgress", "scheduled"]);
const FOLLOWUP = new Set<WorkspaceStatus>([
  "pending",
  "review",
  "attention",
  "draft",
  "unread",
  "lowStock",
]);
const ROLE_LABELS: Record<RoleId, { ar: string; en: string }> = {
  owner: { ar: "مالك", en: "Owner" },
  branchManager: { ar: "مدير فرع", en: "Branch manager" },
  receptionist: { ar: "استقبال", en: "Receptionist" },
  therapist: { ar: "معالج", en: "Therapist" },
  medicalSupervisor: { ar: "مشرف طبي", en: "Medical supervisor" },
  accountant: { ar: "محاسب", en: "Accountant" },
  hrManager: { ar: "مدير موارد بشرية", en: "HR manager" },
  inventoryManager: { ar: "مدير مخزون", en: "Inventory manager" },
  marketing: { ar: "تسويق", en: "Marketing" },
};
type Props = { module: ModuleId; path: string };

function keyFor(module: ModuleId, path: string): WorkspaceKey {
  const root = path.split("/").filter(Boolean)[0];
  if (root === "treatment-plans") return "treatmentPlans";
  if (root === "packages") return "packages";
  if (root === "procurement") return "procurement";
  if (root === "hr") return "employees";
  return module === "clinical"
    ? "clinical"
    : module === "services"
      ? "services"
      : module === "inventory"
        ? "inventory"
        : (module as WorkspaceKey);
}

/** Route-facing dispatcher. Patient and appointment routes remain outside this workspace suite. */
export function ModuleWorkspacePage({ module, path }: Props) {
  const key = keyFor(module, path);
  return <WorkspaceView key={key} workspace={key} />;
}
export const BranchesWorkspace = (props: Props) => (
  <WorkspaceView workspace="branches" {...props} />
);
export const ClinicalWorkspace = (props: Props) => (
  <WorkspaceView workspace="clinical" {...props} />
);
export const TreatmentPlansWorkspace = (props: Props) => (
  <WorkspaceView workspace="treatmentPlans" {...props} />
);
export const ServicesWorkspace = (props: Props) => (
  <WorkspaceView workspace="services" {...props} />
);
export const PackagesWorkspace = (props: Props) => (
  <WorkspaceView workspace="packages" {...props} />
);
export const FinanceWorkspace = (props: Props) => (
  <WorkspaceView workspace="finance" {...props} />
);
export const InventoryWorkspace = (props: Props) => (
  <WorkspaceView workspace="inventory" {...props} />
);
export const ProcurementWorkspace = (props: Props) => (
  <WorkspaceView workspace="procurement" {...props} />
);
export const EmployeesWorkspace = (props: Props) => (
  <WorkspaceView workspace="employees" {...props} />
);
export const ReportsWorkspace = (props: Props) => (
  <WorkspaceView workspace="reports" {...props} />
);
export const MarketingWorkspace = (props: Props) => (
  <WorkspaceView workspace="marketing" {...props} />
);
export const NotificationsWorkspace = (props: Props) => (
  <WorkspaceView workspace="notifications" {...props} />
);
export const SettingsWorkspace = (props: Props) => (
  <WorkspaceView workspace="settings" {...props} />
);

function WorkspaceView({ workspace }: { workspace: WorkspaceKey }) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    locale,
    role,
    setRole,
    branchId,
    setBranchId,
    theme,
    setTheme,
    sidebarCollapsed,
    setSidebarCollapsed,
    searchQuery,
  } = useWorkspace();
  const { patients, appointments } = useClinicData();
  const t = messages[locale];
  const copy = workspaceCopy[locale];
  const page = copy.pages[workspace];
  const moduleMeta = MODULES[workspace];
  const Icon = moduleMeta.icon;
  const [records, setRecords] = useState<WorkspaceRecord[]>(() =>
    getWorkspaceRecords(workspace),
  );
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");
  const [notice, setNotice] = useState("");
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [appointmentAlerts, setAppointmentAlerts] = useState(true);
  const branches = BRANCHES;
  const scoped = useMemo(
    () =>
      records.filter(
        (r) => !r.branchId || branchId === "all" || r.branchId === branchId,
      ),
    [records, branchId],
  );
  const filtered = useMemo(() => {
    const term = (query || searchQuery).trim().toLocaleLowerCase(locale);
    return scoped.filter(
      (r) =>
        (tab === "all" ||
          (tab === "active" ? ACTIVE.has(r.status) : FOLLOWUP.has(r.status))) &&
        (!term ||
          [
            r.id,
            r.titleAr,
            r.titleEn,
            r.detailAr,
            r.detailEn,
            r.categoryAr,
            r.categoryEn,
          ]
            .join(" ")
            .toLocaleLowerCase(locale)
            .includes(term)),
    );
  }, [locale, query, scoped, searchQuery, tab]);
  const financialAmount = scoped.reduce((sum, r) => sum + (r.amount ?? 0), 0);
  const activeCount = scoped.filter((r) => ACTIVE.has(r.status)).length;
  const attentionCount = scoped.filter((r) => FOLLOWUP.has(r.status)).length;
  const branchLabel =
    branchId === "all" ? t.branches.all : branchName(branchId, locale);

  // Workspace preferences have their own small local store; provider preferences persist through WorkspaceProvider.
  useEffect(() => {
    if (workspace !== "settings") return;
    try {
      const stored = window.localStorage.getItem(
        "ehteraf:workspace-notifications:v1",
      );
      if (stored) {
        const prefs = JSON.parse(stored) as {
          weeklyDigest?: boolean;
          appointmentAlerts?: boolean;
        };
        if (typeof prefs.weeklyDigest === "boolean")
          setWeeklyDigest(prefs.weeklyDigest);
        if (typeof prefs.appointmentAlerts === "boolean")
          setAppointmentAlerts(prefs.appointmentAlerts);
      }
    } catch {
      /* local preferences are optional */
    }
  }, [workspace]);

  function toast(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2400);
  }
  function exportCsv() {
    const data = filtered.map((r) => [
      r.id,
      locale === "ar" ? r.titleAr : r.titleEn,
      locale === "ar" ? r.categoryAr : r.categoryEn,
      r.branchId ? branchName(r.branchId, locale) : branchLabel,
      r.amount ?? r.valueEn ?? r.valueAr ?? "",
      copy.statuses[r.status] ?? r.status,
    ]);
    const csv = [
      [
        copy.reference,
        copy.record,
        copy.category,
        copy.branch,
        copy.value,
        copy.status,
      ],
      ...data,
    ]
      .map((row) =>
        row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }),
    );
    link.download = `ehteraf-${workspace}-demo.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast(copy.exportReady);
  }
  function updateStatus(id: string) {
    setRecords((items) =>
      items.map((r) =>
        r.id === id
          ? {
              ...r,
              status:
                r.status === "unread"
                  ? "read"
                  : r.status === "completed"
                    ? "active"
                    : "completed",
            }
          : r,
      ),
    );
  }
  function addRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    if (!title) return;
    const detail = String(form.get("detail") ?? "").trim();
    setRecords((items) => [
      {
        id: `DEMO-${Date.now().toString().slice(-5)}`,
        titleAr: title,
        titleEn: title,
        detailAr: detail || copy.demoBadge,
        detailEn: detail || copy.demoBadge,
        categoryAr: copy.createNew,
        categoryEn: copy.createNew,
        status: "draft",
        ...(branchId !== "all" ? { branchId } : {}),
      },
      ...items,
    ]);
    toast(
      locale === "ar"
        ? "أضيف إلى قائمة العرض المحلي."
        : "Added to this local demo view.",
    );
    (event.currentTarget as HTMLFormElement).reset();
  }
  function savePreferences() {
    try {
      window.localStorage.setItem(
        "ehteraf:workspace-notifications:v1",
        JSON.stringify({ weeklyDigest, appointmentAlerts }),
      );
    } catch {
      /* optional */
    }
    toast(copy.settingsSaved);
  }
  function setLocale() {
    const parts = pathname.split("/").filter(Boolean);
    parts[0] = locale === "ar" ? "en" : "ar";
    router.push(`/${parts.join("/")}`);
  }
  function changeRole(next: RoleId) {
    setRole(next);
    setBranchId(ROLE_BRANCH_SCOPE[next] ?? "all");
  }

  if (!canAccessModule(role, moduleMeta.module))
    return (
      <main
        dir={locale === "ar" ? "rtl" : "ltr"}
        className="mx-auto max-w-4xl p-6 sm:p-10"
      >
        <Card className="p-8">
          <Badge tone="warning">
            <ShieldCheck size={14} /> {copy.demoBadge}
          </Badge>
          <h1 className="mt-5 text-3xl font-semibold text-ink">
            {locale === "ar"
              ? "الوصول غير متاح لهذا الدور"
              : "This role cannot access this workspace"}
          </h1>
          <p className="mt-3 text-muted">
            {locale === "ar"
              ? "تبديل الدور هنا محاكاة واجهة فقط، ولا يمثل ضابط أمان."
              : "Role switching here is a visual simulation, not a security control."}
          </p>
        </Card>
      </main>
    );

  const isBranches = workspace === "branches";
  const recordsForTable: WorkspaceRecord[] = isBranches
    ? branches
        .map((branch, i) => {
          const branchAppointments = appointments.filter(
            (a) =>
              a.branchId === branch.id &&
              a.date === DEMO_TODAY &&
              !["cancelled", "noShow"].includes(a.status),
          ).length;
          const branchPatients = patients.filter(
            (p) => p.branchId === branch.id,
          ).length;
          return {
            id: `BR-${String(i + 1).padStart(2, "0")}`,
            titleAr: branch.nameAr,
            titleEn: branch.nameEn,
            detailAr: branch.cityAr,
            detailEn: branch.cityEn,
            categoryAr: "فرع تجريبي",
            categoryEn: "Demo branch",
            status: "active" as const,
            branchId: branch.id,
            valueAr: `${branchPatients} ملف · ${branchAppointments} موعد`,
            valueEn: `${branchPatients} profiles · ${branchAppointments} appointments`,
          } satisfies WorkspaceRecord;
        })
        .filter((r) => branchId === "all" || r.branchId === branchId)
    : filtered;

  return (
    <main
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="mx-auto w-full max-w-[1440px] space-y-6 px-4 py-6 text-ink sm:px-7 lg:px-10"
    >
      <header className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-9">
        <div
          className="absolute -end-12 -top-16 h-56 w-56 rounded-full bg-teal-soft/70 blur-2xl"
          aria-hidden="true"
        />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-5 flex items-center gap-2 text-xs font-medium uppercase tracking-[.16em] text-muted">
              <span>{copy.suiteLabel}</span>
              <ChevronRight className="h-3 w-3" />
              <span>{branchLabel}</span>
            </div>
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-teal-soft text-teal">
                <Icon size={23} />
              </span>
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge tone="teal">
                    <Sparkles size={12} />
                    {copy.demoBadge}
                  </Badge>
                  <span className="text-xs text-muted">
                    {locale === "ar"
                      ? "مساحة تشغيلية · بيانات اصطناعية"
                      : "Operations workspace · synthetic data"}
                  </span>
                </div>
                <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                  {page.heading}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted sm:text-base">
                  {page.description}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportCsv}>
              <ArrowDownToLine size={16} />
              {copy.exportView}
            </Button>
            {workspace !== "settings" && workspace !== "branches" && (
              <form onSubmit={addRecord} className="flex flex-wrap gap-2">
                <TextInput
                  name="title"
                  required
                  placeholder={copy.nameField}
                  aria-label={copy.nameField}
                  className="max-w-48"
                />
                <TextInput
                  name="detail"
                  placeholder={copy.detailField}
                  aria-label={copy.detailField}
                  className="max-w-48"
                />
                <Button type="submit">
                  <Plus size={16} />
                  {page.addLabel}
                </Button>
              </form>
            )}
          </div>
        </div>
      </header>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatBlock
          label={page.metricLabels[0]}
          value={formatNumber(
            isBranches ? branches.length : scoped.length,
            locale,
          )}
          detail={copy.demoBadge}
          icon={<Icon size={17} />}
          tone="teal"
        />
        <StatBlock
          label={page.metricLabels[1]}
          value={formatNumber(activeCount, locale)}
          detail={
            locale === "ar" ? "حالات نشطة في العينة" : "Active states in sample"
          }
          icon={<Activity size={17} />}
          tone="brass"
        />
        <StatBlock
          label={page.metricLabels[2]}
          value={
            workspace === "branches"
              ? formatNumber(
                  appointments.filter(
                    (a) =>
                      a.date === DEMO_TODAY &&
                      !["cancelled", "noShow"].includes(a.status),
                  ).length,
                  locale,
                )
              : workspace === "finance" ||
                  workspace === "procurement" ||
                  workspace === "packages" ||
                  workspace === "services"
                ? formatCurrency(financialAmount, locale)
                : formatNumber(attentionCount, locale)
          }
          detail={
            workspace === "finance"
              ? locale === "ar"
                ? "إجمالي مبالغ الفواتير التجريبية"
                : "Sum of demo invoice amounts"
              : copy.demoBadge
          }
          icon={<Wallet size={17} />}
          tone="clay"
        />
        <StatBlock
          label={page.metricLabels[3]}
          value={formatNumber(
            workspace === "branches"
              ? appointments.length
                ? Math.round(
                    (appointments.filter((a) => a.date === DEMO_TODAY).length /
                      Math.max(1, branches.length * 12)) *
                      100,
                  )
                : 0
              : workspace === "inventory"
                ? scoped.filter((r) => r.status === "lowStock").length
                : attentionCount,
            locale,
          )}
          detail={
            locale === "ar"
              ? "قراءة إرشادية من بيانات العرض"
              : "Indicative read from demo data"
          }
          icon={<Filter size={17} />}
          tone="ink"
        />
      </div>
      {workspace === "settings" ? (
        <SettingsPanel
          {...{
            locale,
            role,
            branchId,
            theme,
            sidebarCollapsed,
            weeklyDigest,
            appointmentAlerts,
            setTheme,
            setBranchId,
            setSidebarCollapsed,
            setWeeklyDigest,
            setAppointmentAlerts,
            changeRole,
            setLocale,
            savePreferences,
            copy,
            t,
          }}
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
          <Card className="min-w-0 overflow-hidden p-5 sm:p-7">
            <SectionHeading
              title={page.sectionTitle}
              description={page.sectionDescription}
              eyebrow={page.heading}
              action={<Badge tone="warning">{copy.demoBadge}</Badge>}
            />
            <div className="my-6 flex flex-col gap-3 border-y border-line py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-sm">
                <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <TextInput
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={copy.searchPlaceholder}
                  aria-label={copy.searchPlaceholder}
                  className="ps-10"
                />
              </div>
              <Tabs
                label={page.sectionTitle}
                value={tab}
                onChange={setTab}
                items={[
                  { id: "all", label: copy.filterAll },
                  { id: "active", label: copy.filterActive },
                  { id: "followup", label: copy.filterAttention },
                ]}
              />
            </div>
            {recordsForTable.length ? (
              <DataTableFrame>
                <table className="w-full min-w-[760px] text-start text-sm">
                  <thead>
                    <tr className="border-b border-line text-xs text-muted">
                      {[
                        copy.reference,
                        copy.record,
                        copy.category,
                        copy.branch,
                        copy.value,
                        copy.status,
                        copy.actions,
                      ].map((h) => (
                        <th key={h} className="px-3 py-3 font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recordsForTable.map((record) => (
                      <tr
                        key={record.id}
                        className="border-b border-line/70 last:border-0 hover:bg-canvas/60"
                      >
                        <td className="px-3 py-4 font-mono text-xs text-muted">
                          {record.id}
                        </td>
                        <td className="px-3 py-4">
                          <div className="font-medium">
                            {locale === "ar" ? record.titleAr : record.titleEn}
                          </div>
                          <div className="mt-1 text-xs text-muted">
                            {locale === "ar"
                              ? record.detailAr
                              : record.detailEn}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-muted">
                          {locale === "ar"
                            ? record.categoryAr
                            : record.categoryEn}
                        </td>
                        <td className="px-3 py-4">
                          {record.branchId
                            ? branchName(record.branchId, locale)
                            : "—"}
                        </td>
                        <td className="px-3 py-4">
                          {record.amount !== undefined
                            ? formatCurrency(record.amount, locale)
                            : locale === "ar"
                              ? (record.valueAr ?? "—")
                              : (record.valueEn ?? "—")}
                        </td>
                        <td className="px-3 py-4">
                          <Badge
                            tone={
                              record.status === "completed" ||
                              record.status === "active" ||
                              record.status === "read"
                                ? "success"
                                : FOLLOWUP.has(record.status)
                                  ? "warning"
                                  : "neutral"
                            }
                          >
                            {copy.statuses[record.status] ?? record.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-4">
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={copy.rowAction}
                            onClick={() => updateStatus(record.id)}
                          >
                            {record.status === "unread" ? (
                              <CheckCheck size={16} />
                            ) : (
                              <Check size={16} />
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </DataTableFrame>
            ) : (
              <EmptyState
                title={copy.noResultsTitle}
                description={copy.noResultsDescription}
              />
            )}
            <p className="mt-5 flex items-center gap-2 text-xs leading-6 text-muted">
              <ShieldCheck size={14} className="shrink-0 text-teal" />
              {copy.demoNotice}
            </p>
          </Card>
          <aside className="space-y-5">
            <Card className="p-6">
              <span className="text-xs uppercase tracking-[.15em] text-muted">
                {copy.demoBadge}
              </span>
              <h2 className="mt-2 text-xl font-semibold">
                {page.insightTitle}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                {page.insightDescription}
              </p>
              <div className="mt-6 h-2 overflow-hidden rounded-full bg-canvas">
                <div
                  className="h-full rounded-full bg-teal"
                  style={{
                    width: `${Math.min(100, scoped.length ? Math.round((activeCount / scoped.length) * 100) : 0)}%`,
                  }}
                />
              </div>
              <div className="mt-3 flex justify-between text-xs text-muted">
                <span>{copy.active}</span>
                <strong>
                  {formatNumber(activeCount, locale)} /{" "}
                  {formatNumber(scoped.length, locale)}
                </strong>
              </div>
            </Card>
            <Card className="p-6">
              <SectionHeading
                title={copy.attentionTitle}
                description={
                  locale === "ar"
                    ? "قائمة متابعة من بيانات العرض."
                    : "Follow-up queue based on demo records."
                }
              />
              <div className="mt-4 space-y-3">
                {scoped
                  .filter((r) => FOLLOWUP.has(r.status))
                  .slice(0, 4)
                  .map((r) => (
                    <div
                      key={r.id}
                      className="flex items-start gap-3 border-b border-line pb-3 last:border-0"
                    >
                      <span className="mt-1 h-2 w-2 rounded-full bg-clay" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {locale === "ar" ? r.titleAr : r.titleEn}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {r.id} · {copy.statuses[r.status]}
                        </p>
                      </div>
                    </div>
                  ))}
                {!attentionCount && (
                  <p className="text-sm text-muted">{copy.attentionEmpty}</p>
                )}
              </div>
            </Card>
          </aside>
        </div>
      )}
      {notice && (
        <div
          role="status"
          className="fixed bottom-5 start-1/2 z-50 -translate-x-1/2 rounded-xl bg-ink px-5 py-3 text-sm text-surface shadow-xl"
        >
          {notice}
        </div>
      )}
    </main>
  );
}

function SettingsPanel(props: {
  locale: Locale;
  role: RoleId;
  branchId: BranchId;
  theme: "light" | "dark";
  sidebarCollapsed: boolean;
  weeklyDigest: boolean;
  appointmentAlerts: boolean;
  setTheme: Dispatch<SetStateAction<"light" | "dark">>;
  setBranchId: Dispatch<SetStateAction<BranchId>>;
  setSidebarCollapsed: Dispatch<SetStateAction<boolean>>;
  setWeeklyDigest: Dispatch<SetStateAction<boolean>>;
  setAppointmentAlerts: Dispatch<SetStateAction<boolean>>;
  changeRole: (v: RoleId) => void;
  setLocale: () => void;
  savePreferences: () => void;
  copy: WorkspaceLocaleCopy;
  t: (typeof messages)[Locale];
}) {
  const p = props;
  const locale = p.locale;
  const copy = p.copy;
  const toggle = (
    label: string,
    value: boolean,
    set: (value: boolean) => void,
  ) => (
    <label className="flex cursor-pointer items-center justify-between gap-4 border-b border-line py-4 last:border-0">
      <span className="text-sm">{label}</span>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => set(e.target.checked)}
        className="h-5 w-5 accent-teal"
      />
    </label>
  );
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
      <Card className="p-5 sm:p-7">
        <SectionHeading
          title={copy.pages.settings.sectionTitle}
          description={copy.pages.settings.sectionDescription}
          eyebrow={copy.settingsAppearance}
        />
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <FieldFrame label={copy.settingsLanguage}>
            <Button variant="outline" onClick={p.setLocale}>
              <Languages size={16} />
              {locale === "ar" ? "العربية · RTL" : "English · LTR"}
            </Button>
          </FieldFrame>
          <FieldFrame label={copy.settingsTheme}>
            <Select
              value={p.theme}
              onChange={(e) => p.setTheme(e.target.value as "light" | "dark")}
            >
              <option value="light">{copy.themeLight}</option>
              <option value="dark">{copy.themeDark}</option>
            </Select>
          </FieldFrame>
          <FieldFrame
            label={copy.settingsRole}
            hint={
              locale === "ar"
                ? "محاكاة واجهة، ليست صلاحية أمنية."
                : "Visual simulation, not an access-control setting."
            }
          >
            <Select
              value={p.role}
              onChange={(e) => p.changeRole(e.target.value as RoleId)}
            >
              {ROLE_IDS.map((id) => (
                <option key={id} value={id}>
                  {ROLE_LABELS[id][locale]}
                </option>
              ))}
            </Select>
          </FieldFrame>
          <FieldFrame label={copy.branchScope}>
            <Select
              value={p.branchId}
              onChange={(e) => p.setBranchId(e.target.value as BranchId)}
            >
              <option value="all">{messages[locale].branches.all}</option>
              {BRANCHES.map((b) => (
                <option key={b.id} value={b.id}>
                  {locale === "ar" ? b.nameAr : b.nameEn}
                </option>
              ))}
            </Select>
          </FieldFrame>
        </div>
        <div className="mt-7 border-t border-line pt-4">
          <h3 className="font-semibold">{copy.settingsNotifications}</h3>
          {toggle(copy.settingsWeeklyDigest, p.weeklyDigest, p.setWeeklyDigest)}
          {toggle(
            copy.settingsAppointmentAlerts,
            p.appointmentAlerts,
            p.setAppointmentAlerts,
          )}
          {toggle(
            copy.settingsCompactSidebar,
            p.sidebarCollapsed,
            p.setSidebarCollapsed,
          )}
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={p.savePreferences}>
            <Check size={16} />
            {copy.savePreferences}
          </Button>
        </div>
      </Card>
      <Card className="h-fit p-6">
        <Badge tone="warning">
          <ShieldCheck size={14} />
          {copy.demoBadge}
        </Badge>
        <h2 className="mt-4 text-lg font-semibold">{copy.settingsPrivacy}</h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          {copy.settingsDataNote}
        </p>
        <p className="mt-4 border-t border-line pt-4 text-xs leading-6 text-muted">
          {copy.demoNotice}
        </p>
      </Card>
    </div>
  );
}
function branchName(id: Exclude<BranchId, "all">, locale: Locale) {
  const branch = BRANCHES.find((item) => item.id === id);
  return branch ? (locale === "ar" ? branch.nameAr : branch.nameEn) : id;
}
