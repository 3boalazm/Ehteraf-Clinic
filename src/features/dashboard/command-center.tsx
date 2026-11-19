"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  FileText,
  MapPin,
  Network,
  Users,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/design-system/badge";
import { Button } from "@/design-system/button";
import { Card } from "@/design-system/card";
import { Select } from "@/design-system/fields";
import { SectionHeading, StatBlock } from "@/design-system/blocks";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { useClinicData } from "@/services/clinic-data-provider";
import { mockDashboardRepository } from "@/services/repositories/dashboard.repository";
import { BRANCHES } from "@/lib/mock/branches";
import {
  CLINIC_SERVICES,
  CLINIC_THERAPISTS,
  DEMO_TODAY,
} from "@/lib/mock/clinic-seed";
import { RECENT_ACTIVITIES } from "@/lib/mock/dashboard-data";
import { getBranchName, matchesServiceFilter } from "@/lib/clinic-utils";
import { canAccessModule } from "@/lib/config/roles";
import { messages } from "@/lib/i18n/messages";
import type { DateRange, ServiceFilter } from "@/types";

const tLabel = (locale: "ar" | "en", ar: string, en: string) =>
  locale === "ar" ? ar : en;
const statusCopy = (locale: "ar" | "en", status: string) => {
  const ar: Record<string, string> = {
    confirmed: "مؤكد",
    checkedIn: "وصل",
    inSession: "بالجلسة",
    completed: "مكتمل",
    booked: "محجوز",
    noShow: "لم يحضر",
    cancelled: "ملغي",
  };
  const en: Record<string, string> = {
    confirmed: "Confirmed",
    checkedIn: "Checked in",
    inSession: "In session",
    completed: "Completed",
    booked: "Booked",
    noShow: "No-show",
    cancelled: "Cancelled",
  };
  return (locale === "ar" ? ar : en)[status] ?? status;
};

