"use client";

import { forwardRef, InputHTMLAttributes, ReactNode } from "react";

interface StyledInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  rightElement?: ReactNode;
  label: string;
  error?: string;
}

export const StyledInput = forwardRef<HTMLInputElement, StyledInputProps>(
  ({ icon, rightElement, label, error, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="field">
        <label htmlFor={inputId} className="field__label">
          {label}
        </label>
        <div className={`field__control ${error ? "field__control--error" : ""}`}>
          {icon && <span className="field__icon">{icon}</span>}
          <input
            ref={ref}
            id={inputId}
            className="field__input"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          {rightElement && <span className="field__right">{rightElement}</span>}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="field__error-text" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

StyledInput.displayName = "StyledInput";
