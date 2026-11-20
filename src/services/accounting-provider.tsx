"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  BILL_CATEGORIES,
  buildEntries,
  CATEGORY_ACCOUNT,
  createAccountingSeed,
  round2,
  TODAY,
  VAT_RATE,
  type AccountingSeed,
  type BillCategory,
  type JournalEntry,
  type JournalLine,
  type PaymentMethod,
  type PurchaseBill,
  type RealBranch,
  type SalesInvoice,
  type ZatcaStatus,
} from "@/lib/mock/accounting-data";
import { addDays } from "@/lib/dates";
import { CLINIC_SERVICES, CLINIC_THERAPISTS } from "@/lib/mock/clinic-seed";

const STORAGE_KEY = "ehteraf:accounting:v1";

export interface NewInvoiceInput {
  branchId: RealBranch;
  patientId: string;
  serviceId: string;
  therapistId: string;
  qty: number;
  method: PaymentMethod;
  date: string;
}

export interface NewBillInput {
  branchId: RealBranch;
  supplierId: string;
  category: BillCategory;
  net: number;
  date: string;
}

export interface NewManualEntryInput {
  date: string;
  branchId: RealBranch;
  memo: string;
  lines: JournalLine[];
}

interface AccountingValue extends AccountingSeed {
  entries: JournalEntry[];
  hydrated: boolean;
  createInvoice: (input: NewInvoiceInput) => SalesInvoice | null;
  recordReceipt: (invoiceId: string, method?: PaymentMethod) => void;
  createBill: (input: NewBillInput) => PurchaseBill;
  recordPayment: (billId: string) => void;
  convertOrder: (orderId: string) => SalesInvoice | null;
  convertRequest: (requestId: string) => PurchaseBill | null;
  postManualEntry: (input: NewManualEntryInput) => JournalEntry;
  resubmitZatca: (invoiceId: string) => void;
  closedDays: string[];
  closeDay: (key: string) => void;
  resetAccounting: () => void;
}

const AccountingContext = createContext<AccountingValue | null>(null);

const BRANCH_CODE: Record<RealBranch, string> = { ghadeer: "GH", darAlbaida: "DB", quwayiyah: "QW" };