export function CommandCenter() {
  const router = useRouter();
  const { locale, role, branchId, setBranchId } = useWorkspace();
  const { appointments } = useClinicData();
  const copy = messages[locale].dashboard;
  const [range, setRange] = useState<DateRange>("month");
  const [service, setService] = useState<ServiceFilter>("all");
  const isArabic = locale === "ar";
  const dir = isArabic ? "rtl" : "ltr";
  const snapshot = useMemo(
    () =>
      mockDashboardRepository.getOverview({ branchId, range, service, locale }),
    [branchId, locale, range, service],
  );
  const inScope = (id: string) => branchId === "all" || id === branchId;
  const scopedAppointments = useMemo(
    () =>
      appointments.filter(
        (item) =>
          (branchId === "all" || item.branchId === branchId) &&
          matchesServiceFilter(item.serviceId, service),
      ),
    [appointments, branchId, service],
  );
  const rangeAppointments = useMemo(() => {
    const start = new Date(`${DEMO_TODAY}T12:00:00`);
    const days = range === "week" ? 7 : range === "quarter" ? 90 : 31;
    const end = new Date(start);
    end.setDate(end.getDate() + days);
    return scopedAppointments
      .filter((item) => {
        const date = new Date(`${item.date}T12:00:00`);
        return (
          date >= start &&
          date < end &&
          !["cancelled", "noShow"].includes(item.status)
        );
      })
      .sort((a, b) =>
        `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`),
      );
  }, [range, scopedAppointments]);
  const todayAppointments = useMemo(
    () =>
      scopedAppointments
        .filter(
          (item) =>
            item.date === DEMO_TODAY &&
            !["cancelled", "noShow"].includes(item.status),
        )
        .sort((a, b) => a.time.localeCompare(b.time)),
    [scopedAppointments],
  );
  const branches = snapshot.branchOverview;
  const maxRevenue = Math.max(1, ...branches.map((item) => item.invoiced));
  const formatNumber = (value: number) =>
    new Intl.NumberFormat(isArabic ? "ar-SA" : "en-US").format(value);
  const money = (value: number) => `${formatNumber(value)} ${copy.sar}`;
  const route = (path: string) => router.push(`/${locale}/${path}`);
  const metric = (id: string) =>
    snapshot.metrics.find((item) => item.id === id)?.value ?? 0;
  const therapistName = (id: string) => {
    const therapist = CLINIC_THERAPISTS.find((item) => item.id === id);
    return therapist
      ? isArabic
        ? therapist.nameAr
        : therapist.nameEn
      : tLabel(locale, "الفريق العلاجي", "Care team");
  };
  const serviceName = (id: string) => {
    const found = CLINIC_SERVICES.find((item) => item.id === id);
    return found
      ? isArabic
        ? found.nameAr
        : found.nameEn
      : tLabel(locale, "جلسة علاجية", "Therapy session");
  };
  const chartData = snapshot.appointmentTrend;
  const activityLabels: Record<string, string> = {
    payment: tLabel(
      locale,
      "تحديث تحصيل تجريبي",
      "Illustrative collection entry",
    ),
    patient: tLabel(locale, "إضافة ملف تجريبي", "Illustrative profile entry"),
    appointment: tLabel(
      locale,
      "تحديث موعد تجريبي",
      "Illustrative appointment entry",
    ),
    report: tLabel(locale, "مراجعة تقرير تجريبي", "Illustrative report review"),
  };

  return (
    <main dir={dir} className="space-y-6 pb-8 text-ink">
      <header className="relative overflow-hidden rounded-[1.5rem] border border-line bg-surface px-5 py-6 sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -end-8 -top-20 h-56 w-56 rounded-full border border-teal/10" />
        <div className="pointer-events-none absolute -end-1 -top-12 h-40 w-40 rounded-full border border-teal/10" />
        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[.18em] text-teal">
              <Network size={15} />
              {copy.spatialBrand}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {branchId === "all"
                ? copy.groupCommandCenter
                : copy.branchCommandCenter}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
              {branchId === "all"
                ? copy.groupCommandCenterHint
                : copy.branchCommandCenterHint}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {canAccessModule(role, "reports") && (
              <Button variant="outline" onClick={() => route("reports")}>
                <FileText size={16} />
                {copy.viewReports}
              </Button>
            )}
            {canAccessModule(role, "appointments") && (
              <Button onClick={() => route("appointments")}>
                <CalendarDays size={16} />
                {copy.viewSchedule}
              </Button>
            )}
          </div>
        </div>
        <div className="relative mt-6 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <MapPin size={16} className="shrink-0 text-teal" />
            <span className="font-medium">
              {getBranchName(branchId, locale)}
            </span>
            <Badge tone="teal">
              {tLabel(locale, "بيانات تجريبية", "Synthetic demo data")}
            </Badge>
          </div>
          <div className="ms-auto flex flex-wrap gap-2">
            <label className="sr-only" htmlFor="command-scope">
              {copy.filterContext}
            </label>
            <Select
              id="command-scope"
              aria-label={copy.currentScope}
              value={branchId}
              onChange={(event) =>
                setBranchId(event.target.value as typeof branchId)
              }
              className="min-w-36"
            >
              {role === "owner" && (
                <option value="all">
                  {tLabel(locale, "كل الفروع", "All branches")}
                </option>
              )}
              {BRANCHES.filter(
                (branch) => role === "owner" || branch.id === branchId,
              ).map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {isArabic ? branch.nameAr : branch.nameEn}
                </option>
              ))}
            </Select>
            <Select
              aria-label={copy.dateRange}
              value={range}
              onChange={(event) => setRange(event.target.value as DateRange)}
            >
              <option value="week">{copy.thisWeek}</option>
              <option value="month">{copy.thisMonth}</option>
              <option value="quarter">{copy.thisQuarter}</option>
            </Select>
            <Select
              aria-label={copy.serviceType}
              value={service}
              onChange={(event) =>
                setService(event.target.value as ServiceFilter)
              }
            >
              <option value="all">{copy.allServices}</option>
              <option value="orthopedic">{copy.orthopedic}</option>
              <option value="sports">{copy.sports}</option>
              <option value="neurological">{copy.neurological}</option>
            </Select>
          </div>
        </div>
      </header>

      <section
        aria-label={copy.groupIntelligence}
        className="grid grid-cols-2 gap-3 xl:grid-cols-5"
      >
        <StatBlock
          label={copy.totalRevenue}
          value={money(metric("revenue"))}
          detail={copy.revenueDescription}
          tone="ink"
          icon={<CircleDollarSign size={17} />}
        />
        <StatBlock
          label={copy.collectedPayments}
          value={money(metric("collected"))}
          detail={copy.collectedDescription}
          tone="teal"
          icon={<ArrowDownLeft size={17} />}
        />
        <StatBlock
          label={copy.appointments}
          value={formatNumber(metric("appointments"))}
          detail={copy.appointmentsDescription}
          tone="brass"
          icon={<CalendarDays size={17} />}
        />
        <StatBlock
          label={copy.newPatients}
          value={formatNumber(metric("newPatients"))}
          detail={copy.newPatientsDescription}
          tone="clay"
          icon={<Users size={17} />}
        />
        <StatBlock
          label={copy.returningPatients}
          value={formatNumber(metric("returningPatients"))}
          detail={copy.returningPatientsDescription}
          tone="teal"
          icon={<ArrowUpRight size={17} />}
        />
      </section>
      <p className="-mt-4 text-xs text-muted">
        {tLabel(
          locale,
          "الأرقام المالية والتشغيلية لقطة شهرية اصطناعية لكل الخدمات؛ الفلاتر لا تعيد توزيعها.",
          "Financial and operational figures are synthetic monthly, all-service snapshots; filters do not recalculate them.",
        )}
      </p>

      <section className="grid gap-5 xl:grid-cols-[1.12fr_.88fr]">
        <Card className="overflow-hidden p-5 sm:p-6">
          <SectionHeading
            title={copy.branchNetwork}
            description={copy.branchNetworkHint}
            eyebrow={copy.financialFlow}
          />
          <div className="mt-5 space-y-5">
            {branches.map((branch, index) => (
              <div
                key={branch.branchId}
                className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 border-b border-line/70 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-soft text-xs font-semibold text-teal-deep">
                    0{index + 1}
                  </span>
                  <div>
                    <div className="font-medium">{branch.branchName}</div>
                    <div className="mt-0.5 text-xs text-muted">
                      {formatNumber(branch.appointments)} ·{" "}
                      {copy.branchAppointments}
                    </div>
                  </div>
                </div>
                <div className="text-end">
                  <strong className="text-sm tabular-nums">
                    {money(branch.invoiced)}
                  </strong>
                  <div className="mt-1 text-xs text-muted">
                    {copy.invoiced} · {money(branch.collected)} {copy.collected}
                  </div>
                </div>
                <div className="col-span-2 h-1.5 overflow-hidden rounded-full bg-teal-soft">
                  <div
                    className="h-full rounded-full bg-teal"
                    style={{
                      width: `${Math.max(4, (branch.invoiced / maxRevenue) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          {canAccessModule(role, "branches") && (
            <button
              type="button"
              onClick={() => route("branches")}
              className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-teal-deep hover:underline"
            >
              {tLabel(locale, "تفاصيل الفروع", "Branch details")}
              <ChevronRight
                size={15}
                className={isArabic ? "rotate-180" : ""}
              />
            </button>
          )}
        </Card>
        <Card className="p-5 sm:p-6">
          <SectionHeading
            title={copy.appointmentTrend}
            description={copy.appointmentTrendHint}
            eyebrow={tLabel(locale, "الإيقاع عبر الأشهر", "Monthly rhythm")}
          />
          <div className="mt-5 h-56" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 8, right: 10, left: -18, bottom: 0 }}
              >
                <CartesianGrid
                  stroke="#e4e0d7"
                  strokeDasharray="3 5"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#6f7a75", fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#6f7a75", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: "#e4e0d7",
                    background: "#fffefb",
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="appointments"
                  name={copy.totalAppointments}
                  stroke="#547f78"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#547f78" }}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  name={copy.completed}
                  stroke="#ae8d5b"
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: "#ae8d5b" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-xs text-muted">
            <span>
              {tLabel(
                locale,
                "سجل اصطناعي ثابت للمجموعة؛ لا يتأثر بمرشح الخدمة أو الفترة.",
                "Fixed synthetic group history; not recalculated by service or period filters.",
              )}
            </span>
            <span className="inline-flex items-center gap-1">
              <Activity size={13} />
              {tLabel(locale, "بيانات تجريبية", "Demo data")}
            </span>
          </div>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-[.76fr_1.24fr]">
        <Card className="p-5 sm:p-6">
          <SectionHeading
            title={copy.operationsHealth}
            description={copy.operationsHealthHint}
            eyebrow={tLabel(locale, "قراءة تشغيلية", "Operations readout")}
          />
          <div className="mt-5 divide-y divide-line">
            <div className="flex items-center justify-between gap-3 py-4 first:pt-0">
              <div>
                <div className="text-sm font-medium">{copy.noShowRate}</div>
                <p className="mt-1 text-xs text-muted">
                  {copy.noShowDescription}
                </p>
              </div>
              <strong className="text-2xl font-semibold tabular-nums">
                {formatNumber(snapshot.noShowRate)}%
              </strong>
            </div>
            <div className="flex items-center justify-between gap-3 py-4">
              <div>
                <div className="text-sm font-medium">
                  {copy.therapistOccupancy}
                </div>
                <p className="mt-1 text-xs text-muted">
                  {copy.occupancyDescription}
                </p>
              </div>
              <strong className="text-2xl font-semibold tabular-nums">
                {formatNumber(snapshot.occupancy)}%
              </strong>
            </div>
            <div className="flex items-center justify-between gap-3 py-4 last:pb-0">
              <div>
                <div className="text-sm font-medium">{copy.pendingReports}</div>
                <p className="mt-1 text-xs text-muted">
                  {copy.pendingReportsDescription}
                </p>
              </div>
              <strong className="text-2xl font-semibold tabular-nums">
                {formatNumber(snapshot.pendingReports)}
              </strong>
            </div>
          </div>
          <div className="mt-5 rounded-xl bg-teal-soft/70 p-3 text-xs leading-5 text-muted">
            {tLabel(
              locale,
              "قيم تجريبية مجمعة حسب نطاق الفرع؛ لا تمثل حالة مباشرة.",
              "Synthetic branch-scoped aggregates; not a live status feed.",
            )}
          </div>
        </Card>
        <Card className="p-5 sm:p-6">
          <SectionHeading
            title={copy.dailyOperations}
            description={copy.scheduleHint}
            eyebrow={tLabel(locale, "موعد الرعاية", "Care schedule")}
            action={
              <Badge tone="neutral">
                {
                  copy[
                    range === "week"
                      ? "thisWeek"
                      : range === "quarter"
                        ? "thisQuarter"
                        : "thisMonth"
                  ]
                }
              </Badge>
            }
          />
          <div className="mt-5 divide-y divide-line">
            {rangeAppointments.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3 first:pt-0"
              >
                <div className="min-w-[3.5rem] text-center">
                  <div className="text-sm font-semibold tabular-nums">
                    {item.time}
                  </div>
                  <div className="text-[11px] text-muted">
                    {item.date.slice(5)}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {serviceName(item.serviceId)}
                  </div>
                  <div className="mt-1 truncate text-xs text-muted">
                    {therapistName(item.therapistId)} ·{" "}
                    {getBranchName(item.branchId, locale)}
                  </div>
                </div>
                <Badge
                  tone={
                    item.status === "checkedIn" || item.status === "inSession"
                      ? "teal"
                      : "neutral"
                  }
                >
                  {statusCopy(locale, item.status)}
                </Badge>
              </div>
            ))}
            {rangeAppointments.length === 0 && (
              <div className="py-8 text-center text-sm text-muted">
                {copy.emptyAppointments}
              </div>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-line pt-4">
            <span className="text-xs text-muted">
              {formatNumber(rangeAppointments.length)} · {copy.appointments}
            </span>
            {canAccessModule(role, "appointments") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => route("calendar")}
              >
                <CalendarDays size={15} />
                {copy.viewSchedule}
              </Button>
            )}
          </div>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Card className="p-5 sm:p-6">
          <SectionHeading
            title={copy.appointmentOverview}
            description={copy.appointmentOverviewHint}
            eyebrow={tLabel(locale, "الجدول اليومي", "Today at a glance")}
          />
          <div className="mt-5 flex flex-wrap gap-3">
            <div className="min-w-32 flex-1 rounded-xl bg-teal-soft/70 p-4">
              <span className="text-xs text-muted">{copy.dayAppointments}</span>
              <strong className="mt-1 block text-2xl tabular-nums">
                {formatNumber(todayAppointments.length)}
              </strong>
            </div>
            <div className="min-w-32 flex-1 rounded-xl border border-line p-4">
              <span className="text-xs text-muted">{copy.completedToday}</span>
              <strong className="mt-1 block text-2xl tabular-nums">
                {formatNumber(
                  todayAppointments.filter(
                    (item) => item.status === "completed",
                  ).length,
                )}
              </strong>
            </div>
            <div className="min-w-32 flex-1 rounded-xl border border-line p-4">
              <span className="text-xs text-muted">{copy.remainingToday}</span>
              <strong className="mt-1 block text-2xl tabular-nums">
                {formatNumber(
                  todayAppointments.filter(
                    (item) =>
                      !["completed", "cancelled", "noShow"].includes(
                        item.status,
                      ),
                  ).length,
                )}
              </strong>
            </div>
          </div>
          <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted">
            <Clock3 size={14} className="mt-0.5 shrink-0" />
            {tLabel(
              locale,
              "الأعداد من سجلات المواعيد التجريبية لهذا اليوم، بعد تطبيق نطاق الفرع والخدمة.",
              "Counts from synthetic appointment records for the demo day, scoped by branch and service.",
            )}
          </div>
        </Card>
        <Card className="p-5 sm:p-6">
          <SectionHeading
            title={copy.recentActivity}
            description={copy.recentActivityHint}
            eyebrow={tLabel(
              locale,
              "ملخصات دون هوية",
              "Identity-free summaries",
            )}
          />
          <div className="mt-4 space-y-3">
            {RECENT_ACTIVITIES.filter((item) => inScope(item.branchId)).map(
              (item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl border border-line/80 px-3 py-3"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-soft text-teal">
                    <Activity size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">
                      {activityLabels[item.type]}
                    </div>
                    <div className="mt-1 text-xs text-muted">
                      {getBranchName(item.branchId, locale)}
                    </div>
                  </div>
                  <Badge tone="neutral">
                    {tLabel(locale, "توضيحي", "Illustrative")}
                  </Badge>
                </div>
              ),
            )}
            {RECENT_ACTIVITIES.filter((item) => inScope(item.branchId))
              .length === 0 && (
              <p className="py-6 text-center text-sm text-muted">
                {tLabel(
                  locale,
                  "لا توجد ملخصات ضمن النطاق.",
                  "No summaries in this scope.",
                )}
              </p>
            )}
          </div>
          {canAccessModule(role, "patients") && (
            <button
              type="button"
              onClick={() => route("patients")}
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-teal-deep hover:underline"
            >
              {tLabel(locale, "دليل المرضى", "Patient directory")}
              <ChevronRight
                size={15}
                className={isArabic ? "rotate-180" : ""}
              />
            </button>
          )}
        </Card>
      </section>
      <div className="flex items-start gap-2 rounded-xl border border-line bg-surface px-4 py-3 text-xs leading-5 text-muted">
        <Activity size={15} className="mt-0.5 shrink-0 text-teal" />
        <span>
          {tLabel(
            locale,
            "هذا نموذج ببيانات اصطناعية. الملخصات الثابتة توضيحية وليست مؤشرات لحظية أو سجلات مالية جديدة.",
            "This prototype uses synthetic data. Fixed summaries are illustrative—not live signals or new accounting records.",
          )}
        </span>
      </div>
    </main>
  );
}
