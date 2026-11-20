import { addDays } from "@/lib/dates";
import { BRANCHES } from "@/lib/mock/branches";
import { CLINIC_SERVICES, CLINIC_THERAPISTS, DEMO_TODAY, SEED_PATIENTS } from "@/lib/mock/clinic-seed";
import { BRANCH_STATS } from "@/lib/mock/dashboard-data";
import type { BranchId } from "@/types";

/* ==========================================================================
   Accounting demo ledger.

   Everything here is synthetic. Source documents (invoices, supplier bills,
   payroll runs, rent, depreciation) are generated deterministically and then
   *posted* to journal entries by `buildEntries`, so the trial balance,
   statements, aging and VAT figures always agree with each other.
   ========================================================================== */

export type RealBranch = Exclude<BranchId, "all">;
export type AccountType = "asset" | "liability" | "equity" | "revenue" | "expense";
export type PaymentMethod = "cash" | "card" | "transfer" | "insurance";
export type ZatcaStatus = "cleared" | "reported" | "pending" | "rejected";
export type BillCategory = "inventory" | "supplies" | "utilities" | "maintenance" | "marketing";
export type EntryKind =
  | "opening"
  | "sale"
  | "receipt"
  | "purchase"
  | "payment"
  | "payroll"
  | "gosi"
  | "rent"
  | "depreciation"
  | "inventory"
  | "deposit"
  | "manual";

export const VAT_RATE = 0.15;
export const TODAY = DEMO_TODAY;

export interface Account {
  code: string;
  nameAr: string;
  nameEn: string;
  type: AccountType;
  /** Parent group code, if any. Groups carry no postings of their own. */
  parent?: string;
  group?: boolean;
}

export interface JournalLine {
  account: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  branchId: RealBranch;
  kind: EntryKind;
  memoAr: string;
  memoEn: string;
  ref?: string;
  source: "auto" | "manual";
  lines: JournalLine[];
}

export interface SalesInvoice {
  id: string;
  date: string;
  due: string;
  branchId: RealBranch;
  patientId: string;
  serviceId: string;
  therapistId: string;
  qty: number;
  unitPrice: number;
  net: number;
  vat: number;
  total: number;
  method: PaymentMethod;
  paidAt: string | null;
  zatca: ZatcaStatus;
}

export interface PurchaseBill {
  id: string;
  date: string;
  due: string;
  branchId: RealBranch;
  supplierId: string;
  category: BillCategory;
  net: number;
  vat: number;
  total: number;
  paidAt: string | null;
}

export interface Supplier {
  id: string;
  nameAr: string;
  nameEn: string;
}

export type OrderStatus = "open" | "converted";

export interface SalesOrder {
  id: string;
  date: string;
  branchId: RealBranch;
  patientId: string;
  serviceId: string;
  qty: number;
  status: OrderStatus;
}

export interface PurchaseRequest {
  id: string;
  date: string;
  branchId: RealBranch;
  supplierId: string;
  category: BillCategory;
  net: number;
  requestedBy: "reception" | "therapy" | "management";
  status: OrderStatus;
}

export interface FixedAsset {
  id: string;
  nameAr: string;
  nameEn: string;
  branchId: RealBranch;
  account: "1510" | "1520";
  cost: number;
  acquired: string;
  lifeYears: number;
}

export interface LegalEntity {
  id: string;
  nameAr: string;
  nameEn: string;
  branches: RealBranch[];
}

/* ---------- reference data ---------- */

export const ENTITIES: LegalEntity[] = [
  { id: "le-1", nameAr: "المنشأة القانونية الأولى", nameEn: "Legal entity 1", branches: ["ghadeer", "darAlbaida"] },
  { id: "le-2", nameAr: "المنشأة القانونية الثانية", nameEn: "Legal entity 2", branches: ["quwayiyah"] },
];

