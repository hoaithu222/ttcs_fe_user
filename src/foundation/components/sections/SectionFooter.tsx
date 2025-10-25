import React from "react";

import clsx from "clsx";

interface SectionFooterActionsProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * @component SectionFooterActions
 *
 * 🧷 Component hiển thị hành động hoặc ghi chú ở dưới cùng của section, dùng bên trong `Section.Footer`.
 * Tự động điều chỉnh layout theo số lượng phần tử con:
 * - Nếu chỉ có 1 phần tử: hiển thị dạng cột (`flex-col`)
 * - Nếu nhiều phần tử: hiển thị hàng ngang (`flex-row`)
 *
 * ---
 * ✅ Props:
 * - `children: React.ReactNode` — Các hành động như nút submit, huỷ, ghi chú...
 * - `className?: string` — Custom class.
 *
 * ---
 * 📦 Subcomponents:
 * - `SectionFooterActions.Left`: nội dung căn trái (mô tả, chú thích).
 * - `SectionFooterActions.Right`: nội dung căn phải (nút hành động).
 *
 * ---
 * 💡 Ví dụ:
 * ```tsx
 * <SectionFooterActions>
 *   <SectionFooterActions.Left>Ghi chú nhỏ</SectionFooterActions.Left>
 *   <SectionFooterActions.Right>
 *     <Button>Huỷ</Button>
 *     <Button primary>Tiếp tục</Button>
 *   </SectionFooterActions.Right>
 * </SectionFooterActions>
 * ```
 */
const SectionFooterActions = ({ children, className }: SectionFooterActionsProps) => {
  const childrenArray = React.Children.toArray(children);
  const isSingle = childrenArray.length === 1;

  return (
    <div className={clsx("flex gap-4", isSingle ? "flex-col" : "flex-row items-center", className)}>
      {children}
    </div>
  );
};

const Left = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={clsx("text-caption-12 flex-1 text-neutral-6", className)}>{children}</div>
);

const Right = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={clsx("flex flex-1 justify-end", className)}>{children}</div>
);

SectionFooterActions.Left = Left;
SectionFooterActions.Right = Right;

export default SectionFooterActions;
