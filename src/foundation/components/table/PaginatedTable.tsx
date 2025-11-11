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

const applyStickyOffsets = (columns: ColumnWithSummary<any>[]): ColumnWithSummary<any>[] => {
  let leftOffset = 0;
  const columnsWithOffsets = columns.map((col) => {
    const meta = col.meta;
    if (meta?.sticky === "left") {
      const newOffset = leftOffset;
      leftOffset += col.size || 0;
      return {
        ...col,
        meta: { ...meta, stickyOffset: newOffset },
      };
    }
    return col;
  });

  // Now handle right sticky columns
  let rightOffset = 0;
  return columnsWithOffsets.map((col) => {
    const meta = col.meta;
    if (meta?.sticky === "right") {
      const newOffset = rightOffset;
      rightOffset += col.size || 0;
      return {
        ...col,
        meta: { ...meta, stickyOffset: newOffset },
      };
    }
    return col;
  });
};

const getStickyShadowsMap = (columns: any[]): Map<number, { left?: boolean; right?: boolean }> => {
  const shadowsMap = new Map();
  const leftStickyIndices: number[] = [];
  const rightStickyIndices: number[] = [];

  columns.forEach((col, index) => {
    const meta = (col.columnDef as ColumnWithSummary<any>).meta;
    if (meta?.sticky === "left") {
      leftStickyIndices.push(index);
    } else if (meta?.sticky === "right") {
      rightStickyIndices.push(index);
    }
  });

  // Check for sticky shadows
  columns.forEach((col, index) => {
    const meta = (col.columnDef as ColumnWithSummary<any>).meta;
    if (meta?.sticky) return;

    const needsLeftShadow = leftStickyIndices.some((stickyIdx) => index === stickyIdx + 1);
    const needsRightShadow = rightStickyIndices.some((stickyIdx) => index === stickyIdx - 1);

    if (needsLeftShadow || needsRightShadow) {
      shadowsMap.set(index, { left: needsLeftShadow, right: needsRightShadow });
    }
  });

  return shadowsMap;
};

import Spinner from "../feedback/Spinner";
import ScrollView from "../scroll/ScrollView";
import Pagination from "./Pagination";
import Empty from "../empty/Empty";

// --- Extracted common class constants for reuse ---
const BASE_CELL_HEADER_CLASSES = "min-h-12 px-4 py-3 text-neutral-10 text-body-13-semibold";
const BASE_CELL_CLASSES = "min-h-12 px-4 py-3 text-body-13 text-neutral-10";
const BASE_CELL_SUMMARY_CLASSES = "min-h-10 px-4 py-2 bg-sum";
const BASE_ROW_CLASSES = "divide-x divide-divider-1";

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

export interface PaginatedTableProps<TData extends object> {
  columns: ColumnWithSummary<TData>[];
  data: TData[];
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
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
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
  stickyTopSumRow?: string;
  hideScrollbarX?: boolean;
  hideScrollbarY?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (updater: RowSelectionState) => void;
  enableSelection?: boolean;
  stickyIndex?: boolean;
  stickyCheckbox?: boolean;
  isRowSelectable?: (rowData: TData) => boolean;
  checkboxSize?: "xs" | "sm" | "md" | "lg";
  getRowClassName?: (rowData: TData) => string;
  checkboxSummary?: string;
  customHeightRow?: boolean;
  idCol?: string;
  showPagination?: boolean;
  paginationClassName?: string;
  showPaginationInfo?: boolean;
}

