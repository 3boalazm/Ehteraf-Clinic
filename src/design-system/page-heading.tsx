import type { ReactNode } from "react";

export function PageHeading({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="ds-page-heading">
      <div className="ds-page-heading-copy">
        {eyebrow ? <span className="ds-eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? (
        <div className="ds-page-heading-actions">{actions}</div>
      ) : null}
    </header>
  );
}
