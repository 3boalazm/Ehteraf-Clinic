"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, CircleCheck, Download, FlaskConical, X } from "lucide-react";
import { accCopy, type Pair } from "@/lib/i18n/accounting-copy";
import {
  ACCOUNT_BY_CODE,
  agingTotals,
  balancesByAccount,
  filterEntries,
  naturalBalance,
  profitAndLoss,
  type Account,
  type JournalEntry,
  type PurchaseBill,
  type SalesInvoice,
} from "@/lib/mock/accounting-data";
import { getBranchName } from "@/lib/clinic-utils";
import { formatNumber } from "@/lib/utils";
import { useAccounting } from "@/services/accounting-provider";
import { useApp } from "@/shell/use-app";
import { Badge, Button, Card, CardHead, cx, IconButton, Notice, PageHead, Toast } from "@/ui";

/** Locale-aware translation of an `[ar, en]` pair plus number/date helpers. */
export function useAcc() {
  const app = useApp();
  const data = useAccounting();
  const { locale } = app;
  const tx = (pair: Pair): string => (locale === "ar" ? pair[0] : pair[1]);
  const num = (value: number) => formatNumber(Math.round(value), locale);
  const money = (value: number, decimals = 0) =>
    new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  const sar = (value: number, decimals = 0) => `${money(value, decimals)} ${locale === "ar" ? "ر.س" : "SAR"}`;
  const accountName = (code: string): string => {
    const account: Account | undefined = ACCOUNT_BY_CODE[code];
    return account ? (locale === "ar" ? account.nameAr : account.nameEn) : code;
  };
  const accountLabel = (code: string) => `${code} · ${accountName(code)}`;
  const entryMemo = (entry: JournalEntry) => (locale === "ar" ? entry.memoAr : entry.memoEn);
  return { app, data, tx, num, money, sar, accountName, accountLabel, entryMemo, locale, copy: accCopy };
}

/** Everything the accounting screens need, already limited to the selected branch. */
export function useScoped() {
  const acc = useAcc();
  const { data, app } = acc;
  const branch = app.branchId;
  return useMemo(() => {
    const inScope = <T extends { branchId: string }>(list: T[]) =>
      branch === "all" ? list : list.filter((item) => item.branchId === branch);
    const invoices: SalesInvoice[] = inScope(data.invoices);
    const bills: PurchaseBill[] = inScope(data.bills);
    const entries = filterEntries(data.entries, { branch });
    const balances = balancesByAccount(entries);
    const balanceOf = (code: string) => {
      const account = ACCOUNT_BY_CODE[code];
      return account ? naturalBalance(account, balances[code]) : 0;
    };
    return {
      invoices,
      bills,
      entries,
      balances,
      balanceOf,
      orders: inScope(data.orders),
      requests: inScope(data.requests),
      pnl: profitAndLoss(entries),
      arAging: agingTotals(invoices),
      apAging: agingTotals(bills),
    };
  }, [data.invoices, data.bills, data.entries, data.orders, data.requests, branch]);
}

const NAV: Array<{ key: keyof typeof accCopy.tabs; href: string }> = [
  { key: "overview", href: "/accounting" },
  { key: "sales", href: "/accounting/sales" },
  { key: "purchases", href: "/accounting/purchases" },
  { key: "ledger", href: "/accounting/ledger" },
  { key: "cash", href: "/accounting/cash" },
  { key: "assets", href: "/accounting/assets" },
  { key: "tax", href: "/accounting/tax" },
  { key: "reports", href: "/accounting/reports" },
];

export function AccountingNav() {
  const { app, tx, copy } = useAcc();
  const pathname = usePathname() ?? "";
  const rest = "/" + pathname.split("/").filter(Boolean).slice(1).join("/");
  return (
    <nav className="subnav" aria-label={tx(copy.title)}>
      {NAV.map((item) => {
        const active = item.href === "/accounting" ? rest === item.href : rest.startsWith(item.href);
        return (
          <Link
            key={item.key}
            href={app.href(item.href)}
            className="subnav__item"
            aria-current={active ? "page" : undefined}
          >
            {tx(copy.tabs[item.key])}
          </Link>
        );
      })}
    </nav>
  );
}

export function AccountingPage({
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
  const { app, tx, copy } = useAcc();
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
      <AccountingNav />
      {children}
      <Notice icon={<FlaskConical />}>{tx(copy.demoNotice)}</Notice>
    </>
  );
}