export const ACCOUNTS: Account[] = [
  { code: "1000", nameAr: "الأصول", nameEn: "Assets", type: "asset", group: true },
  { code: "1100", nameAr: "الصندوق", nameEn: "Cash on hand", type: "asset", parent: "1000" },
  { code: "1120", nameAr: "البنك — الحساب الجاري", nameEn: "Bank — current account", type: "asset", parent: "1000" },
  { code: "1200", nameAr: "العملاء (ذمم مدينة)", nameEn: "Accounts receivable", type: "asset", parent: "1000" },
  { code: "1300", nameAr: "المخزون", nameEn: "Inventory", type: "asset", parent: "1000" },
  { code: "1400", nameAr: "ضريبة القيمة المضافة — مدخلات", nameEn: "VAT input", type: "asset", parent: "1000" },
  { code: "1500", nameAr: "الأصول الثابتة", nameEn: "Fixed assets", type: "asset", parent: "1000", group: true },
  { code: "1510", nameAr: "معدات علاجية", nameEn: "Therapy equipment", type: "asset", parent: "1500" },
  { code: "1520", nameAr: "أثاث وتجهيزات", nameEn: "Furniture & fittings", type: "asset", parent: "1500" },
  { code: "1590", nameAr: "مجمع الإهلاك", nameEn: "Accumulated depreciation", type: "asset", parent: "1500" },
  { code: "2000", nameAr: "الخصوم", nameEn: "Liabilities", type: "liability", group: true },
  { code: "2100", nameAr: "الموردون (ذمم دائنة)", nameEn: "Accounts payable", type: "liability", parent: "2000" },
  { code: "2210", nameAr: "التأمينات الاجتماعية المستحقة", nameEn: "GOSI payable", type: "liability", parent: "2000" },
  { code: "2300", nameAr: "ضريبة القيمة المضافة — مخرجات", nameEn: "VAT output", type: "liability", parent: "2000" },
  { code: "3000", nameAr: "حقوق الملكية", nameEn: "Equity", type: "equity", group: true },
  { code: "3100", nameAr: "رأس المال", nameEn: "Capital", type: "equity", parent: "3000" },
  { code: "4000", nameAr: "الإيرادات", nameEn: "Revenue", type: "revenue", group: true },
  { code: "4100", nameAr: "إيرادات العظام والعلاج اليدوي", nameEn: "Orthopedic & manual therapy", type: "revenue", parent: "4000" },
  { code: "4110", nameAr: "إيرادات الإصابات الرياضية", nameEn: "Sports injuries", type: "revenue", parent: "4000" },
  { code: "4120", nameAr: "إيرادات التأهيل والأعصاب", nameEn: "Rehabilitation & neurological", type: "revenue", parent: "4000" },
  { code: "4130", nameAr: "إيرادات علاج الأطفال", nameEn: "Pediatric therapy", type: "revenue", parent: "4000" },
  { code: "5000", nameAr: "المصروفات", nameEn: "Expenses", type: "expense", group: true },
  { code: "5100", nameAr: "الرواتب والأجور", nameEn: "Salaries & wages", type: "expense", parent: "5000" },
  { code: "5110", nameAr: "التأمينات الاجتماعية — حصة صاحب العمل", nameEn: "GOSI — employer share", type: "expense", parent: "5000" },
  { code: "5200", nameAr: "الإيجار", nameEn: "Rent", type: "expense", parent: "5000" },
  { code: "5300", nameAr: "مستلزمات علاجية", nameEn: "Therapy supplies", type: "expense", parent: "5000" },
  { code: "5400", nameAr: "مرافق وخدمات", nameEn: "Utilities", type: "expense", parent: "5000" },
  { code: "5500", nameAr: "صيانة", nameEn: "Maintenance", type: "expense", parent: "5000" },
  { code: "5600", nameAr: "تسويق وإعلان", nameEn: "Marketing", type: "expense", parent: "5000" },
  { code: "5700", nameAr: "مصروف الإهلاك", nameEn: "Depreciation expense", type: "expense", parent: "5000" },
];

