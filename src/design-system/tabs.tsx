import type { ReactNode } from "react";
import { cx } from "@/design-system/cx";

export function Tabs({
  items,
  value,
  onChange,
  label,
}: {
  items: Array<{ id: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <div className="ds-tabs" role="tablist" aria-label={label}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={value === item.id}
          tabIndex={value === item.id ? 0 : -1}
          className={cx("ds-tab", value === item.id && "ds-tab-active")}
          onClick={() => onChange(item.id)}
          onKeyDown={(event) => {
            if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
            event.preventDefault();
            const index = items.findIndex(
              (candidate) => candidate.id === value,
            );
            const step = event.key === "ArrowRight" ? 1 : -1;
            onChange(items[(index + step + items.length) % items.length].id);
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function WithIcon({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <span className="ds-with-icon">
      {icon}
      {children}
    </span>
  );
}
