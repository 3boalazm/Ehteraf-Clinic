"use client";

import { useState } from "react";
import { CalendarPlus, FileText, Fingerprint, Plus, ReceiptText } from "lucide-react";
import { useToast } from "@/features/accounting/shared";
import { LeaveModal } from "@/features/hr/attendance";
import { PayslipModal } from "@/features/hr/payroll";
import { AttendanceBadge, HrPage, useHrUi, useScopedEmployees } from "@/features/hr/shared";
import { formatDate, monthGrid, toISODate } from "@/lib/dates";
import {
  ANNUAL_LEAVE_DAYS,
  EMPLOYEES,
  HR_TODAY,
  leaveDays,
  MONTHS,
  recordFor,
  type PayrollLine,
  type PayrollRun,
} from "@/lib/mock/hr-data";
import { Avatar, Badge, Bubble, Button, Card, CardHead, cx, Field, Notice, Progress, Select } from "@/ui";

export function PortalScreen() {
  const { hr, tx, num, sar, nameOf, jobOf, branchOf, locale, copy } = useHrUi();
  const p = copy.portal;
  const scoped = useScopedEmployees();
  const pool = scoped.length ? scoped : EMPLOYEES;
  const [pickedId, setPickedId] = useState("");
  const employee = pool.find((item) => item.id === pickedId) ?? pool.find((item) => item.role === "therapist") ?? pool[0];
  const [slip, setSlip] = useState<{ line: PayrollLine; run: PayrollRun } | null>(null);
  const [requesting, setRequesting] = useState(false);
  const { show, toast } = useToast();
  if (!employee) return null;

  const today = recordFor(employee, HR_TODAY, hr.ctx);
  const month = HR_TODAY.slice(0, 7);
  const used = hr.leaves.filter((item) => item.empId === employee.id && item.type === "annual" && item.status === "approved").reduce((sum, item) => sum + leaveDays(item), 0);
  const mine = hr.leaves.filter((item) => item.empId === employee.id).sort((x, y) => y.requestedAt.localeCompare(x.requestedAt));
  const slips = MONTHS.slice()
    .reverse()
    .map((item) => {
      const run = hr.runs.find((entry) => entry.branchId === employee.branchId && entry.month === item);
      const line = run?.lines.find((entry) => entry.empId === employee.id);
      return run && line ? { run, line, status: hr.runStatusOf(run.key) } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null && item.status !== "draft")
    .slice(0, 4);

  const cells = monthGrid(month).map(toISODate);

  return (
    <HrPage title={p.title} subtitle={p.subtitle}>
      <Notice icon={<Fingerprint />}>{tx(p.previewNote)}</Notice>
      <div className="bento">
        <Card className="span-12" tone="soft">
          <div className="row row--between row--wrap">
            <div className="row">
              <Avatar name={nameOf(employee)} size="lg" />
              <div>
                <h2 className="t-title">
                  {tx(p.hello)}{locale === "ar" ? "،" : ","} {nameOf(employee)}
                </h2>
                <span className="t-label">
                  {jobOf(employee)} · {branchOf(employee)}
                </span>
              </div>
            </div>
            <Field label={tx(p.viewingAs)}>
              <Select className="select--sm select--card" value={employee.id} onChange={(event) => setPickedId(event.target.value)}>
                {pool.map((item) => (
                  <option key={item.id} value={item.id}>
                    {nameOf(item)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </Card>

        <Card tone="mint" className="span-4">
          <CardHead title={tx(p.today)} hint={formatDate(HR_TODAY, locale, { weekday: "long", day: "numeric", month: "long" })} />
          <div className="row">
            <Bubble tone="glass">
              <Fingerprint />
            </Bubble>
            <div className="grow">
              <AttendanceBadge status={today.status} />
              <div className="t-small t-label" style={{ marginTop: 6 }}>
                {today.checkIn ? `${tx(copy.attendance.checkIn)} ${today.checkIn}` : tx(p.notStarted)}
              </div>
            </div>
          </div>
        </Card>

        <Card className="span-4">
          <CardHead title={tx(copy.employees.leaveBalance)} hint={`${tx(p.used)}: ${num(used)} · ${tx(p.balance)}: ${num(ANNUAL_LEAVE_DAYS - used)}`} />
          <Progress value={(used / ANNUAL_LEAVE_DAYS) * 100} lime />
          <Button variant="ink" icon={<CalendarPlus />} onClick={() => setRequesting(true)}>
            {tx(p.requestLeave)}
          </Button>
        </Card>

        <Card className="span-4">
          <CardHead title={tx(p.month)} hint={formatDate(`${month}-01`, locale, { month: "long", year: "numeric" })} />
          <div className="cal__grid">
            {copy.weekdays.map((day) => (
              <span key={day[1]} className="cal__dow">
                {tx(day).slice(0, locale === "ar" ? 20 : 2)}
              </span>
            ))}
            {cells.map((date) => {
              const record = recordFor(employee, date, hr.ctx);
              const inMonth = date.startsWith(month);
              const dot = { present: "var(--mint)", late: "var(--lime)", absent: "var(--bad)", leave: "var(--sky)", excused: "var(--lilac)" }[record.status as string];
              return (
                <span key={date} className={cx("cal__day", !inMonth && "cal__day--out", date === HR_TODAY && "cal__day--today")} style={{ cursor: "default", position: "relative" }}>
                  {Number(date.slice(8))}
                  {inMonth && dot ? <i style={{ position: "absolute", bottom: 4, width: 5, height: 5, borderRadius: "50%", background: dot }} /> : null}
                </span>
              );
            })}
          </div>
        </Card>

        <Card className="span-6">
          <CardHead title={tx(p.payslips)} />
          {slips.length === 0 ? (
            <p className="t-label">{tx(copy.common.noResults)}</p>
          ) : (
            <div className="list">
              {slips.map(({ run, line }) => (
                <div key={run.key} className="list__row">
                  <Bubble>
                    <ReceiptText />
                  </Bubble>
                  <div className="list__main">
                    <b>{formatDate(`${run.month}-01`, locale, { month: "long", year: "numeric" })}</b>
                    <span>{sar(line.net, 2)}</span>
                  </div>
                  <Button size="sm" variant="soft" onClick={() => setSlip({ line, run })}>
                    {tx(copy.common.view)}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="span-6">
          <CardHead title={tx(p.requests)} actions={<Button size="sm" variant="soft" icon={<Plus />} onClick={() => setRequesting(true)}>{tx(copy.attendance.newLeave)}</Button>} />
          {mine.length === 0 ? (
            <p className="t-label">{tx(copy.common.noResults)}</p>
          ) : (
            <div className="list">
              {mine.slice(0, 5).map((item) => (
                <div key={item.id} className="list__row">
                  <div className="list__main">
                    <b>{tx(copy.leaveTypes[item.type])}</b>
                    <span>
                      {formatDate(item.from, locale, { day: "numeric", month: "short" })} → {formatDate(item.to, locale, { day: "numeric", month: "short" })} · {num(leaveDays(item))} {tx(copy.common.days)}
                    </span>
                  </div>
                  <Badge tone={item.status === "approved" ? "mint" : item.status === "rejected" ? "peach" : "sky"}>{tx(copy.leaveStatus[item.status])}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="span-12">
          <CardHead title={tx(p.documents)} />
          <div className="report-grid">
            {[p.contractDoc, p.insuranceDoc, p.policyDoc].map((doc) => (
              <div key={doc[1]} className="report-card" style={{ cursor: "default" }}>
                <FileText size={18} />
                <b>{tx(doc)}</b>
                <span className="t-small t-muted">{tx(p.available)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {requesting ? (
        <LeaveModal
          fixedEmpId={employee.id}
          onClose={() => setRequesting(false)}
          onSaved={() => {
            setRequesting(false);
            show(tx(p.sent));
          }}
        />
      ) : null}
      {slip ? <PayslipModal line={slip.line} run={slip.run} onClose={() => setSlip(null)} /> : null}
      {toast}
    </HrPage>
  );
}