export const ACCOUNT_BY_CODE: Record<string, Account> = Object.fromEntries(
  ACCOUNTS.map((account) => [account.code, account]),
);

/** Accounts that can receive postings (not groups). */
export const POSTING_ACCOUNTS = ACCOUNTS.filter((account) => !account.group);

export const SUPPLIERS: Supplier[] = [
  { id: "sup-equip", nameAr: "مورد معدات علاجية (تجريبي)", nameEn: "Therapy equipment supplier (demo)" },
  { id: "sup-supplies", nameAr: "مورد مستلزمات طبية (تجريبي)", nameEn: "Medical supplies vendor (demo)" },
  { id: "sup-util", nameAr: "مزود خدمات ومرافق (تجريبي)", nameEn: "Utilities provider (demo)" },
  { id: "sup-maint", nameAr: "شركة صيانة (تجريبية)", nameEn: "Maintenance contractor (demo)" },
  { id: "sup-media", nameAr: "وكالة تسويق (تجريبية)", nameEn: "Marketing agency (demo)" },
];

const CATEGORY_ACCOUNT: Record<BillCategory, string> = {
  inventory: "1300",
  supplies: "5300",
  utilities: "5400",
  maintenance: "5500",
  marketing: "5600",
};
const CATEGORY_SUPPLIER: Record<BillCategory, string> = {
  inventory: "sup-supplies",
  supplies: "sup-supplies",
  utilities: "sup-util",
  maintenance: "sup-maint",
  marketing: "sup-media",
};
export const BILL_CATEGORIES: BillCategory[] = ["inventory", "supplies", "utilities", "maintenance", "marketing"];

const SERVICE_REVENUE: Record<string, string> = {
  "service-physio": "4100",
  "service-manual": "4100",
  "service-sports": "4110",
  "service-post-op": "4120",
  "service-neuro": "4120",
  "service-pediatric": "4130",
};

/** Demo-only attribute used by the sales-by-provider-nationality report. */
export const THERAPIST_NATIONALITY: Record<string, "saudi" | "non-saudi"> = {
  "therapist-khalid": "saudi",
  "therapist-noura": "saudi",
  "therapist-layan": "saudi",
  "therapist-saad": "non-saudi",
  "therapist-fahad": "saudi",
  "therapist-maha": "non-saudi",
};

const BRANCH_CODE: Record<RealBranch, string> = { ghadeer: "GH", darAlbaida: "DB", quwayiyah: "QW" };
const BRANCH_IDS: RealBranch[] = BRANCHES.map((branch) => branch.id);
const MONTHS = ["2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11"];
const GROWTH = [0.7, 0.76, 0.74, 0.86, 0.96, 1];
const RENT: Record<RealBranch, number> = { ghadeer: 14000, darAlbaida: 10000, quwayiyah: 7000 };

