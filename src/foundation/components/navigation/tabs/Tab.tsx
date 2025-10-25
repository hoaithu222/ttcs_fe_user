import React from "react";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import clsx from "clsx";

export type TabsVariant = "solid" | "underline";

export interface TabsProps<T extends string = string>
  extends Omit<TabsPrimitive.TabsProps, "onValueChange" | "value" | "defaultValue"> {
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  className?: string;
  testId?: string;
  children: React.ReactNode;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
  variant?: TabsVariant;
  borderClassName?: string;
  underlineClassName?: string;
  hasPaddingX?: boolean;
  hasPaddingY?: boolean;
  fullWidth?: boolean;
  hasBottomBorder?: boolean;
  testId?: string;
}

interface TabsTriggerProps extends React.ComponentProps<typeof TabsPrimitive.Trigger> {
  children: React.ReactNode;
  className?: string;
  variant?: TabsVariant;
  underlineClassName?: string;
  testId?: string;
  fullWidth?: boolean;
  activeColor?: keyof typeof ACTIVE_TABS_TRIGGER_COLOR_MAP;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  hasPaddingX?: boolean;
  hasPaddingY?: boolean;
  testId?: string;
  activeValue: string;
}

// --- Root ---
function TabsInner<T extends string>({
  value,
  defaultValue,
  onValueChange,
  className,
  testId,
  children,
  ...rest
}: TabsProps<T>) {
  return (
    <div className="flex-1 min-h-0">
      <TabsPrimitive.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange as (v: string) => void}
        className={clsx("flex size-full flex-col", className)}
        data-testid={testId}
        {...rest}
      >
        {children}
      </TabsPrimitive.Root>
    </div>
  );
}

// --- List ---
const TabsList: React.FC<TabsListProps> = ({
  children,
  className,
  variant = "solid",
  borderClassName = "border-neutral-3",
  hasPaddingX,
  hasPaddingY,
  fullWidth = true,
  hasBottomBorder,
  testId,
}) => {
  const isUnderline = variant === "underline";
  const paddingX = hasPaddingX ? (isUnderline ? "px-2" : "px-4") : "";
  const paddingY = hasPaddingY ? (isUnderline ? "py-2" : "py-1.5") : "";

  return (
    <TabsPrimitive.List
      className={clsx(
        "text-body-14 text-neutral-4",
        paddingX,
        paddingY,
        isUnderline && `${borderClassName}`,
        hasBottomBorder && "border-b border-border-2"
      )}
      data-testid={testId}
    >
      <div
        className={clsx(
          fullWidth ? "flex w-full justify-start" : "flex justify-start",
          !isUnderline && "gap-2", // optional spacing
          className
        )}
      >
        <div
          className={clsx(
            !isUnderline ? "rounded-lg bg-neutral-1 p-1" : "gap-x-6",
            fullWidth ? "flex w-full" : "inline-flex"
          )}
        >
          {React.Children.map(children, (child) =>
            React.isValidElement(child)
              ? React.cloneElement(child, {
                  variant,
                  fullWidth,
                } as Partial<TabsTriggerProps>)
              : child
          )}
        </div>
      </div>
    </TabsPrimitive.List>
  );
};

TabsList.displayName = "Tabs.List";

enum ACTIVE_TABS_TRIGGER_COLOR_MAP {
  primary = "data-[state=active]:bg-brand data-[state=active]:text-white data-[state=active]:text-body-14-medium",
  secondary = "data-[state=active]:bg-button-outlined data-[state=active]:text-base-white data-[state=active]:text-body-14-medium",
}

// --- Trigger ---
const TabsTrigger: React.FC<TabsTriggerProps> = ({
  children,
  className,
  variant = "solid",
  activeColor = "primary",
  underlineClassName = "after:-bottom-1 after:h-[2px] after:bg-brand",
  testId,
  fullWidth = true,
  ...props
}) => {
  const base =
    "relative text-center outline-none transition-all  text-body-14-medium text-neutral-4";
  const fullWidthClass = fullWidth ? "flex-1" : "";
  const variantClass =
    variant === "underline"
      ? clsx(
          "after:absolute after:inset-x-0 after:origin-center after:scale-x-0",
          "hover:text-neutral-10 data-[state=active]:text-neutral-10 data-[state=active]:after:scale-x-100",
          underlineClassName
        )
      : `rounded-lg bg-neutral-1 hover:bg-neutral-2 hover:text-neutral-10 data-[state=active]:text-body-14-medium px-1.5 py-1 ${ACTIVE_TABS_TRIGGER_COLOR_MAP[activeColor]}`;

  return (
    <TabsPrimitive.Trigger
      className={clsx(base, variantClass, fullWidthClass, className)}
      data-testid={testId}
      {...props}
    >
      {children}
    </TabsPrimitive.Trigger>
  );
};

TabsTrigger.displayName = "Tabs.Trigger";

