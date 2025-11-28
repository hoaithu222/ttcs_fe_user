import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store";
import SettingListSections from "../components/SettingListSections";
import { initializeSetting } from "@/app/store/slices/setting/setting.slice";
import { selectOtpType } from "@/app/store/slices/setting/setting.selector";
import { selectUser } from "@/features/Auth/components/slice/auth.selector";
import IconCircleWrapper from "@/foundation/components/icons/IconCircleWrapper";
import { ShieldCheck, Lock, KeyRound, Settings2 } from "lucide-react";
import ChangePassword from "./ChangePassword";
import TwoFactorAuth from "./TwoFactorAuth";
import ChangeOtpMethod from "./ChangeOtpMethod";
import SetupSmartOtpForSetting from "./SetupSmartOtpForSetting";

interface SecuritySettingProps {
  push: (screen: any) => void;
  reset?: () => void;
}

const SecuritySetting: React.FC<SecuritySettingProps> = ({ push, reset }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const otpType = useAppSelector(selectOtpType);

  useEffect(() => {
    if (user) {
      dispatch(
        initializeSetting({
          twoFactorAuth: user.twoFactorAuth,
          otpMethod: user.otpMethod as "email" | "smart_otp",
        })
      );
    }
  }, [user, dispatch]);

  return (
    <div className="flex flex-col gap-4 p-6 overflow-y-auto">
      <div className="flex items-center gap-3 mb-4">
        <IconCircleWrapper size="md" color="info">
          <ShieldCheck className="text-primary-7 dark:text-white" />
        </IconCircleWrapper>
        <div>
          <h2 className="text-2xl font-bold text-neutral-9">Bảo mật</h2>
          <p className="text-sm text-neutral-6 mt-0.5">
            Quản lý các cài đặt bảo mật tài khoản
          </p>
        </div>
      </div>

      <SettingListSections
        items={[
          {
            label: "Đổi mật khẩu",
            onClick: () => {
              push({
                title: "Đổi mật khẩu",
                element: <ChangePassword push={push} reset={reset} />,
              });
            },
            icon: (
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-neutral-6" />
              </div>
            ),
          },
          {
            label: "Xác minh 2 bước",
            onClick: () => {
              push({
                title: "Xác minh 2 bước",
                element: <TwoFactorAuth push={push} reset={reset} />,
              });
            },
            icon: (
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-neutral-6" />
              </div>
            ),
          },
          // {
          //   label: "Đổi phương thức nhận OTP",
          //   onClick: () => {
          //     push({
          //       title: "Phương thức OTP",
          //       element: <ChangeOtpMethod push={push} reset={reset} />,
          //     });
          //   },
          //   icon: (
          //     <div className="flex items-center gap-2">
          //       <Settings2 className="w-4 h-4 text-neutral-6" />
          //     </div>
          //   ),
          // },
          // ...(otpType === "smart"
          //   ? [
          //       {
          //         label: "Cài đặt mật khẩu Smart OTP",
          //         onClick: () => {
          //           push({
          //             title: "Thiết lập Smart OTP",
          //             element: (
          //               <SetupSmartOtpForSetting
          //                 onSuccess={() => {
          //                   window.location.reload();
          //                 }}
          //               />
          //             ),
          //           });
          //         },
          //         icon: (
          //           <div className="flex items-center gap-2">
          //             <KeyRound className="w-4 h-4 text-neutral-6" />
          //           </div>
          //         ),
          //       },
          //     ]
          //   : []),
        ]}
      />
    </div>
  );
};

export default SecuritySetting;

