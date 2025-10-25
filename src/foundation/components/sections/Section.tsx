import React from "react";

import clsx from "clsx";

type SpacingSize = "none" | "xs" | "sm" | "md" | "lg" | "xl";

const SPACING_X_MAP: Record<Exclude<SpacingSize, "none">, string> = {
  xs: "px-2",
  sm: "px-4",
  md: "px-6",
  lg: "px-8",
  xl: "px-10",
};

const SPACING_Y_MAP: Record<Exclude<SpacingSize, "none">, string> = {
  xs: "py-1",
  sm: "py-2",
  md: "py-4",
  lg: "py-6",
  xl: "py-8",
};

const getSpacingXYClass = (spacingX: SpacingSize = "md", spacingY: SpacingSize = "md") => {
  const x = spacingX === "none" ? "" : SPACING_X_MAP[spacingX];
  const y = spacingY === "none" ? "" : SPACING_Y_MAP[spacingY];
  return clsx(x, y);
};

interface SectionProps<T extends React.ElementType = "section"> {
  as?: T;
  children: React.ReactNode;
  testId?: string;
  className?: string;
  spacing?: never; // spacing đã chuyển sang Header/Body/Footer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

const Section = <T extends React.ElementType = "section">({
  as,
  children,
  testId,
  className,
  ...rest
}: SectionProps<T>) => {
  const Component = as || "section";
  return (
    <Component
      className={clsx("relative flex size-full min-h-0 flex-col overflow-hidden", className)}
      data-testid={testId}
      {...rest}
    >
      {children}
    </Component>
  );
};

// --- Header ---
const SectionHeader = ({
  children,
  testId,
  className,
  spacingX = "sm",
  spacingY = "sm",
}: {
  children: React.ReactNode;
  testId?: string;
  className?: string;
  spacingX?: SpacingSize;
  spacingY?: SpacingSize;
}) => (
  <div
    className={clsx(
      "sticky top-0 z-10 text-left",
      getSpacingXYClass(spacingX, spacingY),
      className
    )}
    data-testid={testId}
  >
    {children}
  </div>
);
SectionHeader.displayName = "Section.Header";
Section.Header = SectionHeader;

// --- Body ---
const GAP_CLASS_MAP: Record<SpacingSize, string> = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

const SectionBody = ({
  children,
  testId,
  className,
  spacingX = "sm",
  spacingY = "none",
  gap = "md",
}: {
  children: React.ReactNode;
  testId?: string;
  className?: string;
  spacingX?: SpacingSize;
  spacingY?: SpacingSize;
  gap?: SpacingSize;
}) => (
  <div
    className={clsx(
      "flex min-h-0 flex-1 flex-col overflow-auto",
      GAP_CLASS_MAP[gap],
      getSpacingXYClass(spacingX, spacingY),
      className
    )}
    data-testid={testId}
  >
    {children}
  </div>
);
SectionBody.displayName = "Section.Body";
Section.Body = SectionBody;

// --- Footer ---
const SectionFooter = ({
  children,
  testId,
  className,
  spacingX = "sm",
  spacingY = "sm",
}: {
  children: React.ReactNode;
  testId?: string;
  className?: string;
  spacingX?: SpacingSize;
  spacingY?: SpacingSize;
}) => (
  <div
    className={clsx(
      "sticky bottom-0 z-10 mt-auto w-full border-t border-divider-1 bg-background-1",
      getSpacingXYClass(spacingX, spacingY),
      className
    )}
    data-testid={testId}
  >
    {children}
  </div>
);
SectionFooter.displayName = "Section.Footer";
Section.Footer = SectionFooter;

export default Section;
