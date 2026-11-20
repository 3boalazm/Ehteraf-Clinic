import { addDays, parseISODate, toISODate } from "@/lib/dates";
import { BRANCHES } from "@/lib/mock/branches";
import { TODAY } from "@/lib/mock/accounting-data";
import type { ModuleId, RoleId } from "@/types";

/* ==========================================================================
   HR demo data: employees and contracts, rosters, fingerprint attendance and
   payroll. Everything is synthetic and deterministic. Payroll lines are
   *computed* from contracts + attendance + adjustments, and a posted run
   becomes a journal entry in the accounting module.
   ========================================================================== */

export type RealBranch = "ghadeer" | "darAlbaida" | "quwayiyah";
export type Shift = "morning" | "evening";
export type RosterCell = Shift | "off";
export type Nationality = "saudi" | "non-saudi";
export type Department = "management" | "clinical" | "front" | "support";
export type ContractType = "fixed" | "indefinite";
export type AttendanceStatus =
  | "present"
  | "late"
  | "absent"
  | "leave"
  | "excused"
  | "off"
  | "holiday"
  | "upcoming";
export type RunStatus = "draft" | "approved" | "paid" | "posted";
export type LeaveType = "annual" | "sick" | "emergency";
export type LeaveStatus = "pending" | "approved" | "rejected";
export type AdjustmentKind = "allowance" | "bonus" | "deduction";

export const HR_TODAY = TODAY;
export const NOW_MINUTES = 11 * 60 + 20;
export const SHIFTS: Record<Shift, { start: string; end: string }> = {
  morning: { start: "08:00", end: "16:00" },
  evening: { start: "12:00", end: "20:00" },
};
export const HOLIDAYS: Record<string, { ar: string; en: string }> = {
  "2026-09-23": { ar: "اليوم الوطني", en: "National Day" },
};
export const PERIOD_START = "2026-06-01";
export const MONTHS = ["2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11"];
export const HR_BRANCHES: RealBranch[] = BRANCHES.map((branch) => branch.id);

export interface Employee {
  id: string;
  nameAr: string;
  nameEn: string;
  branchId: RealBranch;
  jobAr: string;
  jobEn: string;
  department: Department;
  nationality: Nationality;
  role: RoleId;
  contractType: ContractType;
  start: string;
  end: string | null;
  basic: number;
  housing: number;
  transport: number;
  other: number;
  shift: Shift;
  managerId: string | null;
  deviceUserId: number;
  therapistId?: string;
}

export interface Adjustment {
  id: string;
  empId: string;
  month: string;
  kind: AdjustmentKind;
  amount: number;
  note: string;
}

export interface LeaveRequest {
  id: string;
  empId: string;
  type: LeaveType;
  from: string;
  to: string;
  status: LeaveStatus;
  requestedAt: string;
  note: string;
}

export interface Device {
  id: string;
  branchId: RealBranch;
  location: "entrance" | "clinic-floor";
  online: boolean;
  lastSyncMinutesAgo: number;
  firmware: string;
}

const e = (
  id: string,
  nameAr: string,
  nameEn: string,
  branchId: RealBranch,
  jobAr: string,
  jobEn: string,
  department: Department,
  nationality: Nationality,
  role: RoleId,
  basic: number,
  options: Partial<Employee> = {},
): Employee => ({
  id,
  nameAr,
  nameEn,
  branchId,
  jobAr,
  jobEn,
  department,
  nationality,
  role,
  contractType: "indefinite",
  start: "2025-02-01",
  end: null,
  basic,
  housing: Math.round(basic * 0.25),
  transport: Math.round(basic * 0.1),
  other: 0,
  shift: "morning",
  managerId: null,
  deviceUserId: Number(id.replace(/\D/g, "")),
  ...options,
});

