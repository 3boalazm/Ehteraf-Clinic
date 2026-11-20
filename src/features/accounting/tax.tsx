"use client";

import { useEffect, useState } from "react";
import { Percent, RefreshCw, ScrollText, ShieldCheck } from "lucide-react";
import { AccountingPage, AmountCell, downloadCsv, ExportButton, useAcc, useToast, ZatcaBadge } from "@/features/accounting/shared";
import { getBranchName } from "@/lib/clinic-utils";
import { formatDate } from "@/lib/dates";
import { ENTITIES, REPORT_MONTHS, type ZatcaStatus } from "@/lib/mock/accounting-data";
import { SEED_PATIENTS } from "@/lib/mock/clinic-seed";
import { Badge, Button, Card, CardHead, Empty, Notice, StatCard, Tabs } from "@/ui";

const STATUSES: ZatcaStatus[] = ["cleared", "reported", "pending", "rejected"];

export function TaxScreen() {
  const { app, data, tx, num, sar, locale, copy } = useAcc();
  const t = copy.tax;
  const { show, toast } = useToast();
  const entities = ENTITIES.filter((entity) => app.branchId === "all" || entity.branches.includes(app.branchId as never));
  const [entityId, setEntityId] = useState(entities[0]?.id ?? "le-1");
  useEffect(() => {
    if (!entities.some((entity) => entity.id === entityId)) setEntityId(entities[0]?.id ?? "le-1");
  }, [entities, entityId]);
  const entity = entities.find((item) => item.id === entityId) ?? entities[0];
  if (!entity) return null;

  const inEntity = <T extends { branchId: string }>(list: T[]) => list.filter((item) => (entity.branches as string[]).includes(item.branchId));
  const entries = inEntity(data.entries);
  const invoices = inEntity(data.invoices);
  const bills = inEntity(data.bills);

  const vatByMonth = REPORT_MONTHS.map((month) => {
    let output = 0;
    let input = 0;
    for (const entry of entries) {
      if (!entry.date.startsWith(month)) continue;
      for (const line of entry.lines) {
        if (line.account === "2300") output += line.credit - line.debit;
        if (line.account === "1400") input += line.debit - line.credit;
      }
    }
    return { month, output, input, net: output - input };
  });
  const output = vatByMonth.reduce((sum, row) => sum + row.output, 0);
  const input = vatByMonth.reduce((sum, row) => sum + row.input, 0);
  const taxableSales = invoices.reduce((sum, invoice) => sum + invoice.net, 0);
  const taxablePurchases = bills.reduce((sum, bill) => sum + bill.net, 0);

  const counts = STATUSES.map((status) => ({ status, count: invoices.filter((invoice) => invoice.zatca === status).length }));
  const maxCount = Math.max(1, ...counts.map((item) => item.count));
  const attention = invoices.filter((invoice) => invoice.zatca === "rejected" || invoice.zatca === "pending").slice(0, 8);

  const patientName = (id: string) => {
    const patient = SEED_PATIENTS.find((item) => item.id === id);
    return patient ? app.pick(patient.nameAr, patient.nameEn) : id;
  };

  const exportCsv = () =>
    downloadCsv(
      "ehteraf-vat-return.csv",
      [tx(copy.common.month), tx(t.output), tx(t.input), tx(t.net)],
      vatByMonth.map((row) => [row.month, row.output, row.input, row.net]),
    );

  return (
    <AccountingPage title={t.title} subtitle={t.subtitle} actions={<ExportButton onClick={exportCsv} />}>
      <div className="bento">
        <div className="span-12 row row--between row--wrap">
          {entities.length > 1 ? (
            <Tabs
              value={entity.id}
              onChange={setEntityId}
              label={tx(copy.common.legalEntity)}
              options={entities.map((item) => ({ value: item.id, label: app.pick(item.nameAr, item.nameEn) }))}
            />
          ) : (
            <Badge tone="outline" plain>
              {app.pick(entity.nameAr, entity.nameEn)}
            </Badge>
          )}
          <span className="t-small t-muted">
            {tx(t.branches)}: {entity.branches.map((id) => getBranchName(id, locale)).join(" · ")}
          </span>
        </div>

        <StatCard className="span-3" tone="lime" label={tx(t.output)} value={sar(output)} hint={`${tx(t.taxableSales)}: ${sar(taxableSales)}`} icon={<Percent />} />
        <StatCard className="span-3" label={tx(t.input)} value={sar(input)} hint={`${tx(t.taxablePurchases)}: ${sar(taxablePurchases)}`} icon={<Percent />} />
        <StatCard className="span-3" tone="lilac" label={tx(t.net)} value={sar(output - input)} icon={<ScrollText />} />
        <StatCard className="span-3" tone="mint" label={tx(t.einvoicing)} value={`${num((counts.filter((item) => item.status !== "rejected" && item.status !== "pending").reduce((sum, item) => sum + item.count, 0) / Math.max(1, invoices.length)) * 100)}%`} hint={`${num(invoices.length)} ${tx(copy.reports.invoicesCount)}`} icon={<ShieldCheck />} />

        <Card className="span-7">
          <CardHead title={tx(t.returnTitle)} hint={`${tx(t.returnHint)} · ${app.pick(entity.nameAr, entity.nameEn)}`} actions={<Button size="sm" variant="soft" disabled title={tx(t.filingDemo)}>{tx(t.filing)}</Button>} />
          <div className="table-wrap">
            <table className="table table--compact">
              <thead>
                <tr>
                  <th>{tx(copy.common.month)}</th>
                  <th className="num-col">{tx(t.output)}</th>
                  <th className="num-col">{tx(t.input)}</th>
                  <th className="num-col">{tx(t.net)}</th>
                </tr>
              </thead>
              <tbody>
                {vatByMonth.map((row) => (
                  <tr key={row.month}>
                    <td>
                      <b style={{ fontWeight: 550 }}>{formatDate(`${row.month}-01`, locale, { month: "long", year: "numeric" })}</b>
                    </td>
                    <td className="num-col" data-label={tx(t.output)}>
                      <AmountCell value={row.output} decimals={2} />
                    </td>
                    <td className="num-col" data-label={tx(t.input)}>
                      <AmountCell value={row.input} decimals={2} />
                    </td>
                    <td className="num-col" data-label={tx(t.net)}>
                      <AmountCell value={row.net} decimals={2} signed />
                    </td>
                  </tr>
                ))}
                <tr className="row--total">
                  <td>{tx(copy.common.total)}</td>
                  <td className="num-col" data-label={tx(t.output)}>
                    <AmountCell value={output} decimals={2} />
                  </td>
                  <td className="num-col" data-label={tx(t.input)}>
                    <AmountCell value={input} decimals={2} />
                  </td>
                  <td className="num-col" data-label={tx(t.net)}>
                    <AmountCell value={output - input} decimals={2} signed />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="span-5">
          <CardHead title={tx(t.einvoicing)} hint={tx(t.einvoicingHint)} />
          <div className="stack" style={{ gap: 14 }}>
            {counts.map((item) => (
              <div key={item.status} className="hbar">
                <span>{tx(copy.zatca[item.status])}</span>
                <div className="hbar__track">
                  <div className="hbar__fill" style={{ width: `${(item.count / maxCount) * 100}%` }} />
                </div>
                <b className="amt">{num(item.count)}</b>
              </div>
            ))}
          </div>
        </Card>

        <Card className="span-12" tone="soft">
          <CardHead title={`${tx(t.invoicesOf)} · ${tx(copy.zatca.rejected)} / ${tx(copy.zatca.pending)}`} />
          {attention.length === 0 ? (
            <Empty icon={<ShieldCheck />} title={tx(copy.overview.allClear)} />
          ) : (
            <div className="list">
              {attention.map((invoice) => (
                <div key={invoice.id} className="list__row">
                  <div className="list__main">
                    <b>{invoice.id}</b>
                    <span>
                      {patientName(invoice.patientId)} · {formatDate(invoice.date, locale)} · {sar(invoice.total, 2)}
                    </span>
                  </div>
                  <ZatcaBadge status={invoice.zatca} />
                  {invoice.zatca === "rejected" ? (
                    <Button
                      size="sm"
                      variant="ink"
                      icon={<RefreshCw />}
                      onClick={() => {
                        data.resubmitZatca(invoice.id);
                        show(tx(t.retried));
                      }}
                    >
                      {tx(t.retry)}
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
      <Notice icon={<ShieldCheck />}>{tx(t.entityNote)}</Notice>
      {toast}
    </AccountingPage>
  );
}
