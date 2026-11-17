"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Building2,
  Check,
  CheckCheck,
  CircleAlert,
  CircleCheck,
  ClipboardCheck,
  CreditCard,
  FileDown,
  FileHeart,
  Layers,
  MapPin,
  Megaphone,
  PackageSearch,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Truck,
  Warehouse,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { useClinicData } from "@/services/clinic-data-provider";
import { BRANCHES } from "@/lib/mock/branches";
import { DEMO_TODAY } from "@/lib/mock/clinic-seed";
import { canAccessModule, ROLE_BRANCH_SCOPE, ROLE_IDS } from "@/lib/config/roles";
import { messages, type Messages } from "@/lib/i18n/messages";
import { workspaceCopy, type WorkspaceKey, type WorkspaceLocaleCopy, type WorkspacePageCopy } from "@/lib/i18n/workspace-copy";
import { getWorkspaceRecords, type WorkspaceRecord, type WorkspaceStatus } from "@/lib/mock/workspace-data";
import type { BranchId, Locale, ModuleId, RoleId } from "@/types";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";

const MODULE_ICONS: Record<WorkspaceKey, LucideIcon> = {
  branches: Building2,
  clinical: FileHeart,
  treatmentPlans: ClipboardCheck,
  services: Stethoscope,
  packages: PackageSearch,
  finance: CreditCard,
  inventory: Warehouse,
  procurement: Truck,
  employees: BriefcaseBusiness,
  reports: BarChart3,
  marketing: Megaphone,
  notifications: Bell,
  settings: Settings2,
};

type RelatedWorkspaceLink = { href: string; module: ModuleId; ar: string; en: string };

const RELATED_LINKS: Partial<Record<WorkspaceKey, RelatedWorkspaceLink[]>> = {
  branches: [
    { href: "/reports", module: "reports", ar: "تحليلات الفروع", en: "Branch analytics" },
    { href: "/inventory", module: "inventory", ar: "مخزون الفروع", en: "Branch inventory" },
  ],
  clinical: [
    { href: "/treatment-plans", module: "clinical", ar: "خطط العلاج", en: "Treatment plans" },
    { href: "/appointments", module: "appointments", ar: "جدول المواعيد", en: "Appointment schedule" },
  ],
  treatmentPlans: [
    { href: "/clinical", module: "clinical", ar: "مراجعة التوثيق", en: "Documentation review" },
    { href: "/services", module: "services", ar: "كتالوج الخدمات", en: "Service catalog" },
  ],
  services: [
    { href: "/packages", module: "services", ar: "الباقات والبرامج", en: "Packages & programs" },
    { href: "/finance/invoices", module: "finance", ar: "الفواتير والتحصيل", en: "Invoices & collections" },
  ],
  packages: [
    { href: "/services", module: "services", ar: "كتالوج الخدمات", en: "Service catalog" },
    { href: "/finance/invoices", module: "finance", ar: "الفواتير والتحصيل", en: "Invoices & collections" },
  ],
  finance: [
    { href: "/reports", module: "reports", ar: "تقارير التحصيل", en: "Collections reports" },
    { href: "/procurement", module: "inventory", ar: "طلبات التوريد", en: "Supply requests" },
  ],
  inventory: [
    { href: "/procurement", module: "inventory", ar: "طلبات التوريد", en: "Supply requests" },
    { href: "/branches", module: "branches", ar: "نطاق الفروع", en: "Branch scope" },
  ],
  procurement: [
    { href: "/inventory", module: "inventory", ar: "مستويات المخزون", en: "Stock levels" },
    { href: "/finance/invoices", module: "finance", ar: "المراجعة المالية", en: "Finance review" },
  ],
  employees: [
    { href: "/hr", module: "employees", ar: "نظرة الموارد البشرية", en: "People overview" },
    { href: "/branches", module: "branches", ar: "تغطية الفروع", en: "Branch coverage" },
  ],
  reports: [
    { href: "/finance/invoices", module: "finance", ar: "الفواتير والتحصيل", en: "Invoices & collections" },
    { href: "/branches", module: "branches", ar: "تحليلات الفروع", en: "Branch analytics" },
  ],
  marketing: [
    { href: "/notifications", module: "notifications", ar: "مركز الإشعارات", en: "Notification center" },
    { href: "/reports", module: "reports", ar: "قياس الحملات", en: "Campaign reporting" },
  ],
  notifications: [
    { href: "/appointments", module: "appointments", ar: "جدول المواعيد", en: "Appointment schedule" },
    { href: "/clinical", module: "clinical", ar: "مراجعة التوثيق", en: "Documentation review" },
  ],
  settings: [
    { href: "/branches", module: "branches", ar: "إدارة الفروع", en: "Branch management" },
    { href: "/notifications", module: "notifications", ar: "تفضيلات التنبيه", en: "Notification preferences" },
  ],
};

const WORKSPACE_HERO_MEDIA: Record<WorkspaceKey, { src: string; captionAr: string; captionEn: string }> = {
  branches: {
    src: "/images/ehteraf-clinic-interior.jpg",
    captionAr: "مساحات ترحب بالرعاية",
    captionEn: "Spaces that welcome care",
  },
  clinical: {
    src: "/images/ehteraf-therapy-hero.jpg",
    captionAr: "متابعة واعية في كل خطوة",
    captionEn: "Thoughtful support at every step",
  },
  treatmentPlans: {
    src: "/images/ehteraf-rehab-equipment.jpg",
    captionAr: "خطوات ثابتة نحو التعافي",
    captionEn: "Steady steps toward recovery",
  },
  services: {
    src: "/images/ehteraf-rehab-equipment.jpg",
    captionAr: "مصممة لحركة أفضل",
    captionEn: "Designed for better movement",
  },
  packages: {
    src: "/images/ehteraf-therapy-hero.jpg",
    captionAr: "برامج تدعم رحلة الرعاية",
    captionEn: "Programs that support care",
  },
  finance: {
    src: "/images/ehteraf-clinic-interior.jpg",
    captionAr: "رؤية أوضح لدورة الإيراد",
    captionEn: "A clearer view of revenue flow",
  },
  inventory: {
    src: "/images/ehteraf-rehab-equipment.jpg",
    captionAr: "جاهزية تبدأ من التفاصيل",
    captionEn: "Readiness starts in the details",
  },
  procurement: {
    src: "/images/ehteraf-clinic-interior.jpg",
    captionAr: "تشغيل مترابط عبر الفروع",
    captionEn: "Connected operations across branches",
  },
  employees: {
    src: "/images/ehteraf-clinic-interior.jpg",
    captionAr: "فريق يصنع فرق الرعاية",
    captionEn: "A team behind better care",
  },
  reports: {
    src: "/images/ehteraf-therapy-hero.jpg",
    captionAr: "صورة أوضح للأداء",
    captionEn: "A clearer view of performance",
  },
  marketing: {
    src: "/images/ehteraf-therapy-hero.jpg",
    captionAr: "تواصل أقرب وأكثر إنسانية",
    captionEn: "More thoughtful connections",
  },
  notifications: {
    src: "/images/ehteraf-therapy-hero.jpg",
    captionAr: "تحديثات تدعم تنسيق الرعاية",
    captionEn: "Updates that support coordinated care",
  },
  settings: {
    src: "/images/ehteraf-clinic-interior.jpg",
    captionAr: "مساحة عمل متسقة للفريق",
    captionEn: "A consistent workspace for the team",
  },
};

