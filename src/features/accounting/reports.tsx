"use client";

import { useState, type ReactNode } from "react";
import { ArrowLeft, BookOpenCheck, ChartColumn, FileSpreadsheet, Percent, Scale, Users } from "lucide-react";
import { AccountingPage, AgingBar, AmountCell, downloadCsv, ExportButton, useAcc, useScoped } from "@/features/accounting/shared";
import { getBranchName, getServiceName, getTherapistName } from "@/lib/clinic-utils";
import { formatDate } from "@/lib/dates";
import {
  ACCOUNT_BY_CODE,
  agingBucket,
  AGING_BUCKETS,
  BRANCH_IDS,
  ENTITIES,
  POSTING_ACCOUNTS,
  REPORT_MONTHS,
  round2,
  SUPPLIERS,
  THERAPIST_NATIONALITY,
  TODAY,
  type AccountType,
  type JournalEntry,
  type PaymentMethod,
} from "@/lib/mock/accounting-data";
import { SEED_PATIENTS } from "@/lib/mock/clinic-seed";
import { Badge, Bubble, Button, Card, CardHead, Empty, Field, Notice, Select, Tabs } from "@/ui";

type ReportId =
  | "balanceSheet"
  | "incomeStatement"
  | "cashFlow"
  | "trialBalance"
  | "generalLedger"
  | "journalBook"
  | "arAging"
  | "apAging"
  | "vatReturn"
  | "salesDetail";

const GROUPS: Array<{ title: "financial" | "books" | "receivablesPayables" | "taxReports" | "salesReports"; icon: ReactNode; items: ReportId[] }> = [
  { title: "financial", icon: <Scale />, items: ["balanceSheet", "incomeStatement", "cashFlow"] },
  { title: "books", icon: <BookOpenCheck />, items: ["trialBalance", "generalLedger", "journalBook"] },
  { title: "receivablesPayables", icon: <Users />, items: ["arAging", "apAging"] },
  { title: "taxReports", icon: <Percent />, items: ["vatReturn"] },
  { title: "salesReports", icon: <ChartColumn />, items: ["salesDetail"] },
];

