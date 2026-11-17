"use client";

import { Activity, Clock, FileText } from "lucide-react";
import { Panel } from "@/components/ui/panel";

export function OperationsSummary({
  noShowRate,
  occupancy,
  pendingReports,
  labels,
}: {
  noShowRate: number;
  occupancy: number;
  pendingReports: number;
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
    <Panel className="dashboard-panel">
      <div className="panel-heading">
        <div className="panel-title-block">
          <h2 className="panel-title">{labels.title}</h2>
          <p className="panel-description">{labels.hint}</p>
        </div>
        <span className="operations-live-indicator" aria-hidden="true" />
      </div>

      <div className="operations-stack">
        <div className="operation-stat">
          <span className="operation-stat-icon operation-icon-amber">
            <Activity size={17} />
          </span>
          <span className="operation-stat-copy">
            <span className="operation-stat-title">{labels.noShowRate}</span>
            <span className="operation-stat-hint">{labels.noShowDescription}</span>
          </span>
          <strong className="operation-stat-value" dir="ltr">{noShowRate}%</strong>
          <div className="operation-progress-wrap">
            <div className="operation-progress" aria-label={`${noShowRate}%`}>
              <div
                className="operation-progress-bar operation-progress-bar-amber"
                style={{ width: `${Math.min(noShowRate * 5, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="operation-stat">
          <span className="operation-stat-icon operation-icon-teal">
            <Clock size={17} />
          </span>
          <span className="operation-stat-copy">
            <span className="operation-stat-title">{labels.therapistOccupancy}</span>
            <span className="operation-stat-hint">{labels.occupancyDescription}</span>
          </span>
          <strong className="operation-stat-value" dir="ltr">{occupancy}%</strong>
          <div className="operation-progress-wrap">
            <div className="operation-progress" aria-label={`${occupancy}%`}>
              <div className="operation-progress-bar" style={{ width: `${occupancy}%` }} />
            </div>
          </div>
        </div>

        <div className="pending-report-row">
          <span className="operation-stat-icon operation-icon-violet">
            <FileText size={17} />
          </span>
          <span className="operation-stat-copy">
            <span className="operation-stat-title">{labels.pendingReports}</span>
            <span className="operation-stat-hint">{labels.pendingReportsDescription}</span>
          </span>
          <strong className="operation-stat-value">{pendingReports}</strong>
        </div>
      </div>
    </Panel>
  );
}
