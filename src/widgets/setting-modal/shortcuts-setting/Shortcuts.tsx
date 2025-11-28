import React from "react";

interface ShortcutsProps {
  push?: (screen: any) => void;
}

const Shortcuts: React.FC<ShortcutsProps> = ({ push }) => {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="text-xl font-bold text-neutral-9">Phím tắt</h2>
      <p className="text-sm text-neutral-6">Cài đặt các phím tắt bàn phím</p>
    </div>
  );
};

export default Shortcuts;

