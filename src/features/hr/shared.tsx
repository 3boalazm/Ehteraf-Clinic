"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, type ReactNode } from "react";
import { FlaskConical } from "lucide-react";
import { getBranchName } from "@/lib/clinic-utils";
import { type Pair } from "@/lib/i18n/accounting-copy";
import { hrCopy } from "@/lib/i18n/hr-copy";
import { EMPLOYEES, type Employee } from "@/lib/mock/hr-data";
import { formatNumber } from "@/lib/utils";
import { useHr } from "@/services/hr-provider";
import { useApp } from "@/shell/use-app";
import { Avatar, Badge, Notice, PageHead, type Tone } from "@/ui";

export function useHrUi() {
  const app = useApp();
  const hr = useHr();
  const { locale } = app;
  const tx = (pair: Pair): string => (locale === "ar" ? pair[0] : pair[1]);
  const num = (value: number) => formatNumber(Math.round(value), locale);
  const money = (value: number, decimals = 0) =>
    new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  const sar = (value: number, decimals = 0) => `${money(value, decimals)} ${locale === "ar" ? "ر.س" : "SAR"}`;
  const nameOf = (employee: Employee) => (locale === "ar" ? employee.nameAr : employee.nameEn);
  const jobOf = (employee: Employee) => (locale === "ar" ? employee.jobAr : employee.jobEn);
  const branchOf = (employee: Employee) => getBranchName(employee.branchId, locale);
  return { app, hr, tx, num, money, sar, nameOf, jobOf, branchOf, locale, copy: hrCopy };
}

/** Employees limited to the selected branch scope. */
export function useScopedEmployees(): Employee[] {
  const app = useApp();
  return useMemo(
    () => EMPLOYEES.filter((employee) => app.branchId === "all" || employee.branchId === app.branchId),
    [app.branchId],
  );
}

const NAV: Array<{ key: keyof typeof hrCopy.tabs; href: string }> = [
  { key: "overview", href: "/hr" },
  { key: "employees", href: "/hr/employees" },
  { key: "payroll", href: "/hr/payroll" },
  { key: "attendance", href: "/hr/attendance" },
  { key: "portal", href: "/hr/portal" },
  { key: "structure", href: "/hr/structure" },
];

export function HrNav() {
  const { app, tx, copy } = useHrUi();
  const pathname = usePathname() ?? "";
  const rest = "/" + pathname.split("/").filter(Boolean).slice(1).join("/");
  return (
    <nav className="subnav" aria-label={tx(copy.title)}>
      {NAV.map((item) => {
        const active = item.href === "/hr" ? rest === item.href : rest.startsWith(item.href);
        return (
          <Link key={item.key} href={app.href(item.href)} className="subnav__item" aria-current={active ? "page" : undefined}>
            {tx(copy.tabs[item.key])}
          </Link>
        );
      })}
    </nav>
  );
}

export function HrPage({
  title,
  subtitle,
  actions,
  children,
}: {
  title: Pair;
  subtitle: Pair;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { app, tx, copy } = useHrUi();
  const scope = app.branchId === "all" ? tx(copy.scopeGroup) : getBranchName(app.branchId, app.locale);
  return (
    <>
      <PageHead
        eyebrow={
          <>
            <FlaskConical /> {tx(copy.eyebrow)} · {scope}
          </>
        }
        title={tx(title)}
        subtitle={tx(subtitle)}
        actions={actions}
      />
      <HrNav />
      {children}
      <Notice icon={<FlaskConical />}>{tx(copy.demoNotice)}</Notice>
    </>
  );
}

export function PersonCell({ employee }: { employee: Employee }) {
  const { nameOf, jobOf } = useHrUi();
  return (
    <div className="cell-main">
      <Avatar name={nameOf(employee)} />
      <div>
        <b>{nameOf(employee)}</b>
        <span>{jobOf(employee)}</span>
      </div>
    </div>
  );
}

export const STATUS_TONE: Record<string, Tone | "outline"> = {
  present: "mint",
  late: "lime",
  absent: "peach",
  leave: "sky",
  excused: "lilac",
  off: "sand",
  holiday: "sand",
  upcoming: "outline",
};

export function AttendanceBadge({ status }: { status: keyof typeof hrCopy.attendanceStatus }) {
  const { tx, copy } = useHrUi();
  return <Badge tone={STATUS_TONE[status]}>{tx(copy.attendanceStatus[status])}</Badge>;
}

export const RUN_TONE = { draft: "sand", approved: "sky", paid: "lilac", posted: "mint" } as const;