export function AccountingProvider({ children }: { children: ReactNode }) {
  const [seed, setSeed] = useState<AccountingSeed>(() => createAccountingSeed());
  const [closedDays, setClosedDays] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AccountingSeed> & { closedDays?: string[] };
        if (
          Array.isArray(parsed.invoices) &&
          Array.isArray(parsed.bills) &&
          Array.isArray(parsed.orders) &&
          Array.isArray(parsed.requests) &&
          Array.isArray(parsed.manual)
        ) {
          setSeed({
            invoices: parsed.invoices,
            bills: parsed.bills,
            orders: parsed.orders,
            requests: parsed.requests,
            manual: parsed.manual,
          });
          setClosedDays(Array.isArray(parsed.closedDays) ? parsed.closedDays : []);
        }
      }
    } catch {
      // Falls back to the generated demo ledger when storage is unavailable or malformed.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...seed, closedDays }));
    } catch {
      // Session state keeps working without storage.
    }
  }, [seed, closedDays, hydrated]);

  const entries = useMemo(() => buildEntries(seed), [seed]);

  const nextSerial = (prefix: string, ids: string[]) => {
    const max = ids
      .filter((id) => id.startsWith(prefix))
      .reduce((highest, id) => Math.max(highest, Number(id.replace(/\D/g, "").slice(-4)) || 0), 0);
    return `${prefix}${String(max + 1).padStart(4, "0")}`;
  };

  const buildInvoice = useCallback(
    (input: NewInvoiceInput, ids: string[]): SalesInvoice | null => {
      const service = CLINIC_SERVICES.find((item) => item.id === input.serviceId);
      if (!service || input.qty <= 0) return null;
      const net = service.price * input.qty;
      const vat = round2(net * VAT_RATE);
      return {
        id: nextSerial(`INV-${BRANCH_CODE[input.branchId]}-`, ids),
        date: input.date,
        due: addDays(input.date, 14),
        branchId: input.branchId,
        patientId: input.patientId,
        serviceId: input.serviceId,
        therapistId: input.therapistId,
        qty: input.qty,
        unitPrice: service.price,
        net,
        vat,
        total: round2(net + vat),
        method: input.method,
        paidAt: null,
        zatca: input.date >= addDays(TODAY, -1) ? "pending" : "reported",
      };
    },
    [],
  );

  const createInvoice = useCallback(
    (input: NewInvoiceInput) => {
      const invoice = buildInvoice(
        input,
        seed.invoices.map((item) => item.id),
      );
      if (!invoice) return null;
      setSeed((current) => ({ ...current, invoices: [invoice, ...current.invoices] }));
      return invoice;
    },
    [buildInvoice, seed.invoices],
  );

  const recordReceipt = useCallback((invoiceId: string, method?: PaymentMethod) => {
    setSeed((current) => ({
      ...current,
      invoices: current.invoices.map((invoice) =>
        invoice.id === invoiceId && !invoice.paidAt
          ? { ...invoice, paidAt: TODAY, method: method ?? invoice.method }
          : invoice,
      ),
    }));
  }, []);

  const buildBill = useCallback((input: NewBillInput, ids: string[]): PurchaseBill => {
    const vat = round2(input.net * VAT_RATE);
    return {
      id: nextSerial(`BILL-${BRANCH_CODE[input.branchId]}-`, ids),
      date: input.date,
      due: addDays(input.date, 30),
      branchId: input.branchId,
      supplierId: input.supplierId,
      category: input.category,
      net: input.net,
      vat,
      total: round2(input.net + vat),
      paidAt: null,
    };
  }, []);

  const createBill = useCallback(
    (input: NewBillInput) => {
      const bill = buildBill(
        input,
        seed.bills.map((item) => item.id),
      );
      setSeed((current) => ({ ...current, bills: [bill, ...current.bills] }));
      return bill;
    },
    [buildBill, seed.bills],
  );

  const recordPayment = useCallback((billId: string) => {
    setSeed((current) => ({
      ...current,
      bills: current.bills.map((bill) =>
        bill.id === billId && !bill.paidAt ? { ...bill, paidAt: TODAY } : bill,
      ),
    }));
  }, []);

  const convertOrder = useCallback(
    (orderId: string) => {
      const order = seed.orders.find((item) => item.id === orderId);
      if (!order || order.status === "converted") return null;
      const service = CLINIC_SERVICES.find((item) => item.id === order.serviceId);
      const invoice = buildInvoice(
        {
          branchId: order.branchId,
          patientId: order.patientId,
          serviceId: order.serviceId,
          therapistId: CLINIC_THERAPISTS.find((item) => item.branchId === order.branchId)?.id ?? "",
          qty: order.qty,
          method: "card",
          date: TODAY,
        },
        seed.invoices.map((item) => item.id),
      );
      if (!invoice || !service) return null;
      setSeed((current) => ({
        ...current,
        invoices: [invoice, ...current.invoices],
        orders: current.orders.map((item) =>
          item.id === orderId ? { ...item, status: "converted" as const } : item,
        ),
      }));
      return invoice;
    },
    [buildInvoice, seed.invoices, seed.orders],
  );

  const convertRequest = useCallback(
    (requestId: string) => {
      const request = seed.requests.find((item) => item.id === requestId);
      if (!request || request.status === "converted") return null;
      const bill = buildBill(
        {
          branchId: request.branchId,
          supplierId: request.supplierId,
          category: request.category,
          net: request.net,
          date: TODAY,
        },
        seed.bills.map((item) => item.id),
      );
      setSeed((current) => ({
        ...current,
        bills: [bill, ...current.bills],
        requests: current.requests.map((item) =>
          item.id === requestId ? { ...item, status: "converted" as const } : item,
        ),
      }));
      return bill;
    },
    [buildBill, seed.bills, seed.requests],
  );

  const postManualEntry = useCallback(
    (input: NewManualEntryInput) => {
      const highest = seed.manual.reduce(
        (max, entry) => Math.max(max, Number(entry.id.replace(/\D/g, "")) || 0),
        0,
      );
      const entry: JournalEntry = {
        id: `MJ-${String(highest + 1).padStart(5, "0")}`,
        date: input.date,
        branchId: input.branchId,
        kind: "manual",
        memoAr: input.memo,
        memoEn: input.memo,
        source: "manual",
        lines: input.lines.map((item) => ({
          account: item.account,
          debit: round2(item.debit),
          credit: round2(item.credit),
        })),
      };
      setSeed((current) => ({ ...current, manual: [...current.manual, entry] }));
      return entry;
    },
    [seed.manual],
  );

  const resubmitZatca = useCallback((invoiceId: string) => {
    setSeed((current) => ({
      ...current,
      invoices: current.invoices.map((invoice) =>
        invoice.id === invoiceId ? { ...invoice, zatca: "pending" as ZatcaStatus } : invoice,
      ),
    }));
  }, []);

  const closeDay = useCallback((key: string) => {
    setClosedDays((current) => (current.includes(key) ? current : [...current, key]));
  }, []);

  const resetAccounting = useCallback(() => {
    setSeed(createAccountingSeed());
    setClosedDays([]);
  }, []);

  const value = useMemo<AccountingValue>(
    () => ({
      ...seed,
      entries,
      hydrated,
      createInvoice,
      recordReceipt,
      createBill,
      recordPayment,
      convertOrder,
      convertRequest,
      postManualEntry,
      resubmitZatca,
      closedDays,
      closeDay,
      resetAccounting,
    }),
    [
      seed,
      entries,
      hydrated,
      createInvoice,
      recordReceipt,
      createBill,
      recordPayment,
      convertOrder,
      convertRequest,
      postManualEntry,
      resubmitZatca,
      closedDays,
      closeDay,
      resetAccounting,
    ],
  );

  return <AccountingContext.Provider value={value}>{children}</AccountingContext.Provider>;
}

export function useAccounting(): AccountingValue {
  const context = useContext(AccountingContext);
  if (!context) throw new Error("useAccounting must be used inside an AccountingProvider");
  return context;
}

export { BILL_CATEGORIES, CATEGORY_ACCOUNT };