export const FIXED_ASSETS: FixedAsset[] = [
  { id: "FA-001", nameAr: "جهاز موجات صادمة", nameEn: "Shockwave therapy unit", branchId: "ghadeer", account: "1510", cost: 68000, acquired: "2024-03-01", lifeYears: 7 },
  { id: "FA-002", nameAr: "أسرّة علاج كهربائية (٦)", nameEn: "Electric treatment beds (6)", branchId: "ghadeer", account: "1510", cost: 42000, acquired: "2024-03-01", lifeYears: 8 },
  { id: "FA-003", nameAr: "جهاز موجات فوق صوتية", nameEn: "Ultrasound therapy unit", branchId: "darAlbaida", account: "1510", cost: 31500, acquired: "2024-09-01", lifeYears: 7 },
  { id: "FA-004", nameAr: "جهاز مشي للتأهيل", nameEn: "Rehabilitation treadmill", branchId: "darAlbaida", account: "1510", cost: 24000, acquired: "2025-01-01", lifeYears: 6 },
  { id: "FA-005", nameAr: "تجهيز صالة التمارين", nameEn: "Exercise hall fit-out", branchId: "darAlbaida", account: "1520", cost: 55000, acquired: "2024-09-01", lifeYears: 10 },
  { id: "FA-006", nameAr: "جهاز تحفيز كهربائي", nameEn: "Electrotherapy unit", branchId: "quwayiyah", account: "1510", cost: 19500, acquired: "2025-04-01", lifeYears: 5 },
  { id: "FA-007", nameAr: "أثاث الاستقبال والانتظار", nameEn: "Reception & waiting furniture", branchId: "quwayiyah", account: "1520", cost: 16000, acquired: "2025-04-01", lifeYears: 8 },
  { id: "FA-008", nameAr: "أجهزة حاسب وشاشات", nameEn: "Computers & displays", branchId: "ghadeer", account: "1520", cost: 14400, acquired: "2025-06-01", lifeYears: 4 },
];

export function monthlyDepreciation(asset: FixedAsset): number {
  return Math.round((asset.cost / (asset.lifeYears * 12)) * 100) / 100;
}

function monthsBetween(from: string, to: string): number {
  const [fy = 0, fm = 0] = from.split("-").map(Number);
  const [ty = 0, tm = 0] = to.split("-").map(Number);
  return Math.max(0, (ty - fy) * 12 + (tm - fm));
}

export function accumulatedDepreciation(asset: FixedAsset, asOf: string): number {
  const months = Math.min(asset.lifeYears * 12, monthsBetween(asset.acquired, asOf.slice(0, 7)) + 1);
  return Math.round(monthlyDepreciation(asset) * Math.max(0, months) * 100) / 100;
}

/* ---------- deterministic generation ---------- */

function at<T>(list: readonly T[], index: number): T {
  const item = list[index];
  if (item === undefined) throw new RangeError(`Index ${index} out of range`);
  return item;
}

const round2 = (value: number) => Math.round(value * 100) / 100;

function monthAge(month: string): number {
  return monthsBetween(month, TODAY.slice(0, 7));
}

function generateInvoices(): SalesInvoice[] {
  const result: SalesInvoice[] = [];
  const methods: PaymentMethod[] = ["card", "cash", "card", "transfer", "card", "cash", "insurance", "card", "transfer", "cash"];
  for (const branchId of BRANCH_IDS) {
    const therapists = CLINIC_THERAPISTS.filter((item) => item.branchId === branchId);
    const patients = SEED_PATIENTS.filter((item) => item.branchId === branchId);
    let serial = 0;
    MONTHS.forEach((month, monthIndex) => {
      const count = 22 + monthIndex * 2;
      const target = BRANCH_STATS[branchId].revenue * at(GROWTH, monthIndex);
      const avg = target / count;
      const lastDay = monthIndex === MONTHS.length - 1 ? Number(TODAY.slice(8)) : 28;
      for (let index = 0; index < count; index += 1) {
        serial += 1;
        const weight = 0.6 + ((index * 37 + monthIndex * 11) % 9) * 0.1;
        const service = at(CLINIC_SERVICES, (index + monthIndex) % CLINIC_SERVICES.length);
        const qty = Math.max(4, Math.round((avg * weight) / service.price));
        const net = qty * service.price;
        const vat = round2(net * VAT_RATE);
        const day = 1 + Math.floor((index * (lastDay - 1)) / Math.max(1, count - 1));
        const date = `${month}-${String(day).padStart(2, "0")}`;
        const due = addDays(date, 14);
        const age = monthAge(month);
        const settledShare = age >= 2 ? 0.97 : age === 1 ? 0.86 : 0.55;
        const settled = ((index * 53 + monthIndex * 7) % 100) / 100 < settledShare;
        const payDate = addDays(date, (index % 6) + (index % 10 === 6 ? 25 : 0));
        const method = at(methods, index % methods.length);
        const paidAt = settled && payDate <= TODAY ? payDate : null;
        const ageDays = Math.floor((Date.parse(TODAY) - Date.parse(date)) / 86_400_000);
        let zatca: ZatcaStatus = method === "insurance" ? "cleared" : "reported";
        if (ageDays <= 1) zatca = "pending";
        else if (serial % 47 === 0) zatca = "rejected";
        result.push({
          id: `INV-${BRANCH_CODE[branchId]}-${String(serial).padStart(4, "0")}`,
          date,
          due,
          branchId,
          patientId: at(patients, (serial * 5) % patients.length).id,
          serviceId: service.id,
          therapistId: at(therapists, index % therapists.length).id,
          qty,
          unitPrice: service.price,
          net,
          vat,
          total: round2(net + vat),
          method,
          paidAt,
          zatca,
        });
      }
    });
  }
  return result.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}

