"use client";

import { CalendarDays, CreditCard, UserCheck, UsersRound, Wallet } from "lucide-react";
import type { DashboardMetric, Locale } from "@/types";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Panel } from "@/components/ui/panel";

const iconByMetric = {
  revenue: Wallet,
  collected: CreditCard,
  appointments: CalendarDays,
  newPatients: UsersRound,
  returningPatients: UserCheck,
};

const accentByMetric = {
  revenue: "teal",
  collected: "blue",
  appointments: "violet",
  newPatients: "amber",
  returningPatients: "teal",
};

export function MetricGrid({
  metrics,
  locale,
  labels,
}: {
  metrics: DashboardMetric[];
  locale: Locale;
  labels: {
    revenue: string;
    collected: string;
    appointments: string;
    newPatients: string;
    returningPatients: string;
    revenueDescription: string;
    collectedDescription: string;
    appointmentsDescription: string;
    newPatientsDescription: string;
    returningPatientsDescription: string;
  };
}) {
  const descriptions = {
    revenue: labels.revenueDescription,
    collected: labels.collectedDescription,
    appointments: labels.appointmentsDescription,
    newPatients: labels.newPatientsDescription,
    returningPatients: labels.returningPatientsDescription,
  };
  const titles = {
    revenue: labels.revenue,
    collected: labels.collected,
    appointments: labels.appointments,
    newPatients: labels.newPatients,
    returningPatients: labels.returningPatients,
  };

  return (
    <div className="metric-grid">
      {metrics.map((metric) => {
        const Icon = iconByMetric[metric.id];
        const accent = accentByMetric[metric.id];
        const isRevenue = metric.id === "revenue" || metric.id === "collected";
        const value = isRevenue
          ? formatCurrency(metric.value, locale)
          : formatNumber(metric.value, locale);
        return (
          <Panel className="metric-card" key={metric.id}>
            <div className="metric-card-top">
              <span className="metric-card-title">{titles[metric.id]}</span>
              <span className={`metric-icon metric-icon-${accent}`}>
                <Icon size={17} strokeWidth={1.9} />
              </span>
            </div>
            <div className="metric-value-row">
              <strong className="metric-value" dir="auto">
                {value}
              </strong>
            </div>
            <span className="metric-description">{descriptions[metric.id]}</span>
          </Panel>
        );
      })}
    </div>
  );
}
