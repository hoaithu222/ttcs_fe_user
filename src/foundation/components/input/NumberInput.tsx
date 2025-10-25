import React, { useCallback, useId, useMemo, useState } from "react";

import * as Form from "@radix-ui/react-form";
import clsx from "clsx";
import {
  NumberFormatValues,
  NumericFormat,
  NumericFormatProps,
  SourceInfo,
} from "react-number-format";

import { enhanceIcon } from "@/shared/utils/component.utils";

import Icon, { IconSize } from "../icons/Icon";
import type { InputSize } from "./inputs.consts";
import {
  BASE_INPUT_CLASS,
  BASE_INPUT_CLASS_ACTION,
  BASE_POSITION_CLASS,
  DISABLED_INPUT_CLASS,
  ERROR_INPUT_CLASS,
  ERROR_TEXT_CLASS,
  INPUT_SIZE,
  TEXT_SIZE,
} from "./inputs.consts";

const MAX_NUMBER_VALUE = 999999999999999;

export interface NumberInputProps extends Omit<NumericFormatProps, "onValueChange" | "onChange"> {
  name: string;
  label?: string;
  description?: string;
  error?: string;
  errorBorder?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  textSize?: "large" | "small";
  sizeInput?: keyof typeof InputSize | string;
  onChange: (value: number | undefined) => void;
  allowReturnUndefined?: boolean; // vẫn giữ để không phá API cũ (không dùng nữa trong flow mặc định)
  onValueChange?: (values: NumberFormatValues) => void;
  withStepper?: boolean;
  iconIncrease?: React.ReactNode;
  iconDecrease?: React.ReactNode;
  inputClassName?: string;
  className?: string;
  testId?: string;
  placeholder?: string;
  disabled?: boolean;
  step?: number;
  max?: number | string;
  min?: number | string;
  /** Giữ lại prop để không phá kiểu cũ, mặc định TRUE và được truyền xuống NumericFormat */
  allowNegative?: boolean;
  decimalScale?: number;
  maxLength?: number;
  iconSize?: IconSize;
  hideEmptyValue?: boolean;
  isRoundStep?: boolean;
  errorClassName?: string;
  signalAllow?: boolean;
  thousandSeparator?: boolean;
  onIncrementOverride?: (ctx: {
    current: number | "" | undefined;
    step: number;
  }) => number | undefined;
  onDecrementOverride?: (ctx: {
    current: number | "" | undefined;
    step: number;
  }) => number | undefined;
}

/* -------------------- Helpers CHỐNG LỖI SỐ THỰC -------------------- */
const decimalsOf = (n: number) => {
  const s = String(n);
  const i = s.indexOf(".");
  return i === -1 ? 0 : s.length - i - 1;
};
const computeScale = (stepValue: number, decimalScale?: number) =>
  Math.max(decimalScale ?? 0, decimalsOf(stepValue));

