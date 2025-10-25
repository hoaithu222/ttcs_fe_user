import * as React from "react";

import * as Form from "@radix-ui/react-form";
import clsx from "clsx";

import {
  // ALLOWED_CHAR_RE,
  stripDiacritics,
  stripSpecialCharactersUnicode,
} from "@/shared/utils/string.utils";

import Icon from "../icons/Icon";
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

export interface FieldInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "name"> {
  name: string;
  label?: string;
  description?: string;
  error?: string | React.ReactNode;
  errorBorder?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  textSize?: "large" | "small";
  sizeInput?: keyof typeof InputSize | string;
  testId?: string;
  inputCustomClass?: string;
  /** Triggered when user clicks outside the input */
  onClickOutside?: () => void;
  isIconRightFocus?: boolean;
  /** If true, blocks special characters (only allows letters, numbers and spaces) */
  blockSpecialChars?: boolean;
  /** If true, automatically strip diacritics */
  autoStripDiacritics?: boolean;
  /** If true, automatically convert input to uppercase */
  autoUppercase?: boolean;
  /** Time to debounce transform text */
  debounceTransformText?: number;
}

/**
 * @component Input
 *
 * 👉 Input component chuẩn hóa cho các trường nhập liệu trong form.
 *
 * - Hỗ trợ label, mô tả, hiển thị lỗi theo chuẩn Radix UI Form.
 * - Tự động sinh ID và aria attributes để đảm bảo accessibility (a11y).
 * - Cho phép icon bên trái (`iconLeft`) và bên phải (`iconRight`).
 * - Hỗ trợ trường mật khẩu (`type="password"`) với chức năng show/hide mật khẩu.
 * - Tự động áp dụng các kích thước (sizeInput) chuẩn: full, xl, lg, md, sm, xs.
 * - Cho phép override thêm className tùy chỉnh nếu cần.
 * - Hỗ trợ các kích thước font nội dung (`textSize`: 'large' | 'small').
 * - Hiển thị rõ ràng trạng thái lỗi (error) và trạng thái disable.
 * - Nếu truyền `onClickOutside`, sẽ tự động trigger khi click ra ngoài region
 * - Nếu `blockSpecialChars=true`, chặn nhập ký tự đặc biệt (chỉ cho phép chữ, số và khoảng trắng)
 *
 * @example
 * ```tsx
 * <Input
 *   name="username"
 *   label="Username"
 *   placeholder="Enter your username"
 *   sizeInput="md"
 *   blockSpecialChars
 * />
 * ```
 *
 * @props
 * - `name: string` — Tên trường form, bắt buộc.
 * - `label?: string` — Label hiển thị phía trên input.
 * - `description?: string` — Mô tả thêm cho input.
 * - `error?: string` — Thông báo lỗi, hiển thị dưới input.
 * - `iconLeft?: React.ReactNode` — Icon bên trái input.
 * - `iconRight?: React.ReactNode` — Icon bên phải input.
 * - `textSize?: 'large' | 'small'` — Cỡ chữ cho nội dung input, mặc định 'large'.
 * - `sizeInput?: 'full' | 'xl' | 'lg' | 'md' | 'sm' | 'xs'` — Kích thước input, mặc định 'full'.
 * - `testId?: string` — Gán giá trị cho `data-testid` (testing).
 * - `className?: string` — Gán thêm custom class cho input container.
 * - `inputCustomClass?: string` — Gán thêm custom class cho thẻ `<input>`.
 * - `onClickOutside?: () => void` — Callback khi click ra ngoài vùng input.
 * - `isIconRightFocus?: boolean` — Nếu true, click vào iconRight sẽ focus input.
 * - `blockSpecialChars?: boolean` — Nếu true, chặn nhập ký tự đặc biệt (chỉ cho phép chữ, số, khoảng trắng).
 *
 * @accessibility
 * - Tự động sinh aria-describedby từ description/error.
 * - Gắn đúng role="alert" cho error message.
 */
