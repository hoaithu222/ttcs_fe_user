/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useRef, useState } from "react";

import clsx from "clsx";
import { VariableSizeList as List, ListChildComponentProps } from "react-window";
import { Search, X } from "lucide-react";

import Divider from "@/foundation/components/layout/Divider";
import Input, { FieldInputProps } from "@/foundation/components/input/Input";
import { stripDiacritics } from "@/shared/utils/string.utils";
import { showToastByCode } from "@/shared/utils/toast.utils";

import { IconSize } from "../../icons/Icon";
import { InputSize } from "../inputs.consts";
import CustomOuterElement from "./CustomOuterElement";

export interface SearchOption {
  label: string; // Nhãn hiển thị cho option
  value: string; // Giá trị thực tế sẽ trả về khi chọn
  onClick?: (item: SearchOption) => void; // Callback tuỳ chỉnh khi option được click
  meta?: Record<string, any>; // Trường bổ sung nếu cần đính kèm thông tin khác
  testId?: string; // Dùng để test e2e hoặc unit test
  searchLabel?: string; // Dùng để so khớp bộ lọc (có thể khác label)
}

export interface SearchInputProps extends Omit<FieldInputProps, "sizeInput"> {
  /** Danh sách items gốc để tìm kiếm và render */
  searchItems: SearchOption[];
  /** Tuỳ chỉnh cách render mỗi item trong list */
  renderItem?: (item: SearchOption, selected?: boolean) => React.ReactNode;
  /** Độ rộng dropdown: số (px) hoặc chuỗi CSS width */
  listWidth?: number | string;
  /** Chiều cao dropdown: số (px) hoặc chuỗi CSS height */
  listHeight?: number | string;
  /** Chiều cao mỗi dòng item (mặc định 36px) */
  itemSize?: number;
  /** Class tuỳ chỉnh cho wrapper input */
  inputClassName?: string;
  /** Kích cỡ input (theo enum hoặc chuỗi tuỳ chỉnh) */
  sizeInput?: keyof typeof InputSize | string;
  /** Callback khi nhấn icon clear */
  onClear?: () => void;
  /** Xoá text ngay sau khi chọn item (không giữ value) */
  clearOnSelect?: boolean;
  /** Blur input ngay sau khi chọn để đóng dropdown */
  blurOnSelect?: boolean;
  /** Nếu true: click vào input sẽ clear value và show full list */
  clearOnClick?: boolean;
  /** Tự động mở dropdown khi focus */
  changeOnFocus?: boolean;
  /** testId cho component input */
  testId?: string;
  /** Kích cỡ icon (ví dụ 'sm', 'md', 'lg') */
  iconSize?: IconSize;
  /** Tuỳ biến icon bên phải */
  iconRight?: React.ReactNode;
  /** Tuỳ biến icon bên trái */
  iconLeft?: React.ReactNode;
  hideIconRight?: boolean; // Ẩn icon bên phải nếu true
  hideIconLeft?: boolean; // Ẩn icon bên trái nếu true
  /** Callback khi chọn ticker (chuỗi value) */
  onSelectTicker?: (ticker: string) => void;
  /** Hiển thị value (không phải label) sau khi chọn */
  displaySelectedValue?: boolean;
  /** Tự focus input khi mount nếu true */
  isAutoFocus?: boolean;
  /** Mã lỗi khi không tìm thấy item (hiện toast) */
  keyNotFound?: string;
  /** Callback riêng khi blur (ngoài logic revert) */
  handleBlur?: () => void;
  /** Cho phép so khớp chính xác (trim, case-insensitive) */
  enableExactMatch?: boolean;
  /** Cho phép so khớp prefix */
  enablePrefixMatch?: boolean;
  /** Khi blur sẽ revert về confirmed value/clear như trước */
  revertOnBlur?: boolean;
  /** Danh sách item ưu tiên hiển thị trước */
  priorityItems?: SearchOption[];
  /** Nhãn cho nhóm ưu tiên */
  priorityLabel?: string;
  /** Nhãn cho nhóm bình thường */
  normalLabel?: string;
  /** Khoảng cách giữa các item */
  gapItem?: keyof typeof GAP_ITEM_MAP;
  /** Class tuỳ chỉnh cho container dropdown */
  classNameList?: string;
  /** Class tuỳ chỉnh cho item */
  itemClassName?: string;
  /** Force chữ in hoa */
  forceUpperCase?: boolean;
  /** Class tuỳ chỉnh cho container input */
  inputWrapperClassName?: string;
  /** Cho phép tìm kiếm khi value rỗng */
  shouldSelectDefault?: boolean;
  /** Giới hạn số ký tự */
  maxLength?: number;
  /** Callback khi blur để truyền giá trị hiện tại ra ngoài cả trường hợp enter*/
  onBlurValue?: (value: string) => void;
}
const HEADER_HEIGHT = 24;
const PADDING_CONTAINER = 32;

