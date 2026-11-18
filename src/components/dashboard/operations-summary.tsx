"use client";

import { Activity, Clock, FileText } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import { formatNumber } from "@/lib/utils";
import type { Locale } from "@/types";

export function OperationsSummary({
  noShowRate,
  occupancy,
  pendingReports,
  locale,
  labels,
}: {
  noShowRate: number;
  occupancy: number;
  pendingReports: number;
  locale: Locale;
  labels: {
    title: string;
    hint: string;
    noShowRate: string;
    noShowDescription: string;
    therapistOccupancy: string;
    occupancyDescription: string;
    pendingReports: string;
    pendingReportsDescription: string;
  };
}) {
  return (
    <Panel className="dashboard-panel spatial-operations-panel">
      <div className="panel-heading">
        <div className="panel-title-block">
          <h2 className="panel-title">{labels.title}</h2>
          <p className="panel-description">{labels.hint}</p>
        </div>
        <span className="operations-heading-icon" aria-hidden="true"><Activity size={15} /></span>
      </div>

      <div className="operations-stack">
        <div className="operation-stat">
          <span className="operation-stat-icon operation-icon-amber" aria-hidden="true">
            <Activity size={17} />
          </span>
          <span className="operation-stat-copy">
            <span className="operation-stat-title">{labels.noShowRate}</span>
            <span className="operation-stat-hint">{labels.noShowDescription}</span>
          </span>
          <strong className="operation-stat-value" dir="ltr">{formatNumber(noShowRate, locale)}%</strong>
          <div className="operation-progress-wrap">
            <div
              className="operation-progress"
              role="progressbar"
              aria-label={labels.noShowRate}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={noShowRate}
            >
              <div
                className="operation-progress-bar operation-progress-bar-amber"
                style={{ width: `${Math.max(0, Math.min(noShowRate, 100))}%` }}
              />
            </div>
          </div>
        </div>

        <div className="operation-stat">
          <span className="operation-stat-icon operation-icon-teal" aria-hidden="true">
            <Clock size={17} />
          </span>
          <span className="operation-stat-copy">
            <span className="operation-stat-title">{labels.therapistOccupancy}</span>
            <span className="operation-stat-hint">{labels.occupancyDescription}</span>
          </span>
          <strong className="operation-stat-value" dir="ltr">{formatNumber(occupancy, locale)}%</strong>
          <div className="operation-progress-wrap">
            <div
              className="operation-progress"
              role="progressbar"
              aria-label={labels.therapistOccupancy}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={occupancy}
            >
              <div className="operation-progress-bar" style={{ width: `${Math.max(0, Math.min(occupancy, 100))}%` }} />
            </div>
          </div>
        </div>

        <div className="pending-report-row">
          <span className="operation-stat-icon operation-icon-violet" aria-hidden="true">
            <FileText size={17} />
          </span>
          <span className="operation-stat-copy">
            <span className="operation-stat-title">{labels.pendingReports}</span>
            <span className="operation-stat-hint">{labels.pendingReportsDescription}</span>
          </span>
          <strong className="operation-stat-value" dir="auto">{formatNumber(pendingReports, locale)}</strong>
        </div>
      </div>
    </Panel>
  );
}
