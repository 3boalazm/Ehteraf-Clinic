"use client";

import { Banknote, CalendarCheck2, Check, Landmark, Wallet } from "lucide-react";
import { AccountingPage, AmountCell, downloadCsv, ExportButton, useAcc, useScoped, useToast } from "@/features/accounting/shared";
import { getBranchName } from "@/lib/clinic-utils";
import { addDays, formatDate } from "@/lib/dates";
import {
  accumulatedDepreciation,
  BRANCH_IDS,
  FIXED_ASSETS,
  filterEntries,
  monthlyDepreciation,
  naturalBalance,
  balancesByAccount,
  ACCOUNT_BY_CODE,
  REPORT_MONTHS,
  TODAY,
  type RealBranch,
} from "@/lib/mock/accounting-data";
import { Badge, Bubble, Button, Card, CardHead, StatCard } from "@/ui";
import { PillBars } from "@/ui/charts";

/* ==========================================================================
   Cash & bank
   ========================================================================== */
export function CashScreen() {
  const { app, data, tx, num, sar, locale, copy } = useAcc();
  const c = copy.cash;
  const scoped = useScoped();
  const { show, toast } = useToast();

  const cashTotal = scoped.balanceOf("1100");
  const bankTotal = scoped.balanceOf("1120");

  const branches = (app.branchId === "all" ? BRANCH_IDS : [app.branchId]) as RealBranch[];
  const perBranch = branches.map((id) => {
    const balances = balancesByAccount(filterEntries(data.entries, { branch: id }));
    return {
      id,
      cash: naturalBalance(ACCOUNT_BY_CODE["1100"]!, balances["1100"]),
      bank: naturalBalance(ACCOUNT_BY_CODE["1120"]!, balances["1120"]),
    };
  });

  // Daily close: expected cash = cash receipts of the day, per branch (last 7 days).
  const days = Array.from({ length: 7 }, (_, index) => addDays(TODAY, -index));
  const closeRows = days.flatMap((day) =>
    branches.map((id) => {
      const expected = data.invoices
        .filter((invoice) => invoice.branchId === id && invoice.method === "cash" && invoice.paidAt === day)
        .reduce((sum, invoice) => sum + invoice.total, 0);
      const key = `${id}:${day}`;
      const isClosed = data.closedDays.includes(key) || day < TODAY;
      // Demo variance: a few riyals either way on some closed days.
      const variance = isClosed && expected > 0 ? ((day.charCodeAt(9) + id.length) % 5 === 0 ? -5 : 0) : 0;
      return { key, day, id, expected, counted: isClosed ? expected + variance : 0, isClosed };
    }),
  );

  const flow = REPORT_MONTHS.map((month) => {
    const lines = filterEntries(data.entries, { branch: app.branchId, from: `${month}-01`, to: `${month}-31` }).flatMap((entry) => entry.lines);
    const inflow = lines.filter((line) => (line.account === "1100" || line.account === "1120") && line.debit > 0).reduce((sum, line) => sum + line.debit, 0);
    const outflow = lines.filter((line) => (line.account === "1100" || line.account === "1120") && line.credit > 0).reduce((sum, line) => sum + line.credit, 0);
    return { month, inflow, outflow };
  });

  const exportCsv = () =>
    downloadCsv(
      "ehteraf-cash-close.csv",
      [tx(copy.common.date), tx(copy.common.branch), tx(c.expected), tx(c.counted), tx(c.difference)],
      closeRows.filter((row) => row.expected > 0).map((row) => [row.day, getBranchName(row.id, locale), row.expected, row.counted, row.counted - row.expected]),
    );

  return (
    <AccountingPage title={c.title} subtitle={c.subtitle} actions={<ExportButton onClick={exportCsv} />}>
      <div className="bento">
        <StatCard className="span-4" tone="lime" label={tx(c.cashOnHand)} value={sar(cashTotal)} icon={<Banknote />} />
        <StatCard className="span-4" tone="sky" label={tx(c.bank)} value={sar(bankTotal)} icon={<Landmark />} />
        <StatCard className="span-4" tone="lilac" label={tx(c.totalLiquidity)} value={sar(cashTotal + bankTotal)} icon={<Wallet />} />

        <Card className="span-7">
          <CardHead title={tx(c.movements)} hint={`${tx(c.inflow)} / ${tx(c.outflow)}`} />
          <PillBars
            hot={flow.length - 1}
            data={flow.map((item) => ({
              label: formatDate(`${item.month}-01`, locale, { month: "short" }),
              value: Math.round(item.inflow),
              inner: Math.round(item.outflow),
            }))}
          />
        </Card>

        <Card className="span-5">
          <CardHead title={tx(c.perBranch)} />
          <div className="stack" style={{ gap: 10 }}>
            {perBranch.map((row) => (
              <div key={row.id} className="pill-row" style={{ flexWrap: "wrap" }}>
                <Bubble>
                  <Landmark />
                </Bubble>
                <div className="grow">
                  <b style={{ fontWeight: 550 }}>{getBranchName(row.id, locale)}</b>
                  <div className="t-small t-muted">
                    {tx(c.cashOnHand)}: {sar(row.cash)} · {tx(c.bank)}: {sar(row.bank)}
                  </div>
                </div>
                <b className="amt">{sar(row.cash + row.bank)}</b>
              </div>
            ))}
          </div>
        </Card>

        <Card className="span-12">
          <CardHead title={tx(c.dailyClose)} hint={tx(c.dailyHint)} />
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>{tx(copy.common.date)}</th>
                  <th>{tx(copy.common.branch)}</th>
                  <th className="num-col">{tx(c.expected)}</th>
                  <th className="num-col">{tx(c.counted)}</th>
                  <th className="num-col">{tx(c.difference)}</th>
                  <th>{tx(copy.common.status)}</th>
                  <th>
                    <span className="sr-only">{tx(copy.common.actions)}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {closeRows
                  .filter((row) => row.expected > 0 || row.day === TODAY)
                  .map((row) => {
                    const diff = row.counted - row.expected;
                    return (
                      <tr key={row.key}>
                        <td>
                          <b style={{ fontWeight: 550 }}>{formatDate(row.day, locale, { weekday: "short", day: "numeric", month: "short" })}</b>
                        </td>
                        <td data-label={tx(copy.common.branch)}>{getBranchName(row.id, locale)}</td>
                        <td className="num-col" data-label={tx(c.expected)}>
                          <AmountCell value={row.expected} decimals={2} />
                        </td>
                        <td className="num-col" data-label={tx(c.counted)}>
                          <AmountCell value={row.counted} decimals={2} />
                        </td>
                        <td className="num-col" data-label={tx(c.difference)}>
                          <AmountCell value={row.isClosed ? diff : 0} decimals={2} signed />
                        </td>
                        <td data-label={tx(copy.common.status)}>
                          <Badge tone={row.isClosed ? "mint" : "sand"}>{row.isClosed ? tx(c.closed) : tx(c.pendingClose)}</Badge>
                        </td>
                        <td>
                          <div className="cell-actions">
                            {!row.isClosed ? (
                              <Button
                                size="sm"
                                variant="ink"
                                icon={<Check />}
                                onClick={() => {
                                  data.closeDay(row.key);
                                  show(tx(c.dayClosed));
                                }}
                              >
                                {tx(c.closeDay)}
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
          <span className="t-small t-muted">
            <CalendarCheck2 size={14} style={{ verticalAlign: "-2px" }} /> {num(closeRows.filter((row) => row.isClosed && row.expected > 0).length)} {tx(c.closed)}
          </span>
        </Card>
      </div>
      {toast}
    </AccountingPage>
  );
}

/* ==========================================================================
   Fixed assets
   ========================================================================== */
export function AssetsScreen() {
  const { app, tx, num, sar, locale, copy } = useAcc();
  const a = copy.assets;
  const assets = FIXED_ASSETS.filter((asset) => app.branchId === "all" || asset.branchId === app.branchId);
  const rows = assets.map((asset) => {
    const accumulated = accumulatedDepreciation(asset, TODAY);
    return { asset, accumulated, nbv: asset.cost - accumulated };
  });
  const cost = rows.reduce((sum, row) => sum + row.asset.cost, 0);
  const accumulated = rows.reduce((sum, row) => sum + row.accumulated, 0);
  const monthly = assets.reduce((sum, asset) => sum + monthlyDepreciation(asset), 0);

  const schedule = REPORT_MONTHS.map((month) => ({
    label: formatDate(`${month}-01`, locale, { month: "short" }),
    value: Math.round(monthly),
  }));

  const exportCsv = () =>
    downloadCsv(
      "ehteraf-fixed-assets.csv",
      [tx(a.asset), tx(copy.common.branch), tx(a.class), tx(a.acquired), tx(a.cost), tx(a.accumulated), tx(a.nbv)],
      rows.map((row) => [
        app.pick(row.asset.nameAr, row.asset.nameEn),
        getBranchName(row.asset.branchId, locale),
        tx(a.classes[row.asset.account]),
        row.asset.acquired,
        row.asset.cost,
        row.accumulated,
        row.nbv,
      ]),
    );

  return (
    <AccountingPage title={a.title} subtitle={a.subtitle} actions={<ExportButton onClick={exportCsv} />}>
      <div className="bento">
        <StatCard className="span-3" tone="lime" label={tx(a.cost)} value={sar(cost)} hint={`${num(assets.length)} ${tx(a.asset)}`} />
        <StatCard className="span-3" label={tx(a.accumulated)} value={sar(accumulated)} />
        <StatCard className="span-3" tone="mint" label={tx(a.nbv)} value={sar(cost - accumulated)} />
        <StatCard className="span-3" tone="lilac" label={tx(a.monthly)} value={sar(monthly)} />

        <Card className="span-8">
          <CardHead title={tx(copy.tabs.assets)} hint={tx(a.lateNote)} />
          <div className="table-wrap">
            <table className="table table--compact">
              <thead>
                <tr>
                  <th>{tx(a.asset)}</th>
                  <th>{tx(a.acquired)}</th>
                  <th className="num-col">{tx(a.cost)}</th>
                  <th className="num-col">{tx(a.accumulated)}</th>
                  <th className="num-col">{tx(a.nbv)}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ asset, accumulated: acc, nbv }) => (
                  <tr key={asset.id}>
                    <td>
                      <b style={{ fontWeight: 550 }}>{app.pick(asset.nameAr, asset.nameEn)}</b>
                      <span className="sub">
                        {asset.id} · {getBranchName(asset.branchId, locale)} · {tx(a.classes[asset.account])}
                      </span>
                    </td>
                    <td data-label={tx(a.acquired)}>
                      {formatDate(asset.acquired, locale, { month: "short", year: "numeric" })}
                      <span className="sub">
                        {num(asset.lifeYears)} {tx(a.life)}
                      </span>
                    </td>
                    <td className="num-col" data-label={tx(a.cost)}>
                      <AmountCell value={asset.cost} />
                    </td>
                    <td className="num-col" data-label={tx(a.accumulated)}>
                      <AmountCell value={acc} />
                    </td>
                    <td className="num-col" data-label={tx(a.nbv)}>
                      <AmountCell value={nbv} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="span-4">
          <CardHead title={tx(a.schedule)} hint={tx(a.scheduleHint)} />
          <PillBars hot={schedule.length - 1} data={schedule} />
        </Card>
      </div>
    </AccountingPage>
  );
}
