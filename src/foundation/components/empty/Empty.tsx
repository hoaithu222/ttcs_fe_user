import React from "react";
import "./style.css";
import {
  FileX,
  Inbox,
  Search,
  Users,
  ShoppingCart,
  Database,
  Cloud,
  Image,
  Mail,
  Calendar,
} from "lucide-react";

export type EmptyVariant =
  | "default"
  | "search"
  | "data"
  | "users"
  | "cart"
  | "files"
  | "cloud"
  | "images"
  | "mail"
  | "calendar";

export type EmptySize = "small" | "medium" | "large";

export interface EmptyProps {
  variant?: EmptyVariant;
  size?: EmptySize;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  animated?: boolean;
}

const Empty = ({
  variant = "default",
  size = "medium",
  title,
  description,
  action,
  icon,
  className = "",
  animated = true,
}: EmptyProps) => {
  // Default content based on variant
  const variantConfig = {
    default: {
      icon: <Inbox className="w-full h-full" />,
      title: "Không có dữ liệu",
      description: "Chưa có thông tin nào được hiển thị",
    },
    search: {
      icon: <Search className="w-full h-full" />,
      title: "Không tìm thấy kết quả",
      description: "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc",
    },
    data: {
      icon: <Database className="w-full h-full" />,
      title: "Chưa có dữ liệu",
      description: "Dữ liệu sẽ xuất hiện ở đây khi có sẵn",
    },
    users: {
      icon: <Users className="w-full h-full" />,
      title: "Chưa có người dùng",
      description: "Mời thêm người dùng để bắt đầu",
    },
    cart: {
      icon: <ShoppingCart className="w-full h-full" />,
      title: "Giỏ hàng trống",
      description: "Thêm sản phẩm vào giỏ hàng để tiếp tục",
    },
    files: {
      icon: <FileX className="w-full h-full" />,
      title: "Không có tệp nào",
      description: "Tải lên tệp để bắt đầu làm việc",
    },
    cloud: {
      icon: <Cloud className="w-full h-full" />,
      title: "Đồng bộ trống",
      description: "Dữ liệu đám mây sẽ xuất hiện ở đây",
    },
    images: {
      icon: <Image className="w-full h-full" />,
      title: "Không có hình ảnh",
      description: "Tải lên hình ảnh để xem trước",
    },
    mail: {
      icon: <Mail className="w-full h-full" />,
      title: "Hộp thư trống",
      description: "Không có email mới nào",
    },
    calendar: {
      icon: <Calendar className="w-full h-full" />,
      title: "Không có sự kiện",
      description: "Thêm sự kiện để quản lý lịch trình",
    },
  };

  // Size configurations
  const sizeConfig = {
    small: {
      container: "py-8",
      iconSize: "w-16 h-16",
      title: "text-lg font-semibold",
      description: "text-sm",
      spacing: "space-y-2",
    },
    medium: {
      container: "py-12",
      iconSize: "w-24 h-24",
      title: "text-xl font-semibold",
      description: "text-base",
      spacing: "space-y-3",
    },
    large: {
      container: "py-16",
      iconSize: "w-32 h-32",
      title: "text-2xl font-bold",
      description: "text-lg",
      spacing: "space-y-4",
    },
  };

  const config = variantConfig[variant];
  const sizeSettings = sizeConfig[size];

  const displayTitle = title || config.title;
  const displayDescription = description || config.description;
  const displayIcon = icon || config.icon;

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${sizeSettings.container} ${className}`}
    >
      <div className={`${sizeSettings.spacing}`}>
        {/* Icon with animation */}
        <div className={`mx-auto ${sizeSettings.iconSize} text-gray-300 relative`}>
          <div className={`${animated ? "animate-pulse" : ""}`}>{displayIcon}</div>

          {/* Floating dots animation */}
          {animated && (
            <>
              <div
                className="absolute -top-2 -right-2 w-2 h-2 bg-blue-200 rounded-full animate-bounce"
                style={{ animationDelay: "0s", animationDuration: "2s" }}
              ></div>
              <div
                className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-purple-200 rounded-full animate-bounce"
                style={{ animationDelay: "0.5s", animationDuration: "2s" }}
              ></div>
              <div
                className="absolute -right-3 top-1/2 w-1 h-1 bg-green-200 rounded-full animate-bounce"
                style={{ animationDelay: "1s", animationDuration: "2s" }}
              ></div>
            </>
          )}
        </div>

        {/* Title */}
        <h3
          className={`${sizeSettings.title} text-gray-700 ${animated ? "animate-fade-in-up" : ""}`}
        >
          {displayTitle}
        </h3>

        {/* Description */}
        <p
          className={`${sizeSettings.description} text-gray-500 max-w-sm mx-auto ${animated ? "animate-fade-in-up" : ""}`}
          style={{ animationDelay: animated ? "0.2s" : "0s" }}
        >
          {displayDescription}
        </p>

        {/* Action button */}
        {action && (
          <div
            className={`pt-2 ${animated ? "animate-fade-in-up" : ""}`}
            style={{ animationDelay: animated ? "0.4s" : "0s" }}
          >
            {action}
          </div>
        )}
      </div>

      {/* Background decoration */}
      {animated && (
        <div className="overflow-hidden absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full opacity-30 animate-float"></div>
          <div className="absolute right-1/4 bottom-1/3 w-24 h-24 bg-gradient-to-r from-green-50 to-blue-50 rounded-full opacity-20 animate-float-delayed"></div>
        </div>
      )}
    </div>
  );
};

export default Empty;
