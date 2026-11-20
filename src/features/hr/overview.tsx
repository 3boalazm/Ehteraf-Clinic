"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarOff, FileClock, Fingerprint, UserCheck, Users, Wallet } from "lucide-react";
import { HrPage, PersonCell, RUN_TONE, useHrUi, useScopedEmployees } from "@/features/hr/shared";
import { getBranchName } from "@/lib/clinic-utils";
import { addDays, formatDate } from "@/lib/dates";
import {
  DEVICES,
  HR_BRANCHES,
  HR_TODAY,
  MONTHS,
  recordFor,
  RUN_FLOW,
  type AttendanceStatus,
} from "@/lib/mock/hr-data";
import { Badge, Bubble, Card, CardHead, IconButton, Progress, StatCard } from "@/ui";
import { PillBars } from "@/ui/charts";

export function HrOverview() {
  const { app, hr, tx, num, sar, locale, copy } = useHrUi();
  const o = copy.overview;
  const employees = useScopedEmployees();
  const ids = new Set(employees.map((employee) => employee.id));

  const today = employees.map((employee) => ({ employee, record: recordFor(employee, HR_TODAY, hr.ctx) }));
  const expected = today.filter(({ record }) => !["off", "holiday"].includes(record.status));
  const count = (...statuses: AttendanceStatus[]) => expected.filter(({ record }) => statuses.includes(record.status)).length;
  const present = count("present", "late", "excused");

  // Attendance rate over the last 7 days.
  let workDays = 0;
  let attended = 0;
  for (let back = 0; back < 7; back += 1) {
    const date = addDays(HR_TODAY, -back);
    for (const employee of employees) {
      const status = recordFor(employee, date, hr.ctx).status;
      if (["off", "holiday", "upcoming"].includes(status)) continue;
      workDays += 1;
      if (["present", "late", "excused", "leave"].includes(status)) attended += 1;
    }
  }
  const rate = workDays ? (attended / workDays) * 100 : 0;

  const runs = hr.runs.filter((run) => ids.size && employees.some((employee) => employee.branchId === run.branchId));
  const month = HR_TODAY.slice(0, 7);
  const currentRuns = runs.filter((run) => run.month === month);
  const monthCost = currentRuns.reduce((sum, run) => sum + run.totals.salaryExpense, 0);
  const trend = MONTHS.map((item) => ({
    label: formatDate(`${item}-01`, locale, { month: "short" }),
    value: Math.round(runs.filter((run) => run.month === item).reduce((sum, run) => sum + run.totals.salaryExpense, 0)),
  }));

  const expiring = employees.filter((employee) => employee.end && employee.end >= HR_TODAY && employee.end <= addDays(HR_TODAY, 60));
  const pendingLeave = hr.leaves.filter((item) => item.status === "pending" && ids.has(item.empId));
  const offline = DEVICES.filter((device) => !device.online && (app.branchId === "all" || device.branchId === app.branchId));
  const unposted = currentRuns.filter((run) => hr.runStatusOf(run.key) !== "posted");
  const attention = [
    { icon: <FileClock />, label: o.unpostedRun, count: unposted.length, href: "/hr/payroll" },
    { icon: <CalendarOff />, label: o.pendingLeave, count: pendingLeave.length, href: "/hr/attendance" },
    { icon: <Users />, label: o.expiring, count: expiring.length, href: "/hr/employees" },
    { icon: <Fingerprint />, label: o.devicesOffline, count: offline.length, href: "/hr/attendance" },
  ].filter((item) => item.count > 0);

  const branches = app.branchId === "all" ? HR_BRANCHES : [app.branchId];

  return (
    <HrPage title={copy.title} subtitle={copy.subtitle}>
      <div className="bento">
        <StatCard className="span-3" tone="lime" label={tx(o.headcount)} value={num(employees.length)} hint={`${num(branches.length)} ${tx(copy.common.branch)}`} icon={<Users />} />
        <StatCard className="span-3" tone="mint" label={tx(o.presentToday)} value={`${num(present)} / ${num(expected.length)}`} hint={`${tx(o.late)}: ${num(count("late"))} · ${tx(o.absent)}: ${num(count("absent"))}`} icon={<UserCheck />} />
        <StatCard className="span-3" label={tx(o.attendanceRate)} value={`${num(rate)}%`} hint={`${tx(o.onLeave)}: ${num(count("leave"))}`} icon={<Fingerprint />} />
        <StatCard className="span-3" tone="lilac" label={tx(o.payrollCost)} value={sar(monthCost)} hint={formatDate(`${month}-01`, locale, { month: "long", year: "numeric" })} icon={<Wallet />} />

        <Card className="span-7">
          <CardHead title={tx(o.trend)} hint={tx(o.trendHint)} />
          <PillBars hot={trend.length - 1} data={trend} />
        </Card>

        <Card tone="peach" className="span-5">
          <CardHead title={tx(o.attention)} />
          {attention.length === 0 ? (
            <p className="t-label">{tx(o.allClear)}</p>
          ) : (
            <div className="list">
              {attention.map((item) => (
                <Link key={item.href + item.count} href={app.href(item.href)} className="list__row" style={{ borderColor: "rgba(20,21,22,.1)" }}>
                  <Bubble tone="glass">{item.icon}</Bubble>
                  <div className="list__main">
                    <b>{tx(item.label)}</b>
                  </div>
                  <span className="num num--md" style={{ fontSize: 22 }}>
                    {num(item.count)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="span-7">
          <CardHead title={tx(o.currentRun)} hint={formatDate(`${month}-01`, locale, { month: "long", year: "numeric" })} actions={<IconButton label={tx(copy.tabs.payroll)} size="sm" variant="ink" href={app.href("/hr/payroll")}><ArrowUpRight className="flip" /></IconButton>} />
          <div className="list">
            {currentRuns.map((run) => {
              const status = hr.runStatusOf(run.key);
              const step = RUN_FLOW.indexOf(status) + 1;
              return (
                <div key={run.key} className="list__row" style={{ alignItems: "stretch", flexDirection: "column", gap: 8 }}>
                  <div className="row row--between">
                    <b style={{ fontWeight: 550 }}>{getBranchName(run.branchId, locale)}</b>
                    <Badge tone={RUN_TONE[status]}>{tx(copy.runStatus[status])}</Badge>
                  </div>
                  <Progress value={(step / RUN_FLOW.length) * 100} lime />
                  <div className="row row--wrap t-small t-muted" style={{ gap: 16 }}>
                    <span>
                      {num(run.totals.count)} {tx(o.staff)}
                    </span>
                    <span>
                      {tx(o.cost)}: {sar(run.totals.salaryExpense)}
                    </span>
                    <span>
                      {tx(o.net)}: {sar(run.totals.net)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="span-5">
          <CardHead title={tx(copy.attendance.tabs.daily)} hint={formatDate(HR_TODAY, locale, { weekday: "long", day: "numeric", month: "long" })} />
          <div className="list">
            {today
              .filter(({ record }) => ["late", "absent", "leave"].includes(record.status))
              .slice(0, 6)
              .map(({ employee, record }) => (
                <div key={employee.id} className="list__row">
                  <div className="list__main">
                    <PersonCell employee={employee} />
                  </div>
                  <Badge tone={record.status === "absent" ? "peach" : record.status === "late" ? "lime" : "sky"}>{tx(copy.attendanceStatus[record.status])}</Badge>
                </div>
              ))}
            {today.every(({ record }) => !["late", "absent", "leave"].includes(record.status)) ? <p className="t-label">{tx(o.allClear)}</p> : null}
          </div>
        </Card>
      </div>
    </HrPage>
  );
}