const roundTo = (v: number, scale: number) => {
  const f = 10 ** scale;
  return Math.round((v + Number.EPSILON) * f) / f;
};
/* ------------------------------------------------------------------ */

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      name,
      label,
      description,
      error,
      errorBorder,
      iconLeft,
      iconRight,
      textSize = "large",
      sizeInput = "full",
      value,
      onChange,
      onValueChange,
      placeholder = "Nhập số",
      disabled = false,
      step = 1,
      max = MAX_NUMBER_VALUE,
      min,
      // ✅ Mặc định cho phép số âm
      allowNegative = true,
      decimalScale = 0,
      withStepper = false,
      iconIncrease,
      iconDecrease,
      className,
      inputClassName,
      testId,
      iconSize = "sm",
      hideEmptyValue = true,
      maxLength = 30,
      allowReturnUndefined = false, // vẫn giữ để không breaking
      isRoundStep = false,
      errorClassName,
      signalAllow = false,
      thousandSeparator = false,
      onIncrementOverride,
      onDecrementOverride,
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = generatedId;
    const descriptionId = description ? `${inputId}-description` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const ariaDescribedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

    // ✅ Raw text cho trạng thái nhập dở ( '-', '-0.', '' )
    const [raw, setRaw] = useState<string | null>(null);
    // ✅ Track focus state to control decimal formatting
    // const [isFocused, setIsFocused] = useState(false);

    // Display as '' when value is empty string / 0 (nếu hideEmptyValue)
    const displayValue = useMemo(() => {
      if (hideEmptyValue) {
        return value === "" || value === null || value === undefined || value === 0 ? "" : value;
      }
      return value === "" ? "" : value;
    }, [value, hideEmptyValue]);

    // ✅ Cho phép nhập '-' / '-0.' / … ; không chặn theo min/max trong lúc gõ
    const isAllowed = useCallback(
      (vals: NumberFormatValues) => {
        const s = vals.value;
        const fv = vals.floatValue;

        // Nếu không cho âm (nếu ai đó cố ý truyền false) thì chặn dấu '-'
        if (!allowNegative && s.includes("-")) return false;

        // Cho các trạng thái nhập dở
        if (s === "" || s === "-" || s === "-." || s === "-0" || s === "-0.") return true;

        // Không áp min/max ở đây → áp sau khi parse (handleValueChange)
        // Có thể giới hạn độ dài bằng maxLength của input
        if (fv == null) return true;

        return true;
      },
      [allowNegative]
    );

    const stepValue = Number(step);
    const scale = useMemo(() => computeScale(stepValue, decimalScale), [stepValue, decimalScale]);

    const handleValueChange = useCallback(
      (vals: NumberFormatValues, sourceInfo: SourceInfo) => {
        console.log("vals", vals, signalAllow, !sourceInfo.event);
        if (!sourceInfo.event && signalAllow) return;

        onValueChange?.(vals);

        // ⬇️ Khi chưa có số hợp lệ (đang gõ '-', '-0.', …): lưu raw, KHÔNG onChange(0)
        if (vals.floatValue == null) {
          setRaw(vals.value);
          onChange(undefined);
          return;
        }

        // ⬇️ Có số hợp lệ: xóa raw, gọi onChange
        setRaw(null);

        // ✅ Áp dụng min/max ở đây
        const bounded = Math.min(Math.max(vals.floatValue, Number(min ?? -Infinity)), Number(max));

        onChange(bounded);
      },
      [onChange, onValueChange, signalAllow, min, max]
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        // setIsFocused(false);
        // Khi blur, bỏ raw để hiển thị lại dạng formatted từ value
        setRaw(null);
        rest.onBlur?.(e);
      },
      [rest]
    );

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        // setIsFocused(true);
        rest.onFocus?.(e);
      },
      [rest]
    );

    const handleIncrement = useCallback(() => {
      if (disabled) return;

      if (onIncrementOverride) {
        const currVal =
          typeof value === "number"
            ? value
            : value === "" || value == null
              ? undefined
              : Number(value);
        const maybeNext = onIncrementOverride({ current: currVal, step: stepValue });
        if (typeof maybeNext === "number" && !Number.isNaN(maybeNext)) {
          let bounded = max != null ? Math.min(maybeNext, Number(max)) : maybeNext;
          bounded = roundTo(bounded, scale);
          const vals: NumberFormatValues = {
            value: bounded.toString(),
            floatValue: bounded,
            formattedValue: thousandSeparator
              ? bounded.toLocaleString("en-US", {
                  minimumFractionDigits: decimalScale,
                  maximumFractionDigits: decimalScale,
                })
              : bounded.toFixed(decimalScale),
          };
          onValueChange?.(vals);
          onChange(bounded);
          return;
        }
      }

      const curr = typeof value === "number" ? value : 0;
      const nextRaw = curr + stepValue;

      let next = roundTo(nextRaw, scale);
      if (max != null) next = Math.min(next, Number(max));
      if (isRoundStep) {
        next = roundTo(Math.floor(next / stepValue) * stepValue, scale);
      }

      const vals: NumberFormatValues = {
        value: next.toString(),
        floatValue: next,
        formattedValue: thousandSeparator
          ? next.toLocaleString("en-US", {
              minimumFractionDigits: decimalScale,
              maximumFractionDigits: decimalScale,
            })
          : next.toFixed(decimalScale),
      };
      onValueChange?.(vals);
      onChange(next);
    }, [
      disabled,
      value,
      stepValue,
      max,
      isRoundStep,
      onChange,
      onValueChange,
      onIncrementOverride,
      scale,
    ]);

    const handleDecrement = useCallback(() => {
      if (disabled) return;
      const currVal =
        typeof value === "number"
          ? value
          : value === "" || value == null
            ? undefined
            : Number(value);

      if (onDecrementOverride) {
        const maybeNext = onDecrementOverride({ current: currVal, step: stepValue });
        if (typeof maybeNext === "number" && !Number.isNaN(maybeNext)) {
          let bounded = min != null ? Math.max(maybeNext, Number(min)) : maybeNext;
          bounded = roundTo(bounded, scale);
          const vals: NumberFormatValues = {
            value: bounded.toString(),
            floatValue: bounded,
            formattedValue: thousandSeparator
              ? bounded.toLocaleString("en-US", {
                  minimumFractionDigits: decimalScale,
                  maximumFractionDigits: decimalScale,
                })
              : bounded.toFixed(decimalScale),
          };
          onValueChange?.(vals);
          onChange(bounded);
          return;
        }
      }
      const curr = typeof value === "number" ? value : 0;
      const raw = curr - stepValue;

      // ✅ Cho phép âm mặc định; vẫn tôn trọng min (nếu được truyền)
      let bounded = min != null ? Math.max(raw, Number(min)) : raw;
      let next = bounded;

      if (isRoundStep) {
        next = Math.ceil(next / stepValue) * stepValue;
      }
      next = roundTo(next, scale);

      const vals: NumberFormatValues = {
        value: next.toString(),
        floatValue: next,
        formattedValue: thousandSeparator
          ? next.toLocaleString("en-US", {
              minimumFractionDigits: decimalScale,
              maximumFractionDigits: decimalScale,
            })
          : next.toFixed(decimalScale),
      };
      onValueChange?.(vals);
      onChange(next);
    }, [
      disabled,
      value,
      stepValue,
      min,
      isRoundStep,
      onChange,
      onValueChange,
      scale,
      onDecrementOverride,
    ]);

    const textClass = textSize === "small" ? TEXT_SIZE.SMALL : textSize === "large" ? TEXT_SIZE.LARGE : TEXT_SIZE.MEDIUM;
    const sizeClass = (INPUT_SIZE[sizeInput as keyof typeof INPUT_SIZE] ?? sizeInput).trim();
    const wrapperClass = clsx(
      BASE_POSITION_CLASS,
      BASE_INPUT_CLASS,
      error || errorBorder
        ? ERROR_INPUT_CLASS
        : disabled
          ? DISABLED_INPUT_CLASS
          : BASE_INPUT_CLASS_ACTION,
      sizeClass,
      className
    );

    return (
      <Form.Field name={name} asChild>
        <div className="w-full" data-testid={testId}>
          {label && (
            <Form.Label htmlFor={inputId} className="block text-body-13 text-neutral-9">
              {label}
              {rest.required && <span className="text-red-5">*</span>}
            </Form.Label>
          )}

          <div className={wrapperClass}>
            {iconLeft && (
              <span className="shrink-0">
                {enhanceIcon(iconLeft, {
                  size: iconSize,
                  className: "text-neutral-6",
                })}
              </span>
            )}

            <Form.Control asChild>
              <NumericFormat
                {...rest}
                id={inputId}
                getInputRef={ref}
                // ✅ Ưu tiên hiển thị raw khi đang gõ dở ('-', '-0.', …)
                value={Boolean(raw) ? raw : displayValue}
                onValueChange={handleValueChange}
                isAllowed={isAllowed}
                // ✅ Mặc định cho phép số âm
                allowNegative={allowNegative}
                decimalScale={decimalScale}
                fixedDecimalScale={decimalScale > 0}
                // fixedDecimalScale={true}
                aria-invalid={!!error}
                aria-describedby={ariaDescribedBy}
                placeholder={placeholder}
                disabled={disabled}
                maxLength={maxLength}
                autoComplete="off"
                onBlur={handleBlur}
                onFocus={handleFocus}
                className={clsx(
                  "w-full border-none bg-transparent outline-none placeholder:text-neutral-4 focus:ring-0",
                  textClass,
                  "text-neutral-9",
                  inputClassName
                )}
                thousandSeparator={thousandSeparator}
              />
            </Form.Control>

            {withStepper ? (
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={disabled}
                  className={clsx(
                    "flex h-10 w-7 items-center justify-center rounded-md transition-colors",
                    disabled && "cursor-not-allowed opacity-50"
                  )}
                >
                  {iconDecrease ?? <Icon name="Minus" size={iconSize} className="text-neutral-6" />}
                </button>

                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={disabled}
                  className={clsx(
                    "flex h-10 w-7 items-center justify-center rounded-md transition-colors",
                    disabled && "cursor-not-allowed opacity-50"
                  )}
                >
                  {iconIncrease ?? <Icon name="Plus" size={iconSize} className="text-neutral-6" />}
                </button>

                {iconRight && <span>{iconRight}</span>}
              </div>
            ) : (
              iconRight && (
                <span className="ml-2">
                  {enhanceIcon(iconRight, {
                    size: iconSize,
                    className: "text-neutral-6",
                  })}
                </span>
              )
            )}
          </div>

          {description && (
            <p id={descriptionId} className="mt-1 text-caption-10 text-neutral-9">
              {description}
            </p>
          )}
          {error && (
            <Form.Message asChild>
              <p
                id={errorId}
                role="alert"
                aria-live="assertive"
                className={clsx(ERROR_TEXT_CLASS, errorClassName)}
              >
                {error}
              </p>
            </Form.Message>
          )}
        </div>
      </Form.Field>
    );
  }
);

NumberInput.displayName = "NumberInput";
export default NumberInput;
