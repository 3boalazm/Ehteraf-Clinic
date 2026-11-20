"use client";

import { useEffect, useMemo, useState } from "react";
import { UserRoundSearch } from "lucide-react";
import { AmountCell, downloadCsv, ExportButton, Modal, Pager } from "@/features/accounting/shared";
import { HrPage, PersonCell, useHrUi, useScopedEmployees } from "@/features/hr/shared";
import { formatDate } from "@/lib/dates";
import {
  ANNUAL_LEAVE_DAYS,
  GOSI,
  HR_TODAY,
  leaveDays,
  monthStats,
  monthTotal,
  type Department,
  type Employee,
} from "@/lib/mock/hr-data";
import { Badge, Card, CardHead, Empty, Progress, SearchBox, StatCard, Tabs } from "@/ui";

const PAGE_SIZE = 10;

export function EmployeesScreen() {
  const { app, hr, tx, num, sar, branchOf, nameOf, locale, copy } = useHrUi();
  const e = copy.employees;
  const all = useScopedEmployees();
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState<"all" | Department>("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Employee | null>(null);

  const needle = (query || app.searchQuery).trim().toLocaleLowerCase();
  const rows = useMemo(
    () =>
      all.filter(
        (employee) =>
          (department === "all" || employee.department === department) &&
          (!needle || `${employee.id} ${employee.nameAr} ${employee.nameEn} ${employee.jobAr} ${employee.jobEn}`.toLocaleLowerCase().includes(needle)),
      ),
    [all, department, needle],
  );
  useEffect(() => setPage(1), [department, query, app.searchQuery, app.branchId]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const payroll = all.reduce((sum, employee) => sum + monthTotal(employee), 0);
  const saudis = all.filter((employee) => employee.nationality === "saudi").length;
  const ending = all.filter((employee) => employee.end && employee.end >= HR_TODAY).length;

  const daysLeft = (end: string) => Math.round((Date.parse(end) - Date.parse(HR_TODAY)) / 86_400_000);

  const exportCsv = () =>
    downloadCsv(
      "ehteraf-employees.csv",
      ["ID", tx(copy.common.employee), tx(copy.common.branch), tx(copy.common.job), tx(copy.common.nationality), tx(e.contract), tx(e.start), tx(e.end), tx(e.basic), tx(e.housing), tx(e.transport), tx(e.other), tx(e.package)],
      rows.map((employee) => [
        employee.id,
        nameOf(employee),
        branchOf(employee),
        app.pick(employee.jobAr, employee.jobEn),
        tx(copy.nationalities[employee.nationality]),
        tx(copy.contractTypes[employee.contractType]),
        employee.start,
        employee.end ?? "",
        employee.basic,
        employee.housing,
        employee.transport,
        employee.other,
        monthTotal(employee),
      ]),
    );

  return (
    <HrPage title={e.title} subtitle={e.subtitle} actions={<ExportButton onClick={exportCsv} />}>
      <div className="bento">
        <StatCard className="span-4" tone="lime" label={tx(copy.overview.headcount)} value={num(all.length)} hint={`${tx(copy.nationalities.saudi)}: ${num(saudis)} · ${tx(copy.nationalities["non-saudi"])}: ${num(all.length - saudis)}`} />
        <StatCard className="span-4" tone="lilac" label={tx(e.package)} value={sar(payroll)} hint={tx(copy.overview.payrollCost)} />
        <StatCard className="span-4" tone="peach" label={tx(e.ending)} value={num(ending)} hint={tx(copy.overview.expiring)} />

        <Card className="span-12">
          <div className="toolbar">
            <SearchBox value={query} onChange={setQuery} placeholder={tx(copy.common.search)} />
            <div className="toolbar__end">
              <Tabs
                value={department}
                onChange={setDepartment}
                options={[
                  { value: "all", label: tx(copy.common.all) },
                  ...(["management", "clinical", "front", "support"] as const).map((value) => ({ value, label: tx(copy.departments[value]) })),
                ]}
              />
            </div>
          </div>
          {visible.length === 0 ? (
            <Empty icon={<UserRoundSearch />} title={tx(copy.common.noResults)} />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>{tx(copy.common.employee)}</th>
                    <th>{tx(copy.common.branch)}</th>
                    <th>{tx(e.contract)}</th>
                    <th className="num-col">{tx(e.basic)}</th>
                    <th className="num-col">{tx(e.package)}</th>
                    <th>{tx(copy.common.status)}</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((employee) => {
                    const left = employee.end ? daysLeft(employee.end) : null;
                    return (
                      <tr key={employee.id} onClick={() => setSelected(employee)} style={{ cursor: "pointer" }}>
                        <td>
                          <PersonCell employee={employee} />
                        </td>
                        <td data-label={tx(copy.common.branch)}>
                          {branchOf(employee)}
                          <span className="sub">{tx(copy.departments[employee.department])}</span>
                        </td>
                        <td data-label={tx(e.contract)}>
                          {tx(copy.contractTypes[employee.contractType])}
                          <span className="sub">
                            {formatDate(employee.start, locale, { month: "short", year: "numeric" })} → {employee.end ? formatDate(employee.end, locale, { month: "short", year: "numeric" }) : tx(e.openEnded)}
                          </span>
                        </td>
                        <td className="num-col" data-label={tx(e.basic)}>
                          <AmountCell value={employee.basic} />
                        </td>
                        <td className="num-col" data-label={tx(e.package)}>
                          <AmountCell value={monthTotal(employee)} />
                        </td>
                        <td data-label={tx(copy.common.status)}>
                          {left !== null && left <= 60 ? <Badge tone="peach">{tx(e.expiresIn)} {num(left)} {tx(copy.common.days)}</Badge> : <Badge tone="mint">{tx(e.active)}</Badge>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <Pager page={current} pages={pages} onPage={setPage} total={rows.length} shown={visible.length} />
          <span className="t-small t-muted">{tx(e.gosiNote)}</span>
        </Card>
      </div>

      {selected ? <ProfileModal employee={selected} onClose={() => setSelected(null)} month={HR_TODAY.slice(0, 7)} hr={hr} /> : null}
    </HrPage>
  );
}

function ProfileModal({ employee, onClose, month, hr }: { employee: Employee; onClose: () => void; month: string; hr: ReturnType<typeof useHrUi>["hr"] }) {
  const { tx, num, sar, nameOf, jobOf, branchOf, locale, copy } = useHrUi();
  const e = copy.employees;
  const stats = monthStats(employee, month, hr.ctx);
  const used = hr.leaves
    .filter((item) => item.empId === employee.id && item.type === "annual" && item.status === "approved")
    .reduce((sum, item) => sum + leaveDays(item), 0);
  const gosiBase = Math.min(GOSI.cap, employee.basic + employee.housing);
  const gosiEmp = employee.nationality === "saudi" ? gosiBase * GOSI.saudiEmployee : 0;
  const gosiEr = gosiBase * (employee.nationality === "saudi" ? GOSI.saudiEmployer : GOSI.nonSaudiEmployer);
  const rate = stats.workDays ? (stats.presentDays / stats.workDays) * 100 : 0;
  return (
    <Modal title={nameOf(employee)} hint={`${jobOf(employee)} · ${branchOf(employee)} · ${employee.id}`} onClose={onClose} wide>
      <div className="kv">
        <div>
          <b>{sar(employee.basic)}</b>
          <span>{tx(e.basic)}</span>
        </div>
        <div>
          <b>{sar(employee.housing)}</b>
          <span>{tx(e.housing)}</span>
        </div>
        <div>
          <b>{sar(employee.transport)}</b>
          <span>{tx(e.transport)}</span>
        </div>
        <div>
          <b>{sar(employee.other)}</b>
          <span>{tx(e.other)}</span>
        </div>
        <div>
          <b>{sar(monthTotal(employee))}</b>
          <span>{tx(e.package)}</span>
        </div>
      </div>
      <dl className="dl">
        <div>
          <dt>{tx(e.contract)}</dt>
          <dd>{tx(copy.contractTypes[employee.contractType])}</dd>
        </div>
        <div>
          <dt>{tx(copy.common.nationality)}</dt>
          <dd>{tx(copy.nationalities[employee.nationality])}</dd>
        </div>
        <div>
          <dt>{tx(e.start)}</dt>
          <dd>{formatDate(employee.start, locale)}</dd>
        </div>
        <div>
          <dt>{tx(e.end)}</dt>
          <dd>{employee.end ? formatDate(employee.end, locale) : tx(e.openEnded)}</dd>
        </div>
        <div>
          <dt>{tx(e.shift)}</dt>
          <dd>{tx(copy.shifts[employee.shift])}</dd>
        </div>
        <div>
          <dt>{tx(e.deviceId)}</dt>
          <dd>#{num(employee.deviceUserId)}</dd>
        </div>
        <div>
          <dt>{tx(copy.payroll.gosiEmployee)}</dt>
          <dd>{sar(gosiEmp, 2)}</dd>
        </div>
        <div>
          <dt>{tx(copy.payroll.gosiEmployer)}</dt>
          <dd>{sar(gosiEr, 2)}</dd>
        </div>
      </dl>
      <Card tone="soft">
        <CardHead title={tx(e.attendanceThisMonth)} hint={`${num(stats.presentDays)} / ${num(stats.workDays)} ${tx(copy.common.days)}`} />
        <Progress value={rate} lime />
        <div className="row row--wrap t-small t-muted" style={{ gap: 16 }}>
          <span>
            {tx(copy.attendance.lateDays)}: {num(stats.lateDays)}
          </span>
          <span>
            {tx(copy.attendance.absentDays)}: {num(stats.absentDays)}
          </span>
          <span>
            {tx(e.leaveBalance)}: {num(ANNUAL_LEAVE_DAYS - used)} / {num(ANNUAL_LEAVE_DAYS)}
          </span>
        </div>
      </Card>
    </Modal>
  );
}
