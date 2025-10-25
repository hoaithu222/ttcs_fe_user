import React, { KeyboardEvent, forwardRef } from "react";

import clsx from "clsx";

// Padding utilities
const PADDING_X_MAP = {
  xs: "px-2",
  sm: "px-4",
  md: "px-6",
  lg: "px-8",
  xl: "px-10",
} as const;

const PADDING_Y_MAP = {
  xs: "py-2",
  sm: "py-4",
  md: "py-6",
  lg: "py-8",
  xl: "py-10",
} as const;

// Background variants
const BG_MAP = {
  primary: "bg-band text-base-white",
  secondary: "bg-background-3 text-neutral-10",
  // Extend with other variants as needed
} as const;

// Border variants
const BORDER_MAP = {
  primary: "border border-neutral-10",
  secondary: "border border-border-2",
  // Extend with other variants as needed
} as const;

// Shadow variants
const SHADOW_MAP = {
  sm: "shadow-1",
  md: "shadow-2",
  lg: "shadow-3",
} as const;

export type Variant = "filled" | "outlined" | "elevated";
export type ShadowSize = keyof typeof SHADOW_MAP;
export type CardFooterBg = keyof typeof BG_MAP;

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  testId?: string;
  paddingX?: keyof typeof PADDING_X_MAP;
  paddingY?: keyof typeof PADDING_Y_MAP;
  bg?: keyof typeof BG_MAP;
  shadow?: boolean | ShadowSize;
  bordered?: boolean;
  hoverable?: boolean;
  onClick?: () => void;
  isLoading?: boolean;
  variant?: Variant;
  maxWidth?: string;
}

export type CardType = React.ForwardRefExoticComponent<
  CardProps & React.RefAttributes<HTMLDivElement>
> & {
  Header: typeof CardHeader;
  Body: typeof CardBody;
  Footer: typeof CardFooter;
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      testId,
      paddingX = "sm",
      paddingY = "sm",
      bg = "secondary",
      shadow,
      bordered = false,
      hoverable = false,
      onClick,
      isLoading = false,
      variant = "filled",
      maxWidth,
      className,
      style,
      ...rest
    },
    ref
  ) => {
    // Variant classes
    const variantClasses = {
      filled: BG_MAP[bg],
      outlined: "bg-transparent",
      elevated: BG_MAP[bg],
    }[variant];

    // Border logic
    const borderClass = variant === "outlined" || bordered ? BORDER_MAP[bg] : undefined;

    // Shadow logic
    const shadowClass =
      variant === "elevated"
        ? SHADOW_MAP.md
        : typeof shadow === "string"
          ? SHADOW_MAP[shadow]
          : shadow
            ? SHADOW_MAP.sm
            : undefined;

    // Hover effect
    const hoverClass = hoverable
      ? "hover:shadow-lg transition-transform transform hover:-translate-y-0.5"
      : undefined;

    // Clickable cursor
    const clickableClass = onClick ? "cursor-pointer" : undefined;

    // Keyboard handler for accessibility
    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if (!onClick) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick();
      }
    };

    // Combine style for maxWidth
    const containerStyle = maxWidth ? { ...style, maxWidth } : style;
    const commonProps: React.HTMLAttributes<HTMLDivElement> & {
      ref?: React.Ref<HTMLDivElement>;
      "data-testid"?: string;
    } = {
      ref,
      "data-testid": testId,
      className: clsx(
        "relative overflow-hidden rounded-lg",
        PADDING_X_MAP[paddingX],
        PADDING_Y_MAP[paddingY],
        variantClasses,
        borderClass,
        shadowClass,
        hoverClass,
        clickableClass,
        className
      ),
      style: containerStyle,
      onClick,
      onKeyDown: handleKeyDown,
      role: onClick ? "button" : undefined,
      tabIndex: onClick ? 0 : undefined,
      ...rest,
    };

    if (isLoading) {
      return (
        <div {...commonProps}>
          <div className="space-y-2">
            <div className="w-3/4 h-4 rounded" />
            <div className="w-1/2 h-4 rounded" />
            <div className="w-full h-4 rounded" />
          </div>
        </div>
      );
    }

    return <div {...commonProps}>{children}</div>;
  }
) as CardType;

Card.displayName = "Card";

const CardHeader: React.FC<{
  children: React.ReactNode;
  testId?: string;
}> = ({ children, testId, ...rest }) => (
  <div data-testid={testId} className="mb-4 text-left" {...rest}>
    {children}
  </div>
);
CardHeader.displayName = "Card.Header";

const CardBody: React.FC<{
  children: React.ReactNode;
  testId?: string;
  className?: string;
}> = ({ children, testId, className, ...rest }) => (
  <div data-testid={testId} className={clsx("flex flex-col gap-6", className)} {...rest}>
    {children}
  </div>
);
CardBody.displayName = "Card.Body";

const CardFooter: React.FC<{
  children: React.ReactNode;
  testId?: string;
  footerBg?: CardFooterBg;
}> = ({ children, testId, footerBg = "secondary", ...rest }) => (
  <div
    data-testid={testId}
    className={clsx(
      "absolute bottom-4 left-0 w-full overflow-hidden",
      PADDING_X_MAP.sm,
      PADDING_Y_MAP.sm,
      BG_MAP[footerBg]
    )}
    {...rest}
  >
    {children}
  </div>
);
CardFooter.displayName = "Card.Footer";

// Attach subcomponents
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export { Card };
