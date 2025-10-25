import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";

import clsx from "clsx";

export interface PinInputProps {
  value: string;
  onChange: (val: string) => void;
  length?: number;
  disabled?: boolean;
}

/**
 * Methods exposed via ref:
 * - focus: focus a specific input index
 * - clear: clear all inputs and focus first
 */
export interface PinInputRef {
  focus: (index: number) => void;
  clear: () => void;
}

const PinInput = forwardRef<PinInputRef, PinInputProps>(
  ({ value, onChange, length = 6, disabled = false }, ref) => {
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

    // Expose imperative methods
    useImperativeHandle(ref, () => ({
      focus: (idx: number) => {
        inputsRef.current[idx]?.focus();
      },
      clear: () => {
        onChange("".padStart(length, ""));
        inputsRef.current[0]?.focus();
      },
    }));

    const handleChange = useCallback(
      (val: string, idx: number) => {
        if (!/^\d?$/.test(val)) return;
        const newValue = value.split("");
        newValue[idx] = val;
        onChange(newValue.join(""));
        if (val && idx < length - 1) {
          inputsRef.current[idx + 1]?.focus();
        }
      },
      [value, onChange, length]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
        if (e.key === "Backspace") {
          e.preventDefault();
          const newValue = value.split("");
          if (newValue[idx]) {
            newValue[idx] = "";
            onChange(newValue.join(""));
          } else if (idx > 0) {
            inputsRef.current[idx - 1]?.focus();
            newValue[idx - 1] = "";
            onChange(newValue.join(""));
          }
        }
      },
      [value, onChange]
    );

    const handlePaste = useCallback(
      (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").trim();
        if (pasted.length === length && /^\d+$/.test(pasted)) {
          onChange(pasted);
          inputsRef.current[length - 1]?.focus();
        }
      },
      [onChange, length]
    );

    useEffect(() => {
      if (!disabled) {
        inputsRef.current[0]?.focus();
      }
    }, [disabled]);

    return (
      <div className="flex justify-center gap-4 p-4 mb-4 border text-title-16-semibold rounded-xl border-border-2 bg-background-1 text-neutral-9">
        {Array.from({ length }).map((_, i) => {
          const isFilled = Boolean(value[i]);
          return (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={value[i] || ""}
              disabled={disabled}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={handlePaste}
              className={clsx(
                "size-5 bg-transparent text-center",
                "border-b-2 focus:border-primary-6 focus:outline-none",
                isFilled ? "text-neutral-9" : "border-neutral-3",
                "caret-primary-6"
              )}
            />
          );
        })}
      </div>
    );
  }
);

PinInput.displayName = "PinInput";

export default PinInput;
