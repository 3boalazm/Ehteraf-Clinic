"use client";

import { useState } from "react";
import { CalendarOff, Check, Fingerprint, Plus, RefreshCw, UserCheck, WifiOff, X } from "lucide-react";
import { AmountCell, downloadCsv, ExportButton, Modal, useToast } from "@/features/accounting/shared";
import { AttendanceBadge, HrPage, PersonCell, useHrUi, useScopedEmployees } from "@/features/hr/shared";
import { getBranchName } from "@/lib/clinic-utils";
import { addDays, formatDate } from "@/lib/dates";
import {
  DEVICES,
  EMPLOYEES,
  HR_TODAY,
  leaveDays,
  monthStats,
  MONTHS,
  NOW_MINUTES,
  recordFor,
  rosterFor,
  toClock,
  type LeaveType,
  type RosterCell,
} from "@/lib/mock/hr-data";
import { Badge, Bubble, Button, Card, CardHead, Empty, Field, IconButton, Input, Select, Tabs } from "@/ui";
import { MiniCalendar } from "@/ui/charts";

type AttendanceTab = "daily" | "monthly" | "schedules" | "devices" | "leave";

export function AttendanceScreen() {
  const { tx, copy } = useHrUi();
  const a = copy.attendance;
  const [tab, setTab] = useState<AttendanceTab>("daily");
  return (
    <HrPage title={a.title} subtitle={a.subtitle}>
      <div className="bento">
        <Card className="span-12">
          <div className="toolbar">
            <Tabs
              filled
              value={tab}
              onChange={setTab}
              options={(["daily", "monthly", "schedules", "devices", "leave"] as const).map((value) => ({ value, label: tx(a.tabs[value]) }))}
            />
          </div>
          {tab === "daily" ? <DailyTab /> : null}
          {tab === "monthly" ? <MonthlyTab /> : null}
          {tab === "schedules" ? <SchedulesTab /> : null}
          {tab === "devices" ? <DevicesTab /> : null}
          {tab === "leave" ? <LeaveTab /> : null}
        </Card>
      </div>
    </HrPage>
  );
}

