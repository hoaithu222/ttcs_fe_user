import { FC, useCallback, useMemo } from "react";

import clsx from "clsx";

import { useAppSelector } from "@/app/store";
import { langSelector } from "@/app/store/slices/language/selectors";
// Local type
type SectorRowDataStatic = any;
import Icon from "@/foundation/components/icons/Icon";
import Tooltip from "@/foundation/components/tooltip/Tooltip";
import { convertMarketCdToText } from "@/shared/constants/market.consts";
import { getStockColorByCode } from "@/shared/utils/color.utils";

export interface TickerCellProps {
  /** row data đầy đủ, đã bao gồm colorCode */
  rowData: any;
  /** Hiển thị nút delete không */
  isDeleteTicker?: boolean;
  /** Thêm dấu * nếu cần */
  isShowAsterisk?: boolean;
  /** Được gọi khi click vào ticker */
  onTickerClick?: (secCd: string, data: SectorRowDataStatic) => void;
  /** Được gọi khi click vào delete icon */
  onDeleteClick?: (secCd: string, data: SectorRowDataStatic) => void;
  className?: string;
}

/**
 * Hiển thị ticker với:
 * - màu theo colorCode từ rowData
 * - tooltip tên đầy đủ (secName)
 * - dấu * nếu cần
 * - icon delete với callback
 */
export const TickerCell: FC<TickerCellProps> = ({
  rowData,
  isDeleteTicker = false,
  isShowAsterisk = false,
  onTickerClick,
  onDeleteClick,
  className,
}) => {
  const { secCd, secName, secNameEn, colorCode, marketCd } = rowData;
  const lang = useAppSelector(langSelector);
  const market = convertMarketCdToText(marketCd, true);
  const name = lang === "en" ? secNameEn : secName;

  // tính class màu text
  const textColorClass = useMemo(() => getStockColorByCode(colorCode) || "", [colorCode]);

  // giá trị hiển thị (secCd + dấu *)
  const displayValue = useMemo(
    () => `${secCd}${isShowAsterisk ? " *" : ""}`,
    [secCd, isShowAsterisk]
  );

  // tooltip đầy đủ: secCd – secName (nếu có)
  const title = useMemo(
    () => (name ? `${secCd} – ${name} - ${market}` : `${secCd} - ${market}`),
    [secCd, name, market]
  );

  // handler click vào ticker
  const handleTickerClick = useCallback(() => {
    onTickerClick?.(secCd, rowData);
  }, [onTickerClick, secCd, rowData]);

  // handler click vào delete icon
  const handleDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDeleteClick?.(secCd, rowData);
    },
    [onDeleteClick, secCd, rowData]
  );

  return (
    <Tooltip
      content={title}
      side="bottom"
      align="start"
      sideOffset={4}
      className="px-6 py-3 text-left whitespace-pre-line border rounded text-caption-12 border-neutral-3 text-neutral-10"
    >
      <div className={clsx("flex items-center justify-start gap-x-1", className)}>
        <span
          className={clsx("ag-ticker-value whitespace-nowrap px-2", textColorClass)}
          onClick={handleTickerClick}
        >
          {displayValue}
        </span>
        {isDeleteTicker && (
          <Icon
            name="CloseOutlined"
            size="sm"
            className="cursor-pointer"
            onClick={() => handleDeleteClick({} as React.MouseEvent)}
          />
        )}
      </div>
    </Tooltip>
  );
};

TickerCell.displayName = "TickerCell";
