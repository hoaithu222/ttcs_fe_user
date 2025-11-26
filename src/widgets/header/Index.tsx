import {
  Bell,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Moon,
  Sun,
  ShoppingCart,
  ShoppingBagIcon,
} from "lucide-react";
import Button from "@/foundation/components/buttons/Button";
import { useAuth } from "@/features/Auth/hooks/useAuth";
import { useState, useRef, useEffect } from "react";
import Image from "@/foundation/components/icons/Image";
import IconButton from "@/foundation/components/buttons/IconButton";
import { RootState } from "@/app/store";
import { themeRootSelector } from "@/app/store/slices/theme/selectors";
import { toggleTheme } from "@/app/store/slices/theme";
import { useNavigate } from "react-router-dom";
import Search from "./components/Search";
import { NAVIGATION_CONFIG } from "@/app/router/naviagtion.config";
import { useAppSelector, useAppDispatch } from "@/app/store";
import {
  selectShopStatusByUserStatus,
  selectShopStatusByUser,
} from "@/features/Shop/slice/shop.selector";
import { fetchShopStatusByUserStart } from "@/features/Shop/slice/shop.slice";
import { ReduxStateType } from "@/app/store/types";
import {
  selectNotifications,
  selectUnreadCount,
} from "@/app/store/slices/notification/notification.selector";
import {
  getNotificationsStart,
  markAsReadStart,
  markAllAsReadStart,
} from "@/app/store/slices/notification/notification.slice";
import { Notification } from "@/core/api/notifications/type";
import { MessageSquare } from "lucide-react";
import { getConversationsStart, createConversationStart } from "@/app/store/slices/chat/chat.slice";
import { selectTotalUnreadCount, selectConversations } from "@/app/store/slices/chat/chat.selector";

