"use client";

import Link from "next/link";
import { ArrowUpLeft, ArrowUpRight } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { useClinicData } from "@/services/clinic-data-provider";
import { canAccessModule } from "@/lib/config/roles";
import { messages } from "@/lib/i18n/messages";
import { DEMO_TODAY } from "@/lib/mock/clinic-seed";
import { getBranchName, getServiceName, getTherapistName } from "@/lib/clinic-utils";
import { cn } from "@/lib/utils";

export function UpcomingAppointments() {
  const { locale, branchId, searchQuery, role } = useWorkspace();
  const { appointments, patients } = useClinicData();
  const t = messages[locale].dashboard;
  const query = searchQuery.trim().toLocaleLowerCase();
  const activeStatuses = ["booked", "confirmed", "checkedIn", "inSession"];
  const items = appointments
    .filter((appointment) => appointment.date >= DEMO_TODAY)
    .filter((appointment) => branchId === "all" || appointment.branchId === branchId)
    .filter((appointment) => activeStatuses.includes(appointment.status))
    .map((appointment) => ({ appointment, patient: patients.find((item) => item.id === appointment.patientId) }))
    .filter(({ appointment, patient }) => {
      if (!query) return true;
      const patientName = patient ? `${patient.nameAr} ${patient.nameEn}` : "";
      return [
        patientName,
        patient?.id ?? "",
        getServiceName(appointment.serviceId, "ar"),
        getServiceName(appointment.serviceId, "en"),
        getTherapistName(appointment.therapistId, "ar"),
        getTherapistName(appointment.therapistId, "en"),
      ].some((value) => value.toLocaleLowerCase().includes(query));
    })
    .sort((left, right) => `${left.appointment.date}${left.appointment.time}`.localeCompare(`${right.appointment.date}${right.appointment.time}`))
    .slice(0, 5);
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
          {items.map(({ appointment, patient }, index) => {
            const patientName = patient
              ? locale === "ar" ? patient.nameAr : patient.nameEn || patient.nameAr
              : "—";
            const status = appointment.status === "checkedIn"
              ? t.checkedIn
              : appointment.status === "inSession"
                ? t.inSession
                : t.confirmed;
            const accent = ["teal", "violet", "blue", "amber", "teal"][index];
            return (
              <div className="appointment-row" key={appointment.id}>
                <span className="appointment-time">{appointment.time}</span>
                <div className="appointment-person">
                  <span className={cn("person-avatar", `accent-${accent}`)}>
                    {patientName.slice(0, 2)}
                  </span>
                  <span className="appointment-copy">
                    <span className="appointment-name">{patientName}</span>
                    <span className="appointment-meta">
                      {getServiceName(appointment.serviceId, locale)} · {getTherapistName(appointment.therapistId, locale)}
                    </span>
                  </span>
                </div>
                <span className="appointment-side">
                  <span className={cn("status-badge", `status-${appointment.status === "booked" ? "confirmed" : appointment.status}`)}>
                    {status}
                  </span>
                  {branchId === "all" ? <span className="branch-chip">{getBranchName(appointment.branchId, locale)}</span> : null}
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
