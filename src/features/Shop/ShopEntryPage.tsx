import { useEffect } from "react";
import Section from "@/foundation/components/sections/Section";
import { Card } from "@/foundation/components/info/Card";
import Button from "@/foundation/components/buttons/Button";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { selectUser } from "@/features/Auth/components/slice/auth.selector";
import {
  selectShopUiScreens,
  selectShopFetchStatus,
  selectShopData,
  selectShopStatusByUser,
  selectShopStatusByUserStatus,
} from "./slice/shop.selector";
import { fetchOwnShopStart, fetchShopStatusByUserStart, resetShopState } from "./slice/shop.slice";
import { ReduxStateType } from "@/app/store/types";
import { useNavigate } from "react-router-dom";

const ShopEntryPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectUser) as any;
  const ui = useAppSelector(selectShopUiScreens);
  const shopFetchStatus = useAppSelector(selectShopFetchStatus);
  const shop = useAppSelector(selectShopData);
  const shopStatusByUser = useAppSelector(selectShopStatusByUser);
  const shopStatusByUserStatus = useAppSelector(selectShopStatusByUserStatus);

  useEffect(() => {
    if (user?._id) {
      // Reset shop state trước khi fetch để tránh hiển thị data cũ của user trước
      dispatch(resetShopState());
      // Fetch shop status (chính xác hơn)
      dispatch(fetchShopStatusByUserStart({ userId: user._id }));
      // Also fetch shop list as fallback
      dispatch(fetchOwnShopStart({ userId: user._id, page: 1, limit: 1 }));
    } else {
      // Nếu không có user, reset shop state
      dispatch(resetShopState());
    }
  }, [dispatch, user?._id]);

  // Smart redirect based on status
  useEffect(() => {
    // Wait for both to finish loading
    if (
      shopFetchStatus === ReduxStateType.LOADING ||
      shopStatusByUserStatus === ReduxStateType.LOADING
    )
      return;

    // Check shopStatusByUser first (most accurate)
    if (shopStatusByUser) {
      const { shopStatus } = shopStatusByUser;
      if (shopStatus === "active") {
        navigate("/shop/dashboard", { replace: true });
        return;
      }
      if (shopStatus === "pending_review" || shopStatus === "approved") {
        navigate("/shop/review", { replace: true });
        return;
      }
      if (shopStatus === "blocked" || shopStatus === "suspended") {
        navigate("/shop/suspended", { replace: true });
        return;
      }
      if (shopStatus === "rejected") {
        // Allow user to edit and resubmit
        return;
      }
      // If not_registered, allow registration
    }

    // Fallback: Check UI screens (computed from currentStatus)
    if (ui.showActiveDashboard) {
      navigate("/shop/dashboard", { replace: true });
      return;
    }
    if (ui.showSuspended) {
      navigate("/shop/suspended", { replace: true });
      return;
    }
    if (ui.showPendingReview) {
      navigate("/shop/review", { replace: true });
      return;
    }

    if (ui.showRegistrationLanding) {
      navigate("/shop/register", { replace: true });
      return;
    }
  }, [ui, shopFetchStatus, shopStatusByUser, shopStatusByUserStatus, navigate]);

  return (
    <Section title="Quản lý cửa hàng">
      <Card className="space-y-4">
        {shopFetchStatus === ReduxStateType.LOADING && <div>Đang tải thông tin cửa hàng...</div>}
        {ui.showRegistrationLanding && (
          <div className="space-y-3">
            <div className="text-lg font-semibold">Đăng ký mở cửa hàng</div>
            <div className="text-sm text-neutral-6">
              Vui lòng hoàn thành thông tin để gửi phê duyệt.
            </div>
            <div className="flex gap-2">
              <Button>Tạo hồ sơ cửa hàng</Button>
            </div>
          </div>
        )}
        {ui.showPendingReview && (
          <div className="space-y-3">
            <div className="text-lg font-semibold">Hồ sơ đang chờ phê duyệt</div>
            <div className="text-sm text-neutral-6">Chúng tôi sẽ thông báo khi hoàn tất.</div>
          </div>
        )}
        {ui.showRejected && (
          <div className="space-y-3">
            <div className="text-lg font-semibold">Hồ sơ bị từ chối</div>
            <div className="text-sm text-neutral-6">
              Vui lòng cập nhật lại thông tin và gửi phê duyệt lần nữa.
            </div>
            <Button variant="outline">Cập nhật hồ sơ</Button>
          </div>
        )}
        {ui.showSetup && (
          <div className="space-y-3">
            <div className="text-lg font-semibold">Thiết lập cửa hàng</div>
            <div className="text-sm text-neutral-6">
              Thiết lập vận chuyển, thanh toán để bắt đầu bán hàng.
            </div>
            <Button>Tiến hành thiết lập</Button>
          </div>
        )}
        {ui.showActiveDashboard && (
          <div className="space-y-3">
            <div className="text-lg font-semibold">Bảng điều khiển cửa hàng</div>
            <div className="text-sm text-neutral-6">
              {shop?.name ? `Xin chào, ${shop.name}` : "Cửa hàng đang hoạt động."}
            </div>
            <div className="flex gap-2">
              <Button>Quản lý đơn hàng</Button>
              <Button variant="outline">Sản phẩm</Button>
            </div>
          </div>
        )}
        {ui.showSuspended && (
          <div className="space-y-3">
            <div className="text-lg font-semibold">Cửa hàng bị hạn chế</div>
            <div className="text-sm text-neutral-6">
              Vui lòng liên hệ hỗ trợ hoặc xem lại thông báo vi phạm.
            </div>
          </div>
        )}
      </Card>
    </Section>
  );
};

export default ShopEntryPage;
