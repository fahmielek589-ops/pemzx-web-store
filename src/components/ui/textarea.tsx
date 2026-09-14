import { forwardRef, TextareaHTMLAttributes } from "react";

interface StyledTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const StyledTextarea = forwardRef<HTMLTextAreaElement, StyledTextareaProps>(
  ({ label, error, id, ...props }, ref) => {
    const areaId = id ?? props.name;
    return (
      <div className="field">
        <label htmlFor={areaId} className="field__label">
          {label}
        </label>
        <textarea
          ref={ref}
          id={areaId}
          className={`field__textarea ${error ? "field__control--error" : ""}`}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {error && (
          <p className="field__error-text" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

StyledTextarea.displayName = "StyledTextarea";
