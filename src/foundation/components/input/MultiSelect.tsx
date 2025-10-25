import React, { useCallback, useMemo, useState } from "react";

import * as Form from "@radix-ui/react-form";
import * as Popover from "@radix-ui/react-popover";
import clsx from "clsx";

import Checkbox from "@/foundation/components/input/Checkbox";
import Icon from "@/foundation/components/icons/Icon";
import Input from "@/foundation/components/input/Input";
import Tooltip from "@/foundation/components/tooltip/Tooltip";
import { useNSTranslate } from "@/shared/hooks";

import { IconSize } from "../icons/Icon";
import {
  BASE_INPUT_CLASS,
  BASE_INPUT_CLASS_ACTION,
  BASE_POSITION_CLASS,
  DISABLED_INPUT_CLASS,
  ERROR_INPUT_CLASS,
  INPUT_SIZE,
  TEXT_SIZE,
} from "./inputs.consts";

export interface Option {
  value: string;
  label: React.ReactNode;
  shortLabel?: React.ReactNode;
}
export interface OptionGroup {
  label: string;
  options: Option[];
}

const SIDE_MAP = {
  top: "top",
  bottom: "bottom",
  left: "left",
  right: "right",
} as const;

const ALIGN_MAP = {
  start: "start",
  center: "center",
  end: "end",
} as const;

const BASE_CONTENT = "z-50 w-full max-w-sm rounded-md bg-background-popup shadow-lg";

export interface MultiSelectProps {
  name: string;
  label?: string;
  description?: string;
  error?: string;
  options?: Option[];
  groups?: OptionGroup[];
  size?: keyof typeof INPUT_SIZE;
  required?: boolean;
  disabled?: boolean;
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  searchable?: boolean;
  clearable?: boolean;
  side?: keyof typeof SIDE_MAP;
  align?: keyof typeof ALIGN_MAP;
  id?: string;
  className?: string;
  triggerClassName?: string;
  itemClassName?: string;
  contentClassName?: string;
  placeholderClassName?: string;
  testId?: string;
  footer?: React.ReactNode;
  customWidth?: string;
  customHeight?: string;
  infoTooltip?: string;
  /** Controlled search term */
  searchTerm?: string;
  /** Callback when search term changes */
  onSearchChange?: (value: string) => void;
  textSize?: "large" | "small";
  sizeIcon?: IconSize;
  showAllOption?: boolean;
}

