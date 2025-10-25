import React from "react";

import clsx from "clsx";

const MAX_LEFT_MAP = {
  xs: "24rem",
  sm: "28rem",
  md: "32rem",
  lg: "36rem",
  lg2: "38rem",
  xl: "40rem",
} as const;

interface GridLayoutProps {
  left?: React.ReactNode;
  right?: React.ReactNode;

  /** Min-width vùng trái (px) */
  minLeftWidth?: number;
  /** Tỷ lệ giãn nở vùng trái */
  leftRatio?: number;
  /** Tỷ lệ giãn nở vùng phải */
  rightRatio?: number;

  maxLeftWidth?: keyof typeof MAX_LEFT_MAP;

  /** Khoảng cách giữa 2 vùng, tương ứng Tailwind gap-{n} */
  gap?: number;
}

const gapClassMap: Record<number, string> = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2 tablet:gap-1 mobile:gap-1",
  3: "gap-3 tablet:gap-2 mobile:gap-1",
  4: "gap-4 tablet:gap-2 mobile:gap-1",
  5: "gap-5 tablet:gap-2 mobile:gap-1",
  6: "gap-6 tablet:gap-2 mobile:gap-1",
  8: "gap-8 tablet:gap-4 mobile:gap-2",
  10: "gap-10 tablet:gap-6 mobile:gap-4",
  12: "gap-12 tablet:gap-8 mobile:gap-6",
  16: "gap-16 tablet:gap-12 mobile:gap-8",
};

/**
 * @component GridLayout
 *
 * 📦 Layout hai cột động với tỷ lệ giãn nở, hỗ trợ min-width và khoảng cách giữa hai vùng.
 *
 * - Sử dụng `display: grid` với cấu hình `gridTemplateColumns` tùy biến theo props.
 * - Hỗ trợ chia bố cục thành 2 vùng: `left` và `right`, có thể truyền 1 hoặc cả 2.
 * - Vùng `left` có thể thiết lập `min-width` và giãn nở theo tỷ lệ (`leftRatio`).
 * - Vùng `right` chiếm phần còn lại dựa vào `rightRatio`.
 * - Nếu chỉ truyền 1 vùng (left hoặc right), vùng đó sẽ chiếm toàn bộ chiều rộng (`1fr`).
 * - Tự động áp dụng style mặc định (`border`, `rounded`, `background`) cho từng vùng.
 *
 * ---
 * ✅ Props:
 * - `left?: React.ReactNode` — Nội dung khu vực bên trái (tùy chọn).
 * - `right?: React.ReactNode` — Nội dung khu vực bên phải (tùy chọn).
 * - `minLeftWidth?: number` — Chiều rộng tối thiểu của vùng trái (đơn vị px, mặc định `440`).
 * - `leftRatio?: number` — Tỷ lệ giãn nở của vùng trái (mặc định `1`).
 * - `rightRatio?: number` — Tỷ lệ giãn nở của vùng phải (mặc định `2`).
 * - `gap?: number` — Khoảng cách giữa hai vùng (từ `0` → `16`), tương ứng với Tailwind `gap-{n}` (mặc định `2`).
 *
 * ---
 * 💡 Ví dụ:
 * ```tsx
 * <GridLayout
 *   left={<Card>Thông tin</Card>}
 *   right={<FormSection />}
 *   minLeftWidth={400}
 *   leftRatio={1}
 *   rightRatio={3}
 *   gap={8}
 * />
 * ```
 *
 * ---
 * ♿ Accessibility:
 * - Component không can thiệp trực tiếp vào `aria-*`.
 * - Nếu nội dung trong `left` hoặc `right` chứa input hoặc vùng focusable, nên tự thêm `aria-*` hoặc heading phù hợp.
 */
const GridLayout: React.FC<GridLayoutProps> = ({
  left,
  right,
  minLeftWidth = 440,
  maxLeftWidth = "md",
  rightRatio = 2,
  gap = 2,
}) => {
  const hasLeft = Boolean(left);
  const hasRight = Boolean(right);
  const gapClass = gapClassMap[gap] ?? gapClassMap[6]!;

  // CSS class chung cho mỗi vùng
  const baseClass =
    "relative h-full overflow-hidden rounded border border-border-1 bg-background-1";

  // Xác định gridTemplateColumns: nếu chỉ có 1 vùng thì 1fr, ngược lại minmax + fr
  const gridTemplateColumns =
    hasLeft && hasRight
      ? `minmax(${minLeftWidth}px, ${MAX_LEFT_MAP[maxLeftWidth]}) ${rightRatio}fr`
      : "1fr";

  return (
    <div className={clsx("grid size-full", gapClass)} style={{ gridTemplateColumns }}>
      {hasLeft && <div className={baseClass}>{left}</div>}
      {hasRight && <div className={baseClass}>{right}</div>}
    </div>
  );
};

export default GridLayout;
