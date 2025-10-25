import React from "react";

import clsx from "clsx";

// Define FORMAL_PADDING constant locally
const FORMAL_PADDING = "p-4";

type RightSize = "sm" | "md" | "lg" | "xl";
type LeftSize = "sm" | "md" | "lg" | "xl";

const rightSizeToMinMax: Record<RightSize, [string, string]> = {
  sm: ["5rem", "6.25rem"],
  md: ["6.25rem", "7.5rem"],
  lg: ["7.5rem", "10rem"],
  xl: ["12.5rem", "26.25rem"],
};

const leftSizeToMinMax: Record<LeftSize, [string, string]> = {
  sm: ["7.5rem", "9rem"],
  md: ["8rem", "9.5rem"],
  lg: ["12rem", "16rem"],
  xl: ["16rem", "20rem"],
};

interface BarItem {
  element: React.ReactNode;
  span?: number; // preserved but not used in the new layout
  className?: string; // optional custom className for each item
  key?: string;
}

interface FilterBarProps {
  leftItems?: BarItem[];
  rightItems?: BarItem[];
  leftTotalSpan?: number; // preserved but unused
  rightTotalSpan?: number; // preserved but unused
  leftAuto?: boolean;
  leftSize?: LeftSize; // 👈 thêm option này
  rightSize?: RightSize; // 👈 thêm option này
}

/**
 * @component FilterBar
 *
 * 📦 Thanh lọc dữ liệu dạng 2 bên (trái/phải), hỗ trợ tự động wrap hoặc grid responsive theo min-width.
 *
 * - Dựa trên `flex` và `CSS Grid` để bố trí các phần tử (`element`) bên trái và bên phải.
 * - Mỗi phần tử có `min-width` cố định (7.5rem ~ Tailwind `min-w-24`) để đảm bảo khả năng responsive.
 * - Vùng trái có thể:
 *   - Tự động wrap (nếu `leftAuto = true`) — dùng `flex-wrap`
 *   - Hoặc dùng `grid` với `auto-fit` — tự động chia cột dựa trên không gian còn lại
 * - Vùng phải luôn hiển thị theo kiểu `grid` với `auto-fit`, nhưng wrap lại trong `flex` để canh phải.
 * - Props `span`, `leftTotalSpan`, `rightTotalSpan` **vẫn được giữ** nhưng **không còn ảnh hưởng đến layout** — chỉ để tương thích ngược.
 *
 * ---
 * ✅ Props:
 * - `leftItems?: BarItem[]` — Danh sách phần tử phía trái (mặc định `[]`)
 * - `rightItems?: BarItem[]` — Danh sách phần tử phía phải (mặc định `[]`)
 * - `leftAuto?: boolean` — Nếu `true`, vùng trái sẽ dùng `flex-wrap`; nếu `false`, dùng `grid` responsive (mặc định `false`)
 * - `leftSize?: LeftSize` — Kích thước item bên trái: `'sm' | 'md' | 'lg' | 'xl'` (mặc định `'md'`)
 * - `rightSize?: RightSize` — Kích thước item bên phải: `'sm' | 'md' | 'lg' | 'xl'` (mặc định `'md'`)
 * - `leftTotalSpan?: number` — **[deprecated]** Không còn sử dụng, giữ vì lý do tương thích.
 * - `rightTotalSpan?: number` — **[deprecated]** Không còn sử dụng, giữ vì lý do tương thích.
 * - `BarItem`:
 *   - `element: React.ReactNode` — Nội dung phần tử
 *   - `span?: number` — **[deprecated]** Không còn ảnh hưởng đến layout
 *
 * ---
 * 💡 Ví dụ:
 * ```tsx
 * <FilterBar
 *   leftItems={[
 *     { element: <SelectFilter /> },
 *     { element: <DateRangePicker />, className: 'min-w-48 max-w-60' },
 *   ]}
 *   rightItems={[
 *     { element: <Button>Reset</Button> },
 *     { element: <Button type="primary">Search</Button> },
 *   ]}
 *   leftSize="lg"
 *   rightSize="md"
 *   leftAuto
 * />
 * ```
 *
 * ---
 * ♿ Accessibility:
 * - Không can thiệp trực tiếp vào `aria-*`.
 * - Developer nên tự xử lý accessibility cho từng `element` trong `BarItem`.
 */
const FilterBar: React.FC<FilterBarProps> = ({
  leftItems = [],
  rightItems = [],
  leftAuto = false,
  leftSize = "sm", // 👈 mặc định là md
  rightSize = "md", // 👈 mặc định là md
}) => {
  const hasLeft = leftItems.length > 0;
  const hasRight = rightItems.length > 0;
  const itemClass = "min-w-24"; // ~ Tailwind min-w-24
  const [minWidthLeft, maxWidthLeft] = leftSizeToMinMax[leftSize];
  const [minWidthButton, maxWidthButton] = rightSizeToMinMax[rightSize];

  return (
    <div className={clsx("flex w-full flex-row items-start gap-4", FORMAL_PADDING)}>
      {/* LEFT SIDE */}
      {hasLeft &&
        (leftAuto ? (
          <div className="flex flex-wrap flex-1 gap-4">
            {leftItems.map((item, idx) => (
              <div key={`left-${item?.key ?? idx}`} className={clsx(itemClass, item.className)}>
                {item.element}
              </div>
            ))}
          </div>
        ) : (
          <div
            className="grid flex-1 gap-4 auto-cols-fr auto-rows-auto"
            style={{
              gridTemplateColumns: `repeat(auto-fit, minmax(${minWidthLeft}, ${maxWidthLeft}))`,
            }}
          >
            {leftItems.map((item, idx) => (
              <div key={`left-${idx}`} className={clsx(itemClass, item.className)}>
                {item.element}
              </div>
            ))}
          </div>
        ))}

      {/* RIGHT SIDE */}
      {hasRight && (
        <div
          className="grid gap-4 auto-cols-fr auto-rows-auto"
          style={{
            gridTemplateColumns: `repeat(auto-fit, minmax(${minWidthButton}, ${maxWidthButton}))`,
          }}
        >
          <div className="flex items-center justify-end flex-1 gap-4">
            {rightItems.map((item, idx) => (
              <div key={`right-${item?.key ?? idx}`} className={clsx("shrink-0", item.className)}>
                {item.element}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
