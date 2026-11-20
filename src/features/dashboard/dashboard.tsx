"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  CalendarCheck2,
  CalendarX2,
  CreditCard,
  FileClock,
  HeartPulse,
  Plus,
  Repeat2,
  UserPlus,
  Wallet,
  Warehouse,
} from "lucide-react";
import { STATUS_TONE } from "@/features/appointments/status";
import { formatDate, formatTime } from "@/lib/dates";
import { getServiceName, getTherapistName, matchesServiceFilter } from "@/lib/clinic-utils";
import { canAccessModule, canBookAppointments } from "@/lib/config/roles";
import { DEMO_TODAY } from "@/lib/mock/clinic-seed";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useClinicData } from "@/services/clinic-data-provider";
import { mockDashboardRepository } from "@/services/repositories/dashboard.repository";
import { useApp } from "@/shell/use-app";
import {
  Avatar,
  Badge,
  Bubble,
  Button,
  Card,
  CardHead,
  Empty,
  IconButton,
  PageHead,
  Progress,
  Select,
  StatCard,
  type Tone,
} from "@/ui";
import { Gauge, MiniCalendar, PillBars } from "@/ui/charts";
import type { AppointmentStatus, ModuleId, ServiceFilter } from "@/types";

export function Dashboard() {
  const app = useApp();
  const { t, locale } = app;
  const d = t.dashboard;
  const { patients, appointments } = useClinicData();
  const [selected, setSelected] = useState(DEMO_TODAY);
  const [month, setMonth] = useState(DEMO_TODAY.slice(0, 7));
  const [service, setService] = useState<ServiceFilter>("all");

  const snapshot = useMemo(
    () =>
      mockDashboardRepository.getOverview({
        branchId: app.branchId,
        range: "month",
        service: "all",
        locale,
      }),
    [app.branchId, locale],
  );
  const metric = (id: string) => snapshot.metrics.find((item) => item.id === id)?.value ?? 0;

  const scoped = useMemo(
    () =>
      appointments.filter(
        (item) => app.branchId === "all" || item.branchId === app.branchId,
      ),
    [appointments, app.branchId],
  );
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of scoped) {
      if (item.status !== "cancelled") map[item.date] = (map[item.date] ?? 0) + 1;
    }
    return map;
  }, [scoped]);

  const patientName = (id: string) => {
    const patient = patients.find((item) => item.id === id);
    return patient ? app.pick(patient.nameAr, patient.nameEn) : id;
  };

  const todays = scoped.filter((item) => item.date === DEMO_TODAY && item.status !== "cancelled");
  const completedToday = todays.filter((item) => item.status === "completed").length;
  const clinicians = new Set(todays.map((item) => item.therapistId)).size;

  const query = app.searchQuery.trim().toLocaleLowerCase();
  const dayList = scoped
    .filter((item) => item.date === selected && item.status !== "cancelled")
    .filter((item) => matchesServiceFilter(item.serviceId, service))
    .filter((item) => {
      if (!query) return true;
      return [
        patientName(item.patientId),
        getTherapistName(item.therapistId, locale),
        getServiceName(item.serviceId, locale),
      ]
        .join(" ")
        .toLocaleLowerCase()
        .includes(query);
    })
    .sort((a, b) => a.time.localeCompare(b.time));

  const statusLabels = t.clinic.appointments as unknown as Record<AppointmentStatus, string>;
  const tiles = 30;
  const tilesOn = Math.round((snapshot.occupancy / 100) * tiles);

  const shortcuts: Array<{
    module: ModuleId;
    href: string;
    title: string;
    hint: string;
    tone: Tone;
    icon: React.ReactNode;
  }> = [
    { module: "appointments", href: "/appointments", title: d.healthcareWorkspace, hint: d.healthcareWorkspaceHint, tone: "mint", icon: <HeartPulse /> },
    { module: "finance", href: "/finance/invoices", title: d.financialWorkspace, hint: d.financialWorkspaceHint, tone: "lilac", icon: <CreditCard /> },
    { module: "inventory", href: "/inventory", title: d.supplyWorkspace, hint: d.supplyWorkspaceHint, tone: "peach", icon: <Warehouse /> },
    { module: "reports", href: "/reports", title: d.reportsWorkspace, hint: d.reportsWorkspaceHint, tone: "sand", icon: <BarChart3 /> },
  ];
  const visibleShortcuts = shortcuts.filter((item) => canAccessModule(app.role, item.module));

  return (
    <>
      <PageHead
        eyebrow={
          <>
            {app.branchId === "all" ? t.app.groupOverview : t.app.branchOverview} ·{" "}
            {formatDate(DEMO_TODAY, locale, { weekday: "long", day: "numeric", month: "long" })}
          </>
        }
        title={d.title}
        subtitle={d.subtitle}
        actions={
          <>
            {canAccessModule(app.role, "reports") ? (
              <Button href={app.href("/reports")}>{d.viewReports}</Button>
            ) : null}
            {canBookAppointments(app.role) ? (
              <Button variant="ink" icon={<Plus />} href={app.href("/appointments/new")}>
                {d.newAppointment}
              </Button>
            ) : null}
          </>
        }
      />

      <div className="bento">
        {/* hero */}
        <Card className="hero span-7">
          <Image
            className="hero__img"
            src="/images/ehteraf-dashboard-doctor.jpg"
            alt=""
            fill
            priority
            sizes="(max-width: 1180px) 100vw, 58vw"
          />
          <div>
            <span className="glass-chip">{d.heroBadge}</span>
            <h2 className="hero__title" style={{ marginTop: 16 }}>
              {d.heroTitle}
            </h2>
            <p className="hero__desc">{d.heroDescription}</p>
          </div>
          <div className="hero__foot">
            <div className="stat-row">
              <div>
                <b>{formatNumber(todays.length, locale)}</b>
                <span style={{ color: "rgba(255,255,255,.8)" }}>{d.heroAppointmentsLabel}</span>
              </div>
              <div>
                <b>{formatNumber(patients.length, locale)}</b>
                <span style={{ color: "rgba(255,255,255,.8)" }}>{d.heroPatientsLabel}</span>
              </div>
            </div>
            {canAccessModule(app.role, "appointments") ? (
              <Button variant="ink" arrow href={app.href("/calendar")}>
                {d.viewSchedule}
              </Button>
            ) : null}
          </div>
        </Card>

        {/* today capacity */}
        <Card tone="sky" className="span-5">
          <CardHead
            title={d.therapistOccupancy}
            hint={d.occupancyDescription}
            actions={<Badge tone="lime">{formatNumber(snapshot.occupancy, locale)}%</Badge>}
          />
          <div className="tiles" aria-hidden>
            {Array.from({ length: tiles }, (_, index) => (
              <i key={index} className={index < tilesOn ? "on" : undefined} />
            ))}
          </div>
          <div className="card__grow" />
          <div className="row row--between row--wrap" style={{ alignItems: "flex-end" }}>
            <div className="stat-row">
              <div>
                <b>{formatNumber(completedToday, locale)}</b>
                <span>{d.completedToday}</span>
              </div>
              <div>
                <b>{formatNumber(todays.length - completedToday, locale)}</b>
                <span>{d.remainingToday}</span>
              </div>
              <div>
                <b>{formatNumber(clinicians, locale)}</b>
                <span>{d.todayClinicians}</span>
              </div>
            </div>
            <div style={{ textAlign: "end" }}>
              <div className="num">{formatNumber(todays.length, locale)}</div>
              <span className="t-label">{d.dayAppointments}</span>
            </div>
          </div>
        </Card>

        {/* key figures */}
        <StatCard
          className="span-3"
          tone="lime"
          label={d.totalRevenue}
          value={formatCurrency(metric("revenue"), locale)}
          hint={d.revenueDescription}
          icon={<Wallet />}
        />
        <StatCard
          className="span-3"
          label={d.collectedPayments}
          value={formatCurrency(metric("collected"), locale)}
          hint={d.collectedDescription}
          icon={<CreditCard />}
        />
        <StatCard
          className="span-3"
          tone="lilac"
          label={d.newPatients}
          value={formatNumber(metric("newPatients"), locale)}
          hint={d.newPatientsDescription}
          icon={<UserPlus />}
        />
        <StatCard
          className="span-3"
          tone="mint"
          label={d.returningPatients}
          value={formatNumber(metric("returningPatients"), locale)}
          hint={d.returningPatientsDescription}
          icon={<Repeat2 />}
        />

        {/* trend */}
        <Card className="span-5">
          <CardHead
            title={d.appointmentTrend}
            hint={d.appointmentTrendHint}
            actions={
              <div className="legend">
                <span>
                  <i className="l2" />
                  {d.totalAppointments}
                </span>
                <span>
                  <i />
                  {d.completed}
                </span>
              </div>
            }
          />
          <PillBars
            hot={snapshot.appointmentTrend.length - 1}
            data={snapshot.appointmentTrend.map((point) => ({
              label: point.label,
              value: point.appointments,
              inner: point.completed,
            }))}
          />
        </Card>

        {/* revenue by branch */}
        <Card className="span-4">
          <CardHead title={d.revenueByBranch} hint={d.revenueByBranchHint} />
          <div className="stack" style={{ gap: 16 }}>
            {snapshot.branchOverview.map((branch) => (
              <div key={branch.branchId} className="stack" style={{ gap: 8 }}>
                <div className="row row--between">
                  <b style={{ fontWeight: 550 }}>{branch.branchName}</b>
                  <span className="t-small t-muted">
                    {formatCurrency(branch.collected, locale)} / {formatCurrency(branch.invoiced, locale)}
                  </span>
                </div>
                <Progress value={(branch.collected / branch.invoiced) * 100} />
                <div className="row row--wrap t-small t-muted" style={{ gap: 14 }}>
                  <span>
                    {d.branchAppointments}: {formatNumber(branch.appointments, locale)}
                  </span>
                  <span>
                    {d.branchOccupancy}: {formatNumber(branch.occupancy, locale)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* operations health */}
        <Card className="span-3">
          <CardHead title={d.operationsHealth} hint={d.operationsHealthHint} />
          <Gauge value={snapshot.occupancy}>
            <div className="num num--md">{formatNumber(snapshot.occupancy, locale)}%</div>
            <span className="t-small t-muted">{d.therapistOccupancy}</span>
          </Gauge>
          <div className="stack" style={{ gap: 8 }}>
            <div className="pill-row">
              <Bubble>
                <CalendarX2 />
              </Bubble>
              <span className="grow t-small">{d.noShowRate}</span>
              <b>{formatNumber(snapshot.noShowRate, locale)}%</b>
            </div>
            <div className="pill-row">
              <Bubble>
                <FileClock />
              </Bubble>
              <span className="grow t-small">{d.pendingReports}</span>
              <b>{formatNumber(snapshot.pendingReports, locale)}</b>
            </div>
          </div>
        </Card>

        {/* schedule */}
        <Card className="span-7">
          <CardHead
            title={selected === DEMO_TODAY ? d.upcomingAppointments : d.appointmentOverview}
            hint={formatDate(selected, locale, { weekday: "long", day: "numeric", month: "long" })}
            actions={
              <>
                <Select
                  className="select--sm"
                  style={{ width: "auto" }}
                  aria-label={d.serviceType}
                  value={service}
                  onChange={(event) => setService(event.target.value as ServiceFilter)}
                >
                  <option value="all">{d.allServices}</option>
                  <option value="orthopedic">{d.orthopedic}</option>
                  <option value="sports">{d.sports}</option>
                  <option value="neurological">{d.neurological}</option>
                </Select>
                {canAccessModule(app.role, "appointments") ? (
                  <IconButton label={d.viewDayAppointments} variant="ink" size="sm" href={app.href("/appointments")}>
                    <ArrowUpRight className="flip" />
                  </IconButton>
                ) : null}
              </>
            }
          />
          {dayList.length === 0 ? (
            <Empty
              icon={<CalendarCheck2 />}
              title={query ? d.emptyAppointments : d.noAppointmentsOnDate}
            />
          ) : (
            <div className="list">
              {dayList.slice(0, 6).map((item) => (
                <div key={item.id} className="list__row">
                  <span className="list__time">{formatTime(item.time, locale)}</span>
                  <Avatar name={patientName(item.patientId)} />
                  <div className="list__main">
                    <b>{patientName(item.patientId)}</b>
                    <span>
                      {getServiceName(item.serviceId, locale)} · {getTherapistName(item.therapistId, locale)}
                    </span>
                  </div>
                  <Badge tone={STATUS_TONE[item.status]}>{statusLabels[item.status]}</Badge>
                </div>
              ))}
              {dayList.length > 6 ? (
                <div className="list__row t-small t-muted">
                  +{formatNumber(dayList.length - 6, locale)} {t.clinic.calendar.more}
                </div>
              ) : null}
            </div>
          )}
        </Card>

        <Card className="span-5">
          <MiniCalendar
            month={month}
            selected={selected}
            today={DEMO_TODAY}
            counts={counts}
            locale={locale}
            dayLabels={t.clinic.calendar.daysShort}
            onSelect={(date) => {
              setSelected(date);
              setMonth(date.slice(0, 7));
            }}
            onMonthChange={setMonth}
            labels={{ previous: d.previousMonth, next: d.nextMonth }}
          />
          <div className="pill-row">
            <Bubble tone="lime">
              <CalendarCheck2 />
            </Bubble>
            <span className="grow t-small">
              {formatDate(selected, locale, { day: "numeric", month: "long" })}
            </span>
            <b>
              {formatNumber(counts[selected] ?? 0, locale)} {d.scheduledToday}
            </b>
          </div>
        </Card>

        {/* workspaces */}
        {visibleShortcuts.map((item) => (
          <Card key={item.href} tone={item.tone} className="span-3">
            <div className="row row--between">
              <Bubble tone="glass">{item.icon}</Bubble>
              <IconButton label={d.openWorkspace} variant="ink" size="sm" href={app.href(item.href)}>
                <ArrowUpRight className="flip" />
              </IconButton>
            </div>
            <div className="card__grow" style={{ minHeight: 18 }} />
            <Link href={app.href(item.href)}>
              <h3 className="t-title">{item.title}</h3>
            </Link>
            <p className="t-small t-label">{item.hint}</p>
          </Card>
        ))}
      </div>
    </>
  );
}
