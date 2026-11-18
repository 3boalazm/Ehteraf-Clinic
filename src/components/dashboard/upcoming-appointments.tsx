"use client";

import Link from "next/link";
import { ArrowUpLeft, ArrowUpRight, CalendarDays } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { useClinicData } from "@/services/clinic-data-provider";
import { canAccessModule } from "@/lib/config/roles";
import { messages } from "@/lib/i18n/messages";
import { DEMO_TODAY } from "@/lib/mock/clinic-seed";
import { getBranchName, getServiceName, getTherapistName, matchesServiceFilter } from "@/lib/clinic-utils";
import { cn } from "@/lib/utils";
import type { AppointmentStatus, DateRange, ServiceFilter } from "@/types";

const ACTIVE_STATUSES = new Set<AppointmentStatus>(["booked", "confirmed", "checkedIn", "inSession"]);

function getPeriodEnd(range: DateRange): string {
  const date = new Date(`${DEMO_TODAY}T12:00:00.000Z`);
  if (range === "week") {
    date.setUTCDate(date.getUTCDate() + ((7 - date.getUTCDay()) % 7));
  } else if (range === "month") {
    date.setUTCMonth(date.getUTCMonth() + 1, 0);
  } else {
    const quarterStartMonth = Math.floor(date.getUTCMonth() / 3) * 3;
    date.setUTCMonth(quarterStartMonth + 3, 0);
  }
  return date.toISOString().slice(0, 10);
}

export function UpcomingAppointments({ range, service }: { range: DateRange; service: ServiceFilter }) {
  const { locale, branchId, searchQuery, role } = useWorkspace();
  const { appointments } = useClinicData();
  const t = messages[locale].dashboard;
  const query = searchQuery.trim().toLocaleLowerCase();
  const periodEnd = getPeriodEnd(range);
  const items = appointments
    .filter((appointment) => appointment.date >= DEMO_TODAY && appointment.date <= periodEnd)
    .filter((appointment) => branchId === "all" || appointment.branchId === branchId)
    .filter((appointment) => matchesServiceFilter(appointment.serviceId, service))
    .filter((appointment) => ACTIVE_STATUSES.has(appointment.status))
    .filter((appointment) => {
      if (!query) return true;
      const searchableValues = [
        getServiceName(appointment.serviceId, "ar"),
        getServiceName(appointment.serviceId, "en"),
        getTherapistName(appointment.therapistId, "ar"),
        getTherapistName(appointment.therapistId, "en"),
        getBranchName(appointment.branchId, "ar"),
        getBranchName(appointment.branchId, "en"),
        appointment.time,
      ];
      return searchableValues.some((value) => value.toLocaleLowerCase().includes(query));
    })
    .sort((left, right) => `${left.date}${left.time}`.localeCompare(`${right.date}${right.time}`))
    .slice(0, 5);
  const ArrowIcon = locale === "ar" ? ArrowUpLeft : ArrowUpRight;

  return (
    <Panel className="dashboard-panel spatial-upcoming-panel">
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
            <ArrowIcon size={13} aria-hidden="true" />
          </Link>
        ) : null}
      </div>

      {items.length ? (
        <div className="appointment-list">
          {items.map((appointment, index) => {
            const status = appointment.status === "checkedIn"
              ? t.checkedIn
              : appointment.status === "inSession"
                ? t.inSession
                : t.confirmed;
            const accent = ["teal", "violet", "blue", "amber", "teal"][index];
            return (
              <div className="appointment-row" key={appointment.id}>
                <span className="appointment-time" dir="ltr">{appointment.time}</span>
                <div className="appointment-person">
                  <span className={cn("person-avatar", `accent-${accent}`)} aria-hidden="true">
                    <CalendarDays size={14} />
                  </span>
                  <span className="appointment-copy">
                    <span className="appointment-name">{getServiceName(appointment.serviceId, locale)}</span>
                    <span className="appointment-meta">{getTherapistName(appointment.therapistId, locale)}</span>
                  </span>
                </div>
                <span className="appointment-side">
                  <span className={cn("status-badge", `status-${appointment.status === "booked" ? "confirmed" : appointment.status}`)}>
                    {status}
                  </span>
                  <span className="branch-chip">{getBranchName(appointment.branchId, locale)}</span>
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-appointments">{t.emptyAppointments}</div>
      )}
    </Panel>
  );
}
