import React from "react";
import clsx from "clsx";

// Simple Chevron SVG Components
const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ChevronDoubleLeftIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="11 18 5 12 11 6" />
    <polyline points="18 18 12 12 18 6" />
  </svg>
);

const ChevronDoubleRightIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="13 18 19 12 13 6" />
    <polyline points="6 18 12 12 6 6" />
  </svg>
);

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
  className?: string;
  testId?: string;
}

/**
 * Pagination Component
 *
 * Features:
 * - Navigate between pages
 * - Jump to first/last page
 * - Visual page numbers
 * - Shows total items info
 * - Responsive design
 * - Uses colors from colors.json
 *
 * Props:
 * @param {number} currentPage - Current active page (1-indexed)
 * @param {number} totalPages - Total number of pages
 * @param {number} [totalItems] - Total number of items
 * @param {number} [itemsPerPage] - Items per page
 * @param {(page: number) => void} onPageChange - Callback when page changes
 * @param {boolean} [showFirstLast] - Show first/last buttons (default: true)
 * @param {boolean} [showPrevNext] - Show prev/next buttons (default: true)
 * @param {number} [maxVisiblePages] - Max visible page numbers (default: 5)
 * @param {string} [className] - Additional CSS classes
 * @param {string} [testId] - Test identifier
 *
 * Example:
 * ```tsx
 * <Pagination
 *   currentPage={2}
 *   totalPages={10}
 *   totalItems={100}
 *   itemsPerPage={10}
 *   onPageChange={(page) => console.log(page)}
 * />
 * ```
 */
const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
  className = "",
  testId = "pagination",
}) => {
  // Early return if no pages
  if (totalPages <= 0) {
    return null;
  }

  // Calculate visible page numbers
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const half = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - half);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add first page and ellipsis
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push("ellipsis-start");
      }
    }

    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add last page and ellipsis
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push("ellipsis-end");
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  // Calculate item range
  const startItem = totalItems && itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : null;
  const endItem =
    totalItems && itemsPerPage ? Math.min(currentPage * itemsPerPage, totalItems) : null;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const paginationClasses = clsx(
    "flex flex-wrap justify-between items-center gap-4 px-6 py-4",
    "bg-background-1",
    className
  );

  return (
    <div className={paginationClasses} data-testid={testId}>
      {/* Info Section */}
      {totalItems && itemsPerPage && (
        <div className="text-body-13 text-neutral-6" data-testid={`${testId}-info`}>
          Hiển thị <span className="font-semibold text-neutral-10">{startItem}</span> -{" "}
          <span className="font-semibold text-neutral-10">{endItem}</span> trong tổng số{" "}
          <span className="font-semibold text-neutral-10">{totalItems.toLocaleString()}</span> mục
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex gap-1 items-center" data-testid={`${testId}-controls`}>
        {/* First Page Button */}
        {showFirstLast && currentPage > 1 && (
          <button
            type="button"
            onClick={() => handlePageChange(1)}
            className={clsx(
              "flex justify-center items-center w-9 h-9 rounded",
              "text-neutral-6 hover:text-primary-6 hover:bg-primary-10",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary-6 focus:ring-offset-2",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
            title="Trang đầu"
            data-testid={`${testId}-first`}
          >
            <ChevronDoubleLeftIcon />
          </button>
        )}

        {/* Previous Button */}
        {showPrevNext && (
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className={clsx(
              "flex justify-center items-center w-9 h-9 rounded",
              "text-neutral-6 hover:text-primary-6 hover:bg-primary-10",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary-6 focus:ring-offset-2",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
            title="Trang trước"
            data-testid={`${testId}-prev`}
          >
            <ChevronLeftIcon />
          </button>
        )}

        {/* Page Numbers */}
        {visiblePages.map((page, index) => {
          if (page === "ellipsis-start" || page === "ellipsis-end") {
            return (
              <span
                key={`${page}-${index}`}
                className="flex justify-center items-center w-9 h-9 text-neutral-5 select-none"
                data-testid={`${testId}-ellipsis-${page}`}
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => handlePageChange(pageNum)}
              className={clsx(
                "flex justify-center items-center w-9 h-9 font-semibold rounded",
                "transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-primary-6 focus:ring-offset-2",
                isActive
                  ? "shadow-md bg-button-default text-button-text scale-105"
                  : "text-neutral-6 hover:text-primary-6 hover:bg-primary-10 hover:scale-105"
              )}
              data-testid={`${testId}-page-${pageNum}`}
              aria-current={isActive ? "page" : undefined}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next Button */}
        {showPrevNext && (
          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className={clsx(
              "flex justify-center items-center w-9 h-9 rounded",
              "text-neutral-6 hover:text-primary-6 hover:bg-primary-10",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary-6 focus:ring-offset-2",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
            title="Trang sau"
            data-testid={`${testId}-next`}
          >
            <ChevronRightIcon />
          </button>
        )}

        {/* Last Page Button */}
        {showFirstLast && currentPage < totalPages && (
          <button
            type="button"
            onClick={() => handlePageChange(totalPages)}
            className={clsx(
              "flex justify-center items-center w-9 h-9 rounded",
              "text-neutral-6 hover:text-primary-6 hover:bg-primary-10",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary-6 focus:ring-offset-2",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
            title="Trang cuối"
            data-testid={`${testId}-last`}
          >
            <ChevronDoubleRightIcon />
          </button>
        )}
      </div>
    </div>
  );
};

Pagination.displayName = "Pagination";
export default Pagination;