export const EMPLOYEES: Employee[] = [
  e("EMP-001", "عبدالعزيز القحطاني", "Abdulaziz Al-Qahtani", "ghadeer", "مدير الفرع", "Branch manager", "management", "saudi", "branchManager", 9000, { other: 500 }),
  e("EMP-002", "د. خالد العتيبي", "Dr. Khalid Al-Otaibi", "ghadeer", "أخصائي علاج طبيعي أول", "Senior physiotherapist", "clinical", "saudi", "therapist", 7500, { managerId: "EMP-001", therapistId: "therapist-khalid", contractType: "fixed", start: "2025-09-01", end: "2027-08-31" }),
  e("EMP-003", "نورة السالم", "Noura Al-Salem", "ghadeer", "أخصائية علاج طبيعي", "Physiotherapist", "clinical", "saudi", "therapist", 6000, { managerId: "EMP-001", therapistId: "therapist-noura", shift: "evening" }),
  e("EMP-004", "سلطان الحربي", "Sultan Al-Harbi", "ghadeer", "موظف استقبال", "Receptionist", "front", "saudi", "receptionist", 3500, { managerId: "EMP-001" }),
  e("EMP-005", "أمل الدوسري", "Amal Al-Dossary", "ghadeer", "موظفة استقبال", "Receptionist", "front", "saudi", "receptionist", 3500, { managerId: "EMP-001", shift: "evening" }),
  e("EMP-006", "أحمد حسن", "Ahmed Hassan", "ghadeer", "مساعد علاج طبيعي", "Therapy assistant", "clinical", "non-saudi", "therapist", 3000, { managerId: "EMP-002", contractType: "fixed", start: "2026-01-01", end: "2026-12-31" }),
  e("EMP-007", "محمد إقبال", "Mohammed Iqbal", "ghadeer", "خدمات مساندة", "Support staff", "support", "non-saudi", "receptionist", 2200, { managerId: "EMP-001", contractType: "fixed", start: "2025-11-15", end: "2027-11-14" }),
  e("EMP-008", "ريم الشهراني", "Reem Al-Shahrani", "darAlbaida", "مديرة الفرع", "Branch manager", "management", "saudi", "branchManager", 7000, { other: 400 }),
  e("EMP-009", "ليان المطيري", "Layan Al-Mutairi", "darAlbaida", "أخصائية علاج طبيعي", "Physiotherapist", "clinical", "saudi", "therapist", 6000, { managerId: "EMP-008", therapistId: "therapist-layan" }),
  e("EMP-010", "د. سعد الدوسري", "Dr. Saad Al-Dosari", "darAlbaida", "أخصائي علاج طبيعي أول", "Senior physiotherapist", "clinical", "non-saudi", "therapist", 7000, { managerId: "EMP-008", therapistId: "therapist-saad", shift: "evening", contractType: "fixed", start: "2025-12-01", end: "2026-11-30" }),
  e("EMP-011", "هيفاء المالكي", "Haifa Al-Maliki", "darAlbaida", "موظفة استقبال", "Receptionist", "front", "saudi", "receptionist", 3500, { managerId: "EMP-008" }),
  e("EMP-012", "يوسف علي", "Yousef Ali", "darAlbaida", "مساعد علاج طبيعي", "Therapy assistant", "clinical", "non-saudi", "therapist", 3000, { managerId: "EMP-009", contractType: "fixed", start: "2026-08-01", end: "2027-07-31", shift: "evening" }),
  e("EMP-013", "ماجد الشمري", "Majed Al-Shammari", "quwayiyah", "مدير الفرع", "Branch manager", "management", "saudi", "branchManager", 5500, { other: 300 }),
  e("EMP-014", "د. فهد الشمري", "Dr. Fahad Al-Shammari", "quwayiyah", "أخصائي علاج طبيعي", "Physiotherapist", "clinical", "saudi", "therapist", 6500, { managerId: "EMP-013", therapistId: "therapist-fahad" }),
  e("EMP-015", "مها الزهراني", "Maha Al-Zahrani", "quwayiyah", "أخصائية علاج طبيعي", "Physiotherapist", "clinical", "non-saudi", "therapist", 5000, { managerId: "EMP-013", therapistId: "therapist-maha", shift: "evening", contractType: "fixed", start: "2026-01-15", end: "2026-12-14" }),
  e("EMP-016", "سارة العنزي", "Sarah Al-Anazi", "quwayiyah", "موظفة استقبال", "Receptionist", "front", "saudi", "receptionist", 3000, { managerId: "EMP-013" }),
];

export const EMPLOYEE_BY_ID: Record<string, Employee> = Object.fromEntries(EMPLOYEES.map((item) => [item.id, item]));

export function pickItem<T>(list: readonly T[], index: number): T {
  const item = list[index];
  if (item === undefined) throw new RangeError(`Index ${index} out of range`);
  return item;
}

export const monthTotal = (employee: Employee) => employee.basic + employee.housing + employee.transport + employee.other;

