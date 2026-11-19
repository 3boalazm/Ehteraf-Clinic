import type { ReactNode } from "react";
import { ArrowUpRight, FileSearch } from "lucide-react";
import { Card } from "@/design-system/card";

export function SectionHeading({
  title,
  description,
  action,
  eyebrow,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="ds-section-heading">
      <div>
        {eyebrow ? <span className="ds-eyebrow">{eyebrow}</span> : null}
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {action ? <div className="ds-section-action">{action}</div> : null}
    </div>
  );
}

export function StatBlock({
  label,
  value,
  detail,
  icon,
  tone = "teal",
}: {
  label: string;
  value: string;
  detail?: string;
  icon?: ReactNode;
  tone?: "teal" | "clay" | "brass" | "ink";
}) {
  return (
    <Card className={`ds-stat ds-stat-${tone}`}>
      <div className="ds-stat-top">
        <span>{label}</span>
        {icon ? <span className="ds-stat-icon">{icon}</span> : null}
      </div>
      <strong dir="auto">{value}</strong>
      {detail ? <small>{detail}</small> : null}
    </Card>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="ds-empty-state">
      <span className="ds-empty-symbol">
        <FileSearch size={20} />
      </span>
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      {action ? (
        <div className="ds-empty-action">
          {action}
          <ArrowUpRight size={14} aria-hidden="true" />
        </div>
      ) : null}
    </div>
  );
}

export function DataTableFrame({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`ds-table-frame ${className}`}>{children}</div>;
}
