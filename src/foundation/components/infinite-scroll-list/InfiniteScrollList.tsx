/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useRef, useState } from "react";

import clsx from "clsx";
import { VariableSizeList as List, ListChildComponentProps } from "react-window";

import ScrollView from "@/foundation/components/scroll/ScrollView";
import Spinner from "@/foundation/components/feedback/Spinner";

export const GRID_COLUMN_MAP = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
} as const;

export const GRID_GAP_MAP = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  7: "gap-7",
  8: "gap-8",
  9: "gap-9",
  10: "gap-10",
} as const;

// ✅ Interface định nghĩa props cho component InfiniteScrollList
export interface InfiniteScrollListProps<TData extends object> {
  isFetching: boolean; // Đang loading dữ liệu hay không
  hasMore: boolean; // Còn dữ liệu để load thêm không
  loadMore?: () => void; // Callback khi cần load thêm
  loadingComponent?: React.ReactNode; // Component hiển thị khi đang loading
  emptyComponent?: React.ReactNode; // Component hiển thị khi không có dữ liệu
  containerClassName?: string; // Class tuỳ chỉnh cho container
  page?: number; // Trang hiện tại (để reset scroll khi sang trang mới)
  row: (d: TData, isSelected?: boolean, itemIndex?: number) => JSX.Element; // Hàm render 1 dòng (truyền thêm isSelected)
  data: TData[]; // Dữ liệu dạng mảng
  testId?: string; // Thuộc tính test ID
  heightItem?: number; // Chiều cao mỗi item trong list
  heightVirtual: number; // Chiều cao tổng thể virtual list
  onClickRow?: (itemKey: any, data: TData) => void; // Hàm xử lý khi click vào row
  selectedItem?: string; // Item key hiện đang được chọn
  columnCount?: keyof typeof GRID_COLUMN_MAP; // Số column trên một row trong list
  classCustomRow?: string; //class cho Row
  gap?: number; // gap cho các phần tử
  justifyHeightItemMethod?: (data: TData, nItem?: TData) => void; // điều chỉnh height cho item trong list
}

/* ✅ VirtualizedList hiển thị danh sách dạng virtual scroll:
  - ref: dùng để reset/recalculate height
  - height: chiều cao toàn list
  - itemCount: tổng số dòng (not phần tử)
  - itemSize: hàm tính chiều cao dòng
  - width: 100% width
  - itemData: dữ liệu truyền xuống
  - onItemsRendered: detect khi scroll đến cuối để load thêm
*/