export function ReportsScreen() {
  const { tx, copy } = useAcc();
  const r = copy.reports;
  const [open, setOpen] = useState<ReportId | null>(null);

  if (open) {
    return (
      <AccountingPage title={r.title} subtitle={r.subtitle}>
        <div className="row row--wrap">
          <Button size="sm" variant="soft" icon={<ArrowLeft className="flip" />} onClick={() => setOpen(null)}>
            {tx(r.backToList)}
          </Button>
        </div>
        <ReportViewer id={open} />
      </AccountingPage>
    );
  }

  return (
    <AccountingPage title={r.title} subtitle={r.subtitle}>
      <div className="bento">
        {GROUPS.map((group, index) => (
          <Card key={group.title} className={index === 0 ? "span-12" : "span-6"} tone={index === 0 ? "soft" : undefined}>
            <CardHead title={tx(r[group.title])} actions={<Bubble>{group.icon}</Bubble>} />
            <div className="report-grid">
              {group.items.map((id) => (
                <button key={id} type="button" className="report-card" onClick={() => setOpen(id)}>
                  <FileSpreadsheet size={18} />
                  <b>{tx(r[id])}</b>
                  <span className="t-small t-muted">{tx(r.open)}</span>
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </AccountingPage>
  );
}

function ReportViewer({ id }: { id: ReportId }) {
  switch (id) {
    case "balanceSheet":
      return <BalanceSheet />;
    case "incomeStatement":
      return <IncomeStatement />;
    case "cashFlow":
      return <CashFlow />;
    case "trialBalance":
      return <TrialReport />;
    case "generalLedger":
      return <GeneralLedgerReport />;
    case "journalBook":
      return <JournalBookReport />;
    case "arAging":
      return <AgingReport kind="ar" />;
    case "apAging":
      return <AgingReport kind="ap" />;
    case "vatReturn":
      return <VatReport />;
    default:
      return <SalesReport />;
  }
}

/* ---------- statement rows ---------- */
function Row({ code, label, value, sub, total, grand, signed }: { code?: string; label: string; value: number; sub?: boolean; total?: boolean; grand?: boolean; signed?: boolean }) {
  const { money } = useAcc();
  const text = signed && value < 0 ? `(${money(Math.abs(value), 2)})` : money(value, 2);
  return (
    <div className={`stmt__row${sub ? " stmt__row--sub" : ""}${total ? " stmt__row--total" : ""}${grand ? " stmt__row--grand" : ""}`}>
      <span>
        {code ? <span className="code">{code}</span> : null}
        {label}
      </span>
      <span className="amt">{text}</span>
    </div>
  );
}

function StatementCard({ title, hint, children, onExport }: { title: string; hint: string; children: ReactNode; onExport?: () => void }) {
  return (
    <Card>
      <CardHead title={title} hint={hint} actions={onExport ? <ExportButton onClick={onExport} /> : undefined} />
      <div className="stmt">{children}</div>
    </Card>
  );
}

function typeBalance(scoped: ReturnType<typeof useScoped>, type: AccountType) {
  return POSTING_ACCOUNTS.filter((account) => account.type === type)
    .map((account) => ({ account, value: scoped.balanceOf(account.code) }))
    .filter((row) => row.value !== 0);
}

function BalanceSheet() {
  const { tx, accountName, locale, copy } = useAcc();
  const r = copy.reports;
  const scoped = useScoped();
  const assets = typeBalance(scoped, "asset");
  const liabilities = typeBalance(scoped, "liability");
  const equity = typeBalance(scoped, "equity");
  const totalAssets = assets.reduce((sum, row) => sum + row.value, 0);
  const totalLiabilities = liabilities.reduce((sum, row) => sum + row.value, 0);
  const totalEquity = equity.reduce((sum, row) => sum + row.value, 0) + scoped.pnl.net;
  const hint = `${tx(r.asOf)} ${formatDate(TODAY, locale)}`;
  const exportCsv = () =>
    downloadCsv("ehteraf-balance-sheet.csv", [tx(copy.common.account), tx(copy.common.amount)], [
      ...assets.map((row) => [row.account.code + " " + accountName(row.account.code), row.value]),
      [tx(r.totalAssets), totalAssets],
      ...liabilities.map((row) => [row.account.code + " " + accountName(row.account.code), row.value]),
      ...equity.map((row) => [row.account.code + " " + accountName(row.account.code), row.value]),
      [tx(r.currentProfit), scoped.pnl.net],
      [tx(r.totalLiabilitiesEquity), totalLiabilities + totalEquity],
    ]);
  return (
    <div className="bento">
      <div className="span-6">
        <StatementCard title={tx(r.balanceSheet)} hint={hint} onExport={exportCsv}>
          <div className="stmt__title">{tx(r.assets)}</div>
          {assets.map((row) => (
            <Row key={row.account.code} code={row.account.code} label={accountName(row.account.code)} value={row.value} signed />
          ))}
          <Row label={tx(r.totalAssets)} value={totalAssets} grand />
        </StatementCard>
      </div>
      <div className="span-6">
        <StatementCard title={`${tx(r.liabilities)} + ${tx(r.equity)}`} hint={hint}>
          <div className="stmt__title">{tx(r.liabilities)}</div>
          {liabilities.map((row) => (
            <Row key={row.account.code} code={row.account.code} label={accountName(row.account.code)} value={row.value} />
          ))}
          <div className="stmt__title">{tx(r.equity)}</div>
          {equity.map((row) => (
            <Row key={row.account.code} code={row.account.code} label={accountName(row.account.code)} value={row.value} />
          ))}
          <Row label={tx(r.currentProfit)} value={scoped.pnl.net} />
          <Row label={tx(r.totalLiabilitiesEquity)} value={totalLiabilities + totalEquity} grand />
        </StatementCard>
      </div>
      <span className="span-12">
        <Badge tone={Math.abs(totalAssets - totalLiabilities - totalEquity) < 0.5 ? "lime" : "peach"}>
          {Math.abs(totalAssets - totalLiabilities - totalEquity) < 0.5 ? tx(copy.common.balanced) : tx(copy.common.unbalanced)}
        </Badge>
      </span>
    </div>
  );
}

function IncomeStatement() {
  const { tx, accountName, locale, copy } = useAcc();
  const r = copy.reports;
  const scoped = useScoped();
  const revenue = typeBalance(scoped, "revenue");
  const expenses = typeBalance(scoped, "expense");
  const exportCsv = () =>
    downloadCsv("ehteraf-income-statement.csv", [tx(copy.common.account), tx(copy.common.amount)], [
      ...revenue.map((row) => [accountName(row.account.code), row.value]),
      [tx(r.revenue), scoped.pnl.revenue],
      ...expenses.map((row) => [accountName(row.account.code), row.value]),
      [tx(r.expenses), scoped.pnl.expenses],
      [tx(r.netIncome), scoped.pnl.net],
    ]);
  return (
    <StatementCard title={tx(r.incomeStatement)} hint={`${tx(r.forPeriod)} ${formatDate("2026-06-01", locale)} — ${formatDate(TODAY, locale)}`} onExport={exportCsv}>
      <div className="stmt__title">{tx(r.revenue)}</div>
      {revenue.map((row) => (
        <Row key={row.account.code} code={row.account.code} label={accountName(row.account.code)} value={row.value} />
      ))}
      <Row label={tx(r.revenue)} value={scoped.pnl.revenue} total />
      <div className="stmt__title">{tx(r.expenses)}</div>
      {expenses.map((row) => (
        <Row key={row.account.code} code={row.account.code} label={accountName(row.account.code)} value={row.value} />
      ))}
      <Row label={tx(r.expenses)} value={scoped.pnl.expenses} total />
      <Row label={tx(r.netIncome)} value={scoped.pnl.net} grand signed />
    </StatementCard>
  );
}

function CashFlow() {
  const { tx, locale, copy } = useAcc();
  const r = copy.reports;
  const scoped = useScoped();
  const cashLines = (entry: JournalEntry) => entry.lines.filter((line) => line.account === "1100" || line.account === "1120");
  const sum = (kinds: JournalEntry["kind"][], side: "debit" | "credit") =>
    scoped.entries.filter((entry) => kinds.includes(entry.kind)).reduce((total, entry) => total + cashLines(entry).reduce((inner, line) => inner + line[side], 0), 0);

  // Deposits move money between cash accounts, so they net out and are excluded.
  const receipts = sum(["receipt"], "debit");
  const suppliers = -sum(["payment"], "credit");
  const payroll = -(sum(["payroll", "gosi"], "credit"));
  const rent = -sum(["rent"], "credit");
  const operating = receipts + suppliers + payroll + rent;
  const capital = sum(["opening"], "debit");
  const net = operating + capital;
  const manualCash = scoped.entries
    .filter((entry) => entry.kind === "manual")
    .reduce((total, entry) => total + cashLines(entry).reduce((inner, line) => inner + line.debit - line.credit, 0), 0);
  const closing = scoped.balanceOf("1100") + scoped.balanceOf("1120");

  return (
    <StatementCard title={tx(r.cashFlow)} hint={`${tx(r.forPeriod)} ${formatDate("2026-06-01", locale)} — ${formatDate(TODAY, locale)}`}>
      <div className="stmt__title">{tx(r.operating)}</div>
      <Row label={tx(r.receiptsFromCustomers)} value={receipts} />
      <Row label={tx(r.paymentsToSuppliers)} value={suppliers} signed />
      <Row label={tx(r.payrollPaid)} value={payroll} signed />
      <Row label={tx(r.rentPaid)} value={rent} signed />
      <Row label={tx(r.netOperating)} value={operating} total signed />
      <div className="stmt__title">{tx(r.investing)}</div>
      <Row label={tx(r.noInvesting)} value={0} sub />
      <div className="stmt__title">{tx(r.financing)}</div>
      <Row label={tx(r.capitalIntroduced)} value={capital} />
      {manualCash !== 0 ? <Row label={tx(copy.entryKinds.manual)} value={manualCash} signed /> : null}
      <Row label={tx(r.netChange)} value={net + manualCash} total signed />
      <Row label={tx(r.closingCash)} value={closing} grand />
    </StatementCard>
  );
}

/* ---------- books ---------- */
function TrialReport() {
  const { tx, accountName, locale, copy } = useAcc();
  const scoped = useScoped();
  const rows = POSTING_ACCOUNTS.map((account) => {
    const b = scoped.balances[account.code];
    const net = (b?.debit ?? 0) - (b?.credit ?? 0);
    return { account, debit: net > 0 ? net : 0, credit: net < 0 ? -net : 0 };
  }).filter((row) => row.debit || row.credit);
  const debit = rows.reduce((total, row) => total + row.debit, 0);
  const credit = rows.reduce((total, row) => total + row.credit, 0);
  return (
    <Card>
      <CardHead
        title={tx(copy.reports.trialBalance)}
        hint={`${tx(copy.reports.asOf)} ${formatDate(TODAY, locale)}`}
        actions={
          <ExportButton
            onClick={() =>
              downloadCsv("ehteraf-trial-balance.csv", [tx(copy.ledger.code), tx(copy.ledger.name), tx(copy.common.debit), tx(copy.common.credit)], rows.map((row) => [row.account.code, accountName(row.account.code), row.debit, row.credit]))
            }
          />
        }
      />
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>{tx(copy.ledger.name)}</th>
              <th className="num-col">{tx(copy.common.debit)}</th>
              <th className="num-col">{tx(copy.common.credit)}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.account.code}>
                <td>
                  <b style={{ fontWeight: 550 }}>{row.account.code}</b> {accountName(row.account.code)}
                </td>
                <td className="num-col" data-label={tx(copy.common.debit)}>
                  <AmountCell value={row.debit} decimals={2} />
                </td>
                <td className="num-col" data-label={tx(copy.common.credit)}>
                  <AmountCell value={row.credit} decimals={2} />
                </td>
              </tr>
            ))}
            <tr className="row--total">
              <td>{tx(copy.ledger.totals)}</td>
              <td className="num-col" data-label={tx(copy.common.debit)}>
                <AmountCell value={debit} decimals={2} />
              </td>
              <td className="num-col" data-label={tx(copy.common.credit)}>
                <AmountCell value={credit} decimals={2} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function GeneralLedgerReport() {
  const { tx, accountLabel, entryMemo, locale, copy } = useAcc();
  const scoped = useScoped();
  const [code, setCode] = useState("1120");
  const account = ACCOUNT_BY_CODE[code];
  const debitNormal = account?.type === "asset" || account?.type === "expense";
  let running = 0;
  const rows = scoped.entries.flatMap((entry) =>
    entry.lines
      .filter((line) => line.account === code)
      .map((line) => {
        running = round2(running + (debitNormal ? line.debit - line.credit : line.credit - line.debit));
        return { entry, line, running };
      }),
  );
  const shown = [...rows].reverse().slice(0, 40);
  return (
    <Card>
      <CardHead
        title={tx(copy.reports.generalLedger)}
        hint={accountLabel(code)}
        actions={
          <Field label={tx(copy.common.account)}>
            <Select className="select--sm" value={code} onChange={(event) => setCode(event.target.value)}>
              {POSTING_ACCOUNTS.map((item) => (
                <option key={item.code} value={item.code}>
                  {accountLabel(item.code)}
                </option>
              ))}
            </Select>
          </Field>
        }
      />
      {shown.length === 0 ? (
        <Empty icon={<BookOpenCheck />} title={tx(copy.common.noResults)} />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>{tx(copy.common.date)}</th>
                <th>{tx(copy.common.memo)}</th>
                <th className="num-col">{tx(copy.common.debit)}</th>
                <th className="num-col">{tx(copy.common.credit)}</th>
                <th className="num-col">{tx(copy.common.balance)}</th>
              </tr>
            </thead>
            <tbody>
              {shown.map(({ entry, line, running: balance }, index) => (
                <tr key={entry.id + index}>
                  <td>
                    {formatDate(entry.date, locale)}
                    <span className="sub">{entry.id}</span>
                  </td>
                  <td data-label={tx(copy.common.memo)}>{entryMemo(entry)}</td>
                  <td className="num-col" data-label={tx(copy.common.debit)}>
                    <AmountCell value={line.debit} decimals={2} />
                  </td>
                  <td className="num-col" data-label={tx(copy.common.credit)}>
                    <AmountCell value={line.credit} decimals={2} />
                  </td>
                  <td className="num-col" data-label={tx(copy.common.balance)}>
                    <AmountCell value={balance} decimals={2} signed />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function JournalBookReport() {
  const { tx, accountName, entryMemo, locale, copy } = useAcc();
  const scoped = useScoped();
  const [month, setMonth] = useState(REPORT_MONTHS[REPORT_MONTHS.length - 1] ?? "2026-11");
  const entries = scoped.entries.filter((entry) => entry.date.startsWith(month));
  const lines = entries.flatMap((entry) => entry.lines.map((line) => ({ entry, line })));
  return (
    <Card>
      <CardHead
        title={tx(copy.reports.journalBook)}
        hint={`${entries.length} · ${formatDate(`${month}-01`, locale, { month: "long", year: "numeric" })}`}
        actions={
          <>
            <Select className="select--sm" style={{ width: "auto" }} aria-label={tx(copy.common.month)} value={month} onChange={(event) => setMonth(event.target.value)}>
              {REPORT_MONTHS.map((item) => (
                <option key={item} value={item}>
                  {formatDate(`${item}-01`, locale, { month: "long", year: "numeric" })}
                </option>
              ))}
            </Select>
            <ExportButton
              onClick={() =>
                downloadCsv("ehteraf-journal-book.csv", [tx(copy.ledger.entryNo), tx(copy.common.date), tx(copy.common.memo), tx(copy.common.account), tx(copy.common.debit), tx(copy.common.credit)], lines.map(({ entry, line }) => [entry.id, entry.date, entryMemo(entry), `${line.account} ${accountName(line.account)}`, line.debit, line.credit]))
              }
            />
          </>
        }
      />
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>{tx(copy.ledger.entryNo)}</th>
              <th>{tx(copy.common.account)}</th>
              <th className="num-col">{tx(copy.common.debit)}</th>
              <th className="num-col">{tx(copy.common.credit)}</th>
            </tr>
          </thead>
          <tbody>
            {lines.slice(0, 120).map(({ entry, line }, index) => (
              <tr key={entry.id + index}>
                <td>
                  <b style={{ fontWeight: 550 }}>{entry.id}</b>
                  <span className="sub">
                    {formatDate(entry.date, locale, { day: "numeric", month: "short" })} · {entryMemo(entry)}
                  </span>
                </td>
                <td data-label={tx(copy.common.account)}>
                  {line.account} · {accountName(line.account)}
                </td>
                <td className="num-col" data-label={tx(copy.common.debit)}>
                  <AmountCell value={line.debit} decimals={2} />
                </td>
                <td className="num-col" data-label={tx(copy.common.credit)}>
                  <AmountCell value={line.credit} decimals={2} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {lines.length > 120 ? <span className="t-small t-muted">120 / {lines.length}</span> : null}
    </Card>
  );
}

/* ---------- aging & VAT ---------- */
function AgingReport({ kind }: { kind: "ar" | "ap" }) {
  const { app, tx, num, sar, locale, copy } = useAcc();
  const r = copy.reports;
  const scoped = useScoped();
  const docs = kind === "ar" ? scoped.invoices : scoped.bills;
  const open = docs.filter((doc) => !doc.paidAt);
  const totals = kind === "ar" ? scoped.arAging : scoped.apAging;
  const grouped = new Map<string, { name: string; buckets: Record<string, number>; total: number }>();
  for (const doc of open) {
    let key: string;
    let name: string;
    if ("patientId" in doc) {
      key = doc.patientId;
      name = app.pick(...patientPair(doc.patientId));
    } else {
      key = doc.supplierId;
      name = supplierName(doc.supplierId, locale);
    }
    const entry = grouped.get(key) ?? { name, buckets: { current: 0, d1_30: 0, d31_60: 0, d61_plus: 0 }, total: 0 };
    entry.buckets[agingBucket(doc.due)] = (entry.buckets[agingBucket(doc.due)] ?? 0) + doc.total;
    entry.total += doc.total;
    grouped.set(key, entry);
  }
  const rows = [...grouped.values()].sort((a, b) => b.total - a.total).slice(0, 25);
  const sum = open.reduce((total, doc) => total + doc.total, 0);
  return (
    <Card>
      <CardHead
        title={tx(kind === "ar" ? r.arAging : r.apAging)}
        hint={`${tx(r.totalDue)}: ${sar(sum)} · ${num(open.length)}`}
        actions={
          <ExportButton
            onClick={() =>
              downloadCsv(`ehteraf-${kind}-aging.csv`, [tx(kind === "ar" ? copy.common.customer : copy.common.supplier), ...AGING_BUCKETS.map((bucket) => tx(copy.aging[bucket])), tx(copy.common.total)], rows.map((row) => [row.name, ...AGING_BUCKETS.map((bucket) => row.buckets[bucket] ?? 0), row.total]))
            }
          />
        }
      />
      <AgingBar totals={totals} />
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>{tx(kind === "ar" ? copy.common.customer : copy.common.supplier)}</th>
              {AGING_BUCKETS.map((bucket) => (
                <th key={bucket} className="num-col">
                  {tx(copy.aging[bucket])}
                </th>
              ))}
              <th className="num-col">{tx(copy.common.total)}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td>
                  <b style={{ fontWeight: 550 }}>{row.name}</b>
                </td>
                {AGING_BUCKETS.map((bucket) => (
                  <td key={bucket} className="num-col" data-label={tx(copy.aging[bucket])}>
                    <AmountCell value={row.buckets[bucket] ?? 0} />
                  </td>
                ))}
                <td className="num-col" data-label={tx(copy.common.total)}>
                  <AmountCell value={row.total} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function patientPair(id: string): [string, string] {
  const patient = SEED_PATIENTS.find((item) => item.id === id);
  return patient ? [patient.nameAr, patient.nameEn] : [id, id];
}
function supplierName(id: string, locale: "ar" | "en") {
  const supplier = SUPPLIERS.find((item) => item.id === id);
  return supplier ? (locale === "ar" ? supplier.nameAr : supplier.nameEn) : id;
}

function VatReport() {
  const { data, tx, sar, locale, copy, app } = useAcc();
  const r = copy.reports;
  const entities = ENTITIES.filter((entity) => app.branchId === "all" || (entity.branches as string[]).includes(app.branchId));
  const rows = entities.map((entity) => {
    let output = 0;
    let input = 0;
    for (const entry of data.entries) {
      if (!(entity.branches as string[]).includes(entry.branchId)) continue;
      for (const line of entry.lines) {
        if (line.account === "2300") output += line.credit - line.debit;
        if (line.account === "1400") input += line.debit - line.credit;
      }
    }
    return { entity, output, input, net: output - input };
  });
  return (
    <Card>
      <CardHead
        title={tx(r.vatReturn)}
        hint={`${tx(r.forPeriod)} ${formatDate("2026-06-01", locale)} — ${formatDate(TODAY, locale)}`}
        actions={<ExportButton onClick={() => downloadCsv("ehteraf-vat-return.csv", [tx(copy.common.legalEntity), tx(r.outputVat), tx(r.inputVat), tx(r.netVat)], rows.map((row) => [app.pick(row.entity.nameAr, row.entity.nameEn), row.output, row.input, row.net]))} />}
      />
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>{tx(copy.common.legalEntity)}</th>
              <th className="num-col">{tx(r.outputVat)}</th>
              <th className="num-col">{tx(r.inputVat)}</th>
              <th className="num-col">{tx(r.netVat)}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.entity.id}>
                <td>
                  <b style={{ fontWeight: 550 }}>{app.pick(row.entity.nameAr, row.entity.nameEn)}</b>
                  <span className="sub">{row.entity.branches.map((id) => getBranchName(id, locale)).join(" · ")}</span>
                </td>
                <td className="num-col" data-label={tx(r.outputVat)}>
                  <AmountCell value={row.output} decimals={2} />
                </td>
                <td className="num-col" data-label={tx(r.inputVat)}>
                  <AmountCell value={row.input} decimals={2} />
                </td>
                <td className="num-col" data-label={tx(r.netVat)}>
                  <AmountCell value={row.net} decimals={2} signed />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <span className="t-small t-muted">{sar(rows.reduce((total, row) => total + row.net, 0), 2)}</span>
    </Card>
  );
}

/* ---------- sales reports ---------- */
type Dimension = "branch" | "therapist" | "service" | "method" | "nationality";
type Granularity = "day" | "month" | "year";

function SalesReport() {
  const { app, tx, num, sar, locale, copy } = useAcc();
  const r = copy.reports;
  const scoped = useScoped();
  const [dimension, setDimension] = useState<Dimension>("branch");
  const [granularity, setGranularity] = useState<Granularity>("month");
  const [month, setMonth] = useState(REPORT_MONTHS[REPORT_MONTHS.length - 1] ?? "2026-11");

  const periodInvoices = scoped.invoices.filter((invoice) => {
    if (granularity === "day") return invoice.date === TODAY;
    if (granularity === "month") return invoice.date.startsWith(month);
    return invoice.date.startsWith("2026");
  });

  const label = (invoice: (typeof periodInvoices)[number]): string => {
    switch (dimension) {
      case "branch":
        return getBranchName(invoice.branchId, locale);
      case "therapist":
        return getTherapistName(invoice.therapistId, locale);
      case "service":
        return getServiceName(invoice.serviceId, locale);
      case "method":
        return tx(copy.methods[invoice.method as PaymentMethod]);
      default:
        return tx(r.nationality[THERAPIST_NATIONALITY[invoice.therapistId] ?? "saudi"]);
    }
  };

  const groups = new Map<string, { net: number; total: number; count: number; sessions: number }>();
  for (const invoice of periodInvoices) {
    const key = label(invoice);
    const current = groups.get(key) ?? { net: 0, total: 0, count: 0, sessions: 0 };
    current.net += invoice.net;
    current.total += invoice.total;
    current.count += 1;
    current.sessions += invoice.qty;
    groups.set(key, current);
  }
  const rows = [...groups.entries()].map(([name, value]) => ({ name, ...value })).sort((a, b) => b.net - a.net);
  const totalNet = rows.reduce((total, row) => total + row.net, 0) || 1;
  const maxNet = Math.max(1, ...rows.map((row) => row.net));
  const branchList = app.branchId === "all" ? BRANCH_IDS.length : 1;

  return (
    <div className="bento">
      <Card className="span-12">
        <CardHead
          title={tx(r.salesDetail)}
          hint={`${tx(r.byDimension)} ${tx(r.dimensions[dimension])} · ${tx(r.granularity[granularity])}`}
          actions={
            <ExportButton
              onClick={() =>
                downloadCsv("ehteraf-sales-report.csv", [tx(r.dimensions[dimension]), tx(r.invoicesCount), tx(r.sessions), tx(r.sales), tx(copy.common.total)], rows.map((row) => [row.name, row.count, row.sessions, row.net, row.total]))
              }
            />
          }
        />
        <div className="toolbar">
          <Tabs
            filled
            value={granularity}
            onChange={setGranularity}
            options={(["day", "month", "year"] as const).map((value) => ({ value, label: tx(r.granularity[value]) }))}
          />
          {granularity === "month" ? (
            <Select className="select--sm" style={{ width: "auto" }} aria-label={tx(copy.common.month)} value={month} onChange={(event) => setMonth(event.target.value)}>
              {REPORT_MONTHS.map((item) => (
                <option key={item} value={item}>
                  {formatDate(`${item}-01`, locale, { month: "long", year: "numeric" })}
                </option>
              ))}
            </Select>
          ) : null}
          <div className="toolbar__end">
            <Tabs
              value={dimension}
              onChange={setDimension}
              options={(["branch", "therapist", "service", "method", "nationality"] as const).map((value) => ({ value, label: tx(r.dimensions[value]) }))}
            />
          </div>
        </div>

        {rows.length === 0 ? (
          <Empty icon={<ChartColumn />} title={tx(copy.common.noResults)} />
        ) : (
          <>
            <div className="stack" style={{ gap: 12 }}>
              {rows.slice(0, 8).map((row) => (
                <div key={row.name} className="hbar">
                  <span className="truncate">{row.name}</span>
                  <div className="hbar__track">
                    <div className="hbar__fill" style={{ width: `${(row.net / maxNet) * 100}%` }} />
                  </div>
                  <b className="amt">{sar(row.net)}</b>
                </div>
              ))}
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>{tx(r.dimensions[dimension])}</th>
                    <th className="num-col">{tx(r.invoicesCount)}</th>
                    <th className="num-col">{tx(r.sessions)}</th>
                    <th className="num-col">{tx(r.sales)}</th>
                    <th className="num-col">{tx(r.avgInvoice)}</th>
                    <th className="num-col">{tx(copy.common.share)}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.name}>
                      <td>
                        <b style={{ fontWeight: 550 }}>{row.name}</b>
                      </td>
                      <td className="num-col" data-label={tx(r.invoicesCount)}>
                        {num(row.count)}
                      </td>
                      <td className="num-col" data-label={tx(r.sessions)}>
                        {num(row.sessions)}
                      </td>
                      <td className="num-col" data-label={tx(r.sales)}>
                        <AmountCell value={row.net} />
                      </td>
                      <td className="num-col" data-label={tx(r.avgInvoice)}>
                        <AmountCell value={row.net / row.count} />
                      </td>
                      <td className="num-col" data-label={tx(copy.common.share)}>
                        {num((row.net / totalNet) * 100)}%
                      </td>
                    </tr>
                  ))}
                  <tr className="row--total">
                    <td>{tx(copy.common.total)}</td>
                    <td className="num-col" data-label={tx(r.invoicesCount)}>
                      {num(rows.reduce((total, row) => total + row.count, 0))}
                    </td>
                    <td className="num-col" data-label={tx(r.sessions)}>
                      {num(rows.reduce((total, row) => total + row.sessions, 0))}
                    </td>
                    <td className="num-col" data-label={tx(r.sales)}>
                      <AmountCell value={rows.reduce((total, row) => total + row.net, 0)} />
                    </td>
                    <td />
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
        {dimension === "nationality" ? <Notice>{tx(r.nationalityNote)}</Notice> : null}
        <span className="t-small t-muted">
          {tx(r.costCenterNote)} · {num(branchList)} {tx(copy.common.branch)}
        </span>
      </Card>
    </div>
  );
}
