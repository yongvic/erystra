"use client";

import React, { useId, useState } from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string; // Prop for external error messages
  onValidate?: (value: string) => string | undefined; // Custom validation function
  // Additional props for styling if needed, e.g., 'className'
}

export function InputField({ label, id, type = 'text', error, onValidate, className, ...props }: InputFieldProps) {
  const [internalError, setInternalError] = useState<string | undefined>(undefined);
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (onValidate) {
      setInternalError(onValidate(e.target.value));
    }
    if (props.onBlur) props.onBlur(e); // Call original onBlur if provided
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Re-validate if an error is currently displayed to clear it in real-time
    if (internalError && onValidate) {
      setInternalError(onValidate(e.target.value));
    }
    if (props.onChange) props.onChange(e); // Call original onChange if provided
  };

  const displayError = error || internalError; // Prioritize external error prop

  return (
    <div className="form-group">
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        type={type}
        className={`${displayError ? 'input-error' : ''} ${className || ''}`}
        aria-invalid={displayError ? "true" : "false"}
        aria-describedby={displayError ? errorId : props["aria-describedby"]}
        onBlur={handleBlur}
        onChange={handleChange}
        {...props}
      />
      {displayError && (
        <p id={errorId} className="error-message" role="alert">
          {displayError}
        </p>
      )}
    </div>
  );
}
