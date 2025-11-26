import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { selectUser } from "@/features/Auth/components/slice/auth.selector";
import {
  selectShopStatusByUser,
  selectShopStatusByUserStatus,
} from "@/features/Shop/slice/shop.selector";
import { fetchShopStatusByUserStart } from "@/features/Shop/slice/shop.slice";
import { ReduxStateType } from "@/app/store/types";
import Page from "@/foundation/components/layout/Page";
import Sidebar from "@/features/Shop/components/layouts/Sidebar";
import ScrollView from "@/foundation/components/scroll/ScrollView";
import Loading from "@/foundation/components/loading/Loading";
import Empty from "@/foundation/components/empty/Empty";

interface ShopManagerLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * ShopManagerLayout
 *
 * Layout component chung cho các trang quản lý Shop.
 * Bao gồm Sidebar navigation và content area.
 * Tự động check authentication và quyền shop.
 *
 * Props:
 * - children: React.ReactNode — Nội dung chính của trang
 * - className?: string — CSS classes bổ sung cho container
 *
 * Usage:
 * ```tsx
 * <ShopManagerLayout>
 *   <YourContentComponent />
 * </ShopManagerLayout>
 * ```
 */
const ShopManagerLayout: React.FC<ShopManagerLayoutProps> = ({ children, className = "" }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectUser) as any;
  const shopStatusByUser = useAppSelector(selectShopStatusByUser);
  const shopStatusByUserStatus = useAppSelector(selectShopStatusByUserStatus);

  // Fetch shop status nếu chưa có
  useEffect(() => {
    if (user?._id && shopStatusByUserStatus === ReduxStateType.INIT) {
      dispatch(fetchShopStatusByUserStart({ userId: user._id }));
    }
  }, [user?._id, shopStatusByUserStatus, dispatch]);

  // Check quyền shop và redirect nếu cần
  useEffect(() => {
    // Đợi shop status load xong trước khi check
    if (shopStatusByUserStatus === ReduxStateType.LOADING) {
      return;
    }

    // Router đã xử lý authentication, chỉ cần check quyền shop
    if (!user?._id) {
      // Nếu không có user (router đã redirect rồi), không làm gì
      return;
    }

    // Nếu không có shop hoặc shop chưa được đăng ký, redirect về trang shop entry
    if (!shopStatusByUser || shopStatusByUser.shopStatus === "not_registered") {
      navigate("/shop", { replace: true });
      return;
    }

    // Nếu shop bị blocked hoặc suspended, redirect về trang suspended
    if (shopStatusByUser.shopStatus === "blocked" || shopStatusByUser.shopStatus === "suspended") {
      navigate("/shop/suspended", { replace: true });
      return;
    }
  }, [user, shopStatusByUser, shopStatusByUserStatus, navigate]);

  // Hiển thị loading khi đang check quyền hoặc đang fetch shop status
  if (!user?._id || shopStatusByUserStatus === ReduxStateType.LOADING) {
    return (
      <Page>
        <Loading layout="centered" message="Đang tải thông tin cửa hàng..." />
      </Page>
    );
  }

  // Nếu không có shop hoặc shop chưa được đăng ký, hiển thị thông báo (redirect đã được xử lý trong useEffect)
  if (!shopStatusByUser || shopStatusByUser.shopStatus === "not_registered") {
    return (
      <Page>
        <div className={`px-4 mx-auto ${className}`}>
          <Empty
            variant="default"
            title="Chưa có cửa hàng"
            description="Bạn cần đăng ký cửa hàng trước khi quản lý cửa hàng"
          />
        </div>
      </Page>
    );
  }

  // Nếu shop bị blocked hoặc suspended, hiển thị thông báo (redirect đã được xử lý trong useEffect)
  if (shopStatusByUser.shopStatus === "blocked" || shopStatusByUser.shopStatus === "suspended") {
    return (
      <Page>
        <div className={`px-4 mx-auto ${className}`}>
          <Empty
            variant="default"
            title="Cửa hàng bị hạn chế"
            description="Cửa hàng của bạn đang bị hạn chế. Vui lòng liên hệ hỗ trợ."
          />
        </div>
      </Page>
    );
  }

  // Render layout bình thường khi có quyền hợp lệ
  return (
    <Page>
      <div className={`px-4 mx-auto ${className}`}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
          {/* Sidebar */}
          <div className="lg:col-span-2">
            <Sidebar />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 min-h-[calc(100vh-70px)] max-h-[calc(100vh-70px)]">
            <ScrollView className="overflow-y-auto flex-1">
              <div className="mt-6">{children}</div>
            </ScrollView>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default ShopManagerLayout;