const InfiniteScrollList = <TData extends object>({
  data,
  isFetching,
  emptyComponent = (
    <span className="flex justify-center w-full text-caption-12 text-neutral-10">
      Không có dữ liệu
    </span>
  ),
  hasMore,
  loadMore,
  containerClassName = "",
  testId = "infinite-list",
  page,
  row,
  heightItem,
  justifyHeightItemMethod,
  heightVirtual,
  onClickRow,
  selectedItem,
  loadingComponent = <Spinner />,
  columnCount = 1,
  gap = 4,
  classCustomRow = "",
}: InfiniteScrollListProps<TData>) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevPageRef = useRef<number>();
  const listRef = useRef<List>(null);
  const [heightList, setHeightList] = useState<number>(heightVirtual);

  useEffect(() => {
    if (page === 1 && prevPageRef.current !== 1) {
      scrollContainerRef.current?.scrollTo({ top: 0 });
    }
    prevPageRef.current = page;
  }, [page]);

  const totalRows = Math.ceil(data.length / columnCount);

  const gridColumnClass = GRID_COLUMN_MAP[columnCount ?? 1];

  const gridGapClass = GRID_GAP_MAP[gap as keyof typeof GRID_GAP_MAP];

  const computeHeightList = () => {
    if (!heightItem) return heightVirtual;
    const dynamicHeight = totalRows * heightItem;
    return dynamicHeight > heightVirtual ? heightVirtual : dynamicHeight;
  };

  // ✅ Khi data, page hoặc columnCount thay đổi → kích thước dòng có thể thay đổi
  // ✅ Gọi resetAfterIndex để:
  //    - Xóa cache kích thước dòng cũ
  //    - Buộc react-window tính lại chiều cao từ dòng 0
  // ✅ Tham số `true` giúp tính lại kích thước ngay lập tức, không delay
  useEffect(() => {
    if (data.length > 0) {
      setHeightList(computeHeightList());
      listRef.current?.resetAfterIndex(0, true); // vẫn giữ để reset layout
    }
  }, [data, page, columnCount]);

  const getItemSize = useCallback(
    (index: number) => {
      // ✅ Tính chỉ số phần tử đầu tiên của dòng (index là dòng, không phải phần tử)
      const itemIndex = index * columnCount;

      // ✅ Lấy dữ liệu phần tử đầu tiên của dòng
      const d = data[itemIndex];
      const nItem = data[itemIndex + 1];

      // ✅ Tính chiều cao:
      //    - Nếu có hàm justifyHeightItemMethod → dùng hàm để xác định chiều cao dynamic
      //    - Nếu không có → dùng chiều cao mặc định (heightItem)
      return justifyHeightItemMethod ? justifyHeightItemMethod(d, nItem) : heightItem;
    },
    [justifyHeightItemMethod, heightItem, data, columnCount] // ✅ Rebuild khi deps này đổi
  );

  const Row = ({ data, index, style }: ListChildComponentProps<TData[]>) => {
    const items: JSX.Element[] = [];

    for (let i = 0; i < columnCount; i++) {
      const itemIndex = index * columnCount + i;
      const item = data[itemIndex];
      if (!item) continue;

      const key = (item as any)?.key as string;
      const isSelected = key === selectedItem;

      items.push(
        <div key={key || itemIndex} onClick={() => onClickRow && onClickRow(key, item)}>
          {row(item, isSelected, itemIndex)}
        </div>
      );
    }

    return (
      <div
        style={style}
        className={clsx(`grid ${gridGapClass} ${classCustomRow}`, gridColumnClass)}
      >
        {items}
      </div>
    );
  };

  const VirtualizedList = List as any;

  return (
    <div
      data-testid={testId}
      className={clsx("flex overflow-hidden relative flex-col size-full", containerClassName)}
    >
      {/* ✅ ScrollView bao bọc toàn bộ virtual list, xử lý scroll và cho phép custom scrollRef */}
      <ScrollView
        className="relative flex-1"
        data-testid={`${testId}-scrollview`}
        scrollRef={scrollContainerRef}
      >
        {data.length === 0 ? (
          // ✅ Trường hợp không có dữ liệu
          isFetching ? (
            // ✅ Hiển thị loading khi đang fetch dữ liệu
            <div className="flex justify-center items-center h-full">{loadingComponent}</div>
          ) : (
            // ✅ Hiển thị emptyComponent khi không có dữ liệu và không loading
            <div>{emptyComponent}</div>
          )
        ) : (
          <>
            <VirtualizedList
              ref={listRef}
              height={heightList}
              itemCount={totalRows} // ✅ Tổng số dòng (row), không phải tổng phần tử
              itemSize={getItemSize}
              width="100%"
              itemData={data}
              onItemsRendered={({ visibleStopIndex }: { visibleStopIndex: number }) => {
                // ✅ Khi scroll đến cuối (visibleStopIndex gần cuối) → gọi loadMore nếu còn dữ liệu và không đang fetch
                if (visibleStopIndex >= totalRows - 1 && hasMore && !isFetching) {
                  loadMore && loadMore();
                }
              }}
            >
              {Row}
            </VirtualizedList>

            {/* ✅ Overlay blur + loading giữa list */}
            {hasMore && isFetching && (
              <div className="flex absolute inset-0 z-10 justify-center items-center backdrop-blur-sm bg-background-1/60">
                {loadingComponent}
              </div>
            )}
          </>
        )}
      </ScrollView>
    </div>
  );
};

InfiniteScrollList.displayName = "InfiniteScrollList";
export default InfiniteScrollList;
