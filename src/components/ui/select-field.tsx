import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  compact?: boolean;
  className?: string;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  function SelectField(
    { label, compact = false, className, children, ...props },
    ref,
  ) {
    return (
      <label className={cn("select-field", compact && "select-field-compact", className)}>
        {label ? <span className="select-field-label">{label}</span> : null}
        <span className="select-field-control">
          <select ref={ref} {...props}>
            {children}
          </select>
          <ChevronDown aria-hidden="true" className="select-field-chevron" size={15} />
        </span>
      </label>
    );
  },
);

SelectField.displayName = "SelectField";
