"use client";

import Link from "next/link";
import { useState } from "react";
import { BadgeCheck, Banknote, Check, FileText, Landmark, Plus, Receipt, Trash2 } from "lucide-react";
import { AmountCell, downloadCsv, ExportButton, Modal, useToast } from "@/features/accounting/shared";
import { HrPage, PersonCell, RUN_TONE, useHrUi } from "@/features/hr/shared";
import { getBranchName } from "@/lib/clinic-utils";
import { formatDate } from "@/lib/dates";
import {
  EMPLOYEE_BY_ID,
  HR_BRANCHES,
  HR_TODAY,
  MONTHS,
  type AdjustmentKind,
  type PayrollLine,
  type PayrollRun,
  type RealBranch,
} from "@/lib/mock/hr-data";
import { Badge, Button, Card, CardHead, Empty, Field, IconButton, Input, Select, StatCard, Tabs } from "@/ui";

export function PayrollScreen() {
  const { app, hr, tx, num, sar, nameOf, locale, copy } = useHrUi();
  const p = copy.payroll;
  const { show, toast } = useToast();
  const [month, setMonth] = useState(HR_TODAY.slice(0, 7));
  const scopedBranch: RealBranch = app.branchId === "all" ? "ghadeer" : app.branchId;
  const [pickedBranch, setPickedBranch] = useState<RealBranch>(scopedBranch);
  const branchId: RealBranch = app.branchId === "all" ? pickedBranch : app.branchId;
  const [adding, setAdding] = useState(false);
  const [slip, setSlip] = useState<PayrollLine | null>(null);

  const run = hr.runs.find((item) => item.branchId === branchId && item.month === month);
  if (!run) return null;
  const status = hr.runStatusOf(run.key);
  const locked = status !== "draft";
  const adjustments = hr.adjustments.filter((item) => item.month === month && EMPLOYEE_BY_ID[item.empId]?.branchId === branchId);
  const advanceLabel = status === "posted" ? null : p.advance[status];

  const advance = () => {
    hr.advanceRun(run.key);
    show(status === "paid" ? tx(p.posted) : tx(p.advanced));
  };

  const exportCsv = () =>
    downloadCsv(
      `ehteraf-payroll-${branchId}-${month}.csv`,
      ["ID", tx(copy.common.employee), tx(p.basic), tx(p.allowances), tx(p.overtime), tx(p.earnings), tx(p.absence), tx(p.late), tx(p.manual), tx(p.gosiEmployee), tx(p.net)],
      run.lines.map((line) => {
        const employee = EMPLOYEE_BY_ID[line.empId];
        return [line.empId, employee ? nameOf(employee) : "", line.basic, line.housing + line.transport + line.other + line.extraAllowances, line.overtime, line.earnings, line.absenceDeduction, line.lateDeduction, line.manualDeductions, line.gosiEmployee, line.net];
      }),
    );

  const exportTransfer = () =>
    downloadCsv(
      `ehteraf-salary-transfer-${branchId}-${month}-demo.csv`,
      ["ID", tx(copy.common.employee), tx(p.net)],
      run.lines.map((line) => {
        const employee = EMPLOYEE_BY_ID[line.empId];
        return [line.empId, employee ? nameOf(employee) : "", line.net];
      }),
    );

  return (
    <HrPage
      title={p.title}
      subtitle={p.subtitle}
      actions={
        <>
          <ExportButton onClick={exportCsv} />
          {advanceLabel ? (
            <Button variant="ink" arrow onClick={advance}>
              {tx(advanceLabel)}
            </Button>
          ) : null}
        </>
      }
    >
      <div className="bento">
        <div className="span-12 row row--between row--wrap">
          <Tabs
            value={month}
            onChange={setMonth}
            label={tx(copy.common.month)}
            options={MONTHS.map((item) => ({ value: item, label: formatDate(`${item}-01`, locale, { month: "short" }) }))}
          />
          <div className="row row--wrap">
            {app.branchId === "all" ? (
              <Select className="select--sm select--card" style={{ width: "auto" }} aria-label={tx(copy.common.branch)} value={branchId} onChange={(event) => setPickedBranch(event.target.value as RealBranch)}>
                {HR_BRANCHES.map((id) => (
                  <option key={id} value={id}>
                    {getBranchName(id, locale)}
                  </option>
                ))}
              </Select>
            ) : null}
            <Badge tone={RUN_TONE[status]}>{tx(copy.runStatus[status])}</Badge>
          </div>
        </div>

        <StatCard className="span-3" tone="lime" label={tx(p.earnings)} value={sar(run.totals.earnings)} hint={`${num(run.totals.count)} ${tx(copy.overview.staff)}`} icon={<Banknote />} />
        <StatCard className="span-3" tone="peach" label={tx(p.deductions)} value={sar(run.totals.absenceDeduction + run.totals.lateDeduction + run.totals.manualDeductions)} hint={`${tx(p.gosiEmployee)}: ${sar(run.totals.gosiEmployee)}`} icon={<Receipt />} />
        <StatCard className="span-3" tone="mint" label={tx(p.net)} value={sar(run.totals.net)} icon={<BadgeCheck />} />
        <StatCard className="span-3" tone="lilac" label={tx(p.gosiEmployer)} value={sar(run.totals.gosiEmployer)} hint={`${tx(copy.overview.cost)}: ${sar(run.totals.salaryExpense + run.totals.gosiEmployer)}`} icon={<Landmark />} />

        <Card className="span-12">
          <CardHead
            title={`${tx(p.run)} · ${getBranchName(branchId, locale)} · ${formatDate(`${month}-01`, locale, { month: "long", year: "numeric" })}`}
            hint={locked ? tx(p.locked) : undefined}
            actions={
              status === "posted" || status === "paid" ? (
                <Button size="sm" variant="soft" icon={<FileText />} onClick={exportTransfer}>
                  {tx(p.exportWps)}
                </Button>
              ) : undefined
            }
          />
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>{tx(copy.common.employee)}</th>
                  <th className="num-col">{tx(p.basic)}</th>
                  <th className="num-col">{tx(p.allowances)}</th>
                  <th className="num-col">{tx(p.overtime)}</th>
                  <th className="num-col">{tx(p.deductions)}</th>
                  <th className="num-col">{tx(p.gosiEmployee)}</th>
                  <th className="num-col">{tx(p.net)}</th>
                </tr>
              </thead>
              <tbody>
                {run.lines.map((line) => {
                  const employee = EMPLOYEE_BY_ID[line.empId];
                  if (!employee) return null;
                  return (
                    <tr key={line.empId} onClick={() => setSlip(line)} style={{ cursor: "pointer" }}>
                      <td>
                        <PersonCell employee={employee} />
                      </td>
                      <td className="num-col" data-label={tx(p.basic)}>
                        <AmountCell value={line.basic} />
                      </td>
                      <td className="num-col" data-label={tx(p.allowances)}>
                        <AmountCell value={line.housing + line.transport + line.other + line.extraAllowances} />
                      </td>
                      <td className="num-col" data-label={tx(p.overtime)}>
                        <AmountCell value={line.overtime} />
                      </td>
                      <td className="num-col" data-label={tx(p.deductions)}>
                        <AmountCell value={-(line.absenceDeduction + line.lateDeduction + line.manualDeductions)} signed />
                      </td>
                      <td className="num-col" data-label={tx(p.gosiEmployee)}>
                        <AmountCell value={-line.gosiEmployee} signed />
                      </td>
                      <td className="num-col" data-label={tx(p.net)}>
                        <b className="amt">{sar(line.net)}</b>
                      </td>
                    </tr>
                  );
                })}
                <tr className="row--total">
                  <td>{tx(copy.common.total)}</td>
                  <td className="num-col" data-label={tx(p.basic)}>
                    <AmountCell value={run.totals.basic} />
                  </td>
                  <td className="num-col" data-label={tx(p.allowances)}>
                    <AmountCell value={run.totals.housing + run.totals.transport + run.totals.other + run.totals.extraAllowances} />
                  </td>
                  <td className="num-col" data-label={tx(p.overtime)}>
                    <AmountCell value={run.totals.overtime} />
                  </td>
                  <td className="num-col" data-label={tx(p.deductions)}>
                    <AmountCell value={-(run.totals.absenceDeduction + run.totals.lateDeduction + run.totals.manualDeductions)} signed />
                  </td>
                  <td className="num-col" data-label={tx(p.gosiEmployee)}>
                    <AmountCell value={-run.totals.gosiEmployee} signed />
                  </td>
                  <td className="num-col" data-label={tx(p.net)}>
                    <b className="amt">{sar(run.totals.net)}</b>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <span className="t-small t-muted">{tx(copy.employees.gosiNote)}</span>
        </Card>

        <Card className="span-6">
          <CardHead
            title={tx(p.adjustments)}
            hint={tx(p.adjustmentHint)}
            actions={
              <Button size="sm" variant="ink" icon={<Plus />} disabled={locked} onClick={() => setAdding(true)}>
                {tx(p.addAdjustment)}
              </Button>
            }
          />
          {adjustments.length === 0 ? (
            <Empty icon={<Receipt />} title={tx(p.nothing)} />
          ) : (
            <div className="list">
              {adjustments.map((item) => {
                const employee = EMPLOYEE_BY_ID[item.empId];
                return (
                  <div key={item.id} className="list__row">
                    <div className="list__main">
                      <b>{employee ? nameOf(employee) : item.empId}</b>
                      <span>
                        {tx(p.adjustmentKinds[item.kind])}
                        {item.note ? ` · ${item.note}` : ""}
                      </span>
                    </div>
                    <b className="amt">{item.kind === "deduction" ? "−" : "+"}{sar(item.amount)}</b>
                    <IconButton label={tx(copy.common.cancel)} size="sm" variant="soft" disabled={locked} onClick={() => hr.removeAdjustment(item.id)}>
                      <Trash2 />
                    </IconButton>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="span-6" tone={status === "posted" ? "mint" : "soft"}>
          <CardHead title={tx(p.posting)} hint={status === "posted" ? tx(p.postedNote) : tx(copy.overview.flow)} />
          <div className="stack" style={{ gap: 6 }}>
            {[
              [p.postingLines.salaries, run.totals.salaryExpense, 0],
              [p.postingLines.gosiEmployer, run.totals.gosiEmployer, 0],
              [p.postingLines.bank, 0, run.totals.salaryExpense - run.totals.gosiEmployee],
              [p.postingLines.gosiPayable, 0, run.totals.gosiEmployer + run.totals.gosiEmployee],
            ].map(([label, debit, credit]) => (
              <div key={String(label)} className="pill-row" style={{ background: "var(--card)", padding: "8px 14px" }}>
                <span className="grow t-small">{tx(label as never)}</span>
                <span className="amt t-small" style={{ minWidth: 100, textAlign: "end" }}>
                  {Number(debit) ? `${tx(p.debit)} ${sar(Number(debit), 2)}` : ""}
                </span>
                <span className="amt t-small" style={{ minWidth: 100, textAlign: "end" }}>
                  {Number(credit) ? `${tx(p.credit)} ${sar(Number(credit), 2)}` : ""}
                </span>
              </div>
            ))}
          </div>
          <div className="row row--wrap">
            {status === "posted" ? (
              <Link className="btn btn--sm btn--ink" href={app.href("/accounting/ledger")}>
                <Check size={16} /> {tx(p.viewJournal)}
              </Link>
            ) : advanceLabel ? (
              <Button size="sm" variant="ink" onClick={advance}>
                {tx(advanceLabel)}
              </Button>
            ) : null}
          </div>
        </Card>
      </div>

      {adding ? (
        <AdjustmentModal
          branchId={branchId}
          month={month}
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false);
            show(tx(copy.common.saved));
          }}
        />
      ) : null}
      {slip ? <PayslipModal line={slip} run={run} onClose={() => setSlip(null)} /> : null}
      {toast}
    </HrPage>
  );
}

function AdjustmentModal({ branchId, month, onClose, onSaved }: { branchId: RealBranch; month: string; onClose: () => void; onSaved: () => void }) {
  const { hr, tx, sar, nameOf, copy } = useHrUi();
  const p = copy.payroll;
  const staff = Object.values(EMPLOYEE_BY_ID).filter((employee) => employee.branchId === branchId);
  const [empId, setEmpId] = useState("");
  const [kind, setKind] = useState<AdjustmentKind>("allowance");
  const [amount, setAmount] = useState(300);
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState(false);
  const valid = Boolean(empId) && amount > 0;

  const submit = () => {
    setTouched(true);
    if (!valid) return;
    hr.addAdjustment({ empId, month, kind, amount, note: note.trim() });
    onSaved();
  };

  return (
    <Modal title={tx(p.addAdjustment)} hint={tx(p.adjustmentHint)} onClose={onClose}>
      <div className="form-grid">
        <Field className="full" label={tx(copy.common.employee)} error={touched && !empId ? tx(copy.common.required) : undefined}>
          <Select value={empId} aria-invalid={touched && !empId} onChange={(event) => setEmpId(event.target.value)}>
            <option value="">—</option>
            {staff.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {nameOf(employee)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={tx(copy.common.type)}>
          <Select value={kind} onChange={(event) => setKind(event.target.value as AdjustmentKind)}>
            {(["allowance", "bonus", "deduction"] as const).map((item) => (
              <option key={item} value={item}>
                {tx(p.adjustmentKinds[item])}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={`${tx(copy.common.amount)} (${sar(0).replace(/[\d٠-٩.,\s]/g, "")})`} error={touched && amount <= 0 ? tx(copy.common.required) : undefined}>
          <Input type="number" min={1} value={amount} onChange={(event) => setAmount(Number(event.target.value))} />
        </Field>
        <Field className="full" label={tx(p.reason)}>
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

export function PayslipModal({ line, run, onClose }: { line: PayrollLine; run: PayrollRun; onClose: () => void }) {
  const { tx, num, sar, nameOf, jobOf, locale, copy } = useHrUi();
  const p = copy.payroll;
  const employee = EMPLOYEE_BY_ID[line.empId];
  if (!employee) return null;
  const row = (label: string, value: number, sign: "+" | "−" = "+") => (
    <div className="stmt__row">
      <span>{label}</span>
      <span className="amt">
        {sign === "−" ? "−" : ""}
        {sar(value, 2)}
      </span>
    </div>
  );
  return (
    <Modal title={`${tx(p.payslip)} · ${nameOf(employee)}`} hint={`${jobOf(employee)} · ${formatDate(`${run.month}-01`, locale, { month: "long", year: "numeric" })}`} onClose={onClose} wide>
      <div className="stmt">
        <div className="stmt__title">{tx(p.earnings)}</div>
        {row(tx(p.basic), line.basic)}
        {row(tx(copy.employees.housing), line.housing)}
        {row(tx(copy.employees.transport), line.transport)}
        {line.other ? row(tx(copy.employees.other), line.other) : null}
        {line.overtime ? row(`${tx(p.overtime)} (${num(line.overtimeHours)} ${tx(copy.common.hours)})`, line.overtime) : null}
        {line.extraAllowances ? row(tx(p.adjustments), line.extraAllowances) : null}
        <div className="stmt__row stmt__row--total">
          <span>{tx(p.earnings)}</span>
          <span className="amt">{sar(line.earnings, 2)}</span>
        </div>
        <div className="stmt__title">{tx(p.deductions)}</div>
        {line.absenceDeduction ? row(`${tx(p.absence)} (${num(line.absentDays)} ${tx(copy.common.days)})`, line.absenceDeduction, "−") : null}
        {line.lateDeduction ? row(`${tx(p.late)} (${num(line.lateMinutes)} ${tx(copy.common.minutes)})`, line.lateDeduction, "−") : null}
        {line.manualDeductions ? row(tx(p.manual), line.manualDeductions, "−") : null}
        {row(tx(p.gosiEmployee), line.gosiEmployee, "−")}
        <div className="stmt__row stmt__row--grand">
          <span>{tx(p.net)}</span>
          <span className="amt">{sar(line.net, 2)}</span>
        </div>
      </div>
      {line.factor < 1 ? (
        <span className="t-small t-muted">
          {tx(p.prorated)}: {num(line.factor * 100)}%
        </span>
      ) : null}
    </Modal>
  );
}
