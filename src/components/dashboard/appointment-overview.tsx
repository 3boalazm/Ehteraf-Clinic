"use client";

import { useMemo } from "react";
import { UsersRound } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { useClinicData } from "@/services/clinic-data-provider";
import { messages } from "@/lib/i18n/messages";
import { CLINIC_THERAPISTS, DEMO_TODAY } from "@/lib/mock/clinic-seed";
import { getInitials, matchesServiceFilter } from "@/lib/clinic-utils";
import { cn, formatNumber } from "@/lib/utils";
import type { AppointmentStatus, ServiceFilter } from "@/types";

const NON_VISIT_STATUSES = new Set<AppointmentStatus>(["cancelled", "noShow"]);

export function TodayClinicians({ service }: { service: ServiceFilter }) {
  const { locale, branchId } = useWorkspace();
  const { appointments } = useClinicData();
  const t = messages[locale].dashboard;
  const todayCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const appointment of appointments) {
      if (appointment.date !== DEMO_TODAY || NON_VISIT_STATUSES.has(appointment.status)) continue;
      if (branchId !== "all" && appointment.branchId !== branchId) continue;
      if (!matchesServiceFilter(appointment.serviceId, service)) continue;
      counts.set(appointment.therapistId, (counts.get(appointment.therapistId) ?? 0) + 1);
    }
    return counts;
  }, [appointments, branchId, service]);
  const clinicians = CLINIC_THERAPISTS
    .filter((therapist) => branchId === "all" || therapist.branchId === branchId)
    .map((therapist) => ({ therapist, count: todayCounts.get(therapist.id) ?? 0 }))
    .sort((left, right) => right.count - left.count || left.therapist.nameEn.localeCompare(right.therapist.nameEn))
    .slice(0, 3);

  return (
    <Panel className="dashboard-panel clinicians-panel">
      <div className="panel-heading">
        <div className="panel-title-block">
          <h2 className="panel-title">{t.todayClinicians}</h2>
          <p className="panel-description">{t.scheduleHint}</p>
        </div>
        <span className="clinicians-heading-icon"><UsersRound size={16} aria-hidden="true" /></span>
      </div>
      <div className="clinician-list">
        {clinicians.map(({ therapist, count }, index) => {
          const name = locale === "ar" ? therapist.nameAr : therapist.nameEn;
          return (
            <div className="clinician-row" key={therapist.id}>
              <span className={cn("clinician-avatar", `clinician-avatar-${index + 1}`)} aria-hidden="true">{getInitials(name)}</span>
              <span className="clinician-copy">
                <strong>{name}</strong>
                <small>{locale === "ar" ? therapist.specialtyAr : therapist.specialtyEn}</small>
              </span>
              <span className="clinician-count"><strong>{formatNumber(count, locale)}</strong><small>{t.scheduledToday}</small></span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
