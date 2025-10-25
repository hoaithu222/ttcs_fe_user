/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useId, useMemo, useRef, useState } from "react";

import clsx from "clsx";
import { VariableSizeList as List, ListChildComponentProps } from "react-window";

import Divider from "@/foundation/components/layout/Divider";
import Icon from "@/foundation/components/icons/Icon";
import Input, { FieldInputProps } from "@/foundation/components/input/Input";
import { stripDiacritics } from "@/shared/utils/string.utils";
import { showToastByCode } from "@/shared/utils/toast.utils";
import type { TranslationKeys } from "@/shared/utils/toast.utils";

import { IconSize } from "../../icons/Icon";
import { InputSize } from "../inputs.consts";
import CustomOuterElement from "./CustomOuterElement";

// Defines the shape of each search option
export interface SearchOption {
  label: string;
  value: string;
  onClick?: (item: SearchOption) => void; // callback when option is clicked
  meta?: Record<string, any>;
  testId?: string;
  searchLabel?: string; // custom text to match on when filtering
}

// Props accepted by the SearchInput component
export interface SearchInputProps extends Omit<FieldInputProps, "sizeInput"> {
  searchItems: SearchOption[]; // all options to display
  renderItem?: (item: SearchOption, selected?: boolean) => React.ReactNode; // custom renderer
  listWidth?: number | string;
  listHeight?: number | string;
  itemSize?: number; // height of each option row
  inputClassName?: string;
  sizeInput?: keyof typeof InputSize | string;
  onClear?: () => void; // callback when input is cleared
  clearOnSelect?: boolean; // clear input after selecting
  blurOnSelect?: boolean; // blur input after selecting
  clearOnClick?: boolean; // clear input value on first click
  changeOnFocus?: boolean;
  testId?: string;
  iconSize?: IconSize;
  iconRight?: React.ReactNode;
  iconLeft?: React.ReactNode;
  hideIconRight?: boolean;
  hideIconLeft?: boolean;
  onSelectOption?: (ticker: string) => void; // callback when a ticker is selected
  displaySelectedValue?: boolean; // show selected value instead of label
  isAutoFocus?: boolean;
  keyNotFound?: keyof typeof TranslationKeys; // toast code when no match
  handleBlur?: () => void;
  enableExactMatch?: boolean;
  revertOnBlur?: boolean; // revert to last confirmed value on blur
  priorityItems?: SearchOption[]; // items shown at the top
  priorityLabel?: string;
  normalLabel?: string;
  gapItem?: keyof typeof GAP_ITEM_MAP; // spacing between items
  classNameList?: string;
  itemClassName?: string;
  forceUpperCase?: boolean;
  inputWrapperClassName?: string;
  isIconRightFocus?: boolean;
}

// Constants for header row height and container padding
const HEADER_HEIGHT = 24;
const PADDING_CONTAINER = 32;

// Defines spacing values for gapItem prop
const GAP_ITEM_MAP = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
} as const;

