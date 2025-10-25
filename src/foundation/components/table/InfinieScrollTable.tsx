/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  ColumnDef,
  RowSelectionState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import clsx from "clsx";

// Local i18n mock
const i18n = { t: (key: string) => key };
// import { COLUMN_SIZES } from "@/shared/constants/table.consts";
// import { applyStickyOffsets, getStickyShadowsMap } from "@/shared/utils/table.utils";

// Local constants
// const COLUMN_SIZES = {
//   SMALL: "w-20",
//   MEDIUM: "w-32",
//   LARGE: "w-48",
//   checkbox: "w-12",
//   ind: "w-8"
// } as const;

const applyStickyOffsets = (offsets: any) => offsets;
const getStickyShadowsMap = (shadows: any) => shadows;

import Spinner from "../feedback/Spinner";
import { IconSize } from "../icons/Icon";
// import Checkbox from "../input/Checkbox";
import ScrollView from "../scroll/ScrollView";

// --- Extracted common class constants for reuse ---
const BASE_CELL_HEADER_CLASSES = "h-10 px-2 text-neutral-10 text-body-13-medium";
const BASE_CELL_CLASSES = "h-10 px-2 text-body-13 text-neutral-10";
const BASE_CELL_SUMMARY_CLASSES = "h-8 px-2 bg-sum";
const BASE_ROW_CLASSES = "divide-x divide-divider-1";
// const STRIPED_ROWS = "odd:bg-cell-1 even:bg-cell-2";

export type ColumnWithSummary<T> = ColumnDef<T> & {
  meta?: {
    summaryTopRenderer?: (rows: T[]) => React.ReactNode;
    summaryBottomRenderer?: (rows: T[]) => React.ReactNode;
    className?: string;
    align?: string;
    customCol?: boolean;
    sticky?: "left" | "right";
    stickyOffset?: number;
    customHeight?: number;
  };
};

type ColumnMeta<T> = ColumnWithSummary<T>["meta"];

const t = (key: string) => (i18n.t as any)(key, { ns: "common" }) as string;
export interface InfiniteScrollTableProps<TData extends object> {
  columns: ColumnWithSummary<TData>[];
  data: TData[];
  isFetching: boolean;
  hasMore: boolean;
  loadMore: () => void;
  refresh?: () => void;
  onRowClick?: (row: TData) => void;
  error?: string | null;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  containerClassName?: string;
  tableClassName?: string;
  headerClassName?: string;
  rowClassName?: string;
  striped?: boolean;
  showIndex?: boolean;
  indexOffset?: number;
  indexHeader?: string;
  testId?: string;
  showColumnDividers?: boolean;
  page?: number;
  stickyTopSumRow?: string;
  hideScrollbarX?: boolean;
  hideScrollbarY?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (updater: RowSelectionState) => void;
  enableSelection?: boolean;
  stickyIndex?: boolean;
  stickyCheckbox?: boolean;
  isRowSelectable?: (rowData: TData) => boolean;
  checkboxSize?: IconSize;
  getRowClassName?: (rowData: TData) => string;
  checkboxSummary?: string;
  customHeightRow?: boolean;
  idCol?: string;
}

