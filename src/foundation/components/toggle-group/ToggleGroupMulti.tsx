import React from "react";

import clsx from "clsx";

export interface ToggleOption {
  label: string;
  value: string;
}

interface ToggleGroupProps {
  options: ToggleOption[];
  active: string[];
  onChange: (value: string[]) => void;
  isFull?: boolean;
  className?: string;
  valueNew?: (Value: string) => void;
  valueRemove?: (Value: string) => void;
}

const ToggleGroupMulti: React.FC<ToggleGroupProps> = ({
  options,
  active,
  onChange,
  isFull = false,
  className,
  valueNew,
  valueRemove,
}) => {
  const isActive = (value: string) => active.includes(value);

  const handleClick = (value: string) => {
    if (active.includes(value)) {
      if (valueRemove) valueRemove(value);
      onChange(active.filter((v) => v !== value)); // Bỏ chọn
    } else {
      if (valueNew) valueNew(value);
      onChange([...active, value]); // Thêm chọn
    }
  };

  return (
    <div className={clsx("flex", isFull ? "w-full gap-2" : "space-x-2", className)}>
      {options.map(({ label, value }) => (
        <div
          key={value}
          onClick={() => handleClick(value)}
          className={clsx(
            "cursor-pointer rounded-md px-3 py-1 transition-colors",
            isFull && "flex-1 text-center",
            isActive(value)
              ? "text-caption-10-medium bg-background-3 text-neutral-10"
              : "text-caption-10 border border-neutral-3 text-neutral-7"
          )}
        >
          {label}
        </div>
      ))}
    </div>
  );
};

export default ToggleGroupMulti;