const Header = () => {
  const { user, onLogout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const navigation = useNavigate();
  const { theme } = useAppSelector((state: RootState) => themeRootSelector(state));
  const shopStatusByUserStatus = useAppSelector(selectShopStatusByUserStatus);
  const shopStatusByUser = useAppSelector(selectShopStatusByUser);
  
  // Get notifications from Redux slice
  const notifications = useAppSelector(selectNotifications);
  const unreadCount = useAppSelector(selectUnreadCount);
  
  // Get chat unread count and conversations
  const chatUnreadCount = useAppSelector(selectTotalUnreadCount);
  const conversations = useAppSelector(selectConversations);

  const displayedNotifications = notifications.slice(0, 8);

  // Load notifications when component mounts
  useEffect(() => {
    if (user?._id) {
      dispatch(getNotificationsStart({ query: { page: 1, limit: 10 } }));
    }
  }, [dispatch, user?._id]);


  const formatRelativeTime = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffSeconds < 60) return "Vừa xong";
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} phút trước`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} giờ trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const getShopMenuLabel = () => {
    // Kiểm tra trạng thái loading
    if (shopStatusByUserStatus === ReduxStateType.LOADING) {
      return "Đang tải cửa hàng...";
    }

    // Kiểm tra shopStatus từ shopStatusByUser
    const shopStatus = shopStatusByUser?.shopStatus;

    if (shopStatus === "active") {
      return "Vào cửa hàng của tôi";
    }
    
    if (shopStatus === "pending_review" || shopStatus === "approved") {
      return "Hồ sơ đang chờ duyệt";
    }
    
    if (shopStatus === "blocked" || shopStatus === "suspended") {
      return "Cửa hàng bị hạn chế";
    }
    
    if (shopStatus === "rejected") {
      return "Tiếp tục thiết lập cửa hàng";
    }

    // Mặc định: chưa đăng ký hoặc không có shop
    return "Đăng kí bán hàng";
  };

  // Fetch shop status when user is logged in (chỉ fetch nếu chưa có data hoặc status là INIT)
  useEffect(() => {
    if (user?._id) {
      // Chỉ fetch nếu:
      // 1. Status là INIT (chưa fetch lần nào)
      // 2. Hoặc chưa có data VÀ không phải đang loading/error (tránh vòng lặp khi có lỗi)
      const shouldFetch =
        shopStatusByUserStatus === ReduxStateType.INIT ||
        (!shopStatusByUser &&
          shopStatusByUserStatus !== ReduxStateType.LOADING &&
          shopStatusByUserStatus !== ReduxStateType.ERROR);

      if (shouldFetch) {
        dispatch(fetchShopStatusByUserStart({ userId: user._id }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, dispatch, shopStatusByUserStatus]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isNotificationOpen && unreadCount > 0) {
      dispatch(markAllAsReadStart());
    }
  }, [isNotificationOpen, dispatch, unreadCount]);

  // Load more notifications when notification panel opens
  useEffect(() => {
    if (isNotificationOpen && user?._id) {
      dispatch(getNotificationsStart({ query: { page: 1, limit: 20 } }));
    }
  }, [isNotificationOpen, dispatch, user?._id]);


  // Lấy danh sách conversations và tự động tạo CSKH nếu chưa có
  useEffect(() => {
    if (user?._id) {
      dispatch(getConversationsStart({ query: { page: 1, limit: 50 } }));
    }
  }, [dispatch, user?._id]);

  // Refresh conversations periodically to update unread count
  useEffect(() => {
    if (!user?._id) return;
    
    const interval = setInterval(() => {
      dispatch(getConversationsStart({ query: { page: 1, limit: 50 } }));
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [dispatch, user?._id]);

  // Auto-create CSKH conversation for new users if they don't have one
  const [hasCheckedCSKH, setHasCheckedCSKH] = useState(false);
  
  useEffect(() => {
    if (!user?._id) {
      setHasCheckedCSKH(false);
      return;
    }
    
    // Check if conversations have been loaded (not empty array or has been fetched)
    const conversationsLoaded = conversations.length > 0 || shopStatusByUserStatus !== ReduxStateType.LOADING;
    
    if (!conversationsLoaded || hasCheckedCSKH) return;
    
    // Check if CSKH conversation exists
    const hasCSKHConversation = conversations.some(
      (conv: any) => conv.type === "admin" && (conv.metadata?.context === "CSKH" || conv.metadata?.isSupport === true)
    );
    
    // If no CSKH conversation exists, create one
    if (!hasCSKHConversation) {
      setHasCheckedCSKH(true);
      dispatch(
        createConversationStart({
          data: {
            type: "admin",
            metadata: { context: "CSKH", isSupport: true },
            initialMessage: "Xin chào! Tôi cần hỗ trợ.",
          },
        })
      );
    } else {
      setHasCheckedCSKH(true);
    }
  }, [dispatch, user?._id, conversations, shopStatusByUserStatus, hasCheckedCSKH]);

  const handleLogout = () => {
    onLogout();
    setIsDropdownOpen(false);
  };

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  return (
    <header className="overflow-visible border-b shadow-sm border-border-2 bg-header">
      <div className="container flex overflow-visible justify-between items-center mx-auto h-16">
        {/* Left side - Logo/Brand */}
        <div className="flex items-center space-x-4">
          <div
            className="flex overflow-hidden items-center space-x-2 w-12 h-12 rounded-lg cursor-pointer lg:w-14 lg:h-14"
            onClick={() => navigation(NAVIGATION_CONFIG.home.path)}
          >
            <Image name="logo" alt="logo" />
          </div>
        </div>

        {/* Center - Search */}
        <div className="flex flex-1 justify-center items-center mx-4 max-w-4xl md:mx-8">
          <Search />
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-4">
          {/* Dark/Light Mode Toggle */}
          <IconButton
            icon={theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            variant="ghost"
            onClick={handleToggleTheme}
            tooltip={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            ariaLabel={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          />

          {user ? (
            <>
              {/* Shopping Cart */}
              <IconButton
                icon={<ShoppingCart className="w-5 h-5" />}
                variant="ghost"
                notification={true}
                tooltip="Shopping Cart"
                onClick={() => navigation(NAVIGATION_CONFIG.cart.path)}
              />

              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <IconButton
                  icon={<Bell className="w-5 h-5" />}
                  variant="ghost"
                  notification={unreadCount > 0}
                  tooltip="Thông báo"
                  ariaLabel="Notifications"
                  onClick={() => setIsNotificationOpen((prev) => !prev)}
                />

                {isNotificationOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-96 rounded-lg border border-border-2 bg-background-1 shadow-lg">
                    <div className="flex justify-between items-center px-4 py-3 border-b border-divider-1">
                      <p className="text-lg text-primary-6 font-semibold">Thông báo</p>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => dispatch(markAllAsReadStart())}
                          className="text-xs text-primary-6 hover:text-primary-7 hover:underline transition-colors"
                        >
                          Đánh dấu đã đọc
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto hidden-scrollbar">
                      {displayedNotifications.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-neutral-5">
                          Chưa có thông báo nào
                        </p>
                      ) : (
                        displayedNotifications.map((notification: Notification) => (
                          <button
                            key={notification._id}
                            className={`flex flex-col px-4 py-3 w-full text-left hover:bg-background-2 transition-colors ${
                              !notification.isRead ? "bg-primary-1" : ""
                            }`}
                            onClick={() => {
                              // Mark as read when clicked
                              if (!notification.isRead) {
                                dispatch(markAsReadStart({ id: notification._id }));
                              }
                              if (notification.actionUrl) {
                                navigation(notification.actionUrl);
                              }
                              setIsNotificationOpen(false);
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-neutral-9">
                                  {notification.title || "Thông báo"}
                                </p>
                                {notification.message && (
                                  <p className="mt-1 text-xs text-neutral-6 line-clamp-2">
                                    {notification.message}
                                  </p>
                                )}
                                <span className="mt-1 text-[11px] text-neutral-5">
                                  {formatRelativeTime(notification.createdAt)}
                                </span>
                              </div>
                              {!notification.isRead && (
                                <div className="ml-2 w-2 h-2 bg-primary-6 rounded-full" />
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              {/* Hien thi icon chat */}
              <div className="relative">
                <IconButton
                  icon={<MessageSquare className="w-5 h-5" />}
                  variant="ghost"
                  tooltip={`Chat${chatUnreadCount > 0 ? ` (${chatUnreadCount} tin nhắn chưa đọc)` : ""}`}
                  onClick={() => navigation(NAVIGATION_CONFIG.chat.path)}
                />
                {chatUnreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-neutral-0 bg-error rounded-full z-10">
                    {chatUnreadCount > 99 ? "99+" : chatUnreadCount > 9 ? "9+" : chatUnreadCount}
                  </span>
                )}
              </div>

              {/* User Profile Dropdown */}
              <div className="relative z-50" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center px-3 py-2 space-x-3 rounded-lg transition-colors hover:bg-background-2"
                >
                  <div className="text-right">
                    <p className="text-sm font-medium text-neutral-9">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-neutral-5">{user?.role || ""}</p>
                  </div>
                  <div className="flex justify-center items-center w-8 h-8 lg:w-12 lg:h-12 bg-background-2 rounded-full">
                   <img src={user?.avatar || "https://ui-avatars.com/api/?name=" + user?.name} alt="avatar" className="w-8 h-8 lg:w-12 lg:h-12 rounded-full object-cover" />
                  </div>
                  <ChevronDown className="w-4 h-4 text-neutral-5" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 z-[100] py-1 w-48 bg-background-1 rounded-lg border border-border-2 shadow-lg">
                    {/* Quản lý tài khoản */}
                    <button
                      onClick={() => {
                        navigation(`${NAVIGATION_CONFIG.profile.path}?tab=account`);
                        setIsDropdownOpen(false);
                      }}
                      className="flex items-center px-4 py-2 space-x-3 w-full text-sm text-neutral-9 hover:bg-background-2 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>My Account</span>
                    </button>
                    <hr className="my-1 border-divider-1" />
                    <button
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center px-4 py-2 space-x-3 w-full text-sm text-neutral-9 hover:bg-background-2 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    {/* Đăng kí bán hàng */}

                    <hr className="my-1 border-divider-1" />
                    <button
                      onClick={() => {
                        navigation("/shop");
                        setIsDropdownOpen(false);
                      }}
                      className="flex items-center px-4 py-2 space-x-3 w-full text-sm text-neutral-9 hover:bg-background-2 transition-colors"
                    >
                      <ShoppingBagIcon className="w-4 h-4" />
                      <span>{getShopMenuLabel()}</span>
                    </button>
                    <hr className="my-1 border-divider-1" />

                    <button
                      onClick={handleLogout}
                      className="flex items-center px-4 py-2 space-x-3 w-full text-sm text-error hover:bg-error/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Login Button */}
              <Button
                variant="solid"
                size="sm"
                onClick={() => navigation(NAVIGATION_CONFIG.login.path)}
                className="px-4"
              >
                Đăng nhập
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