const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  (
    {
      name,
      label,
      description,
      error,
      options = [],
      groups,
      size = "full",
      required,
      disabled,
      value = [],
      onChange,
      onOpenChange,
      placeholder = "Chọn...",
      searchable = false,
      clearable = false,
      side = "bottom",
      align = "start",
      id,
      className,
      triggerClassName,
      itemClassName,
      contentClassName,
      placeholderClassName,
      testId,
      footer,
      customWidth,
      customHeight,
      infoTooltip,
      searchTerm: controlledSearch,
      onSearchChange,
      textSize = "large",
      sizeIcon = "sm",
      showAllOption = true,
    },
    ref
  ) => {
    const t = useNSTranslate();
    const genId = React.useId();
    const selectId = id ?? genId;
    const descId = description ? `${selectId}-desc` : undefined;
    const errId = error ? `${selectId}-err` : undefined;
    const ariaDesc = [descId, errId].filter(Boolean).join(" ") || undefined;

    const sizeClass = INPUT_SIZE[size as keyof typeof INPUT_SIZE] ?? "";
    const [open, setOpen] = useState(false);
    const handleOpenChange = (o: boolean) => {
      setOpen(o);
      onOpenChange?.(o);
    };

    // Controlled vs uncontrolled search state
    const [searchState, setSearchState] = useState("");
    const searchTerm = controlledSearch !== undefined ? controlledSearch : searchState;
    const handleSearchChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        if (controlledSearch !== undefined) {
          onSearchChange?.(v);
        } else {
          setSearchState(v);
        }
      },
      [controlledSearch, onSearchChange]
    );

    const filterFn = useCallback(
      (opt: Option) => String(opt.label).toLowerCase().includes(searchTerm.toLowerCase()),
      [searchTerm]
    );

    const allOptions = useMemo(
      () => (groups ? groups.flatMap((g) => g.options) : options),
      [groups, options]
    );

    const filteredGroups = useMemo<OptionGroup[] | undefined>(() => {
      if (!groups) return undefined;
      if (!searchable || !searchTerm) return groups;
      return groups
        .map((g) => ({ label: g.label, options: g.options.filter(filterFn) }))
        .filter((g) => g.options.length > 0);
    }, [groups, searchable, searchTerm, filterFn]);

    const filteredOptions = useMemo<Option[]>(() => {
      if (groups) return [];
      if (searchable && searchTerm) return options.filter(filterFn);
      return options;
    }, [groups, options, searchable, searchTerm, filterFn]);

    const selectedLabels = useMemo(
      () =>
        (value || []).map((v) => {
          const found = allOptions.find((o) => o.value === v);
          return found?.shortLabel?.toString() || found?.label?.toString() || v;
        }),
      [value, allOptions]
    );

    const toggleValue = useCallback(
      (val: string) => {
        const next = value.includes(val) ? value.filter((x) => x !== val) : [...value, val];
        onChange?.(next);
      },
      [value, onChange]
    );

    const allValues = allOptions.map((o) => o.value);
    const allSelected = value.length > 0 && value.length === allValues.length;
    const selectAll = useCallback(() => onChange?.(allValues), [allValues, onChange]);
    const clearAll = useCallback(() => onChange?.([]), [onChange]);

    const OptionItem: React.FC<{ opt: Option }> = ({ opt }) => (
      <div key={opt.value} className={clsx("px-4 py-2 text-left", itemClassName)}>
        <Checkbox
          label={opt.label}
          checked={value.includes(opt.value)}
          onCheckedChange={() => toggleValue(opt.value)}
          disabled={disabled}
          className="mr-2"
          testId={`${testId}-option-${opt.value}`}
          size={sizeIcon}
          wrapperClassName="!justify-start"
          labelClassName={clsx(
            textSize === "small"
              ? TEXT_SIZE.SMALL
              : textSize === "large"
                ? TEXT_SIZE.LARGE
                : TEXT_SIZE.MEDIUM
          )}
        />
      </div>
    );

    const GroupSection: React.FC<{ group: OptionGroup }> = ({ group }) => (
      <div key={group.label}>
        <div className="px-4 py-1 text-left text-caption-12">{group.label}</div>
        {group.options.map((opt) => (
          <OptionItem key={opt.value} opt={opt} />
        ))}
      </div>
    );

    return (
      <Form.Field name={name} asChild>
        <div
          className={clsx("relative text-start", customWidth ?? "w-full", className)}
          data-testid={testId}
        >
          {label && (
            <div className="flex items-center gap-1 mb-1">
              <Form.Label htmlFor={selectId} className="block">
                {label} {required && <span className="text-red-5">*</span>}
              </Form.Label>
              {infoTooltip && (
                <Tooltip content={infoTooltip} side="bottom">
                  <Icon name="General24px" size="sm" className="cursor-help" />
                </Tooltip>
              )}
            </div>
          )}

          <Popover.Root open={open} onOpenChange={handleOpenChange}>
            <Popover.Trigger asChild>
              <button
                type="button"
                ref={ref}
                id={selectId}
                aria-describedby={ariaDesc}
                disabled={disabled}
                className={clsx(
                  BASE_POSITION_CLASS,
                  BASE_INPUT_CLASS,
                  error
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
                  "justify-between",
                  triggerClassName
                )}
              >
                <span className={clsx("truncate", placeholderClassName)}>
                  {selectedLabels.length > 0 ? selectedLabels.join(", ") : placeholder}
                </span>
                <div className="flex items-center gap-2 ml-2">
                  {clearable && selectedLabels.length > 0 && (
                    <Icon
                      name="CloseOutlined"
                      onClick={() => {
                        clearAll();
                      }}
                      testId={`${testId}-clear`}
                      size={sizeIcon}
                    />
                  )}
                  <Icon name="DownArrow" testId={`${testId}-chevron`} size={sizeIcon} />
                </div>
              </button>
            </Popover.Trigger>

            <Popover.Portal>
              <Popover.Content
                side={side}
                align={align}
                collisionPadding={8}
                className={clsx(BASE_CONTENT, customHeight, contentClassName)}
              >
                {allOptions && allOptions.length > 0 && showAllOption && (
                  <div key="select-all" className={clsx("px-4 py-2 text-left", itemClassName)}>
                    <Checkbox
                      label={t("common.all")}
                      checked={allSelected}
                      onCheckedChange={() => (allSelected ? clearAll() : selectAll())}
                      disabled={disabled}
                      size={sizeIcon}
                      wrapperClassName="!justify-start"
                      labelClassName={clsx(
                        textSize === "small"
                          ? TEXT_SIZE.SMALL
                          : textSize === "large"
                            ? TEXT_SIZE.LARGE
                            : TEXT_SIZE.MEDIUM
                      )}
                      className="mr-2"
                    />
                  </div>
                )}

                {searchable && (
                  <div className="p-2">
                    <Input
                      type="text"
                      name={`${name}-search`}
                      value={searchTerm}
                      onChange={handleSearchChange}
                      placeholder={placeholder}
                      data-testid={`${testId}-search`}
                    />
                  </div>
                )}

                <div className="overflow-auto max-h-60">
                  {filteredGroups ? (
                    filteredGroups.map((group) => <GroupSection key={group.label} group={group} />)
                  ) : filteredOptions.length > 0 ? (
                    filteredOptions.map((opt) => <OptionItem key={opt.value} opt={opt} />)
                  ) : (
                    <div
                      className={clsx(
                        "px-4 py-2 text-left text-neutral-5",
                        textSize === "small"
                          ? TEXT_SIZE.SMALL
                          : textSize === "large"
                            ? TEXT_SIZE.LARGE
                            : TEXT_SIZE.MEDIUM
                      )}
                    >
                      {t("common.empty") || "Không có tùy chọn"}
                    </div>
                  )}
                </div>

                {description && (
                  <div className="px-4 py-2 cursor-pointer text-caption-12 text-neutral-7">
                    {description}
                  </div>
                )}

                {footer}
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          {error && (
            <Form.Message asChild>
              <p
                id={errId}
                role="alert"
                aria-live="assertive"
                className="mt-1 text-caption-12 text-error"
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

MultiSelect.displayName = "MultiSelect";
export default React.memo(MultiSelect);
