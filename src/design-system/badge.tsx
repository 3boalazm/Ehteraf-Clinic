import type { HTMLAttributes } from "react";
import { cx } from "@/design-system/cx";

type Tone = "neutral" | "teal" | "success" | "warning" | "danger" | "blue";

export function Badge({
  tone = "neutral",
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span className={cx("ds-badge", `ds-badge-${tone}`, className)} {...props}>
      {children}
    </span>
  );
}
