"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, CircleDollarSign, FileText, Plus, ShoppingCart } from "lucide-react";
import {
  AccountingPage,
  AmountCell,
  DocStatus,
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
  BILL_CATEGORIES,
  BRANCH_IDS,
  CATEGORY_ACCOUNT,
  SUPPLIERS,
  TODAY,
  VAT_RATE,
  type BillCategory,
  type RealBranch,
} from "@/lib/mock/accounting-data";
import { Badge, Bubble, Button, Card, CardHead, Empty, Field, Input, SearchBox, Select, StatCard, Tabs } from "@/ui";

type PurchaseTab = "bills" | "payments" | "requests";
type StatusFilter = "all" | "open" | "overdue" | "paid";
const PAGE_SIZE = 10;

export function PurchasesScreen() {
  const { app, data, tx, num, sar, locale, copy } = useAcc();
  const p = copy.purchases;
  const scoped = useScoped();
  const [tab, setTab] = useState<PurchaseTab>("bills");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const { show, toast } = useToast();

  const supplierName = (id: string) => {
    const supplier = SUPPLIERS.find((item) => item.id === id);
    return supplier ? app.pick(supplier.nameAr, supplier.nameEn) : id;
  };

  const needle = (query || app.searchQuery).trim().toLocaleLowerCase();
  const bills = useMemo(
    () =>
      scoped.bills.filter((bill) => {
        if (status === "paid" && !bill.paidAt) return false;
        if (status === "open" && (bill.paidAt || bill.due < TODAY)) return false;
        if (status === "overdue" && (bill.paidAt || bill.due >= TODAY)) return false;
        if (!needle) return true;
        return `${bill.id} ${supplierName(bill.supplierId)}`.toLocaleLowerCase().includes(needle);
      }),
    // supplierName depends only on the locale, which is covered by `needle` re-renders via app.locale.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scoped.bills, status, needle, locale],
  );
  const payments = useMemo(
    () =>
      scoped.bills
        .filter((bill) => bill.paidAt)
        .sort((a, b) => (b.paidAt ?? "").localeCompare(a.paidAt ?? "") || b.id.localeCompare(a.id)),
    [scoped.bills],
  );
  const rows = tab === "bills" ? bills : payments;
  useEffect(() => setPage(1), [tab, status, query, app.searchQuery, app.branchId]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const billed = scoped.bills.reduce((sum, bill) => sum + bill.total, 0);
  const paid = scoped.bills.filter((bill) => bill.paidAt).reduce((sum, bill) => sum + bill.total, 0);

  const exportCsv = () =>
    downloadCsv(
      "ehteraf-supplier-invoices.csv",
      [tx(copy.common.reference), tx(copy.common.date), tx(copy.common.branch), tx(copy.common.supplier), tx(copy.common.category), tx(copy.common.net), tx(copy.common.vat), tx(copy.common.total), tx(copy.common.status)],
      bills.map((bill) => [
        bill.id,
        bill.date,
        getBranchName(bill.branchId, locale),
        supplierName(bill.supplierId),
        tx(copy.billCategories[bill.category]),
        bill.net,
        bill.vat,
        bill.total,
        bill.paidAt ? tx(copy.common.paid) : tx(copy.common.open),
      ]),
    );

  return (
    <AccountingPage
      title={p.title}
      subtitle={p.subtitle}
      actions={
        <>
          <ExportButton onClick={exportCsv} />
          <Button variant="ink" icon={<Plus />} onClick={() => setCreating(true)}>
            {tx(p.newBill)}
          </Button>
        </>
      }
    >
      <div className="bento">
        <StatCard className="span-4" tone="sand" label={tx(p.billed)} value={sar(billed)} hint={`${num(scoped.bills.length)} ${tx(copy.reports.invoicesCount)}`} icon={<FileText />} />
        <StatCard className="span-4" tone="mint" label={tx(p.paidTotal)} value={sar(paid)} icon={<BadgeCheck />} />
        <StatCard className="span-4" tone="peach" label={tx(p.payable)} value={sar(billed - paid)} icon={<CircleDollarSign />} />

        <Card className="span-12">
          <div className="toolbar">
            <Tabs
              filled
              value={tab}
              onChange={setTab}
              options={[
                { value: "bills", label: tx(p.bills) },
                { value: "payments", label: tx(p.payments) },
                { value: "requests", label: tx(p.requests) },
              ]}
            />
            {tab !== "requests" ? <SearchBox value={query} onChange={setQuery} placeholder={tx(copy.common.search)} /> : null}
            {tab === "bills" ? (
              <div className="toolbar__end">
                <Tabs
                  value={status}
                  onChange={setStatus}
                  options={[
                    { value: "all", label: tx(copy.common.all) },
                    { value: "open", label: tx(copy.common.open) },
                    { value: "overdue", label: tx(copy.common.overdue) },
                    { value: "paid", label: tx(copy.common.paid) },
                  ]}
                />
              </div>
            ) : null}
          </div>

          {tab === "requests" ? (
            <RequestsTable supplierName={supplierName} onConverted={() => show(tx(p.billCreated))} />
          ) : visible.length === 0 ? (
            <Empty icon={<ShoppingCart />} title={tx(copy.common.noResults)} />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>{tx(copy.common.supplier)}</th>
                    <th>{tx(copy.common.category)}</th>
                    <th>{tx(copy.common.date)}</th>
                    <th className="num-col">{tx(copy.common.total)}</th>
                    <th>{tab === "bills" ? tx(copy.common.status) : tx(copy.common.branch)}</th>
                    <th>
                      <span className="sr-only">{tx(copy.common.actions)}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((bill) => (
                    <tr key={bill.id}>
                      <td>
                        <div className="cell-main">
                          <Bubble>
                            <ShoppingCart />
                          </Bubble>
                          <div>
                            <b>{supplierName(bill.supplierId)}</b>
                            <span>{tab === "payments" ? `${tx(copy.sales.receiptNo)} · ${bill.id}` : bill.id}</span>
                          </div>
                        </div>
                      </td>
                      <td data-label={tx(copy.common.category)}>
                        {tx(copy.billCategories[bill.category])}
                        <span className="sub">{bill.branchId && getBranchName(bill.branchId, locale)}</span>
                      </td>
                      <td data-label={tx(copy.common.date)}>
                        {formatDate(tab === "payments" ? (bill.paidAt ?? bill.date) : bill.date, locale)}
                        {tab === "bills" ? <span className="sub">{tx(copy.common.due)}: {formatDate(bill.due, locale)}</span> : null}
                      </td>
                      <td className="num-col" data-label={tx(copy.common.total)}>
                        <AmountCell value={bill.total} decimals={2} />
                        <span className="sub">
                          {tx(copy.common.vat)} {num(VAT_RATE * 100)}% · {sar(bill.vat, 2)}
                        </span>
                      </td>
                      <td data-label={tab === "bills" ? tx(copy.common.status) : tx(copy.common.branch)}>
                        {tab === "bills" ? <DocStatus paidAt={bill.paidAt} due={bill.due} /> : getBranchName(bill.branchId, locale)}
                      </td>
                      <td>
                        <div className="cell-actions">
                          {tab === "bills" && !bill.paidAt ? (
                            <Button
                              size="sm"
                              variant="ink"
                              onClick={() => {
                                data.recordPayment(bill.id);
                                show(tx(p.paymentRecorded));
                              }}
                            >
                              {tx(p.recordPayment)}
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {tab !== "requests" ? <Pager page={current} pages={pages} onPage={setPage} total={rows.length} shown={visible.length} /> : null}
        </Card>
      </div>

      {creating ? (
        <NewBillModal
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            setTab("bills");
            setStatus("all");
            show(tx(p.billCreated));
          }}
        />
      ) : null}
      {toast}
    </AccountingPage>
  );
}

function RequestsTable({ supplierName, onConverted }: { supplierName: (id: string) => string; onConverted: () => void }) {
  const { data, tx, sar, locale, copy } = useAcc();
  const p = copy.purchases;
  const scoped = useScoped();
  if (scoped.requests.length === 0) return <Empty icon={<ShoppingCart />} title={tx(p.noRequests)} />;
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>{tx(copy.common.reference)}</th>
            <th>{tx(copy.common.supplier)}</th>
            <th>{tx(p.requestedBy)}</th>
            <th className="num-col">{tx(p.estimated)}</th>
            <th>{tx(copy.common.status)}</th>
            <th>
              <span className="sr-only">{tx(copy.common.actions)}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {scoped.requests.map((request) => (
            <tr key={request.id}>
              <td>
                <b style={{ fontWeight: 550 }}>{request.id}</b>
                <span className="sub">
                  {formatDate(request.date, locale)} · {getBranchName(request.branchId, locale)}
                </span>
              </td>
              <td data-label={tx(copy.common.supplier)}>
                {supplierName(request.supplierId)}
                <span className="sub">{tx(copy.billCategories[request.category])}</span>
              </td>
              <td data-label={tx(p.requestedBy)}>{tx(p[request.requestedBy])}</td>
              <td className="num-col" data-label={tx(p.estimated)}>
                <AmountCell value={request.net} />
                <span className="sub">{sar(request.net * (1 + VAT_RATE))}</span>
              </td>
              <td data-label={tx(copy.common.status)}>
                <Badge tone={request.status === "open" ? "sky" : "mint"}>{request.status === "open" ? tx(copy.common.open) : tx(copy.sales.converted)}</Badge>
              </td>
              <td>
                <div className="cell-actions">
                  {request.status === "open" ? (
                    <Button
                      size="sm"
                      variant="ink"
                      onClick={() => {
                        if (data.convertRequest(request.id)) onConverted();
                      }}
                    >
                      {tx(p.convert)}
                    </Button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NewBillModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { app, data, tx, num, sar, locale, copy } = useAcc();
  const p = copy.purchases;
  const [branchId, setBranchId] = useState<RealBranch>(app.branchId === "all" ? "ghadeer" : app.branchId);
  const [category, setCategory] = useState<BillCategory>("supplies");
  const [supplierId, setSupplierId] = useState("sup-supplies");
  const [net, setNet] = useState(2500);
  const [date, setDate] = useState(TODAY);
  const [touched, setTouched] = useState(false);

  const vat = net * VAT_RATE;
  const valid = net > 0 && Boolean(date);
  const target = ACCOUNT_BY_CODE[CATEGORY_ACCOUNT[category]];
  const required = locale === "ar" ? "أدخل مبلغًا أكبر من صفر." : "Enter an amount above zero.";

  const submit = () => {
    setTouched(true);
    if (!valid) return;
    data.createBill({ branchId, supplierId, category, net, date });
    onCreated();
  };

  return (
    <Modal title={tx(p.newTitle)} hint={tx(p.newHint)} onClose={onClose} wide>
      <div className="form-grid">
        <Field label={tx(copy.common.branch)}>
          <Select value={branchId} disabled={app.branchId !== "all"} onChange={(event) => setBranchId(event.target.value as RealBranch)}>
            {BRANCH_IDS.map((id) => (
              <option key={id} value={id}>
                {getBranchName(id, locale)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={tx(copy.common.category)}>
          <Select value={category} onChange={(event) => setCategory(event.target.value as BillCategory)}>
            {BILL_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {tx(copy.billCategories[item])}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={tx(copy.common.supplier)}>
          <Select value={supplierId} onChange={(event) => setSupplierId(event.target.value)}>
            {SUPPLIERS.map((item) => (
              <option key={item.id} value={item.id}>
                {app.pick(item.nameAr, item.nameEn)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={tx(copy.common.date)}>
          <Input type="date" value={date} max={TODAY} onChange={(event) => setDate(event.target.value)} />
        </Field>
        <Field className="full" label={`${tx(copy.common.net)} (${locale === "ar" ? "ر.س" : "SAR"})`} error={touched && !valid ? required : undefined}>
          <Input type="number" min={1} step="0.01" value={net} aria-invalid={touched && !valid} onChange={(event) => setNet(Number(event.target.value))} />
        </Field>
      </div>
      <Card tone="soft">
        <CardHead title={tx(p.billed)} hint={target ? `${target.code} · ${locale === "ar" ? target.nameAr : target.nameEn}` : undefined} />
        <div className="kv">
          <div>
            <b>{sar(net, 2)}</b>
            <span>{tx(copy.common.net)}</span>
          </div>
          <div>
            <b>{sar(vat, 2)}</b>
            <span>
              {tx(copy.common.vat)} {num(VAT_RATE * 100)}%
            </span>
          </div>
          <div>
            <b>{sar(net + vat, 2)}</b>
            <span>{tx(copy.common.total)}</span>
          </div>
        </div>
      </Card>
      <div className="row" style={{ justifyContent: "flex-end" }}>
        <Button variant="soft" onClick={onClose}>
          {tx(copy.common.cancel)}
        </Button>
        <Button variant="ink" arrow onClick={submit}>
          {tx(copy.common.create)}
        </Button>
      </div>
    </Modal>
  );
}
