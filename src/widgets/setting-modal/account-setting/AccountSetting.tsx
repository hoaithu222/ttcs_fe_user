import React from "react";

interface AccountSettingProps {
  push: (screen: any) => void;
}

const AccountSetting: React.FC<AccountSettingProps> = ({ push }) => {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="text-xl font-bold text-neutral-9">Cài đặt tài khoản</h2>
      <p className="text-sm text-neutral-6">Quản lý thông tin tài khoản của bạn</p>
    </div>
  );
};

export default AccountSetting;