/* ---------- leave ---------- */
export const LEAVE_SEED: LeaveRequest[] = [
  { id: "LV-001", empId: "EMP-003", type: "annual", from: "2026-08-09", to: "2026-08-20", status: "approved", requestedAt: "2026-07-20", note: "" },
  { id: "LV-002", empId: "EMP-009", type: "annual", from: "2026-07-12", to: "2026-07-23", status: "approved", requestedAt: "2026-06-25", note: "" },
  { id: "LV-003", empId: "EMP-005", type: "sick", from: "2026-10-05", to: "2026-10-07", status: "approved", requestedAt: "2026-10-05", note: "" },
  { id: "LV-004", empId: "EMP-014", type: "annual", from: "2026-09-06", to: "2026-09-10", status: "approved", requestedAt: "2026-08-15", note: "" },
  { id: "LV-005", empId: "EMP-004", type: "annual", from: "2026-11-22", to: "2026-11-26", status: "pending", requestedAt: "2026-11-10", note: "" },
  { id: "LV-006", empId: "EMP-011", type: "emergency", from: "2026-11-18", to: "2026-11-18", status: "pending", requestedAt: "2026-11-16", note: "" },
  { id: "LV-007", empId: "EMP-016", type: "annual", from: "2026-12-06", to: "2026-12-17", status: "pending", requestedAt: "2026-11-12", note: "" },
  { id: "LV-008", empId: "EMP-006", type: "sick", from: "2026-11-02", to: "2026-11-02", status: "rejected", requestedAt: "2026-11-03", note: "" },
];
export const ANNUAL_LEAVE_DAYS = 21;

export function leaveDays(request: Pick<LeaveRequest, "from" | "to">): number {
  return Math.round((Date.parse(request.to) - Date.parse(request.from)) / 86_400_000) + 1;
}

/* ---------- roster ---------- */
export function defaultRoster(employee: Employee): Record<number, RosterCell> {
  const cells: Record<number, RosterCell> = {};
  for (let day = 0; day < 7; day += 1) cells[day] = day === 5 || day === 6 ? "off" : employee.shift;
  return cells;
}

export type RosterOverrides = Record<string, RosterCell>;

export function rosterFor(employee: Employee, overrides: RosterOverrides): Record<number, RosterCell> {
  const base = defaultRoster(employee);
  for (let day = 0; day < 7; day += 1) {
    const override = overrides[`${employee.id}:${day}`];
    if (override) base[day] = override;
  }
  return base;
}

/* ---------- attendance ---------- */
export interface DayRecord {
  date: string;
  status: AttendanceStatus;
  shift: Shift | null;
  checkIn: string | null;
  checkOut: string | null;
  lateMinutes: number;
  overtimeMinutes: number;
  workedMinutes: number;
}

export interface HrContext {
  leaves: LeaveRequest[];
  excused: Record<string, boolean>;
  roster: RosterOverrides;
}

const toMinutes = (clock: string) => {
  const [h = 0, m = 0] = clock.split(":").map(Number);
  return h * 60 + m;
};
export const toClock = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

function dayNumber(date: string): number {
  return Math.round((Date.parse(date) - Date.parse(PERIOD_START)) / 86_400_000);
}

function employeeIndex(employee: Employee): number {
  return Number(employee.id.replace(/\D/g, ""));
}

const leaveOn = (empId: string, date: string, leaves: LeaveRequest[]) =>
  leaves.some((item) => item.empId === empId && item.status === "approved" && item.from <= date && date <= item.to);

export function recordFor(employee: Employee, date: string, ctx: HrContext): DayRecord {
  const blank: DayRecord = { date, status: "off", shift: null, checkIn: null, checkOut: null, lateMinutes: 0, overtimeMinutes: 0, workedMinutes: 0 };
  if (date < employee.start || (employee.end && date > employee.end)) return blank;
  const weekday = parseISODate(date).getUTCDay();
  const cell = rosterFor(employee, ctx.roster)[weekday] ?? "off";
  if (cell === "off") return blank;
  if (HOLIDAYS[date]) return { ...blank, status: "holiday" };
  if (date > TODAY) return { ...blank, status: "upcoming", shift: cell };
  if (leaveOn(employee.id, date, ctx.leaves)) return { ...blank, status: "leave", shift: cell };

  const shift = SHIFTS[cell];
  const index = employeeIndex(employee);
  const seed = (index * 131 + dayNumber(date) * 17 + ((index * dayNumber(date)) % 13)) % 100;
  const startMin = toMinutes(shift.start);
  const endMin = toMinutes(shift.end);
  const excused = ctx.excused[`${employee.id}:${date}`] === true;

  if (date === TODAY && startMin > NOW_MINUTES) return { ...blank, status: "upcoming", shift: cell };

  if (seed < 3) {
    return { ...blank, status: excused ? "excused" : "absent", shift: cell };
  }
  const late = seed < 14 ? ((seed * 3) % 40) + 5 : 0;
  const early = seed % 9 === 0 ? 3 : 0;
  const checkInMinutes = startMin + late - (late === 0 ? early : 0);
  if (date === TODAY && checkInMinutes > NOW_MINUTES) return { ...blank, status: "upcoming", shift: cell };
  const overtime = seed % 11 === 0 ? 30 + (seed % 4) * 30 : 0;
  const checkOutMinutes = endMin + overtime - (seed % 17 === 0 ? 20 : 0);
  const worked = date === TODAY ? 0 : checkOutMinutes - checkInMinutes;
  return {
    date,
    status: late > 0 ? (excused ? "excused" : "late") : "present",
    shift: cell,
    checkIn: toClock(checkInMinutes),
    checkOut: date === TODAY ? null : toClock(checkOutMinutes),
    lateMinutes: late > 0 && !excused ? late : 0,
    overtimeMinutes: overtime,
    workedMinutes: worked,
  };
}