function generateBills(): PurchaseBill[] {
  const result: PurchaseBill[] = [];
  const scale: Record<RealBranch, number> = { ghadeer: 1, darAlbaida: 0.75, quwayiyah: 0.55 };
  const base: Record<BillCategory, number> = { inventory: 7800, supplies: 4200, utilities: 3300, maintenance: 2600, marketing: 3000 };
  for (const branchId of BRANCH_IDS) {
    let serial = 0;
    MONTHS.forEach((month, monthIndex) => {
      BILL_CATEGORIES.forEach((category, categoryIndex) => {
        if (category === "marketing" && branchId === "quwayiyah" && monthIndex % 2 === 0) return;
        serial += 1;
        const wobble = 0.85 + ((monthIndex * 13 + categoryIndex * 7) % 7) * 0.05;
        const net = Math.round((at(Object.values(base), categoryIndex) * scale[branchId] * wobble) / 10) * 10;
        const vat = round2(net * VAT_RATE);
        const day = 2 + categoryIndex * 3 + (monthIndex % 2);
        const date = `${month}-${String(day).padStart(2, "0")}`;
        if (date > TODAY) return;
        const due = addDays(date, 30);
        const age = monthAge(month);
        const paid = age >= 2 || (age === 1 && categoryIndex % 3 !== 0) || (age === 0 && categoryIndex === 2);
        const payDate = addDays(date, 20 + categoryIndex);
        result.push({
          id: `BILL-${BRANCH_CODE[branchId]}-${String(serial).padStart(4, "0")}`,
          date,
          due,
          branchId,
          supplierId: CATEGORY_SUPPLIER[category],
          category,
          net,
          vat,
          total: round2(net + vat),
          paidAt: paid && payDate <= TODAY ? payDate : null,
        });
      });
    });
  }
  return result.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}

function generateOrders(): SalesOrder[] {
  const patients = SEED_PATIENTS;
  return Array.from({ length: 8 }, (_, index) => {
    const branchId = at(BRANCH_IDS, index % 3);
    const branchPatients = patients.filter((item) => item.branchId === branchId);
    return {
      id: `SO-${String(index + 1).padStart(4, "0")}`,
      date: addDays(TODAY, -(index % 9)),
      branchId,
      patientId: at(branchPatients, (index * 3 + 1) % branchPatients.length).id,
      serviceId: at(CLINIC_SERVICES, index % CLINIC_SERVICES.length).id,
      qty: 8 + (index % 3) * 4,
      status: "open" as const,
    };
  });
}

function generateRequests(): PurchaseRequest[] {
  const requesters: PurchaseRequest["requestedBy"][] = ["therapy", "reception", "management"];
  return Array.from({ length: 6 }, (_, index) => {
    const category = at(BILL_CATEGORIES, index % BILL_CATEGORIES.length);
    return {
      id: `PR-${String(index + 1).padStart(4, "0")}`,
      date: addDays(TODAY, -(index * 2)),
      branchId: at(BRANCH_IDS, index % 3),
      supplierId: CATEGORY_SUPPLIER[category],
      category,
      net: 1500 + index * 900,
      requestedBy: at(requesters, index % requesters.length),
      status: "open" as const,
    };
  });
}

