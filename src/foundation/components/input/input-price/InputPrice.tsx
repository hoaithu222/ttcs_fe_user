import * as React from "react";

import * as Form from "@radix-ui/react-form";
import clsx from "clsx";
import numeral from "numeral";
import { NumberFormatValues } from "react-number-format";

import Icon from "@/foundation/components/icons/Icon";
import {
  BASE_INPUT_CLASS,
  BASE_INPUT_CLASS_ACTION,
  BASE_POSITION_CLASS,
  DISABLED_INPUT_CLASS,
  ERROR_INPUT_CLASS,
  ERROR_TEXT_CLASS,
  INPUT_SIZE,
  TEXT_SIZE,
} from "@/foundation/components/input/inputs.consts.js";

import { decrementPrice, incrementPrice } from "./constans";

interface Props {
  ticker?: string;
  name: string;
  value: string | number;
  onValueChange?: (values: NumberFormatValues) => void;
  error?: string;
  label?: string;
  description?: string;
  placeholder?: string;
  sizeInput?: keyof typeof INPUT_SIZE | string;
  textSize?: "large" | "small";
  disabled?: boolean;
  iconSize?: "sm" | "md" | "lg";
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  withStepper?: boolean;
  max?: number;
  min?: number;
}

const InputPrice = React.memo(function InputPrice({
  ticker,
  name,
  value,
  onValueChange,
  error,
  label,
  description,
  placeholder = "Nhập số",
  sizeInput = "full",
  textSize = "large",
  disabled = false,
  iconSize = "sm",
  iconLeft,
  iconRight,
  withStepper = false,
  max,
  min,
}: Props) {
  const generatedId = React.useId();
  const inputId = `${name}-${generatedId}`;
  const descriptionId = description ? `${inputId}-desc` : "";
  const errorId = error ? `${inputId}-error` : "";
  const ariaDescribedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  const wrapperClass = clsx(
    BASE_POSITION_CLASS,
    BASE_INPUT_CLASS,
    error ? ERROR_INPUT_CLASS : disabled ? DISABLED_INPUT_CLASS : BASE_INPUT_CLASS_ACTION,
    INPUT_SIZE[sizeInput as keyof typeof INPUT_SIZE] ?? sizeInput
  );

  const textClass = TEXT_SIZE[textSize as keyof typeof TEXT_SIZE];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "");
    if (!/^\d*(\.\d*)?$/.test(raw)) return;
    onValueChange?.({
      value: raw,
      floatValue: parseFloat(raw),
      formattedValue: numeral(raw).format("0,0.###"),
    });
  };

  const handleChangeDecrement = () => {
    if (!disabled) {
      const priceChange = decrementPrice(ticker ?? "", value, min);
      onValueChange?.({
        value: priceChange.toString(),
        floatValue: Number(priceChange),
        formattedValue: numeral(priceChange).format("0,0.###"),
      });
    }
  };

  const handleChangeIncrement = () => {
    if (!disabled) {
      const priceChange = incrementPrice(ticker ?? "", value, max, min);
      onValueChange?.({
        value: priceChange.toString(),
        floatValue: Number(priceChange),
        formattedValue: numeral(priceChange).format("0,0.###"),
      });
    }
  };

  return (
    <Form.Field name={name} asChild>
      <div>
        {label && (
          <Form.Label htmlFor={inputId} className="block text-body-13 text-neutral-9">
            {label}
          </Form.Label>
        )}

        <div className={wrapperClass}>
          {iconLeft && <span className="shrink-0">{iconLeft}</span>}

          <Form.Control asChild>
            <input
              id={inputId}
              value={numeral(value).format("0,0.###")}
              onChange={handleChange}
              aria-invalid={!!error}
              aria-describedby={ariaDescribedBy}
              placeholder={placeholder}
              disabled={disabled}
              autoComplete="off"
              className={clsx(
                "w-full border-none bg-transparent outline-none placeholder:text-neutral-4 focus:ring-0",
                textClass,
                "text-neutral-9"
              )}
            />
          </Form.Control>

          {withStepper && (
            <div className="flex items-center space-x-2">
              <span>
                <Icon
                  onClick={handleChangeDecrement}
                  disabled={disabled || isNaN(Number(value))}
                  name="Minus"
                  size={iconSize}
                  className="text-neutral-6"
                />
              </span>
              <span>
                <Icon
                  onClick={handleChangeIncrement}
                  disabled={disabled || isNaN(Number(value))}
                  name="Plus"
                  size={iconSize}
                  className="text-neutral-6"
                />
              </span>
              {iconRight && <span>{iconRight}</span>}
            </div>
          )}
        </div>

        {description && (
          <p id={descriptionId} className="mt-1 text-caption-10 text-neutral-9">
            {description}
          </p>
        )}

        {error && (
          <Form.Message asChild>
            <p id={errorId} role="alert" aria-live="assertive" className={ERROR_TEXT_CLASS}>
              {error}
            </p>
          </Form.Message>
        )}
      </div>
    </Form.Field>
  );
});

InputPrice.displayName = "InputPrice";
export default InputPrice;
