"use client";

import Link from "next/link";
import { ArrowUpLeft, ArrowUpRight, CalendarDays, CreditCard, FileText, UserRound, type LucideIcon } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { RECENT_ACTIVITIES } from "@/lib/mock/dashboard-data";
import { messages } from "@/lib/i18n/messages";
import { getBranchName } from "@/lib/clinic-utils";
import { cn } from "@/lib/utils";
import type { RecentActivity as RecentActivityRecord } from "@/types";

const ACTIVITY_ICON: Record<RecentActivityRecord["type"], LucideIcon> = {
  payment: CreditCard,
  patient: UserRound,
  appointment: CalendarDays,
  report: FileText,
};

export function RecentActivity() {
  const { locale, branchId } = useWorkspace();
  const t = messages[locale].dashboard;
  const ArrowIcon = locale === "ar" ? ArrowUpLeft : ArrowUpRight;
  const activityCopy: Record<RecentActivityRecord["type"], { title: string; detail: string }> = {
    payment: { title: t.demoPaymentTitle, detail: t.demoPaymentDetail },
    patient: { title: t.demoPatientTitle, detail: t.demoPatientDetail },
    appointment: { title: t.demoAppointmentTitle, detail: t.demoAppointmentDetail },
    report: { title: t.demoReportTitle, detail: t.demoReportDetail },
  };
  const activities = RECENT_ACTIVITIES.filter(
    (activity) => branchId === "all" || activity.branchId === branchId,
  );

  return (
    <Panel className="dashboard-panel spatial-activity-panel">
      <div className="panel-heading">
        <div className="panel-title-block">
          <h2 className="panel-title">{t.recentActivity}</h2>
          <p className="panel-description">{t.anonymousDemoActivity}</p>
        </div>
        <Link className="panel-action" href={`/${locale}/notifications`}>
          {messages[locale].app.viewAll}
          <ArrowIcon size={13} aria-hidden="true" />
        </Link>
      </div>
      <div className="activity-list">
        {activities.map((activity) => {
          const Icon = ACTIVITY_ICON[activity.type];
          const copy = activityCopy[activity.type];
          return (
            <div className="activity-item" key={activity.id}>
              <span className={cn("activity-avatar", `accent-${activity.accent}`)} aria-hidden="true">
                <Icon size={14} />
              </span>
              <span className="activity-copy">
                <span className="activity-title">{copy.title}</span>
                <span className="activity-detail">{copy.detail} · {getBranchName(activity.branchId, locale)}</span>
              </span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
