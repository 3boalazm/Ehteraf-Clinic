"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BranchRevenue, Locale } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Panel } from "@/components/ui/panel";

export function RevenueChart({
  data,
  locale,
  title,
  description,
  invoicedLabel,
  collectedLabel,
}: {
  data: BranchRevenue[];
  locale: Locale;
  title: string;
  description: string;
  invoicedLabel: string;
  collectedLabel: string;
}) {
  const currencyShort = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}m`;
    if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
    return String(value);
  };

  return (
    <Panel className="dashboard-panel">
      <div className="panel-heading">
        <div className="panel-title-block">
          <h2 className="panel-title">{title}</h2>
          <p className="panel-description">{description}</p>
        </div>
        <div className="chart-legend" aria-label={`${invoicedLabel}, ${collectedLabel}`}>
          <span className="chart-legend-item">
            <span className="legend-swatch legend-invoiced" />
            {invoicedLabel}
          </span>
          <span className="chart-legend-item">
            <span className="legend-swatch legend-collected" />
            {collectedLabel}
          </span>
        </div>
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 4, left: -16, bottom: 2 }}
            barCategoryGap={data.length === 1 ? "65%" : "38%"}
          >
            <CartesianGrid
              vertical={false}
              stroke="hsl(var(--border))"
              strokeDasharray="3 5"
            />
            <XAxis
              dataKey="branchName"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
              tickMargin={10}
              interval={0}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={42}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 8 }}
              tickFormatter={currencyShort}
              tickMargin={5}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted) / 0.55)" }}
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
                        <strong>{formatCurrency(Number(item.value), locale)}</strong>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            <Bar
              dataKey="invoiced"
              name={invoicedLabel}
              fill="hsl(var(--primary))"
              radius={[5, 5, 0, 0]}
              maxBarSize={34}
            />
            <Bar
              dataKey="collected"
              name={collectedLabel}
              fill="hsl(var(--blue))"
              radius={[5, 5, 0, 0]}
              maxBarSize={34}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