export interface MonthStats {
  workDays: number;
  presentDays: number;
  lateDays: number;
  lateMinutes: number;
  absentDays: number;
  leaveDays: number;
  overtimeMinutes: number;
  workedMinutes: number;
}

export function monthDates(month: string): string[] {
  const first = `${month}-01`;
  const next = new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 1));
  const count = Math.round((next.getTime() - Date.parse(first)) / 86_400_000);
  return Array.from({ length: count }, (_, index) => addDays(first, index));
}

export function monthStats(employee: Employee, month: string, ctx: HrContext): MonthStats {
  const stats: MonthStats = { workDays: 0, presentDays: 0, lateDays: 0, lateMinutes: 0, absentDays: 0, leaveDays: 0, overtimeMinutes: 0, workedMinutes: 0 };
  for (const date of monthDates(month)) {
    const record = recordFor(employee, date, ctx);
    if (record.status === "off" || record.status === "upcoming" || record.status === "holiday") continue;
    stats.workDays += 1;
    if (record.status === "absent") stats.absentDays += 1;
    else if (record.status === "leave") stats.leaveDays += 1;
    else {
      stats.presentDays += 1;
      if (record.status === "late") {
        stats.lateDays += 1;
        stats.lateMinutes += record.lateMinutes;
      }
      stats.overtimeMinutes += record.overtimeMinutes;
      stats.workedMinutes += record.workedMinutes;
    }
  }
  return stats;
}

/* ---------- payroll ---------- */
export interface PayrollLine {
  empId: string;
  factor: number;
  basic: number;
  housing: number;
  transport: number;
  other: number;
  overtime: number;
  extraAllowances: number;
  earnings: number;
  absentDays: number;
  lateMinutes: number;
  overtimeHours: number;
  absenceDeduction: number;
  lateDeduction: number;
  manualDeductions: number;
  gosiEmployee: number;
  gosiEmployer: number;
  net: number;
  /** Cost booked to salaries expense: earnings less attendance and manual deductions. */
  salaryExpense: number;
}

export interface PayrollRun {
  key: string;
  branchId: RealBranch;
  month: string;
  lines: PayrollLine[];
  totals: Omit<PayrollLine, "empId" | "factor" | "absentDays" | "lateMinutes" | "overtimeHours"> & { count: number };
}

const money = (value: number) => Math.round(value * 100) / 100;
export const GOSI = { saudiEmployee: 0.0975, saudiEmployer: 0.1175, nonSaudiEmployer: 0.02, cap: 45000 };

