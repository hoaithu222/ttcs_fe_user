import React, { useEffect, useState } from "react";

import * as Popover from "@radix-ui/react-popover";
import clsx from "clsx";
import moment from "moment";
import { DayPicker, getDefaultClassNames } from "react-day-picker";

import Icon from "@/foundation/components/icons/Icon";
import { useNSTranslate } from "@/shared/hooks";

import {
  BASE_INPUT_CLASS,
  BASE_INPUT_CLASS_ACTION,
  BASE_POSITION_CLASS,
  DISABLED_INPUT_CLASS,
  ERROR_INPUT_CLASS,
  INPUT_SIZE,
  InputSize,
  TEXT_SIZE,
} from "./inputs.consts";

interface DatePickerProps {
  /** Giá trị ngày ban đầu, có thể null */
  value?: Date | null;
  /** Callback khi thay đổi: date mới hoặc null */
  onChange?: (date: Date | null) => void;
  className?: string;
  placeholder?: string;
  disabledDays?: (date: Date) => boolean;
  error?: string;
  errorBorder?: boolean;
  /** Chiều cao/width của button: key trong INPUT_SIZE */
  buttonSize?: keyof typeof InputSize;
  /** Cỡ chữ hiển thị bên trong button: 'large' | 'small' */
  textSize?: "large" | "small";
  format?: string;
  testId?: string;
  /** Z-index của popover content, mặc định là 20 */
  zIndex?: number;
  /** Ngày tối đa có thể chọn */
  maxDate?: Date;
  /** Ngày tối thiểu có thể chọn */
  minDate?: Date;
  disabled?: boolean;

  /** màu icon date */
  color?:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | "neutral"
    | "white"
    | "blue"
    | "orange"
    | "normal"
    | "currentColor";
  /** Cho phép nhập text trực tiếp vào input */
  allowTextInput?: boolean;
  /** Placeholder cho input text khi allowTextInput = true */
  textInputPlaceholder?: string;
  /** Callback khi có lỗi validation */
  onError?: (error: string) => void;
  /** Hiển thị lỗi khi người dùng xoá hết dữ liệu (rỗng) */
  showErrorOnClear?: boolean;
  /** Thông điệp lỗi tuỳ chỉnh khi xoá hết dữ liệu (ưu tiên hơn i18n mặc định) */
  clearErrorMessage?: string;
}

/**
 * DatePicker Component
 *
 * 👉 Một component chọn ngày sử dụng Popover và DayPicker.
 * 👉 Hỗ trợ chọn 1 ngày (mode single), có thể disabled ngày theo điều kiện.
 * 👉 Tự động format ngày hiển thị theo `format` (default: DD/MM/YYYY).
 * 👉 Hỗ trợ tuỳ chỉnh kích thước input (`sm` hoặc `large`).
 * 👉 Khi chỉ chọn ngày mà không có giá trị ban đầu, hiển thị placeholder.
 * 👉 Gọi `onChange(date)` khi user chọn ngày mới.
 * 👉 Hỗ trợ nhập text trực tiếp khi `allowTextInput = true`.
 *
 * Props:
 * - `value?: Date` — Giá trị ngày ban đầu.
 * - `onChange?: (date?: Date) => void` — Callback khi chọn ngày.
 * - `className?: string` — Custom className cho button.
 * - `placeholder?: string` — Placeholder khi chưa chọn ngày.
 * - `disabledDays?: (date: Date) => boolean` — Function disable ngày cụ thể.
 * - `error?: string` — Thông báo lỗi hiển thị dưới input.
 * - `sizeInput?: 'large' | 'sm'` — Kích thước button chọn ngày (default: large).
 * - `format?: string` — Định dạng ngày hiển thị (default: DD/MM/YYYY).
 * - `testId?: string` — Test ID cho các thành phần.
 * - `zIndex?: number` — Z-index của popover content (default: 20).
 * - `maxDate?: Date` — Ngày tối đa có thể chọn.
 * - `minDate?: Date` — Ngày tối thiểu có thể chọn.
 * - `disabled?: boolean` — Trạng thái disabled của button.
 * - `allowTextInput?: boolean` — Cho phép nhập text trực tiếp.
 * - `textInputPlaceholder?: string` — Placeholder cho input text.
 *
 * Example:
 * ```tsx
 * <DatePicker value={new Date()} onChange={(date) => console.log(date)} />
 * <DatePicker placeholder="Chọn ngày" sizeInput="sm" />
 * <DatePicker maxDate={new Date()} allowTextInput={true} />
 * ```
 */
