import React from "react";

interface ServiceManageProps {
  push: (screen: any) => void;
}

const ServiceManage: React.FC<ServiceManageProps> = ({ push }) => {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="text-xl font-bold text-neutral-9">Quản lý dịch vụ</h2>
      <p className="text-sm text-neutral-6">Quản lý các dịch vụ và tích hợp</p>
    </div>
  );
};

export default ServiceManage;