export function payrollLine(employee: Employee, month: string, ctx: HrContext, adjustments: Adjustment[]): PayrollLine | null {
  const days = monthDates(month);
  const monthStart = days[0] ?? `${month}-01`;
  const monthEnd = days[days.length - 1] ?? `${month}-28`;
  if (employee.start > monthEnd || (employee.end && employee.end < monthStart)) return null;
  const activeFrom = employee.start > monthStart ? employee.start : monthStart;
  const activeTo = employee.end && employee.end < monthEnd ? employee.end : monthEnd;
  const factor = money((Date.parse(activeTo) - Date.parse(activeFrom)) / 86_400_000 + 1) / days.length;
  const stats = monthStats(employee, month, ctx);

  const basic = money(employee.basic * factor);
  const housing = money(employee.housing * factor);
  const transport = money(employee.transport * factor);
  const other = money(employee.other * factor);
  const dailyRate = monthTotal(employee) / 30;
  const hourlyBasic = employee.basic / 30 / 8;
  const overtimeHours = money(stats.overtimeMinutes / 60);
  const overtime = money(overtimeHours * hourlyBasic * 1.5);
  const mine = adjustments.filter((item) => item.empId === employee.id && item.month === month);
  const extraAllowances = money(mine.filter((item) => item.kind !== "deduction").reduce((sum, item) => sum + item.amount, 0));
  const manualDeductions = money(mine.filter((item) => item.kind === "deduction").reduce((sum, item) => sum + item.amount, 0));
  const earnings = money(basic + housing + transport + other + overtime + extraAllowances);
  const absenceDeduction = money(stats.absentDays * dailyRate);
  const lateDeduction = money((stats.lateMinutes / 60) * hourlyBasic);
  const gosiBase = Math.min(GOSI.cap, basic + housing);
  const gosiEmployee = employee.nationality === "saudi" ? money(gosiBase * GOSI.saudiEmployee) : 0;
  const gosiEmployer = money(gosiBase * (employee.nationality === "saudi" ? GOSI.saudiEmployer : GOSI.nonSaudiEmployer));
  const salaryExpense = money(earnings - absenceDeduction - lateDeduction - manualDeductions);
  return {
    empId: employee.id,
    factor,
    basic,
    housing,
    transport,
    other,
    overtime,
    extraAllowances,
    earnings,
    absentDays: stats.absentDays,
    lateMinutes: stats.lateMinutes,
    overtimeHours,
    absenceDeduction,
    lateDeduction,
    manualDeductions,
    gosiEmployee,
    gosiEmployer,
    net: money(salaryExpense - gosiEmployee),
    salaryExpense,
  };
}

export function computeRun(branchId: RealBranch, month: string, ctx: HrContext, adjustments: Adjustment[]): PayrollRun {
  const lines = EMPLOYEES.filter((item) => item.branchId === branchId)
    .map((employee) => payrollLine(employee, month, ctx, adjustments))
    .filter((line): line is PayrollLine => line !== null);
  const sum = (pick: (line: PayrollLine) => number) => money(lines.reduce((total, line) => total + pick(line), 0));
  return {
    key: `${branchId}:${month}`,
    branchId,
    month,
    lines,
    totals: {
      count: lines.length,
      basic: sum((line) => line.basic),
      housing: sum((line) => line.housing),
      transport: sum((line) => line.transport),
      other: sum((line) => line.other),
      overtime: sum((line) => line.overtime),
      extraAllowances: sum((line) => line.extraAllowances),
      earnings: sum((line) => line.earnings),
      absenceDeduction: sum((line) => line.absenceDeduction),
      lateDeduction: sum((line) => line.lateDeduction),
      manualDeductions: sum((line) => line.manualDeductions),
      gosiEmployee: sum((line) => line.gosiEmployee),
      gosiEmployer: sum((line) => line.gosiEmployer),
      net: sum((line) => line.net),
      salaryExpense: sum((line) => line.salaryExpense),
    },
  };
}

export function defaultRunStatus(month: string): RunStatus {
  return month < TODAY.slice(0, 7) ? "posted" : "draft";
}

export const RUN_FLOW: RunStatus[] = ["draft", "approved", "paid", "posted"];

/** A posted payroll run as the accounting module books it. */
export interface PostedPayroll {
  key: string;
  branchId: RealBranch;
  month: string;
  date: string;
  salaryExpense: number;
  gosiEmployer: number;
  gosiEmployee: number;
}

export function postedDate(month: string, postedAt?: string): string {
  if (postedAt) return postedAt;
  return month < TODAY.slice(0, 7) ? `${month}-27` : TODAY;
}

/* ---------- devices ---------- */
export const DEVICES: Device[] = [
  { id: "FP-GH-01", branchId: "ghadeer", location: "entrance", online: true, lastSyncMinutesAgo: 2, firmware: "demo-1.4.2" },
  { id: "FP-GH-02", branchId: "ghadeer", location: "clinic-floor", online: true, lastSyncMinutesAgo: 6, firmware: "demo-1.4.2" },
  { id: "FP-DB-01", branchId: "darAlbaida", location: "entrance", online: true, lastSyncMinutesAgo: 3, firmware: "demo-1.4.0" },
  { id: "FP-QW-01", branchId: "quwayiyah", location: "entrance", online: false, lastSyncMinutesAgo: 190, firmware: "demo-1.3.9" },
];

/* ---------- modules for the permission matrix ---------- */
export const PERMISSION_MODULES: ModuleId[] = [
  "appointments",
  "patients",
  "clinical",
  "services",
  "finance",
  "inventory",
  "employees",
  "reports",
  "marketing",
  "notifications",
  "settings",
  "branches",
];

export { toISODate };
