import React, {
  JSXElementConstructor,
  ReactElement,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";

import * as Form from "@radix-ui/react-form";
import * as SelectPrimitive from "@radix-ui/react-select";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import clsx from "clsx";

import Icon, { IconName } from "@/foundation/components/icons/Icon";
import Input from "@/foundation/components/input/Input";
import Tooltip from "@/foundation/components/tooltip/Tooltip";
import { useNSTranslate } from "@/shared/hooks";

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
import type { InputSize } from "./inputs.consts";

export interface Option {
  value: string;
  label: string | React.ReactNode;
  shortLabel?: React.ReactNode;
}
export interface OptionGroup {
  label: string;
  options: Option[];
}

export interface SelectProps {
  name: string;
  label?: string;
  description?: string;
  error?: string;
  errorBorder?: boolean;
  options?: Option[];
  groups?: OptionGroup[];
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  sizeSelect?: keyof typeof InputSize;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  placeholderClassName?: string;
  clearable?: boolean;
  searchable?: boolean;
  loadingOptions?: boolean;
  multiple?: boolean;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  id?: string;
  className?: string;
  triggerClassName?: string;
  itemClassName?: string;
  contentClassName?: string;
  testId?: string;
  customWidth?: string;
  messTooltip?: string;
  sizeIcon?: React.ComponentProps<typeof Icon>["size"];
  truncatePlaceholder?: boolean;
  textSize?: "large" | "small";
  customHeight?: string;
  activeClassName?: string;
  downArrowIcon?: IconName;
  defaultOpen?: boolean;
  fallback?: string;
  allow?: boolean;
  valueFilter?: string;
  iconLeftStart?: boolean;
}

/**
 * Select — Component chọn lựa dạng dropdown, xây dựng trên nền Radix UI Select + Form.
 *
 * ✅ Chức năng chính:
 * - Hỗ trợ đầy đủ accessibility: label, error, description, role, aria.
 * - Hỗ trợ danh sách phẳng (`options`) hoặc theo nhóm (`groups`).
 * - Có thể tìm kiếm (`searchable`), xóa lựa chọn (`clearable`), hiển thị trạng thái loading.
 * - Tùy biến icon trái/phải (`iconLeft`, `iconRight`) và kích thước (`sizeSelect`, `textSize`).
 * - Hiển thị placeholder, tooltip, mô tả và lỗi.
 * - Cho phép tùy biến layout qua class: `triggerClassName`, `contentClassName`, v.v.
 * - Cho phép multi-select (chưa có UI hiển thị rõ, cần mở rộng nếu dùng).
 * - Có thể điều khiển qua props `value`, `onChange` hoặc dùng `defaultValue` (uncontrolled).
 *
 * ✅ Hành vi mở rộng:
 * - Khi có giá trị và `clearable = true`, icon mũi tên xuống sẽ được thay bằng nút “×” để xóa.
 * - Dữ liệu được lọc qua `searchTerm` khi bật chế độ `searchable`.
 * - Trạng thái tìm kiếm (`searchTerm`) sẽ được reset khi đóng dropdown.
 *
 */
const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      name,
      label,
      description,
      error,
      errorBorder,
      options = [],
      groups,
      iconLeft,
      iconRight,
      sizeSelect = "full",
      textSize = "large",
      required,
      disabled,
      value,
      defaultValue,
      onChange: onValueChange,
      onOpenChange,
      placeholder = "Chọn",
      placeholderClassName,
      clearable = false,
      searchable = false,
      loadingOptions = false,
      multiple = false,
      side = "bottom",
      align = "start",
      id,
      className = "",
      triggerClassName,
      itemClassName,
      contentClassName,
      testId,
      customWidth,
      messTooltip,
      sizeIcon = "sm",
      truncatePlaceholder = true,
      customHeight,
      activeClassName,
      downArrowIcon = "DownArrow",
      defaultOpen = false,
      fallback = "",
      allow = false,
      valueFilter = "",
      iconLeftStart = false,
    },
    ref
  ) => {
    const t = useNSTranslate();

    const normalizedValue = clearable
      ? (value ?? "")
      : value != null && value !== ""
        ? value
        : undefined;

    // Accessibility IDs
    const generatedId = React.useId();
    const selectId = id ?? generatedId;
    const descriptionId = description ? `${selectId}-description` : undefined;
    const errorId = error ? `${selectId}-error` : undefined;
    const ariaDesc = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

    const sizeClass = INPUT_SIZE[sizeSelect as keyof typeof INPUT_SIZE] ?? "";

    // Search state
    const [searchTerm, setSearchTerm] = useState("");

    // Filtered options
    const filtered = useMemo<Option[]>(() => {
      if (searchable && searchTerm) {
        const fn = (opt: Option) =>
          String(opt.label).toLowerCase().includes(searchTerm.toLowerCase());
        if (groups) return groups.flatMap((g) => g.options.filter(fn));
        return options.filter(fn);
      }
      return groups ? groups.flatMap((g) => g.options) : options;
    }, [options, groups, searchTerm, searchable]);

    // Reset searchTerm when dropdown closes
    const handleOpenChange = useCallback(
      (open: boolean) => {
        if (!open) setSearchTerm("");
        onOpenChange?.(open);
      },
      [onOpenChange]
    );

    // Render list items
    const renderItems = useCallback(() => {
      if (groups) {
        return groups.map((group) => (
          <React.Fragment key={group.label}>
            <SelectPrimitive.Label className="px-3 py-1">{group.label}</SelectPrimitive.Label>
            {group.options.map((opt) => (
              <SelectPrimitive.Item
                key={opt.value}
                value={opt.value}
                className={clsx(
                  "relative flex select-none items-center px-3 py-2 outline-none",
                  "text-neutral-9 hover:bg-purple-2 focus:bg-purple-2",
                  itemClassName
                )}
                data-testid={`${testId}-item-${opt.value}`}
              >
                <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </React.Fragment>
        ));
      }
      return filtered.map((opt) => (
        <SelectPrimitive.Item
          key={opt.value}
          value={opt.value}
          className={clsx(
            "relative flex select-none items-center px-3 py-2 outline-none",
            "text-neutral-9 hover:bg-purple-2 focus:bg-purple-2",
            `${opt.value === valueFilter && "hidden"}`,
            itemClassName
          )}
          data-testid={`${testId}-item-${opt.value}`}
        >
          <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
        </SelectPrimitive.Item>
      ));
    }, [groups, filtered, itemClassName, testId]);

    // Determine display text
    const valueToDisplay =
      options.find((opt) => opt.value === normalizedValue)?.shortLabel ||
      options.find((opt) => opt.value === normalizedValue)?.label ||
      placeholder;

    const displayValueApply = (
      value:
        | string
        | number
        | true
        | ReactElement<any, string | JSXElementConstructor<any>>
        | Iterable<ReactNode>,
      fallback: string,
      allow: boolean
    ) => {
      return allow ? fallback : value;
    };

    return (
      <SelectPrimitive.Root
        defaultOpen={defaultOpen}
        value={normalizedValue}
        defaultValue={defaultValue}
        disabled={disabled}
        onValueChange={onValueChange}
        onOpenChange={handleOpenChange}
        {...(multiple ? { multiple: true } : {})}
      >
        <Form.Field name={name} asChild>
          <div
            className={clsx("text-start", className, customWidth ?? "w-full")}
            data-testid={testId}
          >
            {label && (
              <div className="flex items-center gap-1 mb-1">
                <Form.Label htmlFor={selectId} className="block">
                  {label}
                  {required && <span className="text-red-5">*</span>}
                </Form.Label>
                {messTooltip && (
                  <Tooltip content={messTooltip} side="bottom">
                    <div className="cursor-help text-neutral-9">
                      <Icon name="General24px" size="sm" />
                    </div>
                  </Tooltip>
                )}
              </div>
            )}

            <SelectPrimitive.Trigger
              id={selectId}
              ref={ref}
              aria-describedby={ariaDesc}
              className={clsx(
                BASE_POSITION_CLASS,
                BASE_INPUT_CLASS,
                error || errorBorder
                  ? ERROR_INPUT_CLASS
                  : disabled
                    ? DISABLED_INPUT_CLASS
                    : BASE_INPUT_CLASS_ACTION,
                sizeClass,
                textSize === "small"
                  ? TEXT_SIZE.SMALL
                  : textSize === "large"
                    ? TEXT_SIZE.LARGE
                    : TEXT_SIZE.MEDIUM,
                triggerClassName
              )}
            >
              <div className="flex items-center justify-between w-full">
                {iconLeftStart ? (
                  <div className="flex items-center gap-2">
                    {iconLeft && <span className="shrink-0">{iconLeft}</span>}
                    <div
                      className={clsx(
                        "bg-transparent text-left outline-none",
                        placeholderClassName,
                        normalizedValue ? `${activeClassName} text-neutral-9` : "text-neutral-4",
                        truncatePlaceholder ? "truncate" : "whitespace-nowrap"
                      )}
                    >
                      {/* {valueToDisplay} */}

                      {displayValueApply(valueToDisplay, fallback, allow)}
                    </div>
                  </div>
                ) : (
                  <>
                    {iconLeft && <span>{iconLeft}</span>}

                    <div
                      className={clsx(
                        "bg-transparent text-left outline-none",
                        placeholderClassName,
                        normalizedValue ? `${activeClassName} text-neutral-9` : "text-neutral-4",
                        truncatePlaceholder ? "truncate" : "whitespace-nowrap"
                      )}
                    >
                      {/* {valueToDisplay} */}
                      {displayValueApply(valueToDisplay, fallback, allow)}
                    </div>
                  </>
                )}

                <div className="flex items-center gap-2 ml-2">
                  {clearable && normalizedValue ? (
                    <Icon
                      name="CloseOutlined"
                      size={sizeIcon}
                      className="cursor-pointer text-neutral-6"
                      onClick={() => {
                        onValueChange?.("");
                      }}
                    />
                  ) : iconRight ? (
                    <span className="shrink-0">{iconRight}</span>
                  ) : (
                    <SelectPrimitive.Icon>
                      <Icon name={downArrowIcon} className="text-neutral-6" size={sizeIcon} />
                    </SelectPrimitive.Icon>
                  )}
                </div>
              </div>

              <VisuallyHidden>
                <SelectPrimitive.Value placeholder={placeholder} />
              </VisuallyHidden>
            </SelectPrimitive.Trigger>

            <SelectPrimitive.Portal>
              <SelectPrimitive.Content
                className={clsx(
                  "z-[85] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md bg-background-popup text-neutral-9 shadow-lg",
                  textSize === "small"
                    ? TEXT_SIZE.SMALL
                    : textSize === "large"
                      ? TEXT_SIZE.LARGE
                      : TEXT_SIZE.MEDIUM,
                  contentClassName
                )}
                side={side}
                align={align}
                collisionPadding={8}
                position="popper"
              >
                {searchable && (
                  <div className="p-2">
                    <Input
                      type="text"
                      name="search"
                      value={searchTerm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSearchTerm(e.target.value)
                      }
                      placeholder={placeholder}
                      data-testid={`${testId}-search`}
                    />
                  </div>
                )}
                <SelectPrimitive.Viewport className={clsx("w-full", customHeight)}>
                  {loadingOptions ? (
                    <div className="px-3 py-2 text-center text-caption-12 text-neutral-9">
                      {t("common.loading")}
                    </div>
                  ) : (
                    renderItems()
                  )}
                </SelectPrimitive.Viewport>
              </SelectPrimitive.Content>
            </SelectPrimitive.Portal>

            {description && (
              <p id={descriptionId} className="mt-1 text-caption-12 text-neutral-7">
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
      </SelectPrimitive.Root>
    );
  }
);

Select.displayName = "Select";
export default React.memo(Select);
