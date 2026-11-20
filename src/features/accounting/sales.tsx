"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, CircleDollarSign, FileText, Plus, ReceiptText } from "lucide-react";
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
  ZatcaBadge,
} from "@/features/accounting/shared";
import { getBranchName, getServiceName, getTherapistName } from "@/lib/clinic-utils";
import { formatDate } from "@/lib/dates";
import { BRANCH_IDS, TODAY, VAT_RATE, type PaymentMethod, type RealBranch } from "@/lib/mock/accounting-data";
import { CLINIC_SERVICES, CLINIC_THERAPISTS, SEED_PATIENTS } from "@/lib/mock/clinic-seed";
import { Avatar, Badge, Button, Card, CardHead, Empty, Field, Input, SearchBox, Select, StatCard, Tabs } from "@/ui";

type SalesTab = "invoices" | "receipts" | "orders";
type StatusFilter = "all" | "open" | "overdue" | "paid";
const PAGE_SIZE = 10;
const METHODS: PaymentMethod[] = ["card", "cash", "transfer", "insurance"];

export function SalesScreen() {
  const { app, data, tx, num, sar, locale, copy } = useAcc();
  const s = copy.sales;
  const scoped = useScoped();
  const [tab, setTab] = useState<SalesTab>("invoices");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const { show, toast } = useToast();

  const patientName = (id: string) => {
    const patient = SEED_PATIENTS.find((item) => item.id === id);
    return patient ? app.pick(patient.nameAr, patient.nameEn) : id;
  };

  const needle = (query || app.searchQuery).trim().toLocaleLowerCase();
  const invoices = useMemo(
    () =>
      scoped.invoices.filter((invoice) => {
        if (status === "paid" && !invoice.paidAt) return false;
        if (status === "open" && (invoice.paidAt || invoice.due < TODAY)) return false;
        if (status === "overdue" && (invoice.paidAt || invoice.due >= TODAY)) return false;
        if (!needle) return true;
        const patient = SEED_PATIENTS.find((item) => item.id === invoice.patientId);
        return `${invoice.id} ${patient?.nameAr ?? ""} ${patient?.nameEn ?? ""}`.toLocaleLowerCase().includes(needle);
      }),
    [scoped.invoices, status, needle],
  );
  const receipts = useMemo(
    () =>
      scoped.invoices
        .filter((invoice) => invoice.paidAt)
        .sort((a, b) => (b.paidAt ?? "").localeCompare(a.paidAt ?? "") || b.id.localeCompare(a.id)),
    [scoped.invoices],
  );
  const rows = tab === "invoices" ? invoices : receipts;
  useEffect(() => setPage(1), [tab, status, query, app.searchQuery, app.branchId]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const invoiced = scoped.invoices.reduce((sum, item) => sum + item.total, 0);
  const collected = scoped.invoices.filter((item) => item.paidAt).reduce((sum, item) => sum + item.total, 0);

  const exportCsv = () =>
    downloadCsv(
      "ehteraf-sales-invoices.csv",
      [tx(copy.common.reference), tx(copy.common.date), tx(copy.common.branch), tx(copy.common.customer), tx(copy.common.net), tx(copy.common.vat), tx(copy.common.total), tx(copy.common.status)],
      invoices.map((invoice) => [
        invoice.id,
        invoice.date,
        getBranchName(invoice.branchId, locale),
        patientName(invoice.patientId),
        invoice.net,
        invoice.vat,
        invoice.total,
        invoice.paidAt ? tx(copy.common.paid) : tx(copy.common.open),
      ]),
    );

  const receive = (id: string) => {
    data.recordReceipt(id);
    show(tx(s.receiptRecorded));
  };

  return (
    <AccountingPage
      title={s.title}
      subtitle={s.subtitle}
      actions={
        <>
          <ExportButton onClick={exportCsv} />
          <Button variant="ink" icon={<Plus />} onClick={() => setCreating(true)}>
            {tx(s.newInvoice)}
          </Button>
        </>
      }
    >
      <div className="bento">
        <StatCard className="span-4" tone="lime" label={tx(s.invoiced)} value={sar(invoiced)} hint={`${num(scoped.invoices.length)} ${tx(copy.reports.invoicesCount)}`} icon={<FileText />} />
        <StatCard className="span-4" tone="mint" label={tx(s.collected)} value={sar(collected)} icon={<BadgeCheck />} />
        <StatCard className="span-4" tone="peach" label={tx(s.outstanding)} value={sar(invoiced - collected)} icon={<CircleDollarSign />} />

        <Card className="span-12">
          <div className="toolbar">
            <Tabs
              filled
              value={tab}
              onChange={setTab}
              options={[
                { value: "invoices", label: tx(s.invoices) },
                { value: "receipts", label: tx(s.receipts) },
                { value: "orders", label: tx(s.orders) },
              ]}
            />
            {tab !== "orders" ? <SearchBox value={query} onChange={setQuery} placeholder={tx(copy.common.search)} /> : null}
            {tab === "invoices" ? (
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

          {tab === "orders" ? (
            <OrdersTable patientName={patientName} />
          ) : visible.length === 0 ? (
            <Empty icon={<ReceiptText />} title={tx(copy.common.noResults)} />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>{tx(copy.common.reference)}</th>
                    <th>{tx(copy.common.customer)}</th>
                    <th>{tx(copy.common.date)}</th>
                    <th className="num-col">{tx(copy.common.total)}</th>
                    {tab === "invoices" ? (
                      <>
                        <th>{tx(copy.common.status)}</th>
                        <th>{tx(s.zatcaStatus)}</th>
                      </>
                    ) : (
                      <>
                        <th>{tx(copy.common.method)}</th>
                        <th>{tx(copy.common.branch)}</th>
                      </>
                    )}
                    <th>
                      <span className="sr-only">{tx(copy.common.actions)}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((invoice) => (
                    <tr key={invoice.id}>
                      <td>
                        <div className="cell-main">
                          <Avatar name={patientName(invoice.patientId)} />
                          <div>
                            <b>{tab === "receipts" ? `${tx(s.receiptNo)} · ${invoice.id}` : invoice.id}</b>
                            <span>{getBranchName(invoice.branchId, locale)}</span>
                          </div>
                        </div>
                      </td>
                      <td data-label={tx(copy.common.customer)}>
                        {patientName(invoice.patientId)}
                        <span className="sub">
                          {getServiceName(invoice.serviceId, locale)} × {num(invoice.qty)} · {getTherapistName(invoice.therapistId, locale)}
                        </span>
                      </td>
                      <td data-label={tab === "receipts" ? tx(s.paidOn) : tx(copy.common.date)}>
                        {formatDate(tab === "receipts" ? (invoice.paidAt ?? invoice.date) : invoice.date, locale)}
                        {tab === "invoices" ? <span className="sub">{tx(copy.common.due)}: {formatDate(invoice.due, locale)}</span> : null}
                      </td>
                      <td className="num-col" data-label={tx(copy.common.total)}>
                        <AmountCell value={invoice.total} decimals={2} />
                        <span className="sub">
                          {tx(copy.common.vat)} {num(VAT_RATE * 100)}% · {sar(invoice.vat, 2)}
                        </span>
                      </td>
                      {tab === "invoices" ? (
                        <>
                          <td data-label={tx(copy.common.status)}>
                            <DocStatus paidAt={invoice.paidAt} due={invoice.due} />
                          </td>
                          <td data-label={tx(s.zatcaStatus)}>
                            <ZatcaBadge status={invoice.zatca} />
                          </td>
                        </>
                      ) : (
                        <>
                          <td data-label={tx(copy.common.method)}>{tx(copy.methods[invoice.method])}</td>
                          <td data-label={tx(copy.common.branch)}>{getBranchName(invoice.branchId, locale)}</td>
                        </>
                      )}
                      <td>
                        <div className="cell-actions">
                          {tab === "invoices" && !invoice.paidAt ? (
                            <Button size="sm" variant="ink" onClick={() => receive(invoice.id)}>
                              {tx(s.recordReceipt)}
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
          {tab !== "orders" ? <Pager page={current} pages={pages} onPage={setPage} total={rows.length} shown={visible.length} /> : null}
        </Card>
      </div>

      {creating ? (
        <NewInvoiceModal
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            setTab("invoices");
            setStatus("all");
            show(tx(s.invoiceCreated));
          }}
        />
      ) : null}
      {toast}
    </AccountingPage>
  );
}

function OrdersTable({ patientName }: { patientName: (id: string) => string }) {
  const { data, tx, num, sar, locale, copy } = useAcc();
  const s = copy.sales;
  const scoped = useScoped();
  const { show, toast } = useToast();
  if (scoped.orders.length === 0) return <Empty icon={<ReceiptText />} title={tx(s.noOrders)} />;
  return (
    <>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>{tx(copy.common.reference)}</th>
              <th>{tx(copy.common.customer)}</th>
              <th>{tx(copy.common.service)}</th>
              <th className="num-col">{tx(copy.common.net)}</th>
              <th>{tx(copy.common.status)}</th>
              <th>
                <span className="sr-only">{tx(copy.common.actions)}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {scoped.orders.map((order) => {
              const service = CLINIC_SERVICES.find((item) => item.id === order.serviceId);
              return (
                <tr key={order.id}>
                  <td>
                    <b style={{ fontWeight: 550 }}>{order.id}</b>
                    <span className="sub">
                      {formatDate(order.date, locale)} · {getBranchName(order.branchId, locale)}
                    </span>
                  </td>
                  <td data-label={tx(copy.common.customer)}>{patientName(order.patientId)}</td>
                  <td data-label={tx(copy.common.service)}>
                    {getServiceName(order.serviceId, locale)} × {num(order.qty)}
                  </td>
                  <td className="num-col" data-label={tx(copy.common.net)}>
                    <AmountCell value={(service?.price ?? 0) * order.qty} />
                  </td>
                  <td data-label={tx(copy.common.status)}>
                    <Badge tone={order.status === "open" ? "sky" : "mint"}>{order.status === "open" ? tx(copy.common.open) : tx(s.converted)}</Badge>
                  </td>
                  <td>
                    <div className="cell-actions">
                      {order.status === "open" ? (
                        <Button
                          size="sm"
                          variant="ink"
                          onClick={() => {
                            if (data.convertOrder(order.id)) show(tx(s.invoiceCreated));
                          }}
                        >
                          {tx(s.convert)}
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
        {tx(copy.common.total)}: {sar(scoped.orders.reduce((sum, order) => sum + (CLINIC_SERVICES.find((item) => item.id === order.serviceId)?.price ?? 0) * order.qty, 0))}
      </span>
      {toast}
    </>
  );
}

function NewInvoiceModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { app, data, tx, num, sar, locale, copy } = useAcc();
  const s = copy.sales;
  const initialBranch: RealBranch = app.branchId === "all" ? "ghadeer" : app.branchId;
  const [branchId, setBranchId] = useState<RealBranch>(initialBranch);
  const [patientId, setPatientId] = useState("");
  const [serviceId, setServiceId] = useState(CLINIC_SERVICES[0]?.id ?? "");
  const [therapistId, setTherapistId] = useState("");
  const [qty, setQty] = useState(8);
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [date, setDate] = useState(TODAY);
  const [touched, setTouched] = useState(false);

  const patients = SEED_PATIENTS.filter((item) => item.branchId === branchId && item.status === "active");
  const therapists = CLINIC_THERAPISTS.filter((item) => item.branchId === branchId);
  const service = CLINIC_SERVICES.find((item) => item.id === serviceId);
  const net = (service?.price ?? 0) * qty;
  const vat = net * VAT_RATE;
  const valid = Boolean(patientId && serviceId && therapistId && qty > 0 && date);

  const submit = () => {
    setTouched(true);
    if (!valid) return;
    if (data.createInvoice({ branchId, patientId, serviceId, therapistId, qty, method, date })) onCreated();
  };

  const required = locale === "ar" ? "هذا الحقل مطلوب." : "This field is required.";
  const err = (missing: boolean) => (touched && missing ? required : undefined);

  return (
    <Modal title={tx(s.newTitle)} hint={tx(s.newHint)} onClose={onClose} wide>
      <div className="form-grid">
        <Field label={tx(copy.common.branch)}>
          <Select
            value={branchId}
            disabled={app.branchId !== "all"}
            onChange={(event) => {
              setBranchId(event.target.value as RealBranch);
              setPatientId("");
              setTherapistId("");
            }}
          >
            {BRANCH_IDS.map((id) => (
              <option key={id} value={id}>
                {getBranchName(id, locale)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={tx(copy.common.customer)} error={err(!patientId)}>
          <Select value={patientId} aria-invalid={touched && !patientId} onChange={(event) => setPatientId(event.target.value)}>
            <option value="">—</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {app.pick(patient.nameAr, patient.nameEn)} · {patient.id}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={tx(copy.common.service)}>
          <Select value={serviceId} onChange={(event) => setServiceId(event.target.value)}>
            {CLINIC_SERVICES.map((item) => (
              <option key={item.id} value={item.id}>
                {app.pick(item.nameAr, item.nameEn)} · {sar(item.price)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={tx(copy.common.therapist)} error={err(!therapistId)}>
          <Select value={therapistId} aria-invalid={touched && !therapistId} onChange={(event) => setTherapistId(event.target.value)}>
            <option value="">—</option>
            {therapists.map((item) => (
              <option key={item.id} value={item.id}>
                {app.pick(item.nameAr, item.nameEn)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={tx(copy.common.quantity)}>
          <Input type="number" min={1} max={60} value={qty} onChange={(event) => setQty(Number(event.target.value))} />
        </Field>
        <Field label={tx(copy.common.method)}>
          <Select value={method} onChange={(event) => setMethod(event.target.value as PaymentMethod)}>
            {METHODS.map((item) => (
              <option key={item} value={item}>
                {tx(copy.methods[item])}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={tx(copy.common.date)}>
          <Input type="date" value={date} max={TODAY} onChange={(event) => setDate(event.target.value)} />
        </Field>
      </div>
      <Card tone="soft">
        <CardHead title={tx(s.summary)} hint={tx(copy.common.demoPrice)} />
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
