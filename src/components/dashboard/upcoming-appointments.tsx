"use client";

import Link from "next/link";
import { ArrowUpLeft, ArrowUpRight } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { UPCOMING_APPOINTMENTS } from "@/lib/mock/dashboard-data";
import { BRANCHES } from "@/lib/mock/branches";
import { messages } from "@/lib/i18n/messages";
import { canAccessModule } from "@/lib/config/roles";
import type { BranchId } from "@/types";
import { cn } from "@/lib/utils";

export function UpcomingAppointments() {
  const { locale, branchId, searchQuery, role } = useWorkspace();
  const t = messages[locale].dashboard;
  const branchMessages = messages[locale].branches;
  const query = searchQuery.trim().toLocaleLowerCase();
  const items = UPCOMING_APPOINTMENTS.filter((appointment) => {
    const inBranch = branchId === "all" || appointment.branchId === branchId;
    const matchesSearch =
      !query ||
      [
        appointment.patient,
        appointment.patientEn,
        appointment.service,
        appointment.serviceEn,
        appointment.therapist,
        appointment.therapistEn,
      ].some((value) => value.toLocaleLowerCase().includes(query));
    return inBranch && matchesSearch;
  });
  const statusLabels = {
    confirmed: t.confirmed,
    checkedIn: t.checkedIn,
    inSession: t.inSession,
  };

  function getBranchName(id: BranchId) {
    if (id === "all") return branchMessages.all;
    const branch = BRANCHES.find((item) => item.id === id);
    return branch ? (locale === "ar" ? branch.nameAr : branch.nameEn) : "";
  }

  const ArrowIcon = locale === "ar" ? ArrowUpLeft : ArrowUpRight;

  return (
    <Panel className="dashboard-panel">
      <div className="panel-heading">
        <div className="panel-title-block">
          <h2 className="panel-title">{t.upcomingAppointments}</h2>
          <p className="panel-description">
            {searchQuery ? `${items.length} ${messages[locale].app.searchResults}` : t.scheduleHint}
          </p>
        </div>
        {canAccessModule(role, "appointments") ? (
          <Link className="panel-action" href={`/${locale}/appointments`}>
            {t.viewSchedule}
            <ArrowIcon size={13} />
          </Link>
        ) : null}
      </div>

      {items.length ? (
        <div className="appointment-list">
          {items.map((appointment) => (
            <div className="appointment-row" key={appointment.id}>
              <span className="appointment-time">{appointment.time}</span>
              <div className="appointment-person">
                <span className={cn("person-avatar", `accent-${appointment.accent}`)}>
                  {locale === "ar" ? appointment.initials : appointment.initialsEn}
                </span>
                <span className="appointment-copy">
                  <span className="appointment-name">
                    {locale === "ar" ? appointment.patient : appointment.patientEn}
                  </span>
                  <span className="appointment-meta">
                    {locale === "ar" ? appointment.service : appointment.serviceEn} · {locale === "ar" ? appointment.therapist : appointment.therapistEn}
                  </span>
                </span>
              </div>
              <span className="appointment-side">
                <span className={cn("status-badge", `status-${appointment.status}`)}>
                  {statusLabels[appointment.status]}
                </span>
                {branchId === "all" ? (
                  <span className="branch-chip">{getBranchName(appointment.branchId)}</span>
                ) : null}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-appointments">{t.emptyAppointments}</div>
      )}
    </Panel>
  );
}
