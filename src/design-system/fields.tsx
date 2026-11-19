import {
  forwardRef,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { ChevronDown } from "lucide-react";
import { cx } from "@/design-system/cx";

interface FieldFrameProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FieldFrame({
  label,
  error,
  hint,
  required,
  className,
  children,
}: FieldFrameProps) {
  return (
    <div className={cx("ds-field", className)}>
      <span className="ds-field-label">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </span>
      {children}
      {error ? (
        <span className="ds-field-error" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="ds-field-hint">{hint}</span>
      ) : null}
    </div>
  );
}

export const TextInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function TextInput({ className, ...props }, ref) {
  return <input ref={ref} className={cx("ds-input", className)} {...props} />;
});
TextInput.displayName = "TextInput";

export const TextArea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function TextArea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cx("ds-input ds-textarea", className)}
      {...props}
    />
  );
});
TextArea.displayName = "TextArea";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...props }, ref) {
  return (
    <span className="ds-select-wrap">
      <select
        ref={ref}
        className={cx("ds-input ds-select", className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown size={15} aria-hidden="true" className="ds-select-icon" />
    </span>
  );
});
Select.displayName = "Select";
