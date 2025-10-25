import { ReactNode } from "react";

import clsx from "clsx";

interface SectionTitleProps {
  children: ReactNode;
  sticky?: boolean;
  className?: string;
  color?: string;
  testId?: string;
}

/**
 * @component SectionTitle
 *
 * 🏷️ Hiển thị tiêu đề cho một section, thường nằm trong `Section.Header`.
 * Hỗ trợ sticky khi scroll.
 *
 * ---
 * ✅ Props:
 * - `children: ReactNode` — Nội dung tiêu đề.
 * - `sticky?: boolean` — Bật sticky với `position: sticky` và nền (default: `false`).
 * - `color?: string` — Màu chữ (default: `'text-neutral-10'`).
 * - `className?: string` — Custom class.
 * - `testId?: string` — `data-testid` phục vụ kiểm thử.
 *
 * ---
 * 💡 Ví dụ:
 * ```tsx
 * <SectionTitle sticky>Thông tin tài khoản</SectionTitle>
 * ```
 */
const SectionTitle: React.FC<SectionTitleProps> = ({
  children,
  sticky = false,
  color = "text-neutral-10",
  className,
  testId,
}) => {
  return (
    <div
      className={clsx(
        "text-title-20-bold",
        color,
        { "sticky top-0 bg-background-base": sticky },
        className
      )}
      data-testid={testId}
    >
      {children}
    </div>
  );
};

export default SectionTitle;