export function AmountCell({ value, decimals = 0, signed }: { value: number; decimals?: number; signed?: boolean }) {
  const { money } = useAcc();
  if (!value) return <span className="amt amt--zero">—</span>;
  return (
    <span className={cx("amt", signed && value < 0 && "amt--neg")}>
      {signed && value < 0 ? `(${money(Math.abs(value), decimals)})` : money(value, decimals)}
    </span>
  );
}

export function DocStatus({ paidAt, due }: { paidAt: string | null; due: string }) {
  const { tx, copy } = useAcc();
  if (paidAt) return <Badge tone="mint">{tx(copy.common.paid)}</Badge>;
  return due < "2026-11-17" ? <Badge tone="peach">{tx(copy.common.overdue)}</Badge> : <Badge tone="sky">{tx(copy.common.open)}</Badge>;
}

export function ZatcaBadge({ status }: { status: SalesInvoice["zatca"] }) {
  const { tx, copy } = useAcc();
  const tone = { cleared: "mint", reported: "sky", pending: "sand", rejected: "peach" } as const;
  return <Badge tone={tone[status]}>{tx(copy.zatca[status])}</Badge>;
}

/** Stacked bar showing aging buckets. */
export function AgingBar({ totals }: { totals: Record<string, number> }) {
  const { tx, sar, copy } = useAcc();
  const keys = ["current", "d1_30", "d31_60", "d61_plus"] as const;
  const sum = keys.reduce((total, key) => total + (totals[key] ?? 0), 0) || 1;
  return (
    <div className="stack" style={{ gap: 12 }}>
      <div className="aging" role="img" aria-label={keys.map((key) => `${tx(copy.aging[key])}: ${sar(totals[key] ?? 0)}`).join(", ")}>
        {keys.map((key) => (
          <i key={key} className={`aging__seg aging__seg--${key}`} style={{ flexGrow: Math.max(0.0001, (totals[key] ?? 0) / sum) }} />
        ))}
      </div>
      <div className="aging-legend">
        {keys.map((key) => (
          <div key={key}>
            <span className={`aging__dot aging__seg--${key}`} />
            <span className="t-small t-muted">{tx(copy.aging[key])}</span>
            <b>{sar(totals[key] ?? 0)}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

export function downloadCsv(filename: string, header: string[], rows: Array<Array<string | number>>) {
  const escape = (cell: string | number) => `"${String(cell).replace(/"/g, '""')}"`;
  const text = [header, ...rows].map((row) => row.map(escape).join(",")).join("\n");
  const blob = new Blob([`﻿${text}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function ExportButton({ onClick }: { onClick: () => void }) {
  const { tx, copy } = useAcc();
  return (
    <Button icon={<Download />} onClick={onClick}>
      {tx(copy.common.export)}
    </Button>
  );
}

export function Modal({
  title,
  hint,
  onClose,
  children,
  wide,
}: {
  title: string;
  hint?: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const { tx, copy } = useAcc();
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
      <Card className="modal__panel" >
        <div className="stack" style={{ gap: 16, width: wide ? "min(760px, 100%)" : undefined }}>
          <CardHead
            title={title}
            hint={hint}
            actions={
              <IconButton label={tx(copy.common.close)} size="sm" variant="soft" onClick={onClose}>
                <X />
              </IconButton>
            }
          />
          {children}
        </div>
      </Card>
    </div>
  );
}

export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(null), 2600);
    return () => window.clearTimeout(timer);
  }, [message]);
  const toast = message ? (
    <Toast>
      <CircleCheck size={16} /> {message}
    </Toast>
  ) : null;
  return { show: setMessage, toast };
}

export function Pager({
  page,
  pages,
  onPage,
  total,
  shown,
}: {
  page: number;
  pages: number;
  onPage: (page: number) => void;
  total: number;
  shown: number;
}) {
  const { num, tx, copy } = useAcc();
  return (
    <div className="pager">
      <span>
        {tx(copy.common.showing)} {num(shown)} {tx(copy.common.of)} {num(total)}
      </span>
      <div className="row">
        <IconButton label="‹" variant="soft" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          <ChevronLeft className="flip" />
        </IconButton>
        <span>
          {num(page)} / {num(pages)}
        </span>
        <IconButton label="›" variant="soft" size="sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>
          <ChevronRight className="flip" />
        </IconButton>
      </div>
    </div>
  );
}