/**
 * @component PaginatedTable
 *
 * 📋 **Bảng dữ liệu phân trang chuyên nghiệp với thiết kế hiện đại**
 *
 * Tính năng nổi bật:
 * - ⭐ Header cố định khi scroll với border-bottom rõ ràng
 * - ⭐ Pagination cố định ở bottom, luôn hiển thị
 * - ⭐ Chiều cao tối ưu: 48px cho header và cells
 * - ⭐ Hover effects mượt mà với transition-colors
 * - ⭐ Border ngăn cách rõ ràng giữa header/body và giữa các dòng
 * - ⭐ Empty state với chiều cao 96px trung tâm
 * - ⭐ Hỗ trợ sticky columns, row selection, summary rows
 *
 * 🔧 Props chính:
 * @param {ColumnWithSummary<T>[]} columns - Cấu hình cột với meta options (sticky, align, summary)
 * @param {T[]} data - Dữ liệu hiển thị trong bảng
 * @param {boolean} [isLoading] - Trạng thái đang tải dữ liệu (hiển thị spinner overlay)
 * @param {(page: number) => void} [onPageChange] - Callback khi người dùng thay đổi trang
 * @param {(row: T) => void} [onRowClick] - Callback khi click vào một dòng dữ liệu
 * @param {RowSelectionState} [rowSelection] - Controlled selection state. VD: {0: true, 1: true}
 * @param {(s: RowSelectionState) => void} [onRowSelectionChange] - Callback khi selection thay đổi
 * @param {boolean} [showIndex] - Hiển thị cột STT tự động
 * @param {number} [indexOffset] - Offset cho STT (dùng khi phân trang, ví dụ: (page-1) * itemsPerPage)
 * @param {string} [error] - Thông báo lỗi hiển thị ở phía trên bảng
 * @param {boolean} [showPagination] - Hiển thị control pagination ở bottom (default: true)
 * @param {boolean} [showPaginationInfo] - Hiển thị text "Hiển thị X-Y trong tổng Z mục" (default: true)
 * @param {number} [page] - Trang hiện tại (1-indexed, default: 1)
 * @param {number} [totalPages] - Tổng số trang có sẵn
 * @param {number} [totalItems] - Tổng số items (để hiển thị info)
 * @param {number} [itemsPerPage] - Số items trên mỗi trang (default: 10)
 * @param {string} [testId] - Prefix cho các data-testid attributes (default: "paginated-table")
 *
 * @example
 * ```tsx
 * <PaginatedTable
 *   columns={columns}
 *   data={products}
 *   page={currentPage}
 *   totalPages={totalPages}
 *   totalItems={total}
 *   itemsPerPage={10}
 *   onPageChange={handlePageChange}
 *   onRowClick={(row) => navigate(`/products/${row.id}`)}
 *   showIndex={true}
 *   indexOffset={(currentPage - 1) * 10}
 * />
 * ```
 *
 * @returns {JSX.Element} - Bảng dữ liệu với phân trang, header sticky, pagination cố định
 */
