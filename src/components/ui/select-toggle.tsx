import { SelectHTMLAttributes, forwardRef } from "react";

interface StyledSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
}

export const StyledSelect = forwardRef<HTMLSelectElement, StyledSelectProps>(
  ({ label, options, id, ...props }, ref) => {
    const selectId = id ?? props.name;
    return (
      <div className="field">
        <label htmlFor={selectId} className="field__label">
          {label}
        </label>
        <select ref={ref} id={selectId} className="field__select" {...props}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);

StyledSelect.displayName = "StyledSelect";

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="toggle">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`toggle__track ${checked ? "toggle__track--on" : ""}`}
        onClick={() => onChange(!checked)}
      >
        <span className="toggle__thumb" />
      </button>
      <span className="toggle__label">{label}</span>
    </label>
  );
}