const ATTENTION_STATUSES = new Set<WorkspaceStatus>([
  "pending",
  "review",
  "attention",
  "draft",
  "unread",
  "lowStock",
]);
const ACTIVE_STATUSES = new Set<WorkspaceStatus>(["active", "inProgress", "scheduled"]);
const COMPLETE_STATUSES = new Set<WorkspaceStatus>(["completed", "read"]);

interface WorkspaceMetric {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  tone: "teal" | "blue" | "violet" | "amber";
  progress?: number;
}

export function ModuleWorkspacePage({
  module,
  path,
}: {
  module: ModuleId;
  path: string;
}) {
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
  const appText = messages[locale];
  const copy = workspaceCopy[locale];
  const key = resolveWorkspaceKey(module, path);
  const page = copy.pages[key];
  const Icon = MODULE_ICONS[key];
  const sourceRecords = useMemo(() => getWorkspaceRecords(key), [key]);
  const [records, setRecords] = useState<WorkspaceRecord[]>(sourceRecords);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "attention">("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [appointmentAlerts, setAppointmentAlerts] = useState(true);

  useEffect(() => {
    setRecords(sourceRecords);
  }, [sourceRecords]);

  useEffect(() => {
    if (key !== "settings") return;
    try {
      const preferences = window.localStorage.getItem("ehteraf:workspace-notifications:v1");
      if (!preferences) return;
      const parsed = JSON.parse(preferences) as { weeklyDigest?: boolean; appointmentAlerts?: boolean };
      if (typeof parsed.weeklyDigest === "boolean") setWeeklyDigest(parsed.weeklyDigest);
      if (typeof parsed.appointmentAlerts === "boolean") setAppointmentAlerts(parsed.appointmentAlerts);
    } catch {
      // Local settings are optional; defaults remain available if storage is disabled.
    }
  }, [key]);

  const branchRecords = useMemo(() => BRANCHES.map((branch, index) => {
    const branchPatients = patients.filter((patient) => patient.branchId === branch.id);
    const todayAppointments = appointments.filter((appointment) =>
      appointment.branchId === branch.id &&
      appointment.date === DEMO_TODAY &&
      !["cancelled", "noShow"].includes(appointment.status),
    );
    const sampleCapacity = 12;
    const sampleLoad = Math.min(96, Math.round((todayAppointments.length / sampleCapacity) * 100));
    return {
      id: `BR-${String(index + 1).padStart(2, "0")}`,
      titleAr: branch.nameAr,
      titleEn: branch.nameEn,
      detailAr: branch.cityAr,
      detailEn: branch.cityEn,
      categoryAr: "فرع تجريبي · الاسم أولي",
      categoryEn: "Demo branch · provisional name",
      status: "active" as const,
      branchId: branch.id,
      metric: sampleLoad,
      units: branchPatients.length,
      valueAr: `${formatNumber(branchPatients.length, locale)} ملف · ${formatNumber(todayAppointments.length, locale)} موعد`,
      valueEn: `${formatNumber(branchPatients.length, locale)} profiles · ${formatNumber(todayAppointments.length, locale)} appointments`,
    } satisfies WorkspaceRecord;
  }), [appointments, locale, patients]);

  const scopedRecords = useMemo(() => {
    const source = key === "branches" ? [...branchRecords, ...records] : records;
    return source.filter((record) =>
      !record.branchId || branchId === "all" || record.branchId === branchId,
    );
  }, [branchId, branchRecords, key, records]);

  const filteredRecords = useMemo(() => {
    const term = (query.trim() || searchQuery.trim()).toLocaleLowerCase(locale === "ar" ? "ar" : "en");
    return scopedRecords.filter((record) => {
      const isActive = key === "notifications" ? record.status === "read" : ACTIVE_STATUSES.has(record.status);
      if (filter === "active" && !isActive) return false;
      if (filter === "attention" && !ATTENTION_STATUSES.has(record.status)) return false;
      if (unreadOnly && record.status !== "unread") return false;
      if (!term) return true;
      const searchable = [
        record.id,
        record.titleAr,
        record.titleEn,
        record.detailAr,
        record.detailEn,
        record.categoryAr,
        record.categoryEn,
      ].join(" ").toLocaleLowerCase(locale === "ar" ? "ar" : "en");
      return searchable.includes(term);
    });
  }, [filter, key, locale, query, scopedRecords, searchQuery, unreadOnly]);

  const metrics = useMemo(
    () => buildMetrics(key, scopedRecords, patients, appointments, branchId, role, theme, locale, copy, appText),
    [appText, appointments, branchId, copy, key, locale, patients, role, scopedRecords, theme],
  );
  const attentionCount = scopedRecords.filter((record) => ATTENTION_STATUSES.has(record.status)).length;
  const attentionRecords = scopedRecords.filter((record) => ATTENTION_STATUSES.has(record.status)).slice(0, 3);
  const activeRecords = scopedRecords.filter((record) => ACTIVE_STATUSES.has(record.status)).length;
  const completedRecords = scopedRecords.filter((record) => COMPLETE_STATUSES.has(record.status)).length;
  const workTotal = Math.max(scopedRecords.length, 1);
  const workflowScore = Math.round(Math.max(0, Math.min(100, (completedRecords + activeRecords * 0.6) / workTotal * 100)));
  const branchLabel = branchId === "all"
    ? appText.branches.all
    : branchName(branchId, locale);
  const heroMedia = WORKSPACE_HERO_MEDIA[key];
  const isSettings = key === "settings";
  const isBranches = key === "branches";
  const isNotifications = key === "notifications";
  const relatedLinks = (RELATED_LINKS[key] ?? []).filter((item) =>
    canAccessModule(role, item.module),
  );
  const DirectionArrow = locale === "ar" ? ArrowLeft : ArrowRight;

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  }

  function switchLanguage() {
    const segments = pathname.split("/").filter(Boolean);
    segments[0] = locale === "ar" ? "en" : "ar";
    router.push(`/${segments.join("/")}`);
  }

  function handleRoleChange(nextRole: RoleId) {
    setRole(nextRole);
    setBranchId(ROLE_BRANCH_SCOPE[nextRole] ?? "all");
  }

  function saveSettings() {
    try {
      window.localStorage.setItem(
        "ehteraf:workspace-notifications:v1",
        JSON.stringify({ weeklyDigest, appointmentAlerts }),
      );
    } catch {
      // The visible prototype can be used even when browser storage is unavailable.
    }
    showToast(copy.settingsSaved);
  }

  function handleCreateRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const detail = String(form.get("detail") ?? "").trim();
    const category = String(form.get("category") ?? "").trim();
    if (!title) return;
    const newRecord: WorkspaceRecord = {
      id: `DEMO-${key.toUpperCase()}-${Date.now().toString().slice(-5)}`,
      titleAr: title,
      titleEn: title,
      detailAr: detail || "عنصر جديد في مساحة العرض",
      detailEn: detail || "New item in the demo workspace",
      categoryAr: category || "جديد",
      categoryEn: category || "New",
      status: key === "notifications" ? "unread" : "draft",
      branchId: branchId === "all" ? undefined : branchId,
      valueAr: "عنصر عرض جديد",
      valueEn: "New demo item",
    };
    setRecords((current) => [newRecord, ...current]);
    setFilter("all");
    setUnreadOnly(false);
    setDialogOpen(false);
    showToast(locale === "ar" ? "تمت إضافة العنصر إلى العرض التجريبي." : "The item was added to this demo view.");
  }

  function updateRecordStatus(recordId: string) {
    setRecords((current) => current.map((record) => {
      if (record.id !== recordId) return record;
      return { ...record, status: nextStatus(record.status) };
    }));
  }

  function markAllNotificationsRead() {
    setRecords((current) => current.map((record) => record.status === "unread" ? { ...record, status: "read" } : record));
    setUnreadOnly(false);
    setFilter("all");
    showToast(locale === "ar" ? "تم تحديد إشعارات العرض كمقروءة." : "Demo notifications marked as read.");
  }

  function exportCurrentView() {
    const headers = [copy.reference, copy.record, copy.category, copy.branch, copy.value, copy.status];
    const rows = filteredRecords.map((record) => [
      record.id,
      locale === "ar" ? record.titleAr : record.titleEn,
      locale === "ar" ? record.categoryAr : record.categoryEn,
      record.branchId ? branchName(record.branchId, locale) : branchLabel,
      valueLabel(record, locale),
      statusLabel(record.status, copy),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ehteraf-${key}-demo.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(copy.exportReady);
  }

  return (
    <div className={`feature-page module-workspace module-workspace-${key}`}>
      <section className="workspace-hero">
        <div className="workspace-hero-copy">
          <div className="workspace-breadcrumbs">
            <Link href={`/${locale}/dashboard`}>{appText.nav.dashboard}</Link>
            <span aria-hidden="true">/</span>
            <span>{copy.suiteLabel}</span>
          </div>
          <div className="workspace-title-row">
            <span className="workspace-title-icon" aria-hidden="true"><Icon size={21} strokeWidth={1.8} /></span>
            <div className="workspace-title-copy">
              <span className="workspace-eyebrow"><Sparkles size={13} />{copy.suiteLabel}</span>
              <h1>{page.heading}</h1>
              <p>{page.description}</p>
            </div>
          </div>
          <div className="workspace-hero-meta">
            <span className="workspace-demo-pill"><span />{copy.demoBadge}</span>
            <span className="workspace-branch-context"><MapPin size={13} />{branchLabel}</span>
            <span className="workspace-record-context"><Layers size={13} />{formatNumber(scopedRecords.length, locale)} {copy.totalRecords}</span>
          </div>
        </div>
        <div className="workspace-hero-art workspace-hero-media" aria-hidden="true">
          <Image
            src={heroMedia.src}
            alt=""
            fill
            sizes="(max-width: 760px) 100vw, 200px"
            className="workspace-hero-media-image"
          />
          <span className="workspace-hero-media-shade" />
          <span className="workspace-hero-photo-caption">
            <span className="workspace-hero-photo-icon"><Icon size={14} strokeWidth={1.7} /></span>
            <span>{locale === "ar" ? heroMedia.captionAr : heroMedia.captionEn}</span>
          </span>
        </div>
        <div className="workspace-hero-actions">
          {!isSettings ? (
            <Button variant="outline" className="workspace-export-button" onClick={exportCurrentView}>
              <FileDown size={16} />{copy.exportView}
            </Button>
          ) : null}
          {isSettings ? (
            <Button onClick={saveSettings}>
              <Check size={16} />{copy.savePreferences}
            </Button>
          ) : (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus size={16} />{page.addLabel}
            </Button>
          )}
        </div>
      </section>

      {relatedLinks.length ? (
        <nav className="workspace-related-nav" aria-label={copy.relatedWorkspaces}>
          <span>{copy.relatedWorkspaces}</span>
          {relatedLinks.map((item) => {
            const currentPath = `/${locale}${item.href}`;
            const active = pathname === currentPath || (item.href === "/employees" && pathname.endsWith("/hr"));
            return (
              <Link key={item.href} href={currentPath} className={cn("workspace-related-link", active && "is-active")} aria-current={active ? "page" : undefined}>
                {locale === "ar" ? item.ar : item.en}
                <DirectionArrow size={13} aria-hidden="true" />
              </Link>
            );
          })}
        </nav>
      ) : null}

      <section className="workspace-metrics-grid" aria-label={page.heading}>
        {metrics.map((metric, index) => {
          const MetricIcon = metric.icon;
          return (
            <Panel className={`workspace-metric-card workspace-metric-${metric.tone}`} key={`${metric.label}-${index}`}>
              <div className="workspace-metric-top">
                <span className="workspace-metric-icon"><MetricIcon size={16} strokeWidth={1.9} /></span>
                <span className="workspace-metric-label">{metric.label}</span>
              </div>
              <strong className="workspace-metric-value" dir="auto">{metric.value}</strong>
              {metric.progress !== undefined ? (
                <span
                  className="workspace-metric-progress"
                  role="meter"
                  aria-label={`${metric.label}: ${formatNumber(metric.progress, locale)}%`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={metric.progress}
                >
                  <span style={{ width: `${metric.progress}%` }} />
                </span>
              ) : null}
              <span className="workspace-metric-hint">{metric.hint}</span>
            </Panel>
          );
        })}
      </section>

      <div className="workspace-main-grid">
        <div className="workspace-primary-column">
          {isBranches ? (
            <BranchDirectory
              records={filteredRecords}
              branchScope={branchId}
              patients={patients}
              appointments={appointments}
              locale={locale}
              copy={copy}
              onSelectBranch={(nextBranch) => setBranchId(nextBranch)}
            />
          ) : isSettings ? (
            <SettingsWorkspace
              locale={locale}
              role={role}
              branchId={branchId}
              theme={theme}
              sidebarCollapsed={sidebarCollapsed}
              copy={copy}
              onRoleChange={handleRoleChange}
              onBranchChange={setBranchId}
              onThemeChange={setTheme}
              onLanguageChange={switchLanguage}
              onSidebarChange={setSidebarCollapsed}
              weeklyDigest={weeklyDigest}
              appointmentAlerts={appointmentAlerts}
              onWeeklyDigestChange={setWeeklyDigest}
              onAppointmentAlertsChange={setAppointmentAlerts}
            />
          ) : (
            <WorkspaceDataPanel
              page={page}
              copy={copy}
              locale={locale}
              records={filteredRecords}
              query={query}
              filter={filter}
              isNotifications={isNotifications}
              unreadOnly={unreadOnly}
              onQueryChange={setQuery}
              onFilterChange={setFilter}
              onUnreadOnlyChange={setUnreadOnly}
              onMarkAllRead={markAllNotificationsRead}
              onUpdateRecord={updateRecordStatus}
            />
          )}
        </div>

        <aside className="workspace-side-column">
          <WorkflowInsight
            title={page.insightTitle}
            description={page.insightDescription}
            score={key === "branches" && scopedRecords.length
              ? Math.round(scopedRecords.reduce((total, branch) => total + (branch.metric ?? 0), 0) / scopedRecords.length)
              : workflowScore}
            activeCount={activeRecords}
            attentionCount={attentionCount}
            completedCount={completedRecords}
            locale={locale}
            copy={copy}
          />
          <Panel className="workspace-attention-panel">
            <div className="workspace-side-heading">
              <span className="workspace-side-heading-icon"><CircleAlert size={16} /></span>
              <div>
                <h2>{copy.attentionTitle}</h2>
                <p>{formatNumber(attentionCount, locale)} {copy.filterAttention}</p>
              </div>
            </div>
            {attentionRecords.length ? (
              <div className="workspace-attention-list">
                {attentionRecords.map((record) => (
                  <div className="workspace-attention-row" key={record.id}>
                    <span className="workspace-attention-dot" />
                    <span className="workspace-attention-copy">
                      <strong>{locale === "ar" ? record.titleAr : record.titleEn}</strong>
                      <small>{record.id} · {statusLabel(record.status, copy)}</small>
                    </span>
                    <DirectionArrow size={13} aria-hidden="true" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="workspace-attention-empty"><CircleCheck size={17} />{copy.attentionEmpty}</div>
            )}
          </Panel>
          <div className="workspace-demo-note" role="note">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>{copy.demoNotice}</span>
          </div>
        </aside>
      </div>

      {toast ? <div className="workspace-toast" role="status" aria-live="polite">{toast}</div> : null}
      {dialogOpen ? (
        <CreateRecordDialog
          page={page}
          copy={copy}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleCreateRecord}
        />
      ) : null}
    </div>
  );
}

function WorkspaceDataPanel({
  page,
  copy,
  locale,
  records,
  query,
  filter,
  isNotifications,
  unreadOnly,
  onQueryChange,
  onFilterChange,
  onUnreadOnlyChange,
  onMarkAllRead,
  onUpdateRecord,
}: {
  page: WorkspacePageCopy;
  copy: WorkspaceLocaleCopy;
  locale: Locale;
  records: WorkspaceRecord[];
  query: string;
  filter: "all" | "active" | "attention";
  isNotifications: boolean;
  unreadOnly: boolean;
  onQueryChange: (value: string) => void;
  onFilterChange: (value: "all" | "active" | "attention") => void;
  onUnreadOnlyChange: (value: boolean) => void;
  onMarkAllRead: () => void;
  onUpdateRecord: (id: string) => void;
}) {
  return (
    <Panel className="workspace-data-panel">
      <div className="workspace-data-heading">
        <div>
            <span className="workspace-section-kicker"><Activity size={12} />{copy.demoBadge}</span>
          <h2>{page.sectionTitle}</h2>
          <p>{page.sectionDescription}</p>
        </div>
        <div className="workspace-record-count"><strong>{formatNumber(records.length, locale)}</strong><span>{copy.totalRecords}</span></div>
      </div>
      <div className="workspace-data-toolbar">
        <label className="workspace-search-field">
          <Search size={16} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={copy.searchPlaceholder}
            aria-label={copy.searchPlaceholder}
            dir="auto"
          />
        </label>
        <div className="workspace-filter-row" role="group" aria-label={page.sectionTitle}>
          {([
            ["all", copy.filterAll],
            ["active", copy.filterActive],
            ["attention", copy.filterAttention],
          ] as const).map(([value, label]) => (
            <button className={cn("workspace-filter-chip", filter === value && "is-active")} type="button" key={value} onClick={() => onFilterChange(value)} aria-pressed={filter === value}>
              {label}
            </button>
          ))}
        </div>
        {isNotifications ? (
          <div className="workspace-notification-actions">
            <button type="button" className={cn("workspace-filter-chip", unreadOnly && "is-active")} onClick={() => onUnreadOnlyChange(!unreadOnly)} aria-pressed={unreadOnly}>{copy.notificationsUnreadOnly}</button>
            <Button size="sm" variant="outline" onClick={onMarkAllRead}><CheckCheck size={14} />{copy.notificationsMarkAll}</Button>
          </div>
        ) : null}
      </div>
      {records.length ? (
        <div className="workspace-table-scroll">
          <table className="workspace-data-table">
            <thead>
              <tr>
                <th>{copy.reference}</th>
                <th>{copy.record}</th>
                <th>{copy.category}</th>
                <th>{copy.branch}</th>
                <th>{copy.value}</th>
                <th>{copy.status}</th>
                <th><span className="sr-only">{copy.actions}</span></th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td><span className="workspace-reference">{record.id}</span></td>
                  <td>
                    <div className="workspace-record-cell">
                      <span className="workspace-record-mark">{record.id.slice(-2)}</span>
                      <span>
                        <strong>{locale === "ar" ? record.titleAr : record.titleEn}</strong>
                        <small>{locale === "ar" ? record.detailAr : record.detailEn}</small>
                      </span>
                    </div>
                  </td>
                  <td><span className="workspace-category">{locale === "ar" ? record.categoryAr : record.categoryEn}</span></td>
                  <td><span className="workspace-branch-cell">{record.branchId ? branchName(record.branchId, locale) : "—"}</span></td>
                  <td><strong className="workspace-value">{valueLabel(record, locale)}</strong></td>
                  <td><span className={`workspace-status workspace-status-${record.status}`}><i />{statusLabel(record.status, copy)}</span></td>
                  <td>
                    <button className="workspace-row-action" type="button" onClick={() => onUpdateRecord(record.id)} aria-label={`${copy.rowAction}: ${locale === "ar" ? record.titleAr : record.titleEn}`} title={copy.rowAction}>
                      {record.status === "unread" ? <CheckCheck size={15} /> : <Check size={15} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="workspace-empty-state">
          <span><Search size={18} /></span>
          <h3>{copy.noResultsTitle}</h3>
          <p>{copy.noResultsDescription}</p>
        </div>
      )}
      <div className="workspace-table-footer">
        <span>{page.sectionDescription}</span>
        <span><span className="workspace-status-dot" />{copy.demoBadge}</span>
      </div>
    </Panel>
  );
}

function BranchDirectory({
  records,
  branchScope,
  patients,
  appointments,
  locale,
  copy,
  onSelectBranch,
}: {
  records: WorkspaceRecord[];
  branchScope: BranchId;
  patients: ReturnType<typeof useClinicData>["patients"];
  appointments: ReturnType<typeof useClinicData>["appointments"];
  locale: Locale;
  copy: WorkspaceLocaleCopy;
  onSelectBranch: (branch: BranchId) => void;
}) {
  const appText = messages[locale];
  const ArrowIcon = locale === "ar" ? ArrowLeft : ArrowRight;
  return (
    <Panel className="workspace-branch-panel">
      <div className="workspace-data-heading">
        <div>
          <span className="workspace-section-kicker"><Building2 size={12} />{copy.branchScope}</span>
          <h2>{copy.pages.branches.sectionTitle}</h2>
          <p>{copy.pages.branches.sectionDescription}</p>
        </div>
        <span className="workspace-record-count"><strong>{formatNumber(records.length, locale)}</strong><span>{copy.totalRecords}</span></span>
      </div>
      <div className="workspace-branch-grid">
        {records.map((record) => {
          const branch = BRANCHES.find((item) => item.id === record.branchId);
          const branchPatients = branch ? patients.filter((patient) => patient.branchId === branch.id).length : record.units ?? 0;
          const branchAppointments = branch
            ? appointments.filter((appointment) => appointment.branchId === branch.id && appointment.date === DEMO_TODAY && !["cancelled", "noShow"].includes(appointment.status)).length
            : 0;
          const name = locale === "ar" ? record.titleAr : record.titleEn;
          const city = branch ? (locale === "ar" ? branch.cityAr : branch.cityEn) : (locale === "ar" ? record.detailAr : record.detailEn);
          const isSelected = branch?.id === branchScope;
          return (
            <article className={cn("workspace-branch-card", isSelected && "is-selected", record.status === "draft" && "is-draft")} key={record.id}>
              <div className="workspace-branch-card-top">
                <span className="workspace-branch-icon"><Building2 size={18} /></span>
                <span className={cn("workspace-branch-state", isSelected ? "selected" : "")}>{isSelected ? copy.branchActive : record.status === "draft" ? copy.draft : copy.branchPreview}</span>
              </div>
              <h3>{name}</h3>
              <p><MapPin size={13} />{city}</p>
              <div className="workspace-branch-card-stats">
                <span><strong>{formatNumber(branchPatients, locale)}</strong><small>{copy.patientsLabel}</small></span>
                <span><strong>{formatNumber(branchAppointments, locale)}</strong><small>{copy.appointmentsTodayLabel}</small></span>
              </div>
              <div className="workspace-branch-load">
                <div><span>{copy.progressLabel}</span><strong>{formatNumber(record.metric ?? 0, locale)}%</strong></div>
                <div className="workspace-progress-track"><span style={{ width: `${record.metric ?? 0}%` }} /></div>
              </div>
              <Button
                variant={isSelected ? "secondary" : "outline"}
                size="sm"
                disabled={!branch}
                onClick={() => branch && onSelectBranch(branch.id)}
              >
                {isSelected ? <Check size={14} /> : <ArrowIcon size={14} />}
                {isSelected ? appText.app.branchOverview : copy.viewBranch}
              </Button>
            </article>
          );
        })}
      </div>
      <div className="workspace-branch-note"><ShieldCheck size={15} />{copy.branchAssignmentNotice}</div>
    </Panel>
  );
}

function WorkflowInsight({
  title,
  description,
  score,
  activeCount,
  attentionCount,
  completedCount,
  locale,
  copy,
}: {
  title: string;
  description: string;
  score: number;
  activeCount: number;
  attentionCount: number;
  completedCount: number;
  locale: Locale;
  copy: WorkspaceLocaleCopy;
}) {
  const chartTotal = Math.max(activeCount + attentionCount + completedCount, 1);
  return (
    <Panel className="workspace-insight-panel">
      <div className="workspace-side-heading">
        <span className="workspace-side-heading-icon workspace-insight-icon"><Activity size={16} /></span>
        <div><span className="workspace-mini-kicker">{copy.demoBadge}</span><h2>{title}</h2></div>
      </div>
      <div className="workspace-insight-score-row">
        <div>
          <strong>{formatNumber(score, locale)}<small>%</small></strong>
          <span>{copy.progressLabel}</span>
        </div>
        <div className="workspace-score-ring" style={{ "--score": `${score}%` } as CSSProperties} aria-label={`${score}%`}>
          <span><Activity size={19} /></span>
        </div>
      </div>
      <div className="workspace-progress-track workspace-progress-large"><span style={{ width: `${score}%` }} /></div>
      <p className="workspace-insight-description">{description}</p>
      <div className="workspace-status-composition" aria-label={copy.progressLabel}>
        <span className="composition-active" style={{ width: `${activeCount / chartTotal * 100}%` }} />
        <span className="composition-attention" style={{ width: `${attentionCount / chartTotal * 100}%` }} />
        <span className="composition-complete" style={{ width: `${completedCount / chartTotal * 100}%` }} />
      </div>
      <div className="workspace-composition-legend">
        <span><i className="composition-dot-active" />{copy.active} <strong>{formatNumber(activeCount, locale)}</strong></span>
        <span><i className="composition-dot-attention" />{copy.attention} <strong>{formatNumber(attentionCount, locale)}</strong></span>
        <span><i className="composition-dot-complete" />{copy.completed} <strong>{formatNumber(completedCount, locale)}</strong></span>
      </div>
    </Panel>
  );
}

function SettingsWorkspace({
  locale,
  role,
  branchId,
  theme,
  sidebarCollapsed,
  copy,
  onRoleChange,
  onBranchChange,
  onThemeChange,
  onLanguageChange,
  onSidebarChange,
  weeklyDigest,
  appointmentAlerts,
  onWeeklyDigestChange,
  onAppointmentAlertsChange,
}: {
  locale: Locale;
  role: RoleId;
  branchId: BranchId;
  theme: "light" | "dark";
  sidebarCollapsed: boolean;
  copy: WorkspaceLocaleCopy;
  onRoleChange: (role: RoleId) => void;
  onBranchChange: (branch: BranchId) => void;
  onThemeChange: (theme: "light" | "dark") => void;
  onLanguageChange: () => void;
  onSidebarChange: (value: boolean) => void;
  weeklyDigest: boolean;
  appointmentAlerts: boolean;
  onWeeklyDigestChange: (value: boolean) => void;
  onAppointmentAlertsChange: (value: boolean) => void;
}) {
  const appText = messages[locale];
  return (
    <div className="workspace-settings-grid">
      <Panel className="workspace-settings-panel">
        <div className="workspace-settings-heading">
          <span className="workspace-settings-icon workspace-settings-teal"><Settings2 size={17} /></span>
          <div><h2>{copy.settingsWorkspace}</h2><p>{copy.pages.settings.sectionDescription}</p></div>
        </div>
        <div className="workspace-setting-field">
          <label htmlFor="workspace-role">{copy.settingsRole}</label>
          <select id="workspace-role" value={role} onChange={(event) => onRoleChange(event.target.value as RoleId)}>
            {ROLE_IDS.map((roleId) => <option value={roleId} key={roleId}>{appText.roles[roleId]}</option>)}
          </select>
          <small>{locale === "ar" ? "محاكاة للصلاحيات فقط، وليست ضابط أمان." : "Visual role simulation only; not a security control."}</small>
        </div>
        <div className="workspace-setting-field">
          <label htmlFor="workspace-branch">{copy.selectBranch}</label>
          <select id="workspace-branch" value={ROLE_BRANCH_SCOPE[role] ?? branchId} disabled={Boolean(ROLE_BRANCH_SCOPE[role])} onChange={(event) => onBranchChange(event.target.value as BranchId)}>
            {!ROLE_BRANCH_SCOPE[role] ? <option value="all">{appText.branches.all}</option> : null}
            {BRANCHES.filter((branch) => !ROLE_BRANCH_SCOPE[role] || branch.id === ROLE_BRANCH_SCOPE[role]).map((branch) => <option key={branch.id} value={branch.id}>{locale === "ar" ? branch.nameAr : branch.nameEn}</option>)}
          </select>
        </div>
        <div className="workspace-settings-footer"><MapPin size={14} />{branchId === "all" ? appText.branches.all : (locale === "ar" ? BRANCHES.find((branch) => branch.id === branchId)?.nameAr : BRANCHES.find((branch) => branch.id === branchId)?.nameEn)}</div>
      </Panel>

      <Panel className="workspace-settings-panel">
        <div className="workspace-settings-heading">
          <span className="workspace-settings-icon workspace-settings-violet"><Sparkles size={17} /></span>
          <div><h2>{copy.settingsAppearance}</h2><p>{locale === "ar" ? "اضبط العرض على الجهاز الحالي." : "Tune the view for this device."}</p></div>
        </div>
        <div className="workspace-setting-control">
          <div><strong>{copy.settingsLanguage}</strong><small>{locale === "ar" ? "تبديل فوري بين العربية والإنجليزية" : "Switch between Arabic and English"}</small></div>
          <Button variant="outline" size="sm" onClick={onLanguageChange}>{locale === "ar" ? "English" : "العربية"}</Button>
        </div>
        <div className="workspace-setting-control">
          <div><strong>{copy.settingsTheme}</strong><small>{locale === "ar" ? "تغيير مظهر المنصة" : "Change the application theme"}</small></div>
          <div className="workspace-segmented-control">
            <button type="button" onClick={() => onThemeChange("light")} className={theme === "light" ? "is-active" : ""}>{copy.themeLight}</button>
            <button type="button" onClick={() => onThemeChange("dark")} className={theme === "dark" ? "is-active" : ""}>{copy.themeDark}</button>
          </div>
        </div>
        <PreferenceSwitch label={copy.settingsCompactSidebar} enabled={sidebarCollapsed} copy={copy} onChange={onSidebarChange} />
      </Panel>

      <Panel className="workspace-settings-panel">
        <div className="workspace-settings-heading">
          <span className="workspace-settings-icon workspace-settings-blue"><Bell size={17} /></span>
          <div><h2>{copy.settingsNotifications}</h2><p>{locale === "ar" ? "تنبيهات محلية تجريبية لهذا العرض." : "Local demo alerts for this prototype."}</p></div>
        </div>
        <PreferenceSwitch label={copy.settingsWeeklyDigest} enabled={weeklyDigest} copy={copy} onChange={onWeeklyDigestChange} />
        <PreferenceSwitch label={copy.settingsAppointmentAlerts} enabled={appointmentAlerts} copy={copy} onChange={onAppointmentAlertsChange} />
        <div className="workspace-privacy-card"><ShieldCheck size={16} /><div><strong>{copy.settingsPrivacy}</strong><p>{copy.settingsDataNote}</p></div></div>
      </Panel>
    </div>
  );
}

function PreferenceSwitch({
  label,
  enabled,
  copy,
  onChange,
}: {
  label: string;
  enabled: boolean;
  copy: WorkspaceLocaleCopy;
  onChange: (nextValue: boolean) => void;
}) {
  return (
    <div className="workspace-setting-control">
      <div><strong>{label}</strong><small>{enabled ? copy.enabled : copy.disabled}</small></div>
      <button className={cn("workspace-switch", enabled && "is-on")} type="button" role="switch" aria-checked={enabled} aria-label={label} onClick={() => onChange(!enabled)}><span /></button>
    </div>
  );
}

function CreateRecordDialog({
  page,
  copy,
  onClose,
  onSubmit,
}: {
  page: WorkspacePageCopy;
  copy: WorkspaceLocaleCopy;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="workspace-dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="workspace-dialog" role="dialog" aria-modal="true" aria-labelledby="workspace-dialog-title">
        <div className="workspace-dialog-heading">
          <span className="workspace-dialog-icon"><Plus size={18} /></span>
          <div><h2 id="workspace-dialog-title">{page.addLabel}</h2><p>{copy.createDialogDescription}</p></div>
          <button type="button" className="workspace-dialog-close" onClick={onClose} aria-label={copy.cancelButton}><X size={18} /></button>
        </div>
        <form onSubmit={onSubmit}>
          <label className="workspace-form-field"><span>{copy.nameField}</span><input name="title" required maxLength={90} autoFocus /></label>
          <label className="workspace-form-field"><span>{copy.categoryField}</span><input name="category" maxLength={60} /></label>
          <label className="workspace-form-field"><span>{copy.detailField}</span><textarea name="detail" rows={3} maxLength={180} /></label>
          <div className="workspace-dialog-footer"><Button variant="outline" type="button" onClick={onClose}>{copy.cancelButton}</Button><Button type="submit"><Plus size={15} />{copy.createButton}</Button></div>
        </form>
      </section>
    </div>
  );
}

function buildMetrics(
  key: WorkspaceKey,
  records: WorkspaceRecord[],
  patients: ReturnType<typeof useClinicData>["patients"],
  appointments: ReturnType<typeof useClinicData>["appointments"],
  branchId: BranchId,
  role: RoleId,
  theme: "light" | "dark",
  locale: Locale,
  copy: WorkspaceLocaleCopy,
  appText: Messages,
): WorkspaceMetric[] {
  const labels = copy.pages[key].metricLabels;
  const count = (value: number) => formatNumber(value, locale);
  const totalAmount = (rows: WorkspaceRecord[]) => rows.reduce((sum, record) => sum + (record.amount ?? 0), 0);
  const ratio = (value: number, total: number) =>
    total > 0 ? Math.round(Math.min(100, Math.max(0, (value / total) * 100))) : 0;
  const active = records.filter((record) => ACTIVE_STATUSES.has(record.status));
  const attention = records.filter((record) => ATTENTION_STATUSES.has(record.status));
  const completed = records.filter((record) => COMPLETE_STATUSES.has(record.status));
  const scopedAppointments = appointments.filter((appointment) =>
    (branchId === "all" || appointment.branchId === branchId) &&
    appointment.date === DEMO_TODAY &&
    !["cancelled", "noShow"].includes(appointment.status),
  );
  const scopedPatients = patients.filter((patient) => branchId === "all" || patient.branchId === branchId);
  const metricValues: Array<{ value: string; hint: string; progress?: number }> = [];

  switch (key) {
    case "branches": {
      const visibleBranches = BRANCHES.filter((branch) => branchId === "all" || branch.id === branchId);
      const occupancy = records.length ? Math.round(records.reduce((sum, record) => sum + (record.metric ?? 0), 0) / records.length) : 0;
      metricValues.push(
        { value: count(visibleBranches.length), hint: copy.branchScope },
        { value: count(scopedPatients.length), hint: copy.demoBadge },
        { value: count(scopedAppointments.length), hint: copy.appointmentsTodayLabel },
        { value: `${count(occupancy)}%`, hint: copy.progressLabel, progress: ratio(occupancy, 100) },
      );
      break;
    }
    case "clinical":
    case "treatmentPlans":
      metricValues.push(
        { value: count(records.length), hint: copy.totalRecords },
        { value: count(attention.length), hint: copy.filterAttention, progress: ratio(attention.length, records.length) },
        { value: count(completed.length), hint: copy.completed, progress: ratio(completed.length, records.length) },
        { value: count(records.reduce((sum, record) => sum + (record.units ?? 0), 0)), hint: locale === "ar" ? "جلسات ضمن العرض" : "Sessions in demo" },
      );
      if (key === "clinical") {
        const flaggedRecords = records.filter((record) => record.status === "attention").length;
        metricValues[3] = { value: count(flaggedRecords), hint: copy.attention, progress: ratio(flaggedRecords, records.length) };
      }
      break;
    case "services":
    case "packages": {
      const durationOrSessions = records.reduce((sum, record) => sum + (record.metric ?? 0), 0);
      const average = records.length ? Math.round(durationOrSessions / records.length) : 0;
      const averagePrice = records.length ? Math.round(totalAmount(records) / records.length) : 0;
      metricValues.push(
        { value: count(records.length), hint: copy.totalRecords },
        { value: count(active.length), hint: copy.active, progress: ratio(active.length, records.length) },
        { value: key === "services" ? `${count(average)} ${locale === "ar" ? "دقيقة" : "min"}` : count(records.reduce((sum, record) => sum + (record.metric ?? 0), 0)), hint: key === "services" ? copy.pages.services.metricLabels[2] : copy.pages.packages.metricLabels[2] },
        { value: formatCurrency(averagePrice, locale), hint: copy.pages[key].metricLabels[3] },
      );
      break;
    }
    case "finance": {
      const due = records.filter((record) => ["pending", "attention", "review"].includes(record.status));
      const collected = records.filter((record) => record.status === "completed");
      const overdue = records.filter((record) => record.status === "attention");
      metricValues.push(
        { value: count(records.length), hint: copy.totalRecords },
        { value: formatCurrency(totalAmount(due), locale), hint: copy.pending, progress: ratio(totalAmount(due), totalAmount(records)) },
        { value: formatCurrency(totalAmount(collected), locale), hint: copy.completed, progress: ratio(totalAmount(collected), totalAmount(records)) },
        { value: count(overdue.length), hint: copy.attention, progress: ratio(overdue.length, records.length) },
      );
      break;
    }
    case "inventory": {
      const units = records.reduce((sum, record) => sum + (record.metric ?? 0), 0);
      const lowStock = records.filter((record) => record.status === "lowStock" || record.status === "attention").length;
      const onOrder = records.filter((record) => record.status === "pending" || record.status === "inProgress").length;
      metricValues.push(
        { value: count(records.length), hint: copy.totalRecords },
        { value: count(lowStock), hint: copy.lowStock, progress: ratio(lowStock, records.length) },
        { value: count(units), hint: locale === "ar" ? "وحدة في بيانات العرض" : "Units in demo data" },
        { value: count(onOrder), hint: copy.inProgress, progress: ratio(onOrder, records.length) },
      );
      break;
    }
    case "procurement": {
      const awaiting = records.filter((record) => record.status === "pending" || record.status === "review");
      metricValues.push(
        { value: count(records.length), hint: copy.totalRecords },
        { value: count(awaiting.length), hint: copy.filterAttention, progress: ratio(awaiting.length, records.length) },
        { value: count(completed.length), hint: copy.completed, progress: ratio(completed.length, records.length) },
        { value: formatCurrency(totalAmount(records), locale), hint: locale === "ar" ? "قيمة اصطناعية" : "Synthetic value" },
      );
      break;
    }
    case "employees": {
      const specialties = new Set(records.map((record) => locale === "ar" ? record.categoryAr : record.categoryEn));
      const representedBranches = new Set(records.map((record) => record.branchId).filter(Boolean));
      metricValues.push(
        { value: count(records.length), hint: copy.demoBadge },
        { value: count(specialties.size), hint: locale === "ar" ? "تخصصات في العينة" : "Specialties in sample" },
        { value: count(active.length), hint: copy.active, progress: ratio(active.length, records.length) },
        { value: count(representedBranches.size), hint: locale === "ar" ? "فروع ممثلة في العينة" : "Branches represented" },
      );
      break;
    }
    case "reports": {
      const readyReports = records.filter((record) => record.status === "completed" || record.status === "active").length;
      const scheduledReports = records.filter((record) => record.status === "scheduled").length;
      metricValues.push(
        { value: count(records.length), hint: copy.totalRecords },
        { value: count(readyReports), hint: copy.active, progress: ratio(readyReports, records.length) },
        { value: count(scheduledReports), hint: copy.scheduled, progress: ratio(scheduledReports, records.length) },
        { value: count(completed.length), hint: copy.completed, progress: ratio(completed.length, records.length) },
      );
      break;
    }
    case "marketing": {
      const audience = records.reduce((sum, record) => sum + (record.audience ?? 0), 0);
      const engagementRows = records.filter((record) => record.metric !== undefined);
      const engagement = engagementRows.length ? engagementRows.reduce((sum, record) => sum + (record.metric ?? 0), 0) / engagementRows.length : 0;
      metricValues.push(
        { value: count(records.length), hint: copy.totalRecords },
        { value: count(active.length), hint: copy.active, progress: ratio(active.length, records.length) },
        { value: count(audience), hint: locale === "ar" ? "وصول تقديري اصطناعي" : "Synthetic estimated reach" },
        { value: `${engagement.toFixed(1)}%`, hint: locale === "ar" ? "تفاعل تجريبي" : "Demo engagement", progress: ratio(engagement, 100) },
      );
      break;
    }
    case "notifications": {
      const appointmentAlerts = records.filter((record) => record.categoryEn.toLowerCase().includes("appointment")).length;
      const taskAlerts = records.filter((record) => record.categoryEn.toLowerCase().includes("task") || record.categoryEn.toLowerCase().includes("inventory")).length;
      const unread = records.filter((record) => record.status === "unread").length;
      metricValues.push(
        { value: count(records.length), hint: copy.totalRecords },
        { value: count(unread), hint: copy.unread, progress: ratio(unread, records.length) },
        { value: count(appointmentAlerts), hint: locale === "ar" ? "تنبيهات مواعيد العرض" : "Demo appointment alerts" },
        { value: count(taskAlerts), hint: locale === "ar" ? "مهام تشغيلية تجريبية" : "Demo operations tasks" },
      );
      break;
    }
    case "settings":
      metricValues.push(
        { value: locale === "ar" ? "العربية" : "English", hint: copy.settingsLanguage },
        { value: theme === "dark" ? copy.themeDark : copy.themeLight, hint: copy.settingsTheme },
        { value: appText.roles[role], hint: copy.settingsRole },
        { value: branchId === "all" ? appText.branches.all : branchName(branchId, locale), hint: copy.branchScope },
      );
      break;
  }

  const icons: LucideIcon[] = [Layers, Activity, CircleAlert, CircleCheck];
  const tones: WorkspaceMetric["tone"][] = ["teal", "blue", "violet", "amber"];
  return metricValues.map((entry, index) => ({
    label: labels[index],
    value: entry.value,
    hint: entry.hint,
    progress: entry.progress,
    icon: icons[index],
    tone: tones[index],
  }));
}

function resolveWorkspaceKey(module: ModuleId, path: string): WorkspaceKey {
  const first = path.split("/").filter(Boolean)[0];
  if (first === "treatment-plans") return "treatmentPlans";
  if (first === "packages") return "packages";
  switch (module) {
    case "branches": return "branches";
    case "clinical": return "clinical";
    case "services": return "services";
    case "finance": return "finance";
    case "inventory": return "inventory";
    case "employees": return "employees";
    case "reports": return "reports";
    case "marketing": return "marketing";
    case "notifications": return "notifications";
    case "settings": return "settings";
    case "appointments": return "clinical";
    case "patients": return "clinical";
  }
}

function branchName(branchId: Exclude<BranchId, "all">, locale: Locale): string {
  const branch = BRANCHES.find((item) => item.id === branchId);
  if (!branch) return "—";
  return locale === "ar" ? branch.nameAr : branch.nameEn;
}

function statusLabel(status: WorkspaceStatus, copy: WorkspaceLocaleCopy): string {
  return copy.statuses[status] ?? status;
}

function valueLabel(record: WorkspaceRecord, locale: Locale): string {
  if (record.amount !== undefined) return formatCurrency(record.amount, locale);
  const localizedValue = locale === "ar" ? record.valueAr : record.valueEn;
  if (localizedValue) return localizedValue;
  if (record.metric !== undefined) return `${formatNumber(record.metric, locale)}${record.metric <= 100 ? "%" : ""}`;
  return "—";
}

function nextStatus(status: WorkspaceStatus): WorkspaceStatus {
  if (status === "unread") return "read";
  if (status === "read") return "unread";
  if (status === "active" || status === "inProgress" || status === "scheduled") return "completed";
  if (status === "completed") return "active";
  if (status === "lowStock") return "pending";
  return "completed";
}