/* ---------- daily ---------- */
function DailyTab() {
  const { hr, tx, num, locale, copy, nameOf } = useHrUi();
  const a = copy.attendance;
  const employees = useScopedEmployees();
  const [date, setDate] = useState(HR_TODAY);
  const [month, setMonth] = useState(HR_TODAY.slice(0, 7));
  const { show, toast } = useToast();

  const rows = employees.map((employee) => ({ employee, record: recordFor(employee, date, hr.ctx) }));
  const worked = rows.filter(({ record }) => !["off", "holiday"].includes(record.status));
  const count = (...statuses: string[]) => worked.filter(({ record }) => statuses.includes(record.status)).length;
  const busy: Record<string, number> = {};
  for (let offset = 0; offset < 40; offset += 1) {
    const day = addDays(month + "-01", offset);
    if (day.slice(0, 7) !== month) break;
    busy[day] = employees.filter((employee) => !["off", "holiday", "upcoming"].includes(recordFor(employee, day, hr.ctx).status)).length;
  }

  const exportCsv = () =>
    downloadCsv(
      `ehteraf-attendance-${date}.csv`,
      [tx(copy.common.employee), tx(a.shift), tx(a.checkIn), tx(a.checkOut), tx(copy.common.status)],
      rows.map(({ employee, record }) => [nameOf(employee), record.shift ? tx(copy.shifts[record.shift]) : "", record.checkIn ?? "", record.checkOut ?? "", tx(copy.attendanceStatus[record.status])]),
    );

  return (
    <>
      <div className="bento" style={{ gap: 14 }}>
        <div className="span-4 stack" style={{ gap: 12 }}>
          <MiniCalendar
            month={month}
            selected={date}
            today={HR_TODAY}
            counts={busy}
            locale={locale}
            dayLabels={copy.weekdays.map((day) => tx(day))}
            onSelect={(next) => {
              setDate(next);
              setMonth(next.slice(0, 7));
            }}
            onMonthChange={setMonth}
            labels={{ previous: "‹", next: "›" }}
          />
        </div>
        <div className="span-8 stack" style={{ gap: 14 }}>
          <div className="row row--wrap" style={{ justifyContent: "space-between" }}>
            <b className="card__title">{formatDate(date, locale, { weekday: "long", day: "numeric", month: "long" })}</b>
            <ExportButton onClick={exportCsv} />
          </div>
          <div className="stat-row">
            <div>
              <b>{num(count("present", "late", "excused"))}</b>
              <span>{tx(a.present)}</span>
            </div>
            <div>
              <b>{num(count("late"))}</b>
              <span>{tx(copy.overview.late)}</span>
            </div>
            <div>
              <b>{num(count("absent"))}</b>
              <span>{tx(copy.overview.absent)}</span>
            </div>
            <div>
              <b>{num(count("leave"))}</b>
              <span>{tx(copy.overview.onLeave)}</span>
            </div>
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <Empty icon={<UserCheck />} title={tx(copy.common.noResults)} />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>{tx(copy.common.employee)}</th>
                <th>{tx(a.shift)}</th>
                <th>{tx(a.checkIn)}</th>
                <th>{tx(a.checkOut)}</th>
                <th>{tx(copy.common.status)}</th>
                <th>
                  <span className="sr-only">{tx(copy.common.actions)}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ employee, record }) => {
                const key = `${employee.id}:${date}`;
                const canExcuse = record.status === "absent" || record.status === "late" || (record.status === "excused" && hr.excused[key]);
                return (
                  <tr key={employee.id}>
                    <td>
                      <PersonCell employee={employee} />
                    </td>
                    <td data-label={tx(a.shift)}>{record.shift ? tx(copy.shifts[record.shift]) : "—"}</td>
                    <td data-label={tx(a.checkIn)}>
                      <b className="amt" style={{ fontWeight: 550 }}>
                        {record.checkIn ?? "—"}
                      </b>
                      {record.lateMinutes ? <span className="sub">{tx(a.lateBy)} {num(record.lateMinutes)} {tx(copy.common.minutes)}</span> : null}
                    </td>
                    <td data-label={tx(a.checkOut)}>
                      <b className="amt" style={{ fontWeight: 550 }}>
                        {record.checkOut ?? "—"}
                      </b>
                      {record.overtimeMinutes ? <span className="sub">{tx(a.overtime)} {num(record.overtimeMinutes)} {tx(copy.common.minutes)}</span> : null}
                    </td>
                    <td data-label={tx(copy.common.status)}>
                      <AttendanceBadge status={record.status} />
                    </td>
                    <td>
                      <div className="cell-actions">
                        {canExcuse ? (
                          <Button
                            size="sm"
                            variant={hr.excused[key] ? "soft" : "ink"}
                            onClick={() => {
                              hr.toggleExcused(employee.id, date);
                              show(tx(a.excusedMsg));
                            }}
                          >
                            {hr.excused[key] ? tx(a.undoExcuse) : tx(a.excuse)}
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {toast}
    </>
  );
}

/* ---------- monthly ---------- */
function MonthlyTab() {
  const { hr, tx, num, locale, copy } = useHrUi();
  const a = copy.attendance;
  const employees = useScopedEmployees();
  const [month, setMonth] = useState(HR_TODAY.slice(0, 7));
  const rows = employees.map((employee) => ({ employee, stats: monthStats(employee, month, hr.ctx) }));
  return (
    <>
      <div className="toolbar">
        <Tabs
          value={month}
          onChange={setMonth}
          options={MONTHS.map((item) => ({ value: item, label: formatDate(`${item}-01`, locale, { month: "short" }) }))}
        />
        <div className="toolbar__end">
          <ExportButton
            onClick={() =>
              downloadCsv(`ehteraf-attendance-${month}.csv`, ["ID", tx(copy.common.employee), tx(a.workDays), tx(a.presentDays), tx(a.lateDays), tx(copy.payroll.lateMinutes), tx(a.absentDays), tx(a.leaveDays), tx(copy.payroll.overtimeHours)], rows.map(({ employee, stats }) => [employee.id, locale === "ar" ? employee.nameAr : employee.nameEn, stats.workDays, stats.presentDays, stats.lateDays, stats.lateMinutes, stats.absentDays, stats.leaveDays, Math.round(stats.overtimeMinutes / 6) / 10]))
            }
          />
        </div>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>{tx(copy.common.employee)}</th>
              <th className="num-col">{tx(a.workDays)}</th>
              <th className="num-col">{tx(a.presentDays)}</th>
              <th className="num-col">{tx(a.lateDays)}</th>
              <th className="num-col">{tx(a.absentDays)}</th>
              <th className="num-col">{tx(a.leaveDays)}</th>
              <th className="num-col">{tx(a.rate)}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ employee, stats }) => (
              <tr key={employee.id}>
                <td>
                  <PersonCell employee={employee} />
                </td>
                <td className="num-col" data-label={tx(a.workDays)}>
                  {num(stats.workDays)}
                </td>
                <td className="num-col" data-label={tx(a.presentDays)}>
                  {num(stats.presentDays)}
                </td>
                <td className="num-col" data-label={tx(a.lateDays)}>
                  {num(stats.lateDays)}
                  {stats.lateMinutes ? <span className="sub">{num(stats.lateMinutes)} {tx(copy.common.minutes)}</span> : null}
                </td>
                <td className="num-col" data-label={tx(a.absentDays)}>
                  <AmountCell value={stats.absentDays} />
                </td>
                <td className="num-col" data-label={tx(a.leaveDays)}>
                  <AmountCell value={stats.leaveDays} />
                </td>
                <td className="num-col" data-label={tx(a.rate)}>
                  {stats.workDays ? num(((stats.presentDays + stats.leaveDays) / stats.workDays) * 100) : "—"}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ---------- schedules ---------- */
const CYCLE: RosterCell[] = ["morning", "evening", "off"];

function SchedulesTab() {
  const { hr, tx, copy } = useHrUi();
  const a = copy.attendance;
  const employees = useScopedEmployees();
  return (
    <>
      <p className="card__hint">{tx(a.rosterHint)}</p>
      <div className="table-wrap">
        <table className="table table--compact">
          <thead>
            <tr>
              <th>{tx(copy.common.employee)}</th>
              {copy.weekdays.map((day) => (
                <th key={day[1]} style={{ textAlign: "center" }}>
                  {tx(day)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => {
              const roster = rosterFor(employee, hr.roster);
              return (
                <tr key={employee.id}>
                  <td>
                    <PersonCell employee={employee} />
                  </td>
                  {copy.weekdays.map((day, weekday) => {
                    const cell = roster[weekday] ?? "off";
                    return (
                      <td key={day[1]} data-label={tx(day)} style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          className="choice"
                          aria-pressed={cell !== "off"}
                          style={{ height: 34, paddingInline: 10, fontSize: 12 }}
                          onClick={() => hr.setRoster(employee.id, weekday, CYCLE[(CYCLE.indexOf(cell) + 1) % CYCLE.length] ?? "off")}
                        >
                          {cell === "off" ? tx(copy.shifts.off) : cell === "morning" ? "8–4" : "12–8"}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ---------- devices ---------- */
function DevicesTab() {
  const { app, hr, tx, num, locale, copy } = useHrUi();
  const a = copy.attendance;
  const { show, toast } = useToast();
  const devices = DEVICES.filter((device) => app.branchId === "all" || device.branchId === app.branchId);
  const punches = EMPLOYEES.filter((employee) => app.branchId === "all" || employee.branchId === app.branchId)
    .map((employee) => ({ employee, record: recordFor(employee, HR_TODAY, hr.ctx) }))
    .filter(({ record }) => record.checkIn)
    .sort((x, y) => (y.record.checkIn ?? "").localeCompare(x.record.checkIn ?? ""))
    .slice(0, 8);
  const enrolled = (branchId: string) => EMPLOYEES.filter((employee) => employee.branchId === branchId).length;

  return (
    <>
      <div className="bento" style={{ gap: 14 }}>
        {devices.map((device) => {
          const ago = hr.deviceSync[device.id] ?? device.lastSyncMinutesAgo;
          return (
            <Card key={device.id} tone={device.online ? "mint" : "peach"} className="span-4">
              <div className="row row--between">
                <Bubble tone="glass">{device.online ? <Fingerprint /> : <WifiOff />}</Bubble>
                <Badge tone={device.online ? "lime" : "outline"}>{device.online ? tx(a.online) : tx(a.offline)}</Badge>
              </div>
              <div>
                <h3 className="t-title">{device.id}</h3>
                <span className="t-label">
                  {getBranchName(device.branchId, locale)} · {tx(a.locations[device.location])}
                </span>
              </div>
              <div className="kv">
                <div>
                  <b>{num(enrolled(device.branchId))}</b>
                  <span>{tx(a.enrolled)}</span>
                </div>
                <div>
                  <b>
                    {num(ago)} {tx(a.minutesAgo)}
                  </b>
                  <span>{tx(a.lastSync)}</span>
                </div>
              </div>
              <span className="t-small t-label">
                {tx(a.firmware)}: {device.firmware}
              </span>
              <Button
                size="sm"
                variant="ink"
                icon={<RefreshCw />}
                disabled={!device.online}
                onClick={() => {
                  hr.syncDevice(device.id, 0);
                  show(tx(a.synced));
                }}
              >
                {tx(a.syncNow)}
              </Button>
            </Card>
          );
        })}
      </div>
      <CardHead title={tx(a.liveFeed)} hint={tx(a.model)} />
      <div className="list">
        {punches.map(({ employee, record }) => (
          <div key={employee.id} className="list__row">
            <span className="list__time">{record.checkIn}</span>
            <div className="list__main">
              <PersonCell employee={employee} />
            </div>
            <AttendanceBadge status={record.status} />
          </div>
        ))}
      </div>
      <span className="t-small t-muted">{toClock(NOW_MINUTES)}</span>
      {toast}
    </>
  );
}

/* ---------- leave ---------- */
function LeaveTab() {
  const { hr, tx, num, locale, copy } = useHrUi();
  const a = copy.attendance;
  const employees = useScopedEmployees();
  const { show, toast } = useToast();
  const [creating, setCreating] = useState(false);
  const ids = new Set(employees.map((employee) => employee.id));
  const leaves = hr.leaves.filter((item) => ids.has(item.empId)).sort((x, y) => y.requestedAt.localeCompare(x.requestedAt));
  const decide = (id: string, status: "approved" | "rejected") => {
    hr.decideLeave(id, status);
    show(tx(a.decided));
  };
  return (
    <>
      <div className="toolbar">
        <div className="toolbar__end">
          <Button variant="ink" icon={<Plus />} onClick={() => setCreating(true)}>
            {tx(a.newLeave)}
          </Button>
        </div>
      </div>
      {leaves.length === 0 ? (
        <Empty icon={<CalendarOff />} title={tx(copy.common.noResults)} />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>{tx(copy.common.employee)}</th>
                <th>{tx(copy.common.type)}</th>
                <th>{tx(copy.common.date)}</th>
                <th className="num-col">{tx(a.daysCount)}</th>
                <th>{tx(a.decision)}</th>
                <th>
                  <span className="sr-only">{tx(copy.common.actions)}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((item) => {
                const employee = EMPLOYEES.find((entry) => entry.id === item.empId);
                if (!employee) return null;
                return (
                  <tr key={item.id}>
                    <td>
                      <PersonCell employee={employee} />
                    </td>
                    <td data-label={tx(copy.common.type)}>{tx(copy.leaveTypes[item.type])}</td>
                    <td data-label={tx(copy.common.date)}>
                      {formatDate(item.from, locale, { day: "numeric", month: "short" })} → {formatDate(item.to, locale, { day: "numeric", month: "short" })}
                      <span className="sub">{item.id}</span>
                    </td>
                    <td className="num-col" data-label={tx(a.daysCount)}>
                      {num(leaveDays(item))} {tx(copy.common.days)}
                    </td>
                    <td data-label={tx(a.decision)}>
                      <Badge tone={item.status === "approved" ? "mint" : item.status === "rejected" ? "peach" : "sky"}>{tx(copy.leaveStatus[item.status])}</Badge>
                    </td>
                    <td>
                      <div className="cell-actions">
                        {item.status === "pending" ? (
                          <>
                            <Button size="sm" variant="ink" icon={<Check />} onClick={() => decide(item.id, "approved")}>
                              {tx(copy.common.approve)}
                            </Button>
                            <IconButton label={tx(copy.common.reject)} size="sm" onClick={() => decide(item.id, "rejected")}>
                              <X />
                            </IconButton>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {creating ? (
        <LeaveModal
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            show(copy.portal.sent[locale === "ar" ? 0 : 1]);
          }}
        />
      ) : null}
      {toast}
    </>
  );
}

export function LeaveModal({ onClose, onSaved, fixedEmpId }: { onClose: () => void; onSaved: () => void; fixedEmpId?: string }) {
  const { hr, tx, nameOf, copy } = useHrUi();
  const employees = useScopedEmployees();
  const [empId, setEmpId] = useState(fixedEmpId ?? "");
  const [type, setType] = useState<LeaveType>("annual");
  const [from, setFrom] = useState(addDays(HR_TODAY, 7));
  const [to, setTo] = useState(addDays(HR_TODAY, 9));
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState(false);
  const valid = Boolean(empId) && from <= to;
  const submit = () => {
    setTouched(true);
    if (!valid) return;
    hr.submitLeave({ empId, type, from, to, note: note.trim() });
    onSaved();
  };
  return (
    <Modal title={tx(copy.attendance.newLeave)} onClose={onClose}>
      <div className="form-grid">
        {fixedEmpId ? null : (
          <Field className="full" label={tx(copy.common.employee)} error={touched && !empId ? tx(copy.common.required) : undefined}>
            <Select value={empId} aria-invalid={touched && !empId} onChange={(event) => setEmpId(event.target.value)}>
              <option value="">—</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {nameOf(employee)}
                </option>
              ))}
            </Select>
          </Field>
        )}
        <Field className="full" label={tx(copy.common.type)}>
          <Select value={type} onChange={(event) => setType(event.target.value as LeaveType)}>
            {(["annual", "sick", "emergency"] as const).map((item) => (
              <option key={item} value={item}>
                {tx(copy.leaveTypes[item])}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={tx(copy.common.from)}>
          <Input type="date" value={from} min={HR_TODAY} onChange={(event) => setFrom(event.target.value)} />
        </Field>
        <Field label={tx(copy.common.to)} error={touched && from > to ? tx(copy.common.required) : undefined}>
          <Input type="date" value={to} min={from} onChange={(event) => setTo(event.target.value)} />
        </Field>
        <Field className="full" label={tx(copy.common.note)}>
          <Input value={note} onChange={(event) => setNote(event.target.value)} />
        </Field>
      </div>
      <div className="row" style={{ justifyContent: "flex-end" }}>
        <Button variant="soft" onClick={onClose}>
          {tx(copy.common.cancel)}
        </Button>
        <Button variant="ink" arrow onClick={submit}>
          {tx(copy.common.save)}
        </Button>
      </div>
    </Modal>
  );
}
