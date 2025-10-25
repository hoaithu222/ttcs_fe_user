import * as React from "react";

import * as Form from "@radix-ui/react-form";
import clsx from "clsx";

import {
  // ALLOWED_CHAR_RE,
  stripDiacritics,
  stripSpecialCharactersUnicode,
} from "@/shared/utils/string.utils";

import {
  BASE_INPUT_CLASS,
  BASE_INPUT_CLASS_ACTION,
  BASE_POSITION_CLASS,
  DISABLED_INPUT_CLASS,
  ERROR_INPUT_CLASS,
  ERROR_TEXT_CLASS,
  TEXT_SIZE,
} from "./inputs.consts.js";

export interface TextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "name"> {
  name: string;
  label?: string;
  description?: string;
  error?: string;
  textSize?: "large" | "small";
  rows?: number;
  testId?: string;
  showCharacterCount?: boolean;
  /** If true, blocks special characters (only allows letters, numbers and spaces) */
  blockSpecialChars?: boolean;
  /** If true, automatically strip diacritics */
  autoStripDiacritics?: boolean;
  /** If true, automatically convert input to uppercase */
  autoUppercase?: boolean;
  /** Time to debounce transform text (ms) */
  debounceTransformText?: number;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      name,
      label,
      description,
      error,
      className,
      id,
      textSize = "large",
      rows = 3,
      testId,
      maxLength,
      showCharacterCount = false,
      blockSpecialChars = false,
      autoStripDiacritics = false,
      autoUppercase = false,
      ...props
    },
    ref
  ) => {
    // IDs
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    // Tạo ID cho description và error
    const descriptionId = description ? `${inputId}-description` : "";
    const errorId = error ? `${inputId}-error` : "";
    const ariaDescribedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

    // Chọn class font-size dựa vào textSize
    const textClass =
      textSize === "small"
        ? TEXT_SIZE.SMALL
        : textSize === "large"
          ? TEXT_SIZE.LARGE
          : TEXT_SIZE.MEDIUM;

    // Tính lớp wrapper: base + state + override
    // Nếu có lỗi => ERROR_INPUT_CLASS
    // else nếu disabled => DISABLED_INPUT_CLASS
    // else => BASE_INPUT_CLASS_ACTION
    const wrapperClass = clsx(
      "py-2 has-[textarea:focus]:border-primary-6",
      BASE_POSITION_CLASS,
      BASE_INPUT_CLASS,
      error ? ERROR_INPUT_CLASS : props.disabled ? DISABLED_INPUT_CLASS : BASE_INPUT_CLASS_ACTION,
      "flex flex-col", // Kết hợp để textarea nằm dọc
      className
    );

    // refs
    const regionRef = React.useRef<HTMLDivElement>(null);
    const innerRef = React.useRef<HTMLTextAreaElement | null>(null);
    const handleRef = (el: HTMLTextAreaElement | null) => {
      innerRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    };

    // event handlers
    const {
      onChange: propOnChange,
      onKeyDown: propOnKeyDown,
      onBlur: propOnBlur,
      onPaste: propOnPaste,
      ...restProps
    } = props;

    const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
      // Nếu đang composition (gõ dấu), hoặc không bật blockSpecialChars, hoặc key dài ≠ 1 (Enter, Backspace…)
      if (!blockSpecialChars || e.key.length !== 1) {
        propOnKeyDown?.(e);
        return;
      }

      // Nếu ký tự không nằm trong whitelist thì chặn
      // if (!ALLOWED_CHAR_RE.test(e.key)) {
      //   e.preventDefault();
      //   return;
      // }

      // Với ký tự được phép, chuyển tiếp event
      propOnKeyDown?.(e);
    };

    const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
      // console.log('handleKeyDown', e);
      // if (blockSpecialChars) {
      //   const raw = e.target.value;
      //   console.log('raw 1', raw);
      //   if (blockSpecialChars) {
      //     const sanitized = stripSpecialCharactersUnicode(raw);
      //     if (sanitized !== raw) {
      //       e.target.value = sanitized;
      //     }
      //   }
      // }
      propOnChange?.(e);
    };

    const handleBlur: React.FocusEventHandler<HTMLTextAreaElement> = (e) => {
      let finalValue = e.target.value;

      if (autoStripDiacritics) {
        finalValue = stripDiacritics(finalValue);
      }
      if (blockSpecialChars) {
        finalValue = stripSpecialCharactersUnicode(finalValue);
      }
      if (autoUppercase) {
        finalValue = finalValue.toUpperCase();
      }
      if (finalValue !== e.target.value) {
        e.target.value = finalValue;
        e.target.dispatchEvent(new Event("input", { bubbles: true }));
      }
      propOnBlur?.(e);
    };
    const handlePaste: React.ClipboardEventHandler<HTMLTextAreaElement> = (e) => {
      if (blockSpecialChars || autoUppercase) {
        const el = innerRef.current;
        if (!el) return;

        // Cho phép dán
        setTimeout(() => {
          let val = el.value;
          if (autoStripDiacritics) {
            val = stripDiacritics(val);
          }
          // Làm sạch ký tự đặc biệt nếu bật
          if (blockSpecialChars) {
            val = stripSpecialCharactersUnicode(val);
          }

          // Uppercase nếu bật
          if (autoUppercase) {
            val = val.toUpperCase();
          }

          // Nếu có thay đổi, cập nhật lại giá trị
          if (val !== el.value) {
            el.value = val;
            el.dispatchEvent(new Event("input", { bubbles: true }));
          }
        }, 0); // Delay nhỏ để đợi nội dung được dán vào

        propOnPaste?.(e);
      } else {
        propOnPaste?.(e);
      }
    };

    return (
      <Form.Field name={name} asChild>
        <div ref={regionRef} data-testid={testId} className="w-full">
          {/* Label */}
          {label && (
            <Form.Label htmlFor={inputId} className="block text-body-13 text-neutral-9">
              {label}
              {props.required && <span className="text-red-5">*</span>}
            </Form.Label>
          )}

          {/* Wrapper for textarea */}
          <div className={wrapperClass}>
            <Form.Control asChild>
              <textarea
                id={inputId}
                ref={handleRef}
                rows={rows}
                aria-invalid={!!error}
                aria-describedby={ariaDescribedBy}
                disabled={props.disabled}
                autoComplete="off"
                maxLength={maxLength}
                className={clsx(
                  "p-0 w-full bg-transparent border-none outline-none resize-none placeholder:text-neutral-4 focus:ring-0",
                  textClass,
                  "text-neutral-9"
                )}
                onKeyDown={handleKeyDown}
                onChange={handleChange}
                onBlur={handleBlur}
                onPaste={handlePaste}
                {...restProps}
              />
            </Form.Control>
          </div>

          {/* Character Counter */}
          {maxLength && showCharacterCount && (
            <div className="pr-2 mt-1 text-right text-caption-12 text-neutral-6">
              {(props.value as string)?.length || 0}/{maxLength}
            </div>
          )}

          {/* Description */}
          {description && (
            <p id={descriptionId} className="mt-1 text-caption-12 text-neutral-6">
              {description}
            </p>
          )}

          {/* Error Message */}
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
  }
);

TextArea.displayName = "TextArea";

export default TextArea;
