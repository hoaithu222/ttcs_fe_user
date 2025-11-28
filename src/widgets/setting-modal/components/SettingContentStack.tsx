import React from "react";

import clsx from "clsx";
import { useDispatch } from "react-redux";
import { ArrowLeft, X } from "lucide-react";

import { setVisibleModalSetting } from "@/app/store/slices/setting/settingSlice";

import { Screen, SettingContentStackProps } from "../types";

const SettingContentStack: React.FC<SettingContentStackProps> = ({
  initialScreen,
  initialSubScreens = [],
  resetCounter = 0,
}) => {
  const dispatch = useDispatch();

  const handleCloseModal = () => {
    dispatch(setVisibleModalSetting(false));
  };
  const [stack, setStack] = React.useState<Screen[]>([initialScreen, ...initialSubScreens]);
  const prevResetCounterRef = React.useRef(resetCounter);

  // Reset stack khi resetCounter thay đổi (khi user nhấn tab hiện tại để reset)
  React.useEffect(() => {
    // Chỉ reset khi resetCounter thực sự tăng (user nhấn tab hiện tại)
    if (resetCounter > prevResetCounterRef.current) {
      setStack([initialScreen, ...initialSubScreens]);
      prevResetCounterRef.current = resetCounter;
    }
  }, [resetCounter, initialScreen, initialSubScreens]);
  const push = (screen: Screen) => {
    setStack((prev) => [...prev, screen]);
  };
  const pop = () => {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };
  const reset = () => {
    setStack([initialScreen, ...initialSubScreens]);
  };
  const current = stack[stack.length - 1];

  return (
    <div className="flex flex-col h-full">
      <div className={clsx("flex items-center justify-between border-b border-border-2 p-4")}>
        <div className={clsx("flex items-center gap-2")}>
          {stack.length > 1 && (
            <ArrowLeft
              className={clsx("cursor-pointer w-5 h-5 text-neutral-7")}
              onClick={() => pop()}
            />
          )}
          <h3 className={clsx("text-title-16-semibold text-neutral-9")}>{current.title}</h3>
        </div>
        <X
          className={clsx("cursor-pointer w-5 h-5 text-neutral-7")}
          onClick={handleCloseModal}
        />
      </div>
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {React.cloneElement(current.element as React.ReactElement, {
          push: push,
          reset: reset,
          key: current.key,
        })}
      </div>
    </div>
  );
};

export default SettingContentStack;