const GAP_ITEM_MAP = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
} as const;

const SearchInput: React.FC<SearchInputProps> = ({
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
  onSelectTicker,
  displaySelectedValue = false,
  isAutoFocus,
  keyNotFound,
  handleBlur,
  enableExactMatch = true,
  enablePrefixMatch = false,
  revertOnBlur = true,
  classNameList,
  gapItem = "none",
  priorityItems = [],
  priorityLabel,
  normalLabel,
  itemClassName,
  forceUpperCase = false,
  inputWrapperClassName,
  shouldSelectDefault = true,
  maxLength,
  onBlurValue,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<List>(null);
  const confirmedValueRef = useRef<string | null>(null);
  const confirmedLabelRef = useRef<string>("");

  const generatedId = React.useId();
  const inputId = props.id ?? generatedId;
  const descriptionId = props.description ? `${inputId}-description` : "";
  const errorId = props.error ? `${inputId}-error` : "";
  const ariaDescribedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  const [value, setValue] = useState<string>((props.value as string) || "");
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  useEffect(() => {
    if (props.value !== undefined && props.value !== value) {
      const found = searchItems.find((i) => i.value === props.value);
      const label = displaySelectedValue
        ? String(props.value)
        : (found?.label ?? String(props.value));

      setValue(label);

      // đồng bộ ref để blur-revert đúng
      confirmedValueRef.current = String(props.value);
      confirmedLabelRef.current = label;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.value]);

  const { filteredPriority, filteredNormal } = useMemo(() => {
    const raw = (value ?? "").trim().toLowerCase();
    const norm = stripDiacritics(raw);

    const match = (item: SearchOption) => {
      const txt = stripDiacritics((item.searchLabel ?? item.label).toLowerCase());

      if (enablePrefixMatch) {
        return txt.startsWith(norm);
      }

      if (enableExactMatch && txt === raw) {
        return true;
      }

      // 3. Substring match (mặc định)
      return txt.includes(norm);
    };

    const p = priorityItems.filter(match);
    const n = searchItems
      .filter((i) => !priorityItems.some((pi) => pi.value === i.value))
      .filter(match);

    return { filteredPriority: p, filteredNormal: n };
  }, [
    value,
    searchItems,
    priorityItems,
    enableExactMatch,
    enablePrefixMatch, // nhớ bổ sung vào dependency list
  ]);

  const totalCount = filteredPriority.length + filteredNormal.length;

  const rows = useMemo(() => {
    const list: Array<{
      type: "header" | "item";
      label?: string;
      item?: SearchOption;
      gIdx?: number;
    }> = [];
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

  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      listRef.current.scrollToItem(getListIndex(highlightedIndex));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightedIndex, filteredPriority.length, filteredNormal.length]);

  const moveHighlight = (delta: number) =>
    setHighlightedIndex((idx) => {
      const next = idx + delta;
      if (next < 0) return totalCount - 1;
      if (next >= totalCount) return 0;
      return next;
    });

  const selectByGlobalIndex = (gIdx: number) => {
    const item =
      gIdx < filteredPriority.length
        ? filteredPriority[gIdx]
        : filteredNormal[gIdx - filteredPriority.length];
    item.onClick?.(item);
    onSelectTicker?.(item.value);
    if (clearOnSelect) {
      handleClear();
    } else {
      const label = displaySelectedValue ? item.value : item.label;
      setValue(label);
      setSelectedValue(item.value);
      confirmedValueRef.current = item.value;
      confirmedLabelRef.current = label;
    }
    setHighlightedIndex(-1);
    if (blurOnSelect) {
      inputRef.current?.blur();
      setIsFocused(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["ArrowDown", "ArrowUp", "Enter", "Tab"].includes(e.key)) {
      // if Enter or Tab and revertOnBlur=false, skip selection (allow default behavior)
      if ((e.key === "Enter" || e.key === "Tab") && !revertOnBlur && highlightedIndex < 0) {
        onSelectTicker?.("");

        // chỉ fill khi không có danh sát tìm kiếm phù hợp
        if (!filteredPriority.length && !filteredNormal.length) {
          onBlurValue?.(value ?? "");
        }

        value.trim() !== "" && !onBlurValue
          ? selectByGlobalIndex(0)
          : shouldSelectDefault && selectByGlobalIndex(0);
        // onBlurValue?.(value ?? '');
        // setIsFocused(false);

        if (blurOnSelect) {
          inputRef.current?.blur();
          setIsFocused(false);
        }
        return;
      }

      e.preventDefault();
      if (e.key === "ArrowDown") moveHighlight(1);
      else if (e.key === "ArrowUp") moveHighlight(-1);
      else if (e.key === "Enter" || e.key === "Tab") {
        // setIsFocused(false);
        selectByGlobalIndex(highlightedIndex >= 0 ? highlightedIndex : 0);
        onBlurValue?.(value ?? "");
      }
    }
  };

  const handleKeyUp = () => {
    if (!totalCount) {
      if (keyNotFound) showToastByCode(keyNotFound as string);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (changeOnFocus && !isFocused) setIsFocused(true);
    // Chặn nhập khoảng trắng
    if (e.target.value.includes(" ")) {
      e.target.value = e.target.value.replace(" ", "");
    }
    setValue(forceUpperCase ? e.target.value.toUpperCase() : e.target.value);
    props.onChange?.(e);
    setHighlightedIndex(-1);
  };

  const handleClearIcon = (e: React.MouseEvent<SVGSVGElement, globalThis.MouseEvent>) => {
    e?.stopPropagation();
    e?.preventDefault();
    handleClear();
  };

  const handleClear = () => {
    setValue("");
    props.onChange?.({ target: { value: "" } } as any);
    // onSelectTicker?.('');
    setHighlightedIndex(-1);
    setSelectedValue(null);
    confirmedValueRef.current = null; // <- thêm
    confirmedLabelRef.current = "";
    onClear?.();
    inputRef.current?.focus();
  };

  const clearedOnOpenRef = useRef(false);

  const handleInternalBlur = () => {
    setIsFocused(false);
    clearedOnOpenRef.current = false;
    // Truyền giá trị hiện tại ra ngoài ngay khi blur
    const currentBlurValue = (value ?? "").trim();
    // chỉ fill khi không có danh sách tìm kiếm phù hợp

    // if (!filteredPriority.length && !filteredNormal.length) {
    //   onBlurValue?.(currentBlurValue);
    // }
    onBlurValue?.(currentBlurValue);

    if (!revertOnBlur) {
      if (!value) {
        onSelectTicker?.(value);
      }

      handleBlur?.();
      return;
    }
    setTimeout(() => {
      const raw = value.trim();
      if (confirmedValueRef.current) {
        if (raw !== confirmedLabelRef.current) {
          setValue(confirmedLabelRef.current);
          props.onChange?.({ target: { value: confirmedValueRef.current } } as any);
        }
      } else if (raw) {
        setValue("");
        props.onChange?.({ target: { value: "" } } as any);
        onClear?.();
      }
    }, 0);
    handleBlur?.();
  };

  const handleInputClick = (_e: React.MouseEvent<HTMLInputElement>) => {
    // vẫn clear on click
    if (clearOnClick) handleClear();
    setIsFocused(true);
  };

  const handleInputFocus = (_e: React.FocusEvent<HTMLInputElement>) => {
    if (clearOnClick && !clearedOnOpenRef.current) {
      handleClear();
      clearedOnOpenRef.current = true;
    }
    setIsFocused(true);
  };

  useEffect(() => {
    if (isAutoFocus) inputRef.current?.focus();
  }, [isAutoFocus]);

  const iconSizeClasses = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8",
    base: "w-5 h-5",
  };

  const renderIconLeft = () =>
    hideIconLeft ? null : (iconLeft ?? <Search className={iconSizeClasses[iconSize]} />);
  const renderIconRight = () =>
    hideIconRight
      ? null
      : (iconRight ?? (
          <X
            onClick={() => handleClearIcon({} as React.MouseEvent<SVGSVGElement>)}
            className={clsx(
              iconSizeClasses[iconSize],
              value ? "opacity-100 cursor-pointer" : "opacity-0 pointer-events-none"
            )}
          />
        ));

  const gapItemValue = GAP_ITEM_MAP[gapItem] ?? 0;

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
    let isSel = gIdx === highlightedIndex;
    if (!isSel) {
      isSel = item.value === selectedValue;
    }

    return (
      <div style={style} className="list-wrapper">
        <div
          role="option"
          aria-selected={isSel}
          style={{
            height: Number(style?.height ?? 0) - gapItemValue,
          }}
          className={clsx(
            "flex items-center px-4 w-full text-left cursor-pointer text-body-14",
            isSel ? "bg-purple-2 text-neutral-9" : "text-neutral-9 hover:bg-purple-2",
            itemClassName
          )}
          onMouseEnter={() => {
            setHighlightedIndex(gIdx);
          }}
          onMouseDown={(e) => {
            e.preventDefault();
          }}
          onClick={() => {
            setIsFocused(false);
            selectByGlobalIndex(gIdx);
          }}
        >
          {renderItem?.(item, isSel) ?? item.label}
        </div>
        <div style={{ height: gapItemValue }} className="w-full" />
      </div>
    );
  };

  const totalGap = (rows.length - 1) * gapItemValue;

  const maxH = typeof listHeight === "number" ? listHeight : 240;
  const listH = Math.min(
    rows.reduce((sum, r) => sum + (r.type === "header" ? HEADER_HEIGHT : itemSize), 0) +
      (priorityLabel || normalLabel ? PADDING_CONTAINER : 0) +
      totalGap,
    maxH
  );

  const calcItemSize = (index: number) => {
    const item = rows[index];
    const isLast = index === rows.length - 1;
    if (item.type === "header") return HEADER_HEIGHT + (isLast ? 0 : gapItemValue);
    return itemSize + (isLast ? 0 : gapItemValue);
  };

  const ListAny = List as any;

  return (
    <div className={clsx("relative", inputWrapperClassName)}>
      <Input
        {...props}
        ref={inputRef}
        id={inputId}
        aria-describedby={ariaDescribedBy}
        value={value}
        onChange={handleChange}
        onClick={handleInputClick}
        onFocus={handleInputFocus}
        onBlur={handleInternalBlur}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        iconLeft={renderIconLeft()}
        iconRight={renderIconRight()}
        sizeInput={sizeInput}
        maxLength={maxLength}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        className={clsx(
          "flex items-center", // Ensure proper alignment
          isFocused ? "bg-neutral-0" : "bg-neutral-1",
          "px-3 w-full rounded-xl border-2 transition-all duration-200 border-neutral-3",
          "text-body-14 placeholder:text-neutral-4",
          "hover:border-primary-5 focus:border-primary-6 focus:ring-2 focus:ring-primary-6/20",
          inputClassName
        )}
        data-testid={testId}
      />

      {isFocused && totalCount > 0 && (
        <div
          role="listbox"
          className={clsx(
            "absolute z-50 min-w-full overflow-hidden rounded-lg border border-neutral-3 bg-background-popup shadow-lg",
            priorityLabel || normalLabel ? "py-5" : "",
            classNameList
          )}
          style={{ width: listWidth ?? "100%", height: listH }}
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

SearchInput.displayName = "SearchInput";
export default SearchInput;
