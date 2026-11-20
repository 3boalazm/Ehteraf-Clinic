"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpen, ChevronDown, Plus, Trash2 } from "lucide-react";
import {
  AccountingPage,
  AmountCell,
  downloadCsv,
  ExportButton,
  Modal,
  Pager,
  useAcc,
  useScoped,
  useToast,
} from "@/features/accounting/shared";
import { getBranchName } from "@/lib/clinic-utils";
import { formatDate } from "@/lib/dates";
import {
  ACCOUNT_BY_CODE,
  ACCOUNTS,
  BRANCH_IDS,
  POSTING_ACCOUNTS,
  round2,
  TODAY,
  type AccountType,
  type EntryKind,
  type JournalEntry,
  type RealBranch,
} from "@/lib/mock/accounting-data";
import { Badge, Button, Card, Empty, Field, IconButton, Input, SearchBox, Select, Tabs } from "@/ui";

type LedgerTab = "journal" | "chart" | "trial";
const PAGE_SIZE = 12;
const TYPE_ORDER: AccountType[] = ["asset", "liability", "equity", "revenue", "expense"];

export function LedgerScreen() {
  const { tx, copy, locale } = useAcc();
  const l = copy.ledger;
  const scoped = useScoped();
  const [tab, setTab] = useState<LedgerTab>("journal");
  const [drill, setDrill] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const { show, toast } = useToast();

  const exportCsv = () =>
    downloadCsv(
      "ehteraf-journal.csv",
      [tx(l.entryNo), tx(copy.common.date), tx(copy.common.branch), tx(l.kind), tx(copy.common.memo), tx(copy.common.account), tx(copy.common.debit), tx(copy.common.credit)],
      scoped.entries.flatMap((entry) =>
        entry.lines.map((line) => [
          entry.id,
          entry.date,
          getBranchName(entry.branchId, locale),
          tx(copy.entryKinds[entry.kind]),
          locale === "ar" ? entry.memoAr : entry.memoEn,
          `${line.account} ${locale === "ar" ? ACCOUNT_BY_CODE[line.account]?.nameAr : ACCOUNT_BY_CODE[line.account]?.nameEn}`,
          line.debit,
          line.credit,
        ]),
      ),
    );

  return (
    <AccountingPage
      title={l.title}
      subtitle={l.subtitle}
      actions={
        <>
          <ExportButton onClick={exportCsv} />
          <Button variant="ink" icon={<Plus />} onClick={() => setCreating(true)}>
            {tx(l.newEntry)}
          </Button>
        </>
      }
    >
      <div className="bento">
        <Card className="span-12">
          <div className="toolbar">
            <Tabs
              filled
              value={tab}
              onChange={(next) => {
                setTab(next);
                setDrill(null);
              }}
              options={[
                { value: "journal", label: tx(l.journal) },
                { value: "chart", label: tx(l.chart) },
                { value: "trial", label: tx(l.trial) },
              ]}
            />
          </div>
          {tab === "journal" ? <JournalTab /> : null}
          {tab === "chart" ? (drill ? <AccountActivity code={drill} onBack={() => setDrill(null)} /> : <ChartTab onDrill={setDrill} />) : null}
          {tab === "trial" ? <TrialTab onDrill={(code) => { setDrill(code); setTab("chart"); }} /> : null}
        </Card>
      </div>
      {creating ? (
        <ManualEntryModal
          onClose={() => setCreating(false)}
          onPosted={() => {
            setCreating(false);
            setTab("journal");
            show(tx(l.entryPosted));
          }}
        />
      ) : null}
      {toast}
    </AccountingPage>
  );
}

