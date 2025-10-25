import React from "react";

import clsx from "clsx";

const CustomOuterElement = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ style, ...rest }, ref) => {
    const bgPopup = "!bg-background-popup";

    return (
      <div
        ref={ref}
        {...rest}
        style={{
          ...style,
          scrollbarColor: "var(--scrollbar-thumb) var(--scrollbar-track)",
        }}
        className={clsx("custom-scrollbar-thin-1px w-full", bgPopup)}
      />
    );
  }
);

CustomOuterElement.displayName = "CustomOuterElement";

export default CustomOuterElement;
