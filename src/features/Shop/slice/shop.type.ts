import { ReduxStateType } from "@/app/store/types";
import { Shop } from "@/core/api/shops/type";
import type { ShopInfo, ShopProduct, ShopOrder } from "@/core/api/shop-management/type";
// Các trạng thái của người bán, bao gồm cả quá trình đăng ký và hoạt động.
export enum ShopStatus {
  // Giai đoạn ĐĂNG KÝ
  PENDING_REGISTRATION = "pending_registration", // Đã đăng ký cơ bản, chờ điền thông tin chi tiết.
  INFORMATION_INPUT = "information_input", // Đang điền/chỉnh sửa thông tin đăng ký.
  PENDING_REVIEW = "pending_review", // Hồ sơ đã gửi, chờ Admin xét duyệt. (TRẠNG THÁI MỚI)
  APPROVED = "approved", // Đơn đăng ký đã được phê duyệt.
  REJECTED = "rejected", // Đơn đăng ký bị từ chối.

  // Giai đoạn HOẠT ĐỘNG
  SETUP_IN_PROGRESS = "setup_in_progress", // Đã được duyệt, đang cấu hình chính sách vận chuyển/thanh toán. (TRẠNG THÁI MỚI)
  ACTIVE = "active", // Đã hoàn tất cấu hình, có sản phẩm và đang bán hàng bình thường. (TRẠNG THÁI MỚI)

  // Giai đoạn QUẢN LÝ RỦI RO
  SUSPENDED = "suspended", // Bị tạm khóa/đình chỉ hoạt động do vi phạm (admin áp dụng). (TRẠNG THÁI MỚI)
  BLOCKED = "blocked", // Bị khóa vĩnh viễn hoặc khóa nghiêm trọng. (TRẠNG THÁI MỚI)
  AWAITING_REMEDY = "awaiting_remedy", // Bị khóa/đình chỉ và đang chờ người bán liên hệ/khắc phục vi phạm. (TRẠNG THÁI MỚI)
}

// Giả định: Shop là kiểu dữ liệu cho thông tin chi tiết của một cửa hàng đã được phê duyệt và hoạt động.

export interface IShopState {
  /**
   * @property currentStatus
   * @type {ShopStatus}
   * @description Trạng thái hiện tại của người bán, quyết định luồng giao diện (UI) và quyền hạn trên hệ thống.
   * Đây là phiên bản mở rộng của 'registrationStep'.
   */
  currentStatus: ShopStatus;

  /**
   * @property registrationData
   * @type {object}
   * @description Dữ liệu tạm thời mà người bán đã điền trong quá trình đăng ký/cập nhật trước khi gửi phê duyệt.
   */
  registrationData: {
    /** @description Tên dự kiến của cửa hàng/gian hàng. */
    name: string;
    /** @description Mô tả ngắn gọn về cửa hàng. */
    description: string;
    /** @description URL/đường dẫn của logo cửa hàng. */
    logo: string;
    /** @description URL/đường dẫn của banner/ảnh bìa cửa hàng. */
    banner: string;

    // --- BỔ SUNG QUAN TRỌNG ---
    /** @description Thông tin pháp lý (Tên công ty/Cá nhân đại diện, Mã số thuế...). */
    legalInfo: string;
    /** @description Tài khoản ngân hàng để nhận thanh toán (payouts). */
    bankAccount: string;
    /** @description Các tài liệu pháp lý đã tải lên (URL của Giấy phép kinh doanh, CCCD...). */
    documents: string[];
  };

  /**
   * @property review
   * @type {object}
   * @description Thông tin liên quan đến quá trình xét duyệt và quản lý rủi ro (vi phạm).
   * (TRƯỜNG MỚI)
   */
  review: {
    /** @description Lý do Admin từ chối đơn đăng ký (nếu trạng thái là REJECTED). */
    rejectionReason: string | null;
    /** @description Lý do cửa hàng bị khóa/đình chỉ (nếu trạng thái là SUSPENDED/BLOCKED). */
    suspensionReason: string | null;
    /** @description Ngày hiệu lực khóa/đình chỉ (nếu có). */
    suspensionEndDate: Date | null;
  };

  /**
   * @property shop
   * @type {object}
   * @description Dữ liệu chính thức của cửa hàng sau khi đã được phê duyệt và hoạt động.
   */
  shop: {
    /** @description Đối tượng chứa toàn bộ thông tin chi tiết của cửa hàng đã hoạt động. */
    data: Shop;
    /** @description Trạng thái của việc gọi API để lấy/cập nhật dữ liệu cửa hàng. */
    status: ReduxStateType;
    /** @description Lưu trữ thông báo lỗi nếu việc gọi API thất bại. */
    error: string | null;
    /** @description Lưu trữ thông báo thành công hoặc thông báo khác sau khi thực hiện hành động. */
    message: string | null;
  };

  /**
   * @property shopInfo
   * @type {object}
   * @description Thông tin shop từ shopManagementApi
   */
  shopInfo: {
    data: ShopInfo | null;
    status: ReduxStateType;
    error: string | null;
    message: string | null;
  };

  /**
   * @property createShop
   * @type {object}
   * @description Trạng thái tạo shop
   */
  createShop: {
    status: ReduxStateType;
    error: string | null;
    message: string | null;
  };

  /**
   * @property updateShop
   * @type {object}
   * @description Trạng thái cập nhật shop
   */
  updateShop: {
    status: ReduxStateType;
    error: string | null;
    message: string | null;
  };

  /**
   * @property products
   * @type {object}
   * @description Danh sách sản phẩm của shop
   */
  products: {
    data: ShopProduct[];
    status: ReduxStateType;
    error: string | null;
    message: string | null;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };

  /**
   * @property orders
   * @type {object}
   * @description Danh sách đơn hàng của shop
   */
  orders: {
    data: ShopOrder[];
    status: ReduxStateType;
    error: string | null;
    message: string | null;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };

  /**
   * @property updateOrderStatus
   * @type {object}
   * @description Trạng thái cập nhật order status
   */
  updateOrderStatus: {
    status: ReduxStateType;
    error: string | null;
    message: string | null;
  };

  /**
   * @property shopStatusByUser
   * @type {object}
   * @description Trạng thái shop theo userId từ API getShopStatusByUserId
   */
  shopStatusByUser: {
    data: {
      shopStatus:
        | "not_registered"
        | "pending_review"
        | "approved"
        | "rejected"
        | "active"
        | "blocked"
        | "suspended";
      shop: {
        id: string;
        name: string;
        slug?: string;
        status: string;
      } | null;
    } | null;
    status: ReduxStateType;
    error: string | null;
    message: string | null;
  };
}

// Helper: xác định đã điền đủ thông tin đăng ký tối thiểu hay chưa
export const hasMinimumRegistrationData = (data: IShopState["registrationData"]): boolean => {
  return Boolean(
    data?.name &&
      data?.description &&
      data?.logo &&
      data?.banner &&
      data?.legalInfo &&
      data?.bankAccount
  );
};

// Helper: ánh xạ trạng thái backend shop -> UI ShopStatus mở rộng
export const mapBackendShopStatusToUi = (
  backend?: { status?: "pending" | "active" | "blocked" } | null
): ShopStatus | null => {
  if (!backend?.status) return null;
  switch (backend.status) {
    case "pending":
      return ShopStatus.PENDING_REVIEW;
    case "active":
      return ShopStatus.ACTIVE;
    case "blocked":
      return ShopStatus.BLOCKED;
    default:
      return null;
  }
};