/**
 * @component InfiniteScrollTable
 *
 * ✅ Bảng dữ liệu hỗ trợ scroll vô hạn, sticky column, chọn dòng và hàng tổng.
 *
 * 🔧 Props chính:
 * @param {ColumnWithSummary<T>[]} columns - Cấu hình cột, hỗ trợ sticky và summary.
 * @param {T[]} data - Dữ liệu hiển thị trong bảng.
 * @param {boolean} isFetching - Trạng thái đang tải dữ liệu.
 * @param {boolean} hasMore - Có còn dữ liệu để tải tiếp không.
 * @param {() => void} loadMore - Hàm gọi thêm dữ liệu khi scroll chạm đáy.
 * @param {(row: T) => void} [onRowClick] - Callback khi click vào một dòng.
 * @param {boolean} [enableSelection] - Bật checkbox chọn dòng.
 * @param {RowSelectionState} [rowSelection] - Trạng thái chọn dòng (controlled). VD: {1: true, 2: true}
 * @param {(s: RowSelectionState) => void} [onRowSelectionChange] - Callback khi chọn dòng thay đổi.
 * @param {boolean} [showIndex] - Bật cột STT.
 * @param {boolean} [stickyIndex] - Cố định cột STT bên trái.
 * @param {string} [error] - Chuỗi lỗi hiển thị.
 * @param {() => void} [refresh] - Hàm thử lại khi lỗi.
 * @param {string} [testId] - Prefix cho `data-testid` phục vụ test.
 * @param {boolean} [isRowSelectable] - Callback kiểm tra xem dòng có thể chọn được không.
 *
 * @returns {JSX.Element} - Bảng dữ liệu với scroll vô hạn, chọn dòng và cột cố định.
 */