function PaginatedTable<TData extends object>({
  columns,
  data,
  isLoading = false,
  onPageChange,
  onRowClick,
  error = null,
  loadingComponent = <Spinner />,
  emptyComponent = (
    <Empty
      variant="data"
      size="medium"
      title="Chưa có dữ liệu"
      description="Bắt đầu tạo dữ liệu mới để quản lý sản phẩm của bạn"
    />
  ),
  errorComponent,
  containerClassName = "",
  tableClassName = "w-full border-collapse",
  headerClassName = "bg-cell-header",
  rowClassName = "hover:bg-cell-header",
  // striped = true,
  showIndex = false,
  indexOffset = 0,
  indexHeader = "STT",
  testId = "paginated-table",
  showColumnDividers = true,
  page = 1,
  totalPages = 1,
  totalItems,
  itemsPerPage = 10,
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
  showPagination = true,
  paginationClassName = "",
  showPaginationInfo = true,
}: PaginatedTableProps<TData>) {
  // -------------------------
  // Refs
  // -------------------------
  const scrollContainerRef = useRef<HTMLDivElement>(null);
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
          size: 60, // Fixed size instead of string
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
  // 1. Auto‐scroll to top khi page thay đổi
  // -------------------------
  useEffect(() => {
    if (page !== prevPageRef.current) {
      scrollContainerRef.current?.scrollTo({ top: 0 });
    }
    prevPageRef.current = page;
  }, [page]);

  // -------------------------
  // 2. Kiểm tra summaryTop / summaryBottom tồn tại
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
        </div>
      )}

      <ScrollView
        className="overflow-auto relative flex-1"
        scrollRef={scrollContainerRef}
        hideScrollbarX={hideScrollbarX}
        hideScrollbarY={hideScrollbarY}
        data-testid={`${testId}-scrollview`}
      >
        {/* Loading Overlay */}
        {isLoading && (
          <div className="flex absolute inset-0 z-10 justify-center items-center backdrop-blur-sm bg-background-1/60">
            {loadingComponent}
          </div>
        )}

        <table
          className={clsx("w-full table-fixed", tableClassName)}
          data-testid={`${testId}-table`}
        >
          <thead
            className={clsx("sticky top-0 border-b z-[1] border-divider-1", headerClassName)}
            data-testid={`${testId}-header`}
          >
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => {
                  const meta = header.column.columnDef.meta as ColumnMeta<TData> | undefined;
                  const shadow = stickyShadows.get(header.index);
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

          {hasTop && !isLoading && data.length > 0 && (
            <tbody
              className={clsx("sticky h-9 z-[1] bg-cell-sum", stickyTopSumRow)}
              data-testid={`${testId}-summary-top`}
            >
              <tr className={clsx(rowClassName, showColumnDividers && BASE_ROW_CLASSES)}>
                {leafColumns.map((col, colIndex) => {
                  const meta = col.columnDef.meta as ColumnMeta<TData> | undefined;
                  const shadow = stickyShadows.get(colIndex);
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

          <tbody data-testid={`${testId}-body`} className="bg-background-1">
            {data.length === 0 && !isLoading ? (
              <tr data-testid={`${testId}-empty`}>
                <td
                  colSpan={leafColumns.length}
                  className={clsx(
                    "h-24 px-4 text-body-13 text-center text-neutral-6",
                    customHeightRow && "!important:h-8"
                  )}
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
                    "border-b border-divider-1 bg-background-1 transition-colors",
                    rowClassName,
                    // !getRowClassName?.(row.original) && striped && STRIPED_ROWS,
                    showColumnDividers && BASE_ROW_CLASSES,
                    onRowClick && "cursor-pointer hover:bg-neutral-1"
                    // !getRowClassName?.(row.original) && row.getIsSelected() && "bg-blue-1",
                    // getRowClassName?.(row.original)
                  )}
                >
                  {row.getVisibleCells().map((cell, cellIndex) => {
                    const meta = cell.column.columnDef.meta as ColumnMeta<TData> | undefined;
                    const shadow = stickyShadows.get(cellIndex);
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
          </tbody>

          {hasBottom && !isLoading && data.length > 0 && (
            <tfoot
              className="sticky bottom-0 bg-background-base"
              data-testid={`${testId}-summary-bottom`}
            >
              <tr className={clsx(rowClassName, showColumnDividers && BASE_ROW_CLASSES)}>
                {leafColumns.map((col, colIndex) => {
                  const meta = col.columnDef.meta as ColumnMeta<TData> | undefined;
                  const shadow = stickyShadows.get(colIndex);
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

      {/* Pagination Control - Fixed at Bottom */}
      {showPagination && onPageChange && (
        <div className="sticky bottom-0 z-10 border-t bg-background-1 border-divider-1">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={showPaginationInfo ? totalItems : undefined}
            itemsPerPage={showPaginationInfo ? itemsPerPage : undefined}
            onPageChange={onPageChange}
            className={paginationClassName}
            testId={`${testId}-pagination`}
          />
        </div>
      )}
    </div>
  );
}

PaginatedTable.displayName = "PaginatedTable";
export default PaginatedTable;
