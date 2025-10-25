/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import clsx from "clsx";

export interface ScrollAreaProps
  extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
  children: React.ReactNode;
  className?: string;
  testId?: string;
  /** Ẩn scrollbar khi không hover */
  autoHide?: boolean;
  /** Ẩn scrollbar ngang */
  hideScrollbarX?: boolean;
  /** Ẩn scrollbar dọc */
  hideScrollbarY?: boolean;
  /** Độ dày scrollbar tính bằng px */
  scrollbarThickness?: number;
  /** Thời gian ẩn scrollbar sau khi không hover, ms */
  scrollHideDelay?: number;
  /** Custom class cho track */
  trackClassName?: string;
  /** Custom class cho thumb */
  thumbClassName?: string;
  /** Custom class cho corner */
  cornerClassName?: string;
  /** Ref để attach scroll container (Viewport) */
  scrollRef?: React.Ref<HTMLDivElement>;
}

const ScrollView = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  ScrollAreaProps
>(
  (
    {
      children,
      className = "",
      testId = "scroll-view",
      autoHide = true,
      hideScrollbarX = false,
      hideScrollbarY = true,
      scrollbarThickness = 6, //10
      scrollHideDelay = 300,
      trackClassName = "",
      thumbClassName = "",
      scrollRef,
      ...props
    },
    ref
  ) => {
    return (
      <ScrollAreaPrimitive.Root
        ref={ref}
        className={clsx("overflow-hidden relative group size-full", className)}
        data-testid={testId}
        {...props}
      >
        {/* Viewport with forwarded scrollRef */}
        <ScrollAreaPrimitive.Viewport
          ref={scrollRef}
          className="overflow-auto size-full"
          data-testid={`${testId}-viewport`}
        >
          {children}
        </ScrollAreaPrimitive.Viewport>

        {/* Vertical Scrollbar */}
        <ScrollAreaPrimitive.Scrollbar
          orientation="vertical"
          data-testid={`${testId}-scrollbar-vertical`}
          className={clsx(
            "z-50 flex touch-none select-none p-0.5 transition-opacity duration-200",
            autoHide ? "opacity-0 group-hover:opacity-100" : "opacity-100",
            hideScrollbarY && "invisible",
            trackClassName
          )}
          style={{
            width: scrollbarThickness,
            transitionDelay: `${scrollHideDelay}ms`,
          }}
        >
          <ScrollAreaPrimitive.Thumb
            className={clsx("relative bg-gray-400 rounded-full", thumbClassName)}
            data-testid={`${testId}-thumb-vertical`}
            style={{
              width: scrollbarThickness,
            }}
          />
        </ScrollAreaPrimitive.Scrollbar>

        {/* Horizontal Scrollbar */}
        <ScrollAreaPrimitive.Scrollbar
          orientation="horizontal"
          data-testid={`${testId}-scrollbar-horizontal`}
          className={clsx(
            "z-50 flex touch-none select-none p-0.5 transition-opacity duration-200",
            autoHide ? "opacity-0 group-hover:opacity-100" : "opacity-100",
            hideScrollbarX && "invisible",
            trackClassName
          )}
          style={{
            height: scrollbarThickness,
            transitionDelay: `${scrollHideDelay}ms`,
          }}
        >
          <ScrollAreaPrimitive.Thumb
            className={clsx("relative bg-gray-400 rounded-full", thumbClassName)}
            data-testid={`${testId}-thumb-horizontal`}
          />
        </ScrollAreaPrimitive.Scrollbar>

        {/* Corner */}
        <ScrollAreaPrimitive.Corner className="invisible" data-testid={`${testId}-corner`} />
      </ScrollAreaPrimitive.Root>
    );
  }
);

ScrollView.displayName = "ScrollView";
export default React.memo(ScrollView);