export interface AccountingSeed {
  invoices: SalesInvoice[];
  bills: PurchaseBill[];
  orders: SalesOrder[];
  requests: PurchaseRequest[];
  manual: JournalEntry[];
}

export function createAccountingSeed(): AccountingSeed {
  return {
    invoices: generateInvoices(),
    bills: generateBills(),
    orders: generateOrders(),
    requests: generateRequests(),
    manual: [],
  };
}

/* ---------- posting ---------- */

const cashAccount = (method: PaymentMethod) => (method === "cash" ? "1100" : "1120");

function line(account: string, debit: number, credit: number): JournalLine {
  return { account, debit: round2(debit), credit: round2(credit) };
}

/** Turns source documents and recurring runs into balanced journal entries. */
export function buildEntries(docs: Pick<AccountingSeed, "invoices" | "bills" | "manual">): JournalEntry[] {
  const entries: Omit<JournalEntry, "id">[] = [];
  const push = (entry: Omit<JournalEntry, "id">) => {
    if (entry.date <= TODAY) entries.push(entry);
  };

  for (const branchId of BRANCH_IDS) {
    // Opening balances (1 June): bank, fixed assets at cost, accumulated depreciation, capital.
    const assets = FIXED_ASSETS.filter((asset) => asset.branchId === branchId);
    const cost = assets.reduce((sum, asset) => sum + asset.cost, 0);
    const accumulated = assets.reduce((sum, asset) => sum + accumulatedDepreciation(asset, "2026-05-31"), 0);
    const bank = 250_000;
    push({
      date: "2026-06-01",
      branchId,
      kind: "opening",
      memoAr: "أرصدة افتتاحية",
      memoEn: "Opening balances",
      source: "auto",
      lines: [
        line("1120", bank, 0),
        ...(assets.some((asset) => asset.account === "1510")
          ? [line("1510", assets.filter((asset) => asset.account === "1510").reduce((sum, asset) => sum + asset.cost, 0), 0)]
          : []),
        ...(assets.some((asset) => asset.account === "1520")
          ? [line("1520", assets.filter((asset) => asset.account === "1520").reduce((sum, asset) => sum + asset.cost, 0), 0)]
          : []),
        line("1590", 0, accumulated),
        line("3100", 0, bank + cost - accumulated),
      ],
    });

    MONTHS.forEach((month, monthIndex) => {
      const gross = Math.round((BRANCH_STATS[branchId].revenue * at(GROWTH, monthIndex) * 0.38) / 10) * 10;
      const employer = round2(gross * 0.1);
      const employee = round2(gross * 0.09);
      push({
        date: `${month}-15`,
        branchId,
        kind: "payroll",
        memoAr: `مسير رواتب ${month}`,
        memoEn: `Payroll run ${month}`,
        ref: `PAY-${BRANCH_CODE[branchId]}-${month}`,
        source: "auto",
        lines: [line("5100", gross, 0), line("5110", employer, 0), line("1120", 0, gross - employee), line("2210", 0, employer + employee)],
      });
      if (monthIndex > 0) {
        const prevGross = Math.round((BRANCH_STATS[branchId].revenue * at(GROWTH, monthIndex - 1) * 0.38) / 10) * 10;
        const settle = round2(prevGross * 0.19);
        push({
          date: `${month}-05`,
          branchId,
          kind: "gosi",
          memoAr: `سداد التأمينات الاجتماعية لشهر ${at(MONTHS, monthIndex - 1)}`,
          memoEn: `GOSI settlement for ${at(MONTHS, monthIndex - 1)}`,
          source: "auto",
          lines: [line("2210", settle, 0), line("1120", 0, settle)],
        });
      }
      const rentNet = RENT[branchId];
      push({
        date: `${month}-01`,
        branchId,
        kind: "rent",
        memoAr: `إيجار الفرع ${month}`,
        memoEn: `Branch rent ${month}`,
        source: "auto",
        lines: [line("5200", rentNet, 0), line("1400", rentNet * VAT_RATE, 0), line("1120", 0, rentNet * (1 + VAT_RATE))],
      });
      const monthlyDep = assets.reduce((sum, asset) => sum + monthlyDepreciation(asset), 0);
      push({
        date: `${month}-01`,
        branchId,
        kind: "depreciation",
        memoAr: `إهلاك الأصول الثابتة ${month}`,
        memoEn: `Fixed-asset depreciation ${month}`,
        source: "auto",
        lines: [line("5700", monthlyDep, 0), line("1590", 0, monthlyDep)],
      });
      const cashIn = docs.invoices
        .filter((invoice) => invoice.branchId === branchId && invoice.method === "cash" && invoice.paidAt?.startsWith(month))
        .reduce((sum, invoice) => sum + invoice.total, 0);
      if (cashIn > 0) {
        const deposit = Math.round(cashIn * 0.95);
        push({
          date: `${month}-27`,
          branchId,
          kind: "deposit",
          memoAr: `إيداع نقدي بالبنك ${month}`,
          memoEn: `Cash deposit to bank ${month}`,
          source: "auto",
          lines: [line("1120", deposit, 0), line("1100", 0, deposit)],
        });
      }
      const inventoryBought = docs.bills
        .filter((bill) => bill.branchId === branchId && bill.category === "inventory" && bill.date.startsWith(month))
        .reduce((sum, bill) => sum + bill.net, 0);
      if (inventoryBought > 0) {
        const used = round2(inventoryBought * 0.9);
        push({
          date: `${month}-16`,
          branchId,
          kind: "inventory",
          memoAr: `صرف مخزون للاستهلاك ${month}`,
          memoEn: `Inventory consumed ${month}`,
          source: "auto",
          lines: [line("5300", used, 0), line("1300", 0, used)],
        });
      }
    });
  }

  for (const invoice of docs.invoices) {
    const account = SERVICE_REVENUE[invoice.serviceId] ?? "4100";
    push({
      date: invoice.date,
      branchId: invoice.branchId,
      kind: "sale",
      memoAr: `فاتورة مبيعات ${invoice.id}`,
      memoEn: `Sales invoice ${invoice.id}`,
      ref: invoice.id,
      source: "auto",
      lines: [line("1200", invoice.total, 0), line(account, 0, invoice.net), line("2300", 0, invoice.vat)],
    });
    if (invoice.paidAt) {
      push({
        date: invoice.paidAt,
        branchId: invoice.branchId,
        kind: "receipt",
        memoAr: `سند قبض عن ${invoice.id}`,
        memoEn: `Receipt for ${invoice.id}`,
        ref: invoice.id,
        source: "auto",
        lines: [line(cashAccount(invoice.method), invoice.total, 0), line("1200", 0, invoice.total)],
      });
    }
  }

  for (const bill of docs.bills) {
    push({
      date: bill.date,
      branchId: bill.branchId,
      kind: "purchase",
      memoAr: `فاتورة مورد ${bill.id}`,
      memoEn: `Supplier invoice ${bill.id}`,
      ref: bill.id,
      source: "auto",
      lines: [line(CATEGORY_ACCOUNT[bill.category], bill.net, 0), line("1400", bill.vat, 0), line("2100", 0, bill.total)],
    });
    if (bill.paidAt) {
      push({
        date: bill.paidAt,
        branchId: bill.branchId,
        kind: "payment",
        memoAr: `سند صرف عن ${bill.id}`,
        memoEn: `Payment voucher for ${bill.id}`,
        ref: bill.id,
        source: "auto",
        lines: [line("2100", bill.total, 0), line("1120", 0, bill.total)],
      });
    }
  }

  const auto = entries.sort((a, b) => a.date.localeCompare(b.date) || a.kind.localeCompare(b.kind));
  const numbered: JournalEntry[] = auto.map((entry, index) => ({ ...entry, id: `JE-${String(index + 1).padStart(5, "0")}` }));
  return [...numbered, ...docs.manual].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}

