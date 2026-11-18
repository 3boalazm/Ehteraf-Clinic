import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Panel({ className, children, ...props }: PanelProps) {
  return (
    <section
      className={cn(
        "ui-panel rounded-2xl border border-border bg-card shadow-card",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}