// --- Content ---
const TabsContent: React.FC<TabsContentProps> = ({
  value,
  children,
  className,
  testId,
  hasPaddingX,
  hasPaddingY,
  activeValue,
}) => {
  const paddingX = hasPaddingX ? "px-6" : "";
  const paddingY = hasPaddingY ? "py-6" : "";

  // Trick: always mount Tabs.Content, but conditionally render the inner div
  return (
    <TabsPrimitive.Content
      value={value}
      data-testid={testId}
      className={clsx(
        "flex min-h-0 flex-col outline-none",
        className,
        activeValue === value && "flex-1"
      )}
    >
      <div className={clsx(paddingX, paddingY, "flex flex-1 flex-col overflow-auto")}>
        {children}
      </div>
    </TabsPrimitive.Content>
  );
};

TabsContent.displayName = "Tabs.Content";

/**
 * @component Tabs
 *
 * 📌 Component hiển thị giao diện tab chuyển đổi, xây dựng trên `@radix-ui/react-tabs` và hỗ trợ hai biến thể UI:
 * - `'solid'`: các tab được bọc trong khối bo góc.
 * - `'underline'`: các tab hiển thị underline khi active.
 *
 * ---
 * ✅ Cấu trúc:
 * - `Tabs`: Phần root container điều khiển giá trị tab đang active.
 * - `Tabs.List`: Vùng hiển thị các tab (trigger buttons).
 * - `Tabs.Trigger`: Từng tab item (nút chuyển tab).
 * - `Tabs.Content`: Nội dung tương ứng với mỗi tab.
 *
 * ---
 * 🎯 Tính năng:
 * - Hỗ trợ controlled (`value`) và uncontrolled (`defaultValue`).
 * - Tùy biến layout: padding, fullWidth, border dưới, underline...
 * - Hỗ trợ test dễ dàng với `data-testid`.
 * - Cách ly logic trigger và content rõ ràng, dễ tái sử dụng.
 * - Render nội dung mọi `Tabs.Content` nhưng chỉ hiện tab đang active (`activeValue`).
 *
 * ---
 * 💡 Ví dụ sử dụng:
 * ```tsx
 * <Tabs defaultValue="tab1" onValueChange={(v) => console.log(v)}>
 *   <Tabs.List variant="solid" hasBottomBorder>
 *     <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
 *     <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
 *   </Tabs.List>
 *   <Tabs.Content value="tab1" activeValue="tab1">Nội dung tab 1</Tabs.Content>
 *   <Tabs.Content value="tab2" activeValue="tab1">Nội dung tab 2</Tabs.Content>
 * </Tabs>
 * ```
 *
 * ---
 * 🧩 Props chi tiết:
 *
 * `Tabs` (Root):
 * - `value?: string` — Giá trị controlled.
 * - `defaultValue?: string` — Giá trị mặc định (uncontrolled).
 * - `onValueChange?: (value: string) => void` — Callback khi tab thay đổi.
 * - `className?: string` — Custom class cho vùng wrapper.
 * - `testId?: string` — `data-testid` cho wrapper.
 *
 * `Tabs.List`:
 * - `variant?: 'solid' | 'underline'` — Kiểu hiển thị tab (default: `'solid'`).
 * - `hasPaddingX?: boolean` — Bật `px-6` cho padding ngang.
 * - `hasPaddingY?: boolean` — Bật `py-6` cho padding dọc.
 * - `hasBottomBorder?: boolean` — Thêm border đáy.
 * - `fullWidth?: boolean` — Tab co giãn hết chiều ngang container (default: `true`).
 * - `borderClassName?: string` — Class border đáy cho `underline`.
 * - `underlineClassName?: string` — Class tùy chỉnh cho underline.
 * - `className?: string` — Custom class cho container list.
 * - `testId?: string`
 *
 * `Tabs.Trigger`:
 * - `value: string` — Giá trị tương ứng với tab.
 * - `variant?: 'solid' | 'underline'` — Dạng tab (kế thừa từ List).
 * - `underlineClassName?: string` — Custom style cho underline (nếu dùng).
 * - `fullWidth?: boolean` — Có co giãn chiều ngang hay không.
 * - `className?: string`
 * - `testId?: string`
 *
 * `Tabs.Content`:
 * - `value: string` — Tab key tương ứng.
 * - `activeValue: string` — Tab đang active (dùng để hiển thị nội dung).
 * - `hasPaddingX?: boolean` — Padding ngang bên trong nội dung.
 * - `hasPaddingY?: boolean` — Padding dọc bên trong nội dung.
 * - `className?: string`
 * - `testId?: string`
 *
 * ---
 * ♿ Accessibility:
 * - Sử dụng chuẩn từ `@radix-ui/react-tabs`, đảm bảo hỗ trợ keyboard navigation và ARIA roles đầy đủ.
 */
const Tabs = Object.assign(TabsInner, {
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
});

export default Tabs;