const SearchInputEnhance: React.FC<SearchInputProps> = ({
  searchItems = [],
  renderItem,
  listWidth,
  listHeight,
  itemSize = 36,
  inputClassName,
  sizeInput = "md",
  onClear,
  clearOnSelect = false,
  blurOnSelect = false,
  clearOnClick = false,
  changeOnFocus = false,
  testId,
  iconSize = "sm",
  iconRight,
  iconLeft,
  hideIconRight = false,
  hideIconLeft = false,
  onSelectOption,
  displaySelectedValue = false,
  isAutoFocus,
  keyNotFound,
  handleBlur,
  enableExactMatch = true,
  revertOnBlur = true,
  priorityItems = [],
  priorityLabel,
  normalLabel,
  gapItem = "none",
  classNameList,
  itemClassName,
  forceUpperCase = false,
  inputWrapperClassName,
  isIconRightFocus = false,
  ...props
}) => {
  // Refs to DOM elements and state trackers
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<List>(null);
  const confirmedValueRef = useRef<string | null>(null); // last confirmed selection value
  const confirmedLabelRef = useRef<string>(""); // last confirmed label text
  const editingRef = useRef<boolean>(false); // whether user is editing value

  // Generate unique IDs for accessibility if not provided
  const generatedId = useId();
  const inputId = props.id ?? generatedId;
  const descriptionId = props.description ? `${inputId}-description` : "";
  const errorId = props.error ? `${inputId}-error` : "";
  const ariaDescribedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  // Component state
  const [value, setValue] = useState<string>(() => (props.value as string) || "");
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  // Sync external prop value into internal state
  useEffect(() => {
    if (props.value !== undefined) {
      const val = props.value as string;
      const label = displaySelectedValue
        ? val
        : (searchItems.find((i) => i.value === val)?.label ?? val);
      setValue(label);
      confirmedValueRef.current = val;
      confirmedLabelRef.current = label;
      setSelectedValue(val);
      editingRef.current = false;
    }
  }, [props.value, displaySelectedValue, searchItems]);

  // Filter items into priority and normal groups based on user input
  const { filteredPriority, filteredNormal } = useMemo(() => {
    const raw = (value || "").trim().toLowerCase();
    const norm = stripDiacritics(raw);
    const match = (item: SearchOption) => {
      const txt = stripDiacritics((item.searchLabel ?? item.label).toLowerCase());
      if (enableExactMatch && txt === raw) return true;
      return txt.includes(norm);
    };
    const p = priorityItems.filter(match);
    const n = searchItems
      .filter((i) => !priorityItems.some((pi) => pi.value === i.value))
      .filter(match);
    return { filteredPriority: p, filteredNormal: n };
  }, [value, searchItems, priorityItems, enableExactMatch]);

  // Combine headers and items into a flat rows array for rendering
  const rows = useMemo(() => {
    const list: { type: "header" | "item"; label?: string; item?: SearchOption; gIdx?: number }[] =
      [];
    if (filteredPriority.length) {
      if (priorityLabel) list.push({ type: "header", label: priorityLabel });
      filteredPriority.forEach((item, i) => list.push({ type: "item", item, gIdx: i }));
    }
    if (filteredNormal.length) {
      if (normalLabel) list.push({ type: "header", label: normalLabel });
      filteredNormal.forEach((item, i) =>
        list.push({ type: "item", item, gIdx: filteredPriority.length + i })
      );
    }
    return list;
  }, [filteredPriority, filteredNormal, priorityLabel, normalLabel]);

  const totalCount = filteredPriority.length + filteredNormal.length;

  // Map group index to actual list index (accounting for headers)
  const getListIndex = (gIdx: number) => {
    let idx = 0;
    if (filteredPriority.length) {
      idx += priorityLabel ? 1 : 0;
      if (gIdx < filteredPriority.length) return idx + gIdx;
      idx += filteredPriority.length;
    }
    if (filteredNormal.length) {
      idx += normalLabel ? 1 : 0;
      return idx + (gIdx - filteredPriority.length);
    }
    return 0;
  };

  // Scroll the list to keep highlighted item in view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      listRef.current.scrollToItem(getListIndex(highlightedIndex));
    }
  }, [highlightedIndex, filteredPriority.length, filteredNormal.length]);

  // Move highlight up/down with wrapping
  const moveHighlight = (delta: number) =>
    setHighlightedIndex((idx) => {
      const next = idx + delta;
      if (next < 0) return totalCount - 1;
      if (next >= totalCount) return 0;
      return next;
    });

  // Handle selecting an item by its group index
  const selectByGlobalIndex = (gIdx: number) => {
    const item =
      gIdx < filteredPriority.length
        ? filteredPriority[gIdx]
        : filteredNormal[gIdx - filteredPriority.length];
    item.onClick?.(item);
    props.onChange?.({ target: { value: item.value } } as any);
    onSelectOption?.(item.value);
    const label = displaySelectedValue ? item.value : item.label;
    setValue(label);
    setSelectedValue(item.value);
    confirmedValueRef.current = item.value;
    confirmedLabelRef.current = label;
    editingRef.current = false;
    setHighlightedIndex(-1);
    if (blurOnSelect) {
      inputRef.current?.blur();
      setIsFocused(false);
    }
    if (clearOnSelect) onClear?.();
  };

  // Keyboard navigation: arrows + enter/tab
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["ArrowDown", "ArrowUp", "Enter", "Tab"].includes(e.key)) {
      e.preventDefault();
      if (e.key === "ArrowDown") moveHighlight(1);
      else if (e.key === "ArrowUp") moveHighlight(-1);
      else selectByGlobalIndex(highlightedIndex >= 0 ? highlightedIndex : 0);
    }
  };

  // // Show toast if no matches
  // const handleKeyUp = () => {
  //   if (!totalCount && keyNotFound)
  // };

  // Update internal state on input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (changeOnFocus && !isFocused) setIsFocused(true);
    setValue(forceUpperCase ? e.target.value.toUpperCase() : e.target.value);
    props.onChange?.(e);
    setHighlightedIndex(-1);
    editingRef.current = true;
  };

  // Handle clicking the clear (X) icon
  const handleClearIcon = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setValue("");
    props.onChange?.({ target: { value: "" } } as any);
    setSelectedValue(null);
    confirmedValueRef.current = null;
    confirmedLabelRef.current = "";
    editingRef.current = false;
    onClear?.();
    inputRef.current?.focus();
  };

  // Blur event: optionally revert to last confirmed value
  const handleInternalBlur = () => {
    setIsFocused(false);
    if (!totalCount && keyNotFound) showToastByCode(keyNotFound as string);
    if (!revertOnBlur) {
      handleBlur?.();
      return;
    }
    setTimeout(() => {
      if (editingRef.current) {
        setValue(confirmedLabelRef.current);
        props.onChange?.({ target: { value: confirmedValueRef.current || "" } } as any);
        editingRef.current = false;
      }
    }, 0);
    handleBlur?.();
  };

  // Click on input: clear on first click, restore highlight
  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (clearOnClick && !editingRef.current) {
      setValue("");
      props.onChange?.({ target: { value: "" } } as any);
      editingRef.current = true;
    }
    setIsFocused(true);
    setTimeout(() => {
      if (selectedValue !== null && listRef.current) {
        let tempListPriority: SearchOption[] = [];
        let tempListNormal: SearchOption[] = [];
        if (clearOnClick) {
          tempListPriority = priorityItems;
          tempListNormal = searchItems;
        } else {
          tempListPriority = filteredPriority;
          tempListNormal = filteredNormal;
        }

        let prevIdx = tempListPriority.findIndex((i) => i.value === selectedValue);
        if (prevIdx === -1) {
          const normIdx = tempListNormal.findIndex((i) => i.value === selectedValue);
          if (normIdx !== -1) prevIdx = tempListPriority.length + normIdx;
        }
        if (prevIdx >= 0) {
          setHighlightedIndex(prevIdx);
        }
      }
    }, 50);
  };

  // Focus behaves same as click for clearOnClick
  const handleInputFocus = (_e: React.FocusEvent<HTMLInputElement>) => {
    if (clearOnClick && !editingRef.current) {
      setValue("");
      props.onChange?.({ target: { value: "" } } as any);
      editingRef.current = true;
    }
    setIsFocused(true);
  };

  // Auto-focus when mounted if requested
  useEffect(() => {
    if (isAutoFocus) inputRef.current?.focus();
  }, [isAutoFocus]);

  // Render left icon (search or custom)
  const renderIconLeft = () =>
    hideIconLeft ? null : (iconLeft ?? <Icon name="SearchOutlined" size={iconSize} />);

  // Render right icon (clear or custom)
  const renderIconRight = () => {
    if (hideIconRight) return null;
    if (iconRight) {
      return (
        <span
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            inputRef.current?.focus();
          }}
        >
          {iconRight}
        </span>
      );
    }
    return (
      <Icon
        name="CloseOutlined"
        size={iconSize}
        onClick={() => handleClearIcon({} as React.MouseEvent)}
        className={clsx(value ? "opacity-100" : "opacity-0")}
      />
    );
  };

  // Calculate spacing and list height based on items and gaps
  const gapItemValue = GAP_ITEM_MAP[gapItem] ?? 0;
  const totalGap = (rows.length - 1) * gapItemValue;
  const maxH = typeof listHeight === "number" ? listHeight : 240;
  const listH = Math.min(
    rows.reduce((sum, r) => sum + (r.type === "header" ? HEADER_HEIGHT : itemSize), 0) +
      (priorityLabel || normalLabel ? PADDING_CONTAINER : 0) +
      totalGap,
    maxH
  );
  const calcItemSize = (index: number) => {
    const r = rows[index];
    const isLast = index === rows.length - 1;
    return (r.type === "header" ? HEADER_HEIGHT : itemSize) + (isLast ? 0 : gapItemValue);
  };

  // Alias for TS to allow custom outer element
  const ListAny = List as any;

  // Row renderer for react-window list
  const Row = ({ index, style }: ListChildComponentProps) => {
    const entry = rows[index];
    if (entry.type === "header") {
      return (
        <div style={style} className="px-4">
          <Divider text={entry.label} classNameText="!text-body-14 !text-neutral-6" />
        </div>
      );
    }
    const gIdx = entry.gIdx!;
    const item = entry.item!;
    const isSel = gIdx === highlightedIndex || item.value === selectedValue;
    return (
      <div style={style} className="list-wrapper">
        <div
          role="option"
          aria-selected={isSel}
          style={{ height: Number(style.height) - gapItemValue }}
          className={clsx(
            "text-body-14 flex w-full cursor-pointer items-center px-4",
            isSel ? "bg-purple-2 text-neutral-9" : "text-neutral-9 hover:bg-purple-2",
            itemClassName
          )}
          onMouseEnter={() => setHighlightedIndex(gIdx)}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => selectByGlobalIndex(gIdx)}
        >
          {renderItem?.(item, isSel) ?? item.label}
        </div>
        <div style={{ height: gapItemValue }} className="w-full" />
      </div>
    );
  };

  return (
    <div className={clsx("relative", inputWrapperClassName)}>
      {/* Main input field with icons and handlers */}
      <Input
        ref={inputRef}
        {...props}
        id={inputId}
        aria-describedby={ariaDescribedBy}
        value={value}
        onChange={handleChange}
        onClick={handleInputClick}
        onFocus={handleInputFocus}
        onBlur={handleInternalBlur}
        onKeyDown={handleKeyDown}
        // onKeyUp={handleKeyUp}
        iconLeft={renderIconLeft()}
        iconRight={renderIconRight()}
        sizeInput={sizeInput}
        className={clsx(
          isFocused ? "bg-neutral-0" : "bg-neutral-1",
          "w-full rounded-lg border border-neutral-3 px-3 transition-colors",
          "text-body-14 placeholder:text-neutral-4 hover:border-neutral-5 focus:border-primary-6",
          inputClassName
        )}
        data-testid={testId}
        isIconRightFocus={isIconRightFocus}
      />

      {/* Dropdown list, shown when focused and items exist */}
      {isFocused && totalCount > 0 && (
        <div
          role="listbox"
          className={clsx(
            "absolute z-50 min-w-full overflow-hidden rounded-lg border border-neutral-3 bg-background-popup shadow-lg",
            priorityLabel || normalLabel ? "py-5" : "",
            classNameList
          )}
          style={{
            width: listWidth ?? "100%",
            height: listH,
          }}
        >
          <ListAny
            ref={listRef}
            height={listH}
            itemCount={rows.length}
            itemSize={calcItemSize}
            width="100%"
            outerElementType={CustomOuterElement}
          >
            {Row}
          </ListAny>
        </div>
      )}
    </div>
  );
};

SearchInputEnhance.displayName = "SearchInputEnhance";
export default SearchInputEnhance;