/* ---------- journal ---------- */
function JournalTab() {
  const { app, tx, num, sar, accountLabel, entryMemo, locale, copy } = useAcc();
  const l = copy.ledger;
  const scoped = useScoped();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"all" | EntryKind>("all");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<string | null>(null);

  const needle = (query || app.searchQuery).trim().toLocaleLowerCase();
  const rows = useMemo(
    () =>
      [...scoped.entries]
        .reverse()
        .filter((entry) => (kind === "all" || entry.kind === kind) && (!needle || `${entry.id} ${entry.memoAr} ${entry.memoEn} ${entry.ref ?? ""}`.toLocaleLowerCase().includes(needle))),
    [scoped.entries, kind, needle],
  );
  useEffect(() => setPage(1), [kind, query, app.searchQuery, app.branchId]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const kinds = Object.keys(copy.entryKinds) as EntryKind[];

  return (
    <>
      <div className="toolbar">
        <SearchBox value={query} onChange={setQuery} placeholder={tx(copy.common.search)} />
        <div className="toolbar__end">
          <Select className="select--sm" style={{ width: "auto" }} aria-label={tx(l.kind)} value={kind} onChange={(event) => setKind(event.target.value as typeof kind)}>
            <option value="all">{tx(copy.common.all)}</option>
            {kinds.map((item) => (
              <option key={item} value={item}>
                {tx(copy.entryKinds[item])}
              </option>
            ))}
          </Select>
        </div>
      </div>
      {visible.length === 0 ? (
        <Empty icon={<BookOpen />} title={tx(copy.common.noResults)} />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>{tx(l.entryNo)}</th>
                <th>{tx(copy.common.memo)}</th>
                <th>{tx(copy.common.date)}</th>
                <th>{tx(l.kind)}</th>
                <th className="num-col">{tx(copy.common.amount)}</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((entry) => {
                const total = entry.lines.reduce((sum, item) => sum + item.debit, 0);
                const isOpen = open === entry.id;
                return (
                  <Fragment key={entry.id}>
                    <tr onClick={() => setOpen(isOpen ? null : entry.id)} style={{ cursor: "pointer" }}>
                      <td>
                        <div className="cell-main">
                          <ChevronDown size={16} style={{ transform: isOpen ? "none" : "rotate(-90deg)", flex: "none" }} />
                          <div>
                            <b>{entry.id}</b>
                            <span>{getBranchName(entry.branchId, locale)}</span>
                          </div>
                        </div>
                      </td>
                      <td data-label={tx(copy.common.memo)}>{entryMemo(entry)}</td>
                      <td data-label={tx(copy.common.date)}>{formatDate(entry.date, locale)}</td>
                      <td data-label={tx(l.kind)}>
                        <Badge tone={entry.source === "manual" ? "lilac" : "outline"} plain>
                          {tx(copy.entryKinds[entry.kind])}
                        </Badge>
                      </td>
                      <td className="num-col" data-label={tx(copy.common.amount)}>
                        <AmountCell value={total} decimals={2} />
                      </td>
                    </tr>
                    {isOpen ? (
                      <tr>
                        <td colSpan={5} style={{ gridColumn: "1 / -1" }}>
                          <div className="stack" style={{ gap: 6 }}>
                            {entry.lines.map((line, index) => (
                              <div key={index} className="pill-row" style={{ background: "var(--card)", padding: "8px 14px" }}>
                                <span className="grow t-small">{accountLabel(line.account)}</span>
                                <span className="amt t-small" style={{ minWidth: 90, textAlign: "end" }}>
                                  {line.debit ? `${tx(copy.common.debit)} ${sar(line.debit, 2)}` : ""}
                                </span>
                                <span className="amt t-small" style={{ minWidth: 90, textAlign: "end" }}>
                                  {line.credit ? `${tx(copy.common.credit)} ${sar(line.credit, 2)}` : ""}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Pager page={current} pages={pages} onPage={setPage} total={rows.length} shown={visible.length} />
      <span className="t-small t-muted">{num(scoped.entries.length)} {tx(l.lines)}</span>
    </>
  );
}

/* ---------- chart of accounts ---------- */
function ChartTab({ onDrill }: { onDrill: (code: string) => void }) {
  const { tx, accountName, copy } = useAcc();
  const l = copy.ledger;
  const scoped = useScoped();
  const [type, setType] = useState<"all" | AccountType>("all");
  const accounts = ACCOUNTS.filter((account) => type === "all" || account.type === type);

  const groupTotal = (code: string): number =>
    ACCOUNTS.filter((account) => account.parent === code).reduce((sum, account) => {
      if (account.group) return sum + groupTotal(account.code);
      return sum + scoped.balanceOf(account.code);
    }, 0);

  return (
    <>
      <div className="toolbar">
        <Tabs
          value={type}
          onChange={setType}
          options={[
            { value: "all", label: tx(copy.common.all) },
            ...TYPE_ORDER.map((item) => ({ value: item, label: tx(copy.accountTypes[item]) })),
          ]}
        />
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>{tx(l.code)}</th>
              <th>{tx(l.name)}</th>
              <th>{tx(l.type)}</th>
              <th className="num-col">{tx(copy.common.balance)}</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => {
              const isGroup = Boolean(account.group);
              const value = isGroup ? groupTotal(account.code) : scoped.balanceOf(account.code);
              return (
                <tr key={account.code} onClick={isGroup ? undefined : () => onDrill(account.code)} style={{ cursor: isGroup ? "default" : "pointer" }} className={isGroup ? "row--total" : undefined}>
                  <td>
                    <b style={{ fontWeight: 550 }}>{account.code}</b>
                  </td>
                  <td data-label={tx(l.name)} style={{ paddingInlineStart: account.parent && account.parent !== "1000" && !isGroup ? 28 : undefined }}>
                    {accountName(account.code)}
                  </td>
                  <td data-label={tx(l.type)}>{tx(copy.accountTypes[account.type])}</td>
                  <td className="num-col" data-label={tx(copy.common.balance)}>
                    <AmountCell value={value} decimals={2} signed />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function AccountActivity({ code, onBack }: { code: string; onBack: () => void }) {
  const { tx, sar, accountLabel, entryMemo, locale, copy } = useAcc();
  const l = copy.ledger;
  const scoped = useScoped();
  const account = ACCOUNT_BY_CODE[code];
  const debitNormal = account?.type === "asset" || account?.type === "expense";
  const lines = scoped.entries
    .flatMap((entry) => entry.lines.filter((line) => line.account === code).map((line) => ({ entry, line })))
    .reduce<Array<{ entry: JournalEntry; debit: number; credit: number; running: number }>>((list, { entry, line }) => {
      const previous = list[list.length - 1]?.running ?? 0;
      const running = round2(previous + (debitNormal ? line.debit - line.credit : line.credit - line.debit));
      list.push({ entry, debit: line.debit, credit: line.credit, running });
      return list;
    }, []);
  const [page, setPage] = useState(1);
  const ordered = [...lines].reverse();
  const pages = Math.max(1, Math.ceil(ordered.length / PAGE_SIZE));
  const visible = ordered.slice((Math.min(page, pages) - 1) * PAGE_SIZE, Math.min(page, pages) * PAGE_SIZE);

  return (
    <>
      <div className="row row--between row--wrap">
        <div>
          <h3 className="card__title">{accountLabel(code)}</h3>
          <p className="card__hint">
            {tx(l.drilldown)} · {tx(copy.common.balance)}: {sar(lines[lines.length - 1]?.running ?? 0, 2)}
          </p>
        </div>
        <Button size="sm" variant="soft" icon={<ArrowLeft className="flip" />} onClick={onBack}>
          {tx(l.back)}
        </Button>
      </div>
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
            {visible.map(({ entry, debit, credit, running }, index) => (
              <tr key={`${entry.id}-${index}`}>
                <td>
                  {formatDate(entry.date, locale)}
                  <span className="sub">{entry.id}</span>
                </td>
                <td data-label={tx(copy.common.memo)}>{entryMemo(entry)}</td>
                <td className="num-col" data-label={tx(copy.common.debit)}>
                  <AmountCell value={debit} decimals={2} />
                </td>
                <td className="num-col" data-label={tx(copy.common.credit)}>
                  <AmountCell value={credit} decimals={2} />
                </td>
                <td className="num-col" data-label={tx(copy.common.balance)}>
                  <AmountCell value={running} decimals={2} signed />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager page={Math.min(page, pages)} pages={pages} onPage={setPage} total={ordered.length} shown={visible.length} />
    </>
  );
}

/* ---------- trial balance ---------- */
function TrialTab({ onDrill }: { onDrill: (code: string) => void }) {
  const { tx, num, sar, accountName, locale, copy } = useAcc();
  const l = copy.ledger;
  const scoped = useScoped();
  const rows = POSTING_ACCOUNTS.map((account) => {
    const balance = scoped.balances[account.code];
    const net = (balance?.debit ?? 0) - (balance?.credit ?? 0);
    return { account, debit: net > 0 ? net : 0, credit: net < 0 ? -net : 0 };
  }).filter((row) => row.debit || row.credit);
  const debit = rows.reduce((sum, row) => sum + row.debit, 0);
  const credit = rows.reduce((sum, row) => sum + row.credit, 0);
  const balanced = Math.abs(debit - credit) < 0.01;
  return (
    <>
      <div className="row row--between row--wrap">
        <p className="card__hint">
          {tx(copy.reports.asOf)} {formatDate(TODAY, locale)}
        </p>
        <span className={`balance-chip ${balanced ? "balance-chip--ok" : "balance-chip--bad"}`}>
          {balanced ? tx(copy.common.balanced) : tx(copy.common.unbalanced)} · {sar(debit, 2)}
        </span>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>{tx(l.code)}</th>
              <th>{tx(l.name)}</th>
              <th className="num-col">{tx(copy.common.debit)}</th>
              <th className="num-col">{tx(copy.common.credit)}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.account.code} onClick={() => onDrill(row.account.code)} style={{ cursor: "pointer" }}>
                <td>
                  <b style={{ fontWeight: 550 }}>{row.account.code}</b>
                </td>
                <td data-label={tx(l.name)}>{accountName(row.account.code)}</td>
                <td className="num-col" data-label={tx(copy.common.debit)}>
                  <AmountCell value={row.debit} decimals={2} />
                </td>
                <td className="num-col" data-label={tx(copy.common.credit)}>
                  <AmountCell value={row.credit} decimals={2} />
                </td>
              </tr>
            ))}
            <tr className="row--total">
              <td>{num(rows.length)}</td>
              <td>{tx(l.totals)}</td>
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
    </>
  );
}

/* ---------- manual entry ---------- */
interface DraftLine {
  account: string;
  debit: string;
  credit: string;
}

function ManualEntryModal({ onClose, onPosted }: { onClose: () => void; onPosted: () => void }) {
  const { app, data, tx, num, sar, accountLabel, locale, copy } = useAcc();
  const l = copy.ledger;
  const [date, setDate] = useState(TODAY);
  const [branchId, setBranchId] = useState<RealBranch>(app.branchId === "all" ? "ghadeer" : app.branchId);
  const [memo, setMemo] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([
    { account: "", debit: "", credit: "" },
    { account: "", debit: "", credit: "" },
  ]);
  const [touched, setTouched] = useState(false);

  const parsed = lines.map((item) => ({ account: item.account, debit: Number(item.debit) || 0, credit: Number(item.credit) || 0 }));
  const totalDebit = round2(parsed.reduce((sum, item) => sum + item.debit, 0));
  const totalCredit = round2(parsed.reduce((sum, item) => sum + item.credit, 0));
  const difference = round2(totalDebit - totalCredit);
  const filled = parsed.filter((item) => item.account && (item.debit || item.credit));
  const balanced = totalDebit > 0 && difference === 0;
  const valid = Boolean(memo.trim()) && filled.length >= 2 && balanced && filled.length === parsed.filter((item) => item.account || item.debit || item.credit).length;

  const update = (index: number, patch: Partial<DraftLine>) =>
    setLines((current) =>
      current.map((item, position) => {
        if (position !== index) return item;
        const next = { ...item, ...patch };
        // A line is either a debit or a credit, never both.
        if (patch.debit) next.credit = "";
        if (patch.credit) next.debit = "";
        return next;
      }),
    );

  const submit = () => {
    setTouched(true);
    if (!valid) return;
    data.postManualEntry({ date, branchId, memo: memo.trim(), lines: filled });
    onPosted();
  };

  return (
    <Modal title={tx(l.entryTitle)} hint={tx(l.entryHint)} onClose={onClose} wide>
      <div className="form-grid">
        <Field label={tx(copy.common.date)}>
          <Input type="date" value={date} max={TODAY} onChange={(event) => setDate(event.target.value)} />
        </Field>
        <Field label={tx(copy.common.branch)}>
          <Select value={branchId} disabled={app.branchId !== "all"} onChange={(event) => setBranchId(event.target.value as RealBranch)}>
            {BRANCH_IDS.map((id) => (
              <option key={id} value={id}>
                {getBranchName(id, locale)}
              </option>
            ))}
          </Select>
        </Field>
        <Field className="full" label={tx(copy.common.memo)} error={touched && !memo.trim() ? tx(l.memoRequired) : undefined}>
          <Input value={memo} aria-invalid={touched && !memo.trim()} onChange={(event) => setMemo(event.target.value)} />
        </Field>
      </div>

      <div className="stack" style={{ gap: 8 }}>
        {lines.map((item, index) => (
          <div key={index} className="jline">
            <Select aria-label={tx(copy.common.account)} value={item.account} onChange={(event) => update(index, { account: event.target.value })}>
              <option value="">{tx(l.selectAccount)}</option>
              {POSTING_ACCOUNTS.map((account) => (
                <option key={account.code} value={account.code}>
                  {accountLabel(account.code)}
                </option>
              ))}
            </Select>
            <Input type="number" min={0} step="0.01" placeholder={tx(copy.common.debit)} aria-label={tx(copy.common.debit)} value={item.debit} onChange={(event) => update(index, { debit: event.target.value })} />
            <Input type="number" min={0} step="0.01" placeholder={tx(copy.common.credit)} aria-label={tx(copy.common.credit)} value={item.credit} onChange={(event) => update(index, { credit: event.target.value })} />
            <IconButton label={tx(l.removeLine)} size="sm" variant="soft" disabled={lines.length <= 2} onClick={() => setLines((current) => current.filter((_, position) => position !== index))}>
              <Trash2 />
            </IconButton>
          </div>
        ))}
        <div className="row row--between row--wrap">
          <Button size="sm" variant="soft" icon={<Plus />} onClick={() => setLines((current) => [...current, { account: "", debit: "", credit: "" }])}>
            {tx(l.addLine)}
          </Button>
          <span className={`balance-chip ${balanced ? "balance-chip--ok" : touched ? "balance-chip--bad" : ""}`}>
            {tx(copy.common.debit)} {sar(totalDebit, 2)} · {tx(copy.common.credit)} {sar(totalCredit, 2)}
            {!balanced ? ` · ${tx(l.difference)} ${num(Math.abs(difference))}` : ""}
          </span>
        </div>
        {touched && filled.length < 2 ? (
          <span className="field__error" role="alert">
            {tx(l.needTwoLines)}
          </span>
        ) : null}
      </div>

      <div className="row" style={{ justifyContent: "flex-end" }}>
        <Button variant="soft" onClick={onClose}>
          {tx(copy.common.cancel)}
        </Button>
        <Button variant="ink" arrow onClick={submit}>
          {tx(l.post)}
        </Button>
      </div>
    </Modal>
  );
}