/* ---------- selectors ---------- */

export interface EntryFilter {
  branch?: BranchId;
  from?: string;
  to?: string;
}

export function filterEntries(entries: JournalEntry[], filter: EntryFilter = {}): JournalEntry[] {
  return entries.filter(
    (entry) =>
      (!filter.branch || filter.branch === "all" || entry.branchId === filter.branch) &&
      (!filter.from || entry.date >= filter.from) &&
      (!filter.to || entry.date <= filter.to),
  );
}

export interface Balance {
  debit: number;
  credit: number;
}

export function balancesByAccount(entries: JournalEntry[]): Record<string, Balance> {
  const map: Record<string, Balance> = {};
  for (const entry of entries) {
    for (const item of entry.lines) {
      const current = (map[item.account] ??= { debit: 0, credit: 0 });
      current.debit += item.debit;
      current.credit += item.credit;
    }
  }
  return map;
}

/** Natural-side balance: positive when the account has its normal balance. */
export function naturalBalance(account: Account, balance: Balance | undefined): number {
  if (!balance) return 0;
  const debitNormal = account.type === "asset" || account.type === "expense";
  return round2(debitNormal ? balance.debit - balance.credit : balance.credit - balance.debit);
}

export interface Totals {
  revenue: number;
  expenses: number;
  net: number;
}

