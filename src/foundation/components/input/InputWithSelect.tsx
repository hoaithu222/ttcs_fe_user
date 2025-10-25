import React from "react";

import * as Form from "@radix-ui/react-form";
import clsx from "clsx";

// import đúng path của bạn
import Input, { FieldInputProps } from "@/foundation/components/input/Input";
import Select, { SelectProps } from "@/foundation/components/input/Select";

export interface InputWithSelectProps {
  /** Tên trường input (Form.Field name) */
  nameInput: string;
  /** Tên trường select (Form.Field name) */
  nameSelect: string;

  /** Label chung */

  label?: string;
  /** Description chung (optional) */
  description?: string;
  /** Error chung (optional) */
  error?: string;

  /** Tất cả props bạn thường truyền vào Input */
  inputProps?: Omit<FieldInputProps, "name" | "id">;
  /** Tất cả props bạn thường truyền vào Select */
  selectProps?: Omit<SelectProps, "name" | "id">;

  /** Dùng cho testing */
  testId?: string;
}

const InputWithSelect: React.FC<InputWithSelectProps> = ({
  nameInput,
  nameSelect,
  label,
  description,
  error,
  inputProps = {},
  selectProps = {},
  testId,
}) => {
  // Sinh ID cho input và select
  const generatedId = React.useId();
  const inputId = `${generatedId}-input`;
  const selectId = `${generatedId}-select`;

  return (
    <div data-testid={testId}>
      {/* Label chung */}
      {label && (
        <Form.Label htmlFor={inputId} className="block mb-1 text-body-13 text-neutral-9">
          {label}
          {inputProps.required && <span className="text-red-5"> *</span>}
        </Form.Label>
      )}

      {/* Description chung */}
      {description && (
        <p className="mb-1 text-caption-12 text-neutral-7" id={`${generatedId}-desc`}>
          {description}
        </p>
      )}

      {/* Container flex cho input + select */}
      <div
        className={clsx(
          "flex items-center rounded-lg border",
          error ? "border-red-5" : "border-neutral-3",
          inputProps.disabled && "cursor-not-allowed bg-disabled-2"
        )}
      >
        {/* Input bên trái */}
        <Form.Field name={nameInput} asChild>
          <div className="flex-1">
            <Input
              id={inputId}
              name={nameInput}
              aria-describedby={
                description || error ? `${generatedId}-desc ${generatedId}-err` : undefined
              }
              {...inputProps}
              className={clsx(
                // override để bỏ border phải và bo góc phải
                "rounded-r-none border-r-0 shadow-none",
                inputProps.className
              )}
            />
          </div>
        </Form.Field>

        {/* Select bên phải */}
        <Form.Field name={nameSelect} asChild>
          <div>
            <Select
              id={selectId}
              name={nameSelect}
              aria-describedby={
                description || error ? `${generatedId}-desc ${generatedId}-err` : undefined
              }
              {...selectProps}
              className="!p-0" // bỏ padding wrapper mặc định
              triggerClassName={clsx(
                // override để bỏ border trái và bo góc trái
                "rounded-l-none border-l-0 px-2 shadow-none",
                selectProps.triggerClassName
              )}
            />
          </div>
        </Form.Field>
      </div>

      {/* Error chung */}
      {error && (
        <Form.Message asChild>
          <p
            id={`${generatedId}-err`}
            role="alert"
            aria-live="assertive"
            className="mt-1 text-caption-12 text-red-5"
          >
            {error}
          </p>
        </Form.Message>
      )}
    </div>
  );
};

export default React.memo(InputWithSelect);
