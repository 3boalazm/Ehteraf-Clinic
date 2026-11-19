import { forwardRef, type HTMLAttributes } from "react";
import { cx } from "@/design-system/cx";

export const Card = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  function Card({ className, ...props }, ref) {
    return (
      <section ref={ref} className={cx("ds-card", className)} {...props} />
    );
  },
);

Card.displayName = "Card";
