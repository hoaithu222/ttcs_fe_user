import React from "react";

interface CheckboxIconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
}

export const CheckedBoxIcon: React.FC<CheckboxIconProps> = ({
  color = "currentColor",
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="m8 12 3 3 5-6" />
  </svg>
);

export const UncheckedBoxIcon: React.FC<CheckboxIconProps> = ({
  color = "currentColor",
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="3" y="3" width="18" height="18" rx="3" />
  </svg>
);


