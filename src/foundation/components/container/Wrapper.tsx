import { FC, ReactNode, useState } from "react";

// Styled header component (you can keep your existing styles)
const Header = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`bg-gray-800 text-white p-4 flex items-center justify-between ${className}`}>
    {children}
  </div>
);

type WrapperProps = {
  header: string | (() => ReactNode);
  children: ReactNode;

  // Các chức năng mới
  headerActions?: ReactNode; // Actions bên phải header
  footer?: ReactNode; // Footer cho wrapper
  collapsible?: boolean; // Cho phép thu gọn/mở rộng
  defaultCollapsed?: boolean; // Trạng thái mặc định
  loading?: boolean; // Trạng thái loading
  error?: string; // Hiển thị lỗi
  padding?: boolean; // Thêm padding cho content
  maxHeight?: string; // Giới hạn chiều cao
  scrollable?: boolean; // Cho phép scroll
  className?: string; // Custom className
  headerClassName?: string; // Custom header className
  contentClassName?: string; // Custom content className
  onCollapse?: (collapsed: boolean) => void; // Callback khi collapse
};

const Wrapper: FC<WrapperProps> = ({
  header,
  children,
  headerActions,
  footer,
  collapsible = false,
  defaultCollapsed = false,
  loading = false,
  error,
  padding = true,
  maxHeight,
  scrollable = true,
  className = "",
  headerClassName = "",
  contentClassName = "",
  onCollapse,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const handleToggleCollapse = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    onCollapse?.(newState);
  };

  const renderHeader = () => {
    const headerContent =
      typeof header === "string" ? <p className="text-lg font-semibold">{header}</p> : header();

    return (
      <Header className={headerClassName}>
        <div className="flex items-center gap-2">
          {collapsible && (
            <button
              onClick={handleToggleCollapse}
              className="p-1 transition-colors rounded hover:bg-gray-700"
              aria-label={collapsed ? "Expand" : "Collapse"}
            >
              <svg
                className={`w-5 h-5 transition-transform ${collapsed ? "-rotate-90" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          )}
          {headerContent}
        </div>
        {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
      </Header>
    );
  };

  const contentStyle = {
    maxHeight: maxHeight || "auto",
    overflow: scrollable ? "auto" : "visible",
  };

  return (
    <div className={`flex flex-col h-full bg-white shadow-lg rounded-lg ${className}`}>
      {renderHeader()}

      {!collapsed && (
        <>
          <div
            className={`flex-1 bg-gray-50 ${padding ? "p-4" : ""} ${contentClassName}`}
            style={contentStyle}
          >
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-12 h-12 border-b-2 border-blue-500 rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="px-4 py-3 text-red-700 bg-red-100 border border-red-400 rounded">
                  <p className="font-bold">Lỗi</p>
                  <p>{error}</p>
                </div>
              </div>
            ) : (
              children
            )}
          </div>

          {footer && <div className="p-4 bg-gray-100 border-t border-gray-200">{footer}</div>}
        </>
      )}
    </div>
  );
};

export default Wrapper;