export function profitAndLoss(entries: JournalEntry[]): Totals {
  const balances = balancesByAccount(entries);
  let revenue = 0;
  let expenses = 0;
  for (const account of POSTING_ACCOUNTS) {
    if (account.type === "revenue") revenue += naturalBalance(account, balances[account.code]);
    if (account.type === "expense") expenses += naturalBalance(account, balances[account.code]);
  }
  return { revenue: round2(revenue), expenses: round2(expenses), net: round2(revenue - expenses) };
}

export function monthlyProfit(entries: JournalEntry[]): Array<Totals & { month: string }> {
  return MONTHS.map((month) => ({ month, ...profitAndLoss(entries.filter((entry) => entry.date.startsWith(month))) }));
}

export type AgingBucket = "current" | "d1_30" | "d31_60" | "d61_plus";
export const AGING_BUCKETS: AgingBucket[] = ["current", "d1_30", "d31_60", "d61_plus"];

export function agingBucket(due: string, asOf: string = TODAY): AgingBucket {
  const days = Math.floor((Date.parse(asOf) - Date.parse(due)) / 86_400_000);
  if (days <= 0) return "current";
  if (days <= 30) return "d1_30";
  if (days <= 60) return "d31_60";
  return "d61_plus";
}

export function agingTotals(
  docs: Array<{ due: string; total: number; paidAt: string | null }>,
): Record<AgingBucket, number> {
  const totals: Record<AgingBucket, number> = { current: 0, d1_30: 0, d31_60: 0, d61_plus: 0 };
  for (const doc of docs) {
    if (!doc.paidAt) totals[agingBucket(doc.due)] += doc.total;
  }
  return totals;
}

export function branchEntity(branchId: RealBranch): LegalEntity {
  return ENTITIES.find((entity) => entity.branches.includes(branchId)) ?? at(ENTITIES, 0);
}

export const REPORT_MONTHS = MONTHS;
export { BRANCH_IDS, BRANCH_CODE, CATEGORY_ACCOUNT, SERVICE_REVENUE, round2, at as pick };
