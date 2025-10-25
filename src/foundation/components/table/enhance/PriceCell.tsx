import { FC, useEffect, useMemo, useRef } from "react";

import clsx from "clsx";
import numeral from "numeral";

import { BLINK_TIME } from "@/app/config/env.config";
// import { STOCK_COLOR_CODE } from "@/core/integrations/grpc/generated/auto_trading";
// import { EMPT_VALUE_CHAR } from "@/features/category/constants/common/grid.constants";
import { getStockColorByCode } from "@/shared/utils/color.utils";

// Local constants
const STOCK_COLOR_CODE = {
  UP: "UP",
  DOWN: "DOWN",
  REFERENCE: "REFERENCE",
} as const;

const EMPT_VALUE_CHAR = "-";

type StockColorCode = (typeof STOCK_COLOR_CODE)[keyof typeof STOCK_COLOR_CODE];

export interface PriceCellProps {
  price: number | string | null | undefined;
  data: {
    secCd: string;
    ceilingPrice: number;
    floorPrice: number;
    basicPrice: number;
    colorCode: StockColorCode;
  };
  isRate?: boolean;
  iconPlus?: boolean;
  enableFlash?: boolean;
  enableTextPrice?: boolean;
  isDerivative30?: boolean;
  isDerivativeTPCP?: boolean;
  className?: string;
  onDoubleClick?: () => void;
}

export const PriceCell: FC<PriceCellProps> = ({
  price,
  data,
  isRate = false,
  iconPlus = false,
  enableFlash = false,
  enableTextPrice = false,
  isDerivative30 = false,
  isDerivativeTPCP = false,
  className,
  onDoubleClick,
}) => {
  // Ref cho root div để thao tác classList
  const containerRef = useRef<HTMLDivElement>(null);
  // Ref giữ timeout để clear khi cần
  const timeoutRef = useRef<number>();
  // Ref giữ giá trị trước để so sánh
  const lastValueRef = useRef<number | string | null>(price ?? null);

  // Chuyển giá trị về số nếu có thể
  const numericPrice = useMemo<number | null>(() => {
    if (price == null) return null;
    if (typeof price === "string") {
      const parsed = parseFloat(price.replace(/[^0-9.-]+/g, ""));
      return isNaN(parsed) ? null : parsed;
    }
    return price;
  }, [price]);

  // Tính maxRange cho trường hợp so sánh range
  // const maxRange = useMemo(() => {
  //   const { ceilingPrice, basicPrice } = data;
  //   if (ceilingPrice != null && basicPrice != null) {
  //     return Number(ceilingPrice) - Number(basicPrice);
  //   }
  //   return 0;
  // }, [data]);

  // Format hiển thị
  const formatted = useMemo((): string => {
    // Nếu là text-price (ATO/ATC)
    if (enableTextPrice && typeof price === "string" && isNaN(Number(price))) {
      return price;
    }
    // Giá rỗng hoặc zero (nếu không so sánh lastPrice)
    if (price === "" || price == null || numericPrice === 0) {
      return EMPT_VALUE_CHAR;
    }
    const plus = iconPlus && numericPrice !== 0 ? "+" : "";
    if (isRate) {
      return numeral(numericPrice!).format(`${plus}0,0.00`) + "%";
    }
    if (isDerivative30) {
      return numeral(numericPrice!).format(`${plus}0,0.0`);
    }
    if (isDerivativeTPCP) {
      return numeral(numericPrice!).format(`${plus}0,0`);
    }
    return numeral(numericPrice!).format(`${plus}0,0.00`);
  }, [price, numericPrice, enableTextPrice, iconPlus, isRate, isDerivative30, isDerivativeTPCP]);

  // Xác định class màu chữ
  const colorClass = useMemo<string>(() => {
    if (numericPrice == null) return "";
    // if (maxRange && isCompareLastPrice) {
    //   return getStockColorByPriceRange(numericPrice, maxRange, 'text') || '';
    // }
    if (numericPrice === 0) {
      return "";
    }
    return getStockColorByCode(data.colorCode as StockColorCode);
  }, [numericPrice, data]);

  // Effect: trigger flash animation khi giá thay đổi
  useEffect(() => {
    const prev = lastValueRef.current;
    // Chỉ flash khi bật và có giá trị trước & sau khác nhau
    if (enableFlash && numericPrice != null && prev != null && typeof prev !== "object") {
      // Chuyển prev về số nếu là string
      const prevNum =
        typeof prev === "string" ? parseFloat(prev.replace(/[^0-9.-]+/g, "")) : (prev as number);

      if (!isNaN(prevNum) && numericPrice !== prevNum) {
        const delta = numericPrice - prevNum;
        const flashCls = delta >= 0 ? "animate-flash-up" : "animate-flash-down";
        const textFlashCls = "text-neutral-10";

        // Clear timeout cũ
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        const el = containerRef.current;
        if (el) {
          // Xoá cả hai class cũ
          el.classList.remove("animate-flash-up", "animate-flash-down");
          const span = el.querySelector("span");

          if (span) {
            span.classList.remove(textFlashCls);
          }

          // Force reflow để reset animation
          void el.offsetWidth;
          // Thêm class mới
          el.classList.add(flashCls);
          if (span) {
            span.classList.add(textFlashCls);
          }
        }

        // Xoá class sau khi hết thời gian flash
        timeoutRef.current = window.setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.classList.remove(flashCls);

            const span = containerRef.current.querySelector("span");
            if (span) {
              span.classList.remove(textFlashCls);
            }
          }
        }, BLINK_TIME);
      }
    }

    // Cập nhật prevRef cho lần render tiếp theo
    lastValueRef.current = price ?? null;
  }, [numericPrice, price, enableFlash]);

  return (
    <div
      ref={containerRef}
      className={clsx(
        "flex cursor-pointer items-center justify-end overflow-hidden pr-2",
        className
      )}
      style={{ willChange: "background-color, color" }}
      onDoubleClick={onDoubleClick}
    >
      <span className={clsx("ag-value-change-value", colorClass)}>{formatted}</span>
    </div>
  );
};

PriceCell.displayName = "PriceCell";