function InfiniteScrollTable<TData extends object>({
  columns,
  data,
  isFetching,
  hasMore,
  loadMore,
  refresh,
  onRowClick,
  error = null,
  loadingComponent = <Spinner />,
  emptyComponent = <span className="text-caption-12 text-neutral-10">{t("empty")}</span>,
  errorComponent,
  containerClassName = "",
  tableClassName = "w-full border-collapse",
  headerClassName = "bg-cell-header",
  rowClassName = "hover:bg-cell-header",
  // striped = true,
  showIndex = false,
  indexOffset = 0,
  indexHeader = "STT",
  testId = "infinite-table",
  showColumnDividers = true,
  page,
  stickyTopSumRow = "top-10",
  hideScrollbarX = false,
  hideScrollbarY = false,
  rowSelection,
  onRowSelectionChange,
  // enableSelection,
  // stickyIndex,
  // stickyCheckbox,
  // isRowSelectable,
  // checkboxSize = "sm",
  // getRowClassName, // sét màu cho dòng
  // checkboxSummary, // summary cho cột checkbox
  customHeightRow = false,
  idCol = "id",
}: InfiniteScrollTableProps<TData>) {
  // -------------------------
  // Refs
  // -------------------------
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLTableRowElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const prevPageRef = useRef<number>();

  // -------------------------
  // Internal state for row selection
  // -------------------------
  const internalRowSelection = useState<RowSelectionState>({});
  const [internalSelection, setInternalSelection] = internalRowSelection;

  // -------------------------
  // Controlled vs. internal selection
  // -------------------------
  const isControlledRowSelection = rowSelection !== undefined;

  // -------------------------
  // Column for selection (checkbox)
  // -------------------------
  const selectionColumn: ColumnWithSummary<TData> | null = null;

  // -------------------------
  // Combine selection column, index column, and data columns
  // -------------------------
  const displayColumns = useMemo(() => {
    const indexColumn: ColumnWithSummary<TData> | null = showIndex
      ? {
          id: "stt",
          header: indexHeader || "STT",
          cell: (info) => indexOffset + info.row.index + 1,
          meta: {
            className: "text-center",
            align: "text-center",
            // ...(stickyIndex && { sticky: "left" }),
          },
          size: 32, // Fixed size instead of string
        }
      : null;
    const base = showIndex ? [indexColumn!, ...columns] : [...columns];
    const combined = selectionColumn ? [selectionColumn, ...base] : base;
    return applyStickyOffsets(combined);
  }, [columns, indexOffset, indexHeader, showIndex, selectionColumn]);

  // -------------------------
  // React Table instance
  // -------------------------
  const table = useReactTable({
    data,
    columns: displayColumns,
    columnResizeMode: "onChange",
    state: { rowSelection: isControlledRowSelection ? rowSelection! : internalSelection },
    onRowSelectionChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater(isControlledRowSelection ? rowSelection! : internalSelection)
          : updater;
      if (isControlledRowSelection) {
        onRowSelectionChange?.(next);
      } else {
        setInternalSelection(next);
      }
    },
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
  });

  // -------------------------
  // 1. Auto‐scroll to top khi page = 1
  // -------------------------
  useEffect(() => {
    if (page === 1 && prevPageRef.current !== 1) {
      scrollContainerRef.current?.scrollTo({ top: 0 });
    }
    prevPageRef.current = page;
  }, [page]);

  // -------------------------
  // 2. Setup IntersectionObserver (create new observer)
  // -------------------------
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Nếu đã có observer cũ thì disconnect trước
    observerRef.current?.disconnect();

    // Tạo mới IntersectionObserver
    observerRef.current = new IntersectionObserver(
      ([entry], obs) => {
        if (entry.isIntersecting && !isFetching && hasMore) {
          obs.unobserve(entry.target);
          loadMore();
        }
      },
      { root: container, rootMargin: "200px 0px", threshold: 0.1 } // IntersectionObserver phải để px hoặc % chính xác
    );

    // Cleanup khi unmount
    return () => {
      observerRef.current?.disconnect();
    };
  }, [isFetching, hasMore, loadMore]);

  const rowSelectionState = isControlledRowSelection ? rowSelection : internalSelection;
  // -------------------------
  // 3. Quan sát sentinelRef MỖI KHI BẢN BODY THAY ĐỔI
  // -------------------------
  useEffect(() => {
    const obs = observerRef.current;
    const el = sentinelRef.current;

    // Trước tiên, chắc chắn đã disconnect tất cả target cũ (nếu có)
    if (obs) {
      obs.disconnect();
    }

    // Nếu có sentinel mới và điều kiện loadMore đúng, attach lại
    if (obs && el && !isFetching && hasMore) {
      obs.observe(el);
    }

    // Cleanup khi unmount hoặc thay đổi
    return () => {
      obs?.disconnect();
    };
    // Bao gồm điều kiện row‐selection để trigger mỗi khi table re‐render
  }, [data.length, isFetching, hasMore, rowSelectionState]);

  // -------------------------
  // 4. Kiểm tra summaryTop / summaryBottom tồn tại
  // -------------------------
  const leafColumns = table.getAllLeafColumns();
  const hasTop = leafColumns.some(
    (col) =>
      typeof (col.columnDef as ColumnWithSummary<TData>).meta?.summaryTopRenderer === "function"
  );
  const hasBottom = leafColumns.some(
    (col) =>
      typeof (col.columnDef as ColumnWithSummary<TData>).meta?.summaryBottomRenderer === "function"
  );
  const stickyShadows = useMemo(() => getStickyShadowsMap(leafColumns), [leafColumns]);

  return (
    <div
      className={clsx("flex overflow-hidden relative flex-col size-full", containerClassName)}
      data-testid={testId}
    >
      {error && (
        <div
          className="flex justify-between items-center p-4 bg-red-1 text-red-8"
          data-testid={`${testId}-error`}
        >
          {errorComponent ?? <span data-testid={`${testId}-error-message`}>{error}</span>}
          <button
            onClick={refresh}
            className="ml-4 underline"
            data-testid={`${testId}-refresh-btn`}
          >
            Thử lại
          </button>
        </div>
      )}

      <ScrollView
        className="relative flex-1"
        scrollRef={scrollContainerRef}
        hideScrollbarX={hideScrollbarX}
        hideScrollbarY={hideScrollbarY}
        data-testid={`${testId}-scrollview`}
      >
        <table className={clsx("table-fixed", tableClassName)} data-testid={`${testId}-table`}>
          <thead
            className={clsx("sticky top-0 z-[1]", headerClassName)}
            data-testid={`${testId}-header`}
          >
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => {
                  const meta = header.column.columnDef.meta as ColumnMeta<TData> | undefined;
                  const shadow = stickyShadows[header.index];
                  const hasLeft = shadow?.left;
                  const hasRight = shadow?.right;

                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className={clsx(
                        BASE_CELL_HEADER_CLASSES,
                        meta?.align ?? "text-left",
                        meta?.className,
                        meta?.sticky &&
                          `sticky border-divider-1 bg-cell-header ${header.index !== 0 ? "border-l" : ""}`,
                        showColumnDividers && !meta?.sticky && "border-r border-divider-1",
                        hasLeft && hasRight
                          ? "shadow-divider-inset-x"
                          : hasLeft
                            ? `${header.index !== 0 ? "shadow-divider-inset-left" : ""}`
                            : hasRight
                              ? "shadow-divider-inset-right"
                              : undefined
                      )}
                      style={{
                        width: header.getSize() ?? "auto",
                        minWidth: (header.column.columnDef as any).minSize ?? "auto",
                        maxWidth: (header.column.columnDef as any).maxSize ?? "auto",
                        ...(meta?.sticky === "left" && { left: meta?.stickyOffset }),
                        ...(meta?.sticky === "right" && { right: meta?.stickyOffset }),
                      }}
                      data-testid={`${testId}-header-${header.id}`}
                    >
                      {!header.isPlaceholder &&
                        flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          {hasTop && !isFetching && data.length > 0 && (
            <tbody
              className={clsx("sticky h-9 z-[1] bg-cell-sum", stickyTopSumRow)}
              data-testid={`${testId}-summary-top`}
            >
              <tr className={clsx(rowClassName, showColumnDividers && BASE_ROW_CLASSES)}>
                {leafColumns.map((col, colIndex) => {
                  const meta = col.columnDef.meta as ColumnMeta<TData> | undefined;
                  const shadow = stickyShadows[colIndex];
                  const hasLeft = shadow?.left;
                  const hasRight = shadow?.right;

                  return (
                    <td
                      key={(col as any).id ?? colIndex}
                      className={clsx(
                        BASE_CELL_SUMMARY_CLASSES,
                        meta?.align ?? "text-left",
                        meta?.className,
                        meta?.sticky && "sticky bg-inherit",
                        showColumnDividers && !meta?.sticky && "border-r border-divider-1",
                        showColumnDividers &&
                          (hasLeft && hasRight
                            ? "shadow-divider-inset-x"
                            : hasLeft
                              ? `${colIndex !== 0 ? "shadow-divider-inset-left" : ""}`
                              : hasRight
                                ? "shadow-divider-inset-right"
                                : undefined)
                      )}
                      style={{
                        width: col.getSize() ?? "auto",
                        minWidth: (col.columnDef as any).minSize ?? "auto",
                        maxWidth: (col.columnDef as any).maxSize ?? "auto",
                        ...(meta?.sticky === "left" && {
                          left: meta?.stickyOffset,
                        }),
                        ...(meta?.sticky === "right" && {
                          right: meta?.stickyOffset,
                        }),
                      }}
                    >
                      {meta?.summaryTopRenderer?.(data)}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          )}

          <tbody data-testid={`${testId}-body`}>
            {data.length === 0 && !isFetching ? (
              <tr data-testid={`${testId}-empty`}>
                <td
                  colSpan={leafColumns.length}
                  className={clsx(
                    BASE_CELL_CLASSES,
                    "text-center",
                    customHeightRow && "!important:h-8"
                  )}
                  style={{ height: "100%" }}
                >
                  {emptyComponent}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, rowIndex) => (
                <tr
                  key={
                    // Ưu tiên idCol từ dữ liệu gốc nếu có
                    (idCol && (row.original as any)?.[idCol]) ?? row.id ?? rowIndex
                  }
                  data-testid={`${testId}-row-${row.id}`}
                  onClick={() => onRowClick?.(row.original)}
                  className={clsx(
                    rowClassName,
                    // !getRowClassName?.(row.original) && striped && STRIPED_ROWS,
                    showColumnDividers && BASE_ROW_CLASSES,
                    onRowClick && "cursor-pointer hover:bg-cell-header"
                    // !getRowClassName?.(row.original) && row.getIsSelected() && "bg-blue-1",
                    // getRowClassName?.(row.original)
                  )}
                >
                  {row.getVisibleCells().map((cell, cellIndex) => {
                    const meta = cell.column.columnDef.meta as ColumnMeta<TData> | undefined;
                    const shadow = stickyShadows[cellIndex];
                    const hasLeft = shadow?.left;
                    const hasRight = shadow?.right;

                    return (
                      <td
                        key={cell.id}
                        className={clsx(
                          meta?.customCol ? "h-10" : BASE_CELL_CLASSES,
                          meta?.align ?? "text-left",
                          meta?.className,
                          meta?.sticky && "sticky z-0 bg-inherit",
                          showColumnDividers && !meta?.sticky && "border-r border-divider-1",
                          hasLeft && hasRight
                            ? "shadow-divider-inset-x"
                            : hasLeft
                              ? `${cellIndex !== 0 ? "shadow-divider-inset-left" : ""}`
                              : hasRight
                                ? "shadow-divider-inset-right"
                                : undefined
                        )}
                        style={{
                          width: cell.column.getSize() ?? "auto",
                          minWidth: (cell.column.columnDef as any).minSize ?? "auto",
                          maxWidth: (cell.column.columnDef as any).maxSize ?? "auto",
                          ...(meta?.sticky === "left" && { left: meta?.stickyOffset }),
                          ...(meta?.sticky === "right" && { right: meta?.stickyOffset }),
                        }}
                        data-testid={`${testId}-cell-${cell.id}`}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}

            {hasMore && (
              <tr ref={sentinelRef} data-testid={`${testId}-sentinel`}>
                <td
                  colSpan={displayColumns.length}
                  className={clsx(BASE_CELL_CLASSES, "text-center")}
                >
                  {isFetching && loadingComponent}
                </td>
              </tr>
            )}
          </tbody>

          {hasBottom && !isFetching && data.length > 0 && (
            <tfoot
              className="sticky bottom-0 bg-background-base"
              data-testid={`${testId}-summary-bottom`}
            >
              <tr className={clsx(rowClassName, showColumnDividers && BASE_ROW_CLASSES)}>
                {leafColumns.map((col, colIndex) => {
                  const meta = col.columnDef.meta as ColumnMeta<TData> | undefined;
                  const shadow = stickyShadows[colIndex];
                  const hasLeft = shadow?.left;
                  const hasRight = shadow?.right;

                  return (
                    <td
                      key={(col as any).id ?? colIndex}
                      className={clsx(
                        BASE_CELL_SUMMARY_CLASSES,
                        meta?.align ?? "text-left",
                        meta?.className,
                        meta?.sticky && "sticky bg-inherit",
                        showColumnDividers && !meta?.sticky && "border-r border-divider-1",
                        hasLeft && hasRight
                          ? "shadow-divider-inset-x"
                          : hasLeft
                            ? `${colIndex !== 0 ? "shadow-divider-inset-left" : ""}`
                            : hasRight
                              ? "shadow-divider-inset-right"
                              : undefined
                      )}
                      style={{
                        width: col.getSize() ?? "auto",
                        minWidth: (col.columnDef as any).minSize ?? "auto",
                        maxWidth: (col.columnDef as any).maxSize ?? "auto",
                        ...(meta?.sticky === "left" && {
                          left: meta?.stickyOffset,
                        }),
                        ...(meta?.sticky === "right" && {
                          right: meta?.stickyOffset,
                        }),
                      }}
                    >
                      {meta?.summaryBottomRenderer?.(data)}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          )}
        </table>
      </ScrollView>
    </div>
  );
}

InfiniteScrollTable.displayName = "InfiniteScrollTable";
export default InfiniteScrollTable;