const Input = React.forwardRef<HTMLInputElement, FieldInputProps>(
  (
    {
      name,
      label,
      description,
      error,
      errorBorder,
      iconLeft,
      iconRight,
      className,
      id,
      textSize = "large",
      sizeInput = "full",
      type,
      testId,
      inputCustomClass,
      required,
      autoComplete = "off",
      disabled,
      onClickOutside,
      isIconRightFocus,
      blockSpecialChars = false,
      autoStripDiacritics = false,
      autoUppercase = false,
      ...rest
    },
    ref
  ) => {
    const regionRef = React.useRef<HTMLDivElement>(null);

    // Generate stable IDs for input, description, error
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    // Tạo ID cho description và error (nếu có)
    const descriptionId = description ? `${inputId}-description` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    // aria-describedby = ["mô tả", "lỗi"]
    const ariaDescribedBy = React.useMemo(
      () => [descriptionId, errorId].filter(Boolean).join(" ") || undefined,
      [descriptionId, errorId]
    );

    // State show/hide password
    const [showPassword, setShowPassword] = React.useState(false);
    const inputType = type === "password" ? (showPassword ? "text" : "password") : type || "text";

    // Decide autoComplete: nếu user truyền thì dùng, ngược lại với password set current-password
    const autoCompleteAttr = autoComplete ?? (type === "password" ? "current-password" : undefined);

    // Lấy class cho text + placeholder
    const textClass =
      textSize === "small"
        ? TEXT_SIZE.SMALL
        : textSize === "large"
          ? TEXT_SIZE.LARGE
          : TEXT_SIZE.MEDIUM;

    // Lấy class size (height/width) từ INPUT_SIZE map, nếu không nằm trong map thì dùng luôn chuỗi truyền vào
    const sizeClass = (INPUT_SIZE[sizeInput as keyof typeof INPUT_SIZE] ?? sizeInput).trim();

    // Chuẩn logic chọn lớp tương tác:
    // 1. Luôn + BASE_POSITION_CLASS + BASE_INPUT_CLASS
    // 2. Sau đó nếu có error: thêm ERROR_INPUT_CLASS
    //    else nếu disabled: thêm DISABLED_INPUT_CLASS
    //    else (normal): thêm BASE_INPUT_CLASS_ACTION
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

    // Click-away handler using pointerdown for consistency
    React.useEffect(() => {
      if (!onClickOutside) return;
      const handleClickAway = (evt: PointerEvent) => {
        if (regionRef.current && !regionRef.current.contains(evt.target as Node)) {
          onClickOutside();
        }
      };
      document.addEventListener("pointerdown", handleClickAway, true);
      return () => document.removeEventListener("pointerdown", handleClickAway, true);
    }, [onClickOutside]);

    // --- thêm ref nội bộ ----
    const innerRef = React.useRef<HTMLInputElement | null>(null);

    // Kết hợp forwarded ref và innerRef
    const handleRef = (el: HTMLInputElement | null) => {
      innerRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    };

    const {
      onChange: propOnChange,
      onPaste: propOnPaste,
      onKeyDown: propOnKeyDown,
      onBlur: propOnBlur,
      ...restProps
    } = rest;

    const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
      // Nếu đang composition (gõ dấu), hoặc không bật blockSpecialChars, hoặc key dài ≠ 1 (Enter, Backspace…)
      if (!blockSpecialChars || e.key.length !== 1) {
        propOnKeyDown?.(e);
        return;
      }

      // // Nếu ký tự không nằm trong whitelist thì chặn
      // if (!ALLOWED_CHAR_RE.test(e.key)) {
      //   e.preventDefault();
      //   return;
      // }

      // Với ký tự được phép, chuyển tiếp event
      propOnKeyDown?.(e);
    };

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
      // if (blockSpecialChars) {
      //   const raw = e.target.value;
      //   if (blockSpecialChars) {
      //     const sanitized = stripSpecialCharactersUnicode(raw);
      //     if (sanitized !== raw) {
      //       e.target.value = sanitized;
      //     }
      //   }
      // }

      propOnChange?.(e);
    };

    const handleBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
      const el = e.target as HTMLInputElement;
      // remove tones
      let finalValue = el.value;
      if (autoStripDiacritics) {
        finalValue = stripDiacritics(finalValue);
      }
      if (blockSpecialChars) {
        finalValue = stripSpecialCharactersUnicode(finalValue);
      }
      // uppercase
      if (autoUppercase) {
        finalValue = finalValue.toUpperCase();
      }
      if (finalValue !== el.value) {
        el.value = finalValue;
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }
      propOnBlur?.(e);
    };

    const handlePaste: React.ClipboardEventHandler<HTMLInputElement> = (e) => {
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
              {required && <span className="text-red-5">*</span>}
            </Form.Label>
          )}

          {/* Wrapper input + icon */}
          <div className={wrapperClass}>
            {/* Icon bên trái */}
            {iconLeft && <span className="shrink-0">{iconLeft}</span>}

            {/* Thẻ input */}
            <Form.Control asChild>
              <input
                id={inputId}
                ref={handleRef}
                type={inputType}
                autoComplete={autoCompleteAttr}
                aria-invalid={!!error}
                aria-required={required || undefined}
                aria-describedby={ariaDescribedBy}
                disabled={disabled}
                className={clsx(
                  "size-full border-none bg-transparent p-0 outline-none focus:ring-0",
                  textClass,
                  "text-neutral-9 placeholder:text-neutral-4",
                  inputCustomClass
                )}
                onKeyDown={handleKeyDown}
                onChange={handleChange}
                onBlur={handleBlur}
                onPaste={handlePaste}
                {...restProps}
              />
            </Form.Control>

            {/* Icon show/hide password HOẶC iconRight */}
            {type === "password" ? (
              <Icon
                name={showPassword ? "ViewOn" : "ViewOff"}
                onClick={() => setShowPassword((prev) => !prev)}
                key={showPassword ? "ViewOn" : "ViewOff"}
                color="secondary"
                role="button"
                tabIndex={-1}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setShowPassword((prev) => !prev);
                  }
                }}
              />
            ) : (
              iconRight && (
                <span
                  className="shrink-0"
                  onClick={() => isIconRightFocus && innerRef.current?.focus()}
                >
                  {iconRight}
                </span>
              )
            )}
          </div>

          {/* Phần mô tả (description) */}
          {description && (
            <p id={descriptionId} className="mt-1 text-caption-12 text-start text-neutral-6">
              {description}
            </p>
          )}

          {/* Phần hiển thị lỗi (error) */}
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

Input.displayName = "Input";

export default Input;
