"use client";

import Link from "next/link";
import { ArrowUpLeft, ArrowUpRight } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { RECENT_ACTIVITIES } from "@/lib/mock/dashboard-data";
import { messages } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils";

export function RecentActivity() {
  const { locale, branchId } = useWorkspace();
  const t = messages[locale].dashboard;
  const ArrowIcon = locale === "ar" ? ArrowUpLeft : ArrowUpRight;

  return (
    <Panel className="dashboard-panel">
      <div className="panel-heading">
        <div className="panel-title-block">
          <h2 className="panel-title">{t.recentActivity}</h2>
          <p className="panel-description">{t.recentActivityHint}</p>
        </div>
        <Link className="panel-action" href={`/${locale}/notifications`}>
          {messages[locale].app.viewAll}
          <ArrowIcon size={13} />
        </Link>
      </div>
      <div className="activity-list">
        {RECENT_ACTIVITIES.filter(
          (activity) => branchId === "all" || activity.branchId === branchId,
        ).map((activity) => (
          <div className="activity-item" key={activity.id}>
            <span className={cn("activity-avatar", `accent-${activity.accent}`)}>
              {locale === "ar" ? activity.initials : activity.initialsEn}
            </span>
            <span className="activity-copy">
              <span className="activity-title">
                {locale === "ar" ? activity.titleAr : activity.titleEn}
              </span>
              <span className="activity-detail">
                {locale === "ar" ? activity.detailAr : activity.detailEn}
              </span>
            </span>
            <span className="activity-time">
              {locale === "ar" ? activity.timeAr : activity.timeEn}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
