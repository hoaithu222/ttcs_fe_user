import { FC, useEffect, useMemo, useRef } from "react";

import clsx from "clsx";
import numeral from "numeral";

import { BLINK_TIME } from "@/app/config/env.config";
// import { EMPT_VALUE_CHAR } from "@/features/category/constants/common/grid.constants";
import { getStockColorByPrice } from "@/shared/utils/color.utils";

// Local constant
const EMPT_VALUE_CHAR = "-";

export interface VolumeCellProps {
  volume: number | string | null;
  data: any;
  formatType?: string;
  keepRawValue?: boolean;
  formatSlice?: number;
  enableFlash?: boolean;
  colorField?: string;
  className?: string;
}

export const VolumeCell: FC<VolumeCellProps> = ({
  volume,
  data,
  formatType = "",
  keepRawValue = false,
  formatSlice = 0,
  enableFlash = false,
  colorField,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<number>();

  // Parse volume thành số
  const numericVol = useMemo<number | null>(() => {
    if (volume == null) return null;
    const v = typeof volume === "string" ? parseFloat(volume.replace(/[^0-9.-]+/g, "")) : volume;
    return isNaN(v as number) ? null : (v as number);
  }, [volume]);

  // Tạo chuỗi hiển thị
  const formatted = useMemo<string>(() => {
    if (numericVol == null || numericVol === 0) {
      return EMPT_VALUE_CHAR;
    }
    let txt = keepRawValue
      ? numeral(numericVol).format("0,0")
      : numeral(numericVol * 10).format(formatType || "0,0");

    if (formatSlice && txt.length > formatSlice) {
      txt = txt.slice(0, -formatSlice);
    }
    return txt;
  }, [numericVol, formatType, keepRawValue, formatSlice]);

  // Tính class màu dựa vào giá của field chỉ định
  const colorClass = useMemo<string>(() => {
    if (!colorField) return "";
    const priceVal = (data as any)?.[colorField];
    if (typeof priceVal !== "number" || priceVal === 0) return "";
    return getStockColorByPrice(priceVal, Number(data?.basicPrice)) || "";
  }, [data, colorField]);

  // Giữ trạng thái cũ để so sánh
  const lastValueRef = useRef<number | null>(numericVol);
  const lastFormattedRef = useRef<string>(formatted);
  const lastColorRef = useRef<string>(colorClass);

  // Cập nhật nội dung & màu lên DOM
  const updateCell = () => {
    const span = spanRef.current;
    if (!span) return;

    if (formatted !== lastFormattedRef.current) {
      span.textContent = formatted;
      lastFormattedRef.current = formatted;
    }

    if (colorClass !== lastColorRef.current) {
      span.className = clsx("ag-value-change-value", colorClass);
      lastColorRef.current = colorClass;
    }
  };

  // Flash animation
  const triggerFlash = () => {
    const delta = (numericVol ?? 0)! - (lastValueRef.current ?? 0)!;
    const flashCls = delta >= 0 ? "animate-flash-up" : "animate-flash-down";
    const textFlashCls = "text-neutral-10";

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const el = containerRef.current;
    if (!el) return;

    // Xoá cả hai class cũ
    el.classList.remove("animate-flash-up", "animate-flash-down");
    const span = el.querySelector("span");

    if (span) {
      span.classList.remove(textFlashCls);
    }

    // force reflow
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    el.offsetWidth;
    el.classList.add(flashCls);
    if (span) {
      span.classList.add(textFlashCls);
    }

    timeoutRef.current = window.setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.classList.remove(flashCls);

        const span = containerRef.current.querySelector("span");
        if (span) {
          span.classList.remove(textFlashCls);
        }
      }
    }, BLINK_TIME);
  };

  useEffect(() => {
    const prev = lastValueRef.current;

    // Chỉ flash khi giá thực sự thay đổi (và không phải lần mount đầu)
    if (enableFlash && prev != null && numericVol != null && numericVol !== prev) {
      triggerFlash();
    }

    updateCell();
    lastValueRef.current = numericVol;

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numericVol, formatted, colorClass, enableFlash]);

  return (
    <div
      ref={containerRef}
      className={clsx("flex items-center justify-end overflow-hidden pr-2", className)}
      style={{ willChange: "background-color, color" }}
    >
      <span ref={spanRef} className={clsx("ag-value-change-value", colorClass)}>
        {formatted}
      </span>
    </div>
  );
};

VolumeCell.displayName = "VolumeCell";
