import React, { useCallback, useRef } from "react";

import clsx from "clsx";

interface OtpInputProps {
  value: string;
  onChange: (val: string) => void;
  length?: number;
  disabled?: boolean;
}

const OtpInput: React.FC<OtpInputProps> = ({ value, onChange, length = 6, disabled = false }) => {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

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

  return (
    <div className="flex justify-center gap-2 mb-4">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          value={value[i] || ""}
          onChange={(e) => handleChange(e.target.value, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          className={clsx(
            "h-12 w-10 rounded-md border bg-background-base text-center text-neutral-10",
            "focus:outline-none focus:ring-1 focus:ring-primary-6",
            value[i] ? "border-primary-6" : "border-neutral-2"
          )}
        />
      ))}
    </div>
  );
};

export default React.memo(OtpInput);