const DatePicker: React.FC<DatePickerProps> = ({
  value = null,
  onChange,
  className,
  placeholder = "",
  disabledDays,
  error,
  errorBorder,
  buttonSize = "md",
  textSize = "large",
  format = "DD/MM/YYYY",
  testId,
  zIndex = 60,
  maxDate,
  minDate,
  disabled = false,
  color,
  textInputPlaceholder,
  onError,
  showErrorOnClear = false,
  clearErrorMessage,
}) => {
  // State chọn ngày
  const t = useNSTranslate();
  const [selectedDate, setSelectedDate] = useState<Date | null>(value);
  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState<string>("");
  const [inputError, setInputError] = useState<string>("");
  const MSG_VALIDATE_Err = t("common.validatDateErr");
  const MSG_INVALID_FMT = t("common.invalidDate");

  const lastErrorRef = React.useRef<string>("");
  const emitError = (msg: string) => {
    if (lastErrorRef.current !== msg) {
      lastErrorRef.current = msg;
      onError?.(msg);
    }
  };

  // Đồng bộ khi prop value thay đổi
  useEffect(() => {
    setSelectedDate(value);
    if (value) {
      setInputText(moment(value).format(format));
      setInputError("");
      emitError("");
    } else {
      // setInputText(''); // nếu muốn “controlled” hoàn toàn khi value=null
      // setInputError('');
      // emitError('');
    }
  }, [value, format]);

  const defaultClassNames = getDefaultClassNames();

  // Lấy class cỡ chữ từ TEXT_SIZE
  const fontClass =
    textSize === "small"
      ? TEXT_SIZE.SMALL
      : textSize === "large"
        ? TEXT_SIZE.LARGE
        : TEXT_SIZE.MEDIUM;

  // Lấy class size (height/width) từ INPUT_SIZE map, nếu không nằm trong map thì dùng luôn chuỗi truyền vào
  const sizeClass = (INPUT_SIZE[buttonSize as keyof typeof INPUT_SIZE] ?? buttonSize).trim();

  const isOutOfRange = (d: Date) => {
    const day = moment(d).startOf("day");

    if (maxDate && day.isAfter(moment(maxDate).startOf("day"))) return true;
    if (minDate && day.isBefore(moment(minDate).startOf("day"))) return true;
    return false;
  };

  // Hàm kiểm tra ngày bị disable
  const getDisabledDays = (date: Date) => {
    if (disabledDays && disabledDays(date)) return true;
    return isOutOfRange(date);
  };

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return; // Không cho bỏ chọn
    setSelectedDate(date);
    setInputText(moment(date).format(format));
    setInputError("");
    onChange?.(date);
    setOpen(false);
  };

  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let text = e.target.value;

    // Chỉ cho phép nhập số và dấu /
    if (!/^[0-9/]*$/.test(text)) {
      return;
    }

    // Chặn việc nhập dấu / liên tiếp
    if (text.includes("//")) {
      return;
    }

    // Giới hạn độ dài tối đa 10 ký tự
    if (text.length > 10) {
      return;
    }

    // Tự động correct format ngày/tháng
    if (text.length >= 2 && text[1] === "/") {
      // Correct ngày: 1/ -> 01/
      if (text.length === 2) {
        text = text[0].padStart(2, "0") + "/";
      }
    }

    if (text.length >= 5 && text[4] === "/") {
      // Correct tháng: 10/1/ -> 10/01/
      if (text.length === 5) {
        const dayPart = text.substring(0, 3); // "01/"
        const monthPart = text[3]; // "1"
        text = dayPart + monthPart.padStart(2, "0") + "/";
      }
    }

    // Tự động fill năm hiện tại sau khi nhập tháng
    // if (text.length === 6 && text[5] === '/') {
    //   const currentYear = moment().format('YYYY');
    //   text = text + currentYear;
    // }

    // Tự động thêm dấu / sau ngày và tháng (UX tốt hơn)
    if (
      (text.length === 2 || text.length === 5) &&
      inputText.length < text.length &&
      text[text.length - 1] !== "/"
    ) {
      text += "/";
    }

    // Kiểm tra vị trí dấu /
    if ((text.length > 2 && text[2] !== "/") || (text.length > 5 && text[5] !== "/")) {
      return;
    }

    setInputText(text);
    setInputError("");

    // Chỉ parse khi đủ 10 ký tự

    if (text.length === 10) {
      const parsedDate = moment(text, "DD/MM/YYYY", true);

      if (parsedDate.isValid()) {
        const date = parsedDate.toDate();
        if (getDisabledDays(date)) {
          onChange?.(null);
          setInputError(MSG_INVALID_FMT);
          emitError(MSG_INVALID_FMT);

          return;
        }
        setSelectedDate(date);
        setInputError("");
        emitError("");
        onChange?.(date);
      } else {
        setInputError(MSG_VALIDATE_Err);
        emitError(MSG_VALIDATE_Err);
      }
    } else if (!text.trim()) {
      onChange?.(null);
      setSelectedDate(null);
      if (showErrorOnClear) {
        const msg = clearErrorMessage || MSG_VALIDATE_Err;
        setInputError(msg);
        emitError(msg);
      } else {
        setInputError("");
        emitError("");
      }
    }
  };

  // Xử lý blur input
  const handleTextInputBlur = () => {
    if (!inputText.trim()) {
      onChange?.(null);
      setSelectedDate(null);
      if (showErrorOnClear) {
        const msg = clearErrorMessage || MSG_VALIDATE_Err;
        setInputError(msg);
        emitError(msg);
      } else {
        setInputError("");
        emitError("");
      }
      return;
    }
    if (inputText && inputError) {
      setInputError(inputError);
      onError?.(inputError);
    } else if (inputText && inputText.length > 0 && inputText.length < 10) {
      // Khi blur mà chưa nhập xong, append 0 cho đủ ký tự
      const parsedDate = moment(inputText, "DD/MM/YYYY", true);
      if (parsedDate.isValid()) {
        const date = parsedDate.toDate();
        if (getDisabledDays(date)) {
          onChange?.(null);
          setInputError(MSG_INVALID_FMT);
          emitError(MSG_INVALID_FMT);
          return;
        }
        setSelectedDate(date);
        setInputText(moment(date).format(format)); // Hiển thị lại theo format chuẩn
        setInputError("");
        emitError("");
        onChange?.(date);
      } else {
        onChange?.(null);
        setInputError(MSG_INVALID_FMT);
        emitError(MSG_INVALID_FMT);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    if (open) {
      window.addEventListener("keydown", handleKeyDown, true);
    } else {
      window.removeEventListener("keydown", handleKeyDown, true);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [open]);

  // Render input text nếu allowTextInput = true
  return (
    <div>
      <div className="relative">
        <input
          type="text"
          value={inputText}
          onChange={handleTextInputChange}
          onBlur={handleTextInputBlur}
          placeholder={textInputPlaceholder || placeholder}
          disabled={disabled}
          data-testid={testId ? `${testId}-input` : undefined}
          className={clsx(
            BASE_POSITION_CLASS,
            BASE_INPUT_CLASS,
            // Trạng thái error / disabled / normal
            error || inputError || errorBorder
              ? ERROR_INPUT_CLASS
              : disabled
                ? DISABLED_INPUT_CLASS
                : BASE_INPUT_CLASS_ACTION,
            fontClass,
            "w-full bg-neutral-0 px-3 py-2",
            sizeClass,
            className
          )}
        />
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <span className="absolute -translate-y-1/2 right-3 top-1/2 text-neutral-6">
              <Icon
                testId={testId ? `${testId}-calendar-button` : undefined}
                disabled={disabled}
                onClick={() => setOpen(!open)}
                name="CalendarOutlined"
                color={color}
                size="sm"
              />
            </span>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              className="p-4 rounded shadow-lg bg-background-popup"
              side="bottom"
              align="start"
              style={{ zIndex }}
              id="datepicker"
            >
              <DayPicker
                data-testid={testId ? `${testId}-day-picker` : undefined}
                mode="single"
                selected={selectedDate ?? undefined}
                defaultMonth={selectedDate ?? moment().toDate()}
                onSelect={handleSelectDate}
                disabled={getDisabledDays}
                classNames={{
                  today: "bg-background-4",
                  selected: "bg-primary-6 text-base-white outline-none border-none",
                  chevron: `${defaultClassNames.chevron} fill-current text-neutral-10`,
                  button_previous: `${defaultClassNames.button_previous} text-neutral-10 hover:opacity-80 focus:outline-none`,
                  button_next: `${defaultClassNames.button_next} text-neutral-10 hover:opacity-80 focus:outline-none`,
                  day: `${defaultClassNames.day} text-body-13 rounded-full hover:ring-1 hover:ring-neutral-5`,
                  day_button: `${defaultClassNames.day_button} `,
                  month_caption: `${defaultClassNames.month_caption} text-body-13 text-neutral-10`,
                  weekday: `${defaultClassNames.weekday} text-body-13 text-neutral-10`,
                  month: `${defaultClassNames.month} text-body-13 text-neutral-10`,
                }}
              />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>

      {(error || inputError) && !onError && (
        <p className="mt-1 text-caption-12 text-start text-red-5">{error || inputError}</p>
      )}
    </div>
  );
};

export default DatePicker;
