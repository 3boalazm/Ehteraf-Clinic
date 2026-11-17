"use client";

import { useId } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AppointmentTrendPoint, Locale } from "@/types";
import { formatNumber } from "@/lib/utils";
import { Panel } from "@/components/ui/panel";

export function AppointmentTrendChart({
  data,
  locale,
  title,
  description,
  appointmentsLabel,
  completedLabel,
}: {
  data: AppointmentTrendPoint[];
  locale: Locale;
  title: string;
  description: string;
  appointmentsLabel: string;
  completedLabel: string;
}) {
  const gradientId = `appointment-${useId().replace(/:/g, "")}`;

  return (
    <Panel className="dashboard-panel">
      <div className="panel-heading">
        <div className="panel-title-block">
          <h2 className="panel-title">{title}</h2>
          <p className="panel-description">{description}</p>
        </div>
        <div className="chart-legend">
          <span className="chart-legend-item">
            <span className="legend-swatch legend-invoiced" />
            {appointmentsLabel}
          </span>
          <span className="chart-legend-item">
            <span className="legend-swatch legend-collected" />
            {completedLabel}
          </span>
        </div>
      </div>
      <div className="chart-container chart-container-small">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 9, right: 2, left: -21, bottom: 0 }}>
            <defs>
              <linearGradient id={`${gradientId}-appointments`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.22} />
                <stop offset="92%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id={`${gradientId}-completed`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--blue))" stopOpacity={0.12} />
                <stop offset="92%" stopColor="hsl(var(--blue))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="hsl(var(--border))"
              strokeDasharray="3 5"
            />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
              tickMargin={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={35}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 8 }}
              tickFormatter={(value: number) => formatNumber(value, locale)}
            />
            <Tooltip
              cursor={{ stroke: "hsl(var(--border))", strokeDasharray: "4 4" }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="chart-tooltip" dir={locale}>
                    <span className="chart-tooltip-label">{label}</span>
                    {payload.map((item) => (
                      <div className="chart-tooltip-line" key={String(item.dataKey)}>
                        <span
                          className="chart-tooltip-dot"
                          style={{ background: String(item.color) }}
                        />
                        <span>{item.name}:</span>
                        <strong>{formatNumber(Number(item.value), locale)}</strong>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="appointments"
              name={appointmentsLabel}
              stroke="hsl(var(--primary))"
              strokeWidth={2.4}
              fill={`url(#${gradientId}-appointments)`}
              activeDot={{ r: 4.5, strokeWidth: 2, stroke: "hsl(var(--card))" }}
            />
            <Area
              type="monotone"
              dataKey="completed"
              name={completedLabel}
              stroke="hsl(var(--blue))"
              strokeWidth={2}
              fill={`url(#${gradientId}-completed)`}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "hsl(var(--card))" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
