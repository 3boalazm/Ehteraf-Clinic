"use client";

import Link from "next/link";
import { ArrowUpRight, BadgeCheck, FileClock, FileWarning, Landmark, ReceiptText, ShoppingCart, TrendingUp, Wallet } from "lucide-react";
import { AccountingPage, AgingBar, AmountCell, useAcc, useScoped } from "@/features/accounting/shared";
import { getBranchName } from "@/lib/clinic-utils";
import { formatDate } from "@/lib/dates";
import { BRANCH_IDS, filterEntries, monthlyProfit, profitAndLoss, TODAY } from "@/lib/mock/accounting-data";
import { Badge, Bubble, Card, CardHead, IconButton, StatCard } from "@/ui";
import { PillBars } from "@/ui/charts";

export function AccountingOverview() {
  const { app, data, tx, num, sar, copy, locale, entryMemo } = useAcc();
  const scoped = useScoped();
  const o = copy.overview;
  const { pnl } = scoped;

  const months = monthlyProfit(scoped.entries);
  const lastMonth = months[months.length - 1];
  const cash = scoped.balanceOf("1100") + scoped.balanceOf("1120");
  const receivables = scoped.balanceOf("1200");
  const payables = scoped.balanceOf("2100");
  const vatNet = scoped.balanceOf("2300") - scoped.balanceOf("1400");
  const margin = pnl.revenue ? (pnl.net / pnl.revenue) * 100 : 0;

  const branchRows = (app.branchId === "all" ? BRANCH_IDS : [app.branchId]).map((id) => {
    const totals = profitAndLoss(filterEntries(data.entries, { branch: id }));
    return { id, ...totals, margin: totals.revenue ? (totals.net / totals.revenue) * 100 : 0 };
  });

  const overdue = scoped.invoices.filter((invoice) => !invoice.paidAt && invoice.due < TODAY).length;
  const rejected = scoped.invoices.filter((invoice) => invoice.zatca === "rejected").length;
  const openRequests = scoped.requests.filter((item) => item.status === "open").length;
  const openOrders = scoped.orders.filter((item) => item.status === "open").length;
  const attention = [
    { icon: <FileClock />, label: o.overdueInvoices, count: overdue, href: "/accounting/sales" },
    { icon: <FileWarning />, label: o.rejectedInvoices, count: rejected, href: "/accounting/tax" },
    { icon: <ShoppingCart />, label: o.openRequests, count: openRequests, href: "/accounting/purchases" },
    { icon: <ReceiptText />, label: o.openOrders, count: openOrders, href: "/accounting/sales" },
  ].filter((item) => item.count > 0);

  const recent = scoped.entries.slice(-6).reverse();

  return (
    <AccountingPage title={copy.title} subtitle={copy.subtitle}>
      <div className="bento">
        <StatCard
          className="span-3"
          tone="lime"
          label={tx(o.revenue)}
          value={sar(pnl.revenue)}
          hint={`${tx(copy.common.thisMonth)}: ${sar(lastMonth?.revenue ?? 0)}`}
          icon={<TrendingUp />}
        />
        <StatCard
          className="span-3"
          label={tx(o.expenses)}
          value={sar(pnl.expenses)}
          hint={`${tx(copy.common.thisMonth)}: ${sar(lastMonth?.expenses ?? 0)}`}
          icon={<Wallet />}
        />
        <StatCard
          className="span-3"
          tone="mint"
          label={tx(o.netProfit)}
          value={sar(pnl.net)}
          hint={`${tx(o.margin)}: ${num(margin)}%`}
          icon={<BadgeCheck />}
        />
        <StatCard
          className="span-3"
          tone="lilac"
          label={tx(o.cash)}
          value={sar(cash)}
          hint={`${tx(o.vatPayable)}: ${sar(vatNet)}`}
          icon={<Landmark />}
        />

        <Card className="span-7">
          <CardHead
            title={tx(o.trend)}
            hint={tx(o.trendHint)}
            actions={<Badge tone="outline" plain>{tx(copy.common.ytd)}</Badge>}
          />
          <PillBars
            hot={months.length - 1}
            data={months.map((item) => ({
              label: formatDate(`${item.month}-01`, locale, { month: "short" }),
              value: Math.round(item.revenue),
              inner: Math.round(item.expenses),
            }))}
          />
        </Card>

        <div className="span-5 stack" style={{ gap: 14 }}>
          <Card>
            <CardHead
              title={tx(o.arAging)}
              hint={`${tx(o.receivables)}: ${sar(receivables)}`}
              actions={
                <IconButton label={tx(copy.tabs.sales)} size="sm" variant="ink" href={app.href("/accounting/sales")}>
                  <ArrowUpRight className="flip" />
                </IconButton>
              }
            />
            <AgingBar totals={scoped.arAging} />
          </Card>
          <Card tone="sand">
            <CardHead
              title={tx(o.apAging)}
              hint={`${tx(o.payables)}: ${sar(payables)}`}
              actions={
                <IconButton label={tx(copy.tabs.purchases)} size="sm" variant="ink" href={app.href("/accounting/purchases")}>
                  <ArrowUpRight className="flip" />
                </IconButton>
              }
            />
            <AgingBar totals={scoped.apAging} />
          </Card>
        </div>

        <Card className="span-7">
          <CardHead title={tx(o.branches)} hint={tx(o.branchesHint)} />
          <div className="table-wrap">
            <table className="table table--compact">
              <thead>
                <tr>
                  <th>{tx(copy.common.branch)}</th>
                  <th className="num-col">{tx(o.revenue)}</th>
                  <th className="num-col">{tx(o.expenses)}</th>
                  <th className="num-col">{tx(o.netProfit)}</th>
                  <th className="num-col">{tx(o.margin)}</th>
                </tr>
              </thead>
              <tbody>
                {branchRows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <b style={{ fontWeight: 550 }}>{getBranchName(row.id, locale)}</b>
                    </td>
                    <td className="num-col" data-label={tx(o.revenue)}>
                      <AmountCell value={row.revenue} />
                    </td>
                    <td className="num-col" data-label={tx(o.expenses)}>
                      <AmountCell value={row.expenses} />
                    </td>
                    <td className="num-col" data-label={tx(o.netProfit)}>
                      <AmountCell value={row.net} signed />
                    </td>
                    <td className="num-col" data-label={tx(o.margin)}>
                      {num(row.margin)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

        <Card className="span-12">
          <CardHead
            title={tx(o.recent)}
            actions={
              <Link className="btn btn--sm btn--soft" href={app.href("/accounting/ledger")}>
                {tx(o.viewAll)}
              </Link>
            }
          />
          <div className="list">
            {recent.map((entry) => {
              const total = entry.lines.reduce((sum, item) => sum + item.debit, 0);
              return (
                <div key={entry.id} className="list__row">
                  <span className="list__time" style={{ minWidth: 70 }}>
                    {formatDate(entry.date, locale, { day: "numeric", month: "short" })}
                  </span>
                  <div className="list__main">
                    <b>{entryMemo(entry)}</b>
                    <span>
                      {entry.id} · {getBranchName(entry.branchId, locale)}
                    </span>
                  </div>
                  <Badge tone="outline" plain>
                    {tx(copy.entryKinds[entry.kind])}
                  </Badge>
                  <b className="amt">{sar(total)}</b>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </AccountingPage>
  );
}
