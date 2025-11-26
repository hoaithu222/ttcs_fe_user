import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as Form from "@radix-ui/react-form";
import Section from "@/foundation/components/sections/Section";
import SectionTitle from "@/foundation/components/sections/SectionTitle";
import Input from "@/foundation/components/input/Input";
import TextArea from "@/foundation/components/input/TextArea";
import Button from "@/foundation/components/buttons/Button";
import ImageUpload from "@/foundation/components/input/upload/ImageUpload";
import Loading from "@/foundation/components/loading/Loading";
import Empty from "@/foundation/components/empty/Empty";
import { getShopInfoStart, updateShopStart } from "@/features/Shop/slice/shop.slice";
import { imagesApi } from "@/core/api/images";
import { addToast } from "@/app/store/slices/toast";
import {
  selectShopInfo,
  selectShopInfoStatus,
  selectShopInfoError,
  selectUpdateShopStatus,
  selectUpdateShopError,
  selectShopStatusByUser,
} from "@/features/Shop/slice/shop.selector";
import { ReduxStateType } from "@/app/store/types";
import { ShopInfo } from "@/core/api/shop-management/type";
import { Store, Save, Lock } from "lucide-react";
import { formatAddressFromCodes, AddressCodes } from "@/shared/common/data-address/address.utils";

const InfoShop: React.FC = () => {
  const dispatch = useDispatch();
  const shopInfo = useSelector(selectShopInfo) as ShopInfo | null;
  const shopInfoStatus = useSelector(selectShopInfoStatus);
  const shopInfoError = useSelector(selectShopInfoError);
  const updateStatus = useSelector(selectUpdateShopStatus);
  const updateError = useSelector(selectUpdateShopError);
  const shopStatusByUser = useSelector(selectShopStatusByUser);

  // Chỉ cho phép edit khi shop status là ACTIVE hoặc APPROVED
  // Sử dụng shopStatusByUser để có thông tin chính xác nhất
  const shopStatus = shopStatusByUser?.shopStatus;
  const canEdit = shopStatus === "active" || shopStatus === "approved";

  const [formData, setFormData] = useState<Partial<ShopInfo>>({
    name: "",
    description: "",
    logo: "",
    coverImage: "",
    address: "",
    phone: "",
    email: "",
    website: "",
  });

  // State để lưu address codes nếu address là object
  const [addressCodes, setAddressCodes] = useState<AddressCodes | null>(null);
  const [formattedAddress, setFormattedAddress] = useState<string>("");

  const [logoFile, setLogoFile] = useState<{ url: string; publicId?: string } | null>(null);
  const [coverFile, setCoverFile] = useState<{ url: string; publicId?: string } | null>(null);

  // Fetch shop info khi component mount (chỉ fetch một lần nếu chưa có data)
  useEffect(() => {
    // Chỉ fetch shop info nếu chưa có data hoặc status là INIT
    // Tránh fetch lại không cần thiết
    if (shopInfoStatus === ReduxStateType.INIT || !shopInfo) {
      dispatch(getShopInfoStart());
    }
  }, [dispatch, shopInfoStatus, shopInfo]);

  useEffect(() => {
    if (shopInfo) {
      // Map API response fields to form fields
      const banner = shopInfo.banner || shopInfo.coverImage || "";
      const phone = shopInfo.contactPhone || shopInfo.phone || "";
      const email = shopInfo.contactEmail || shopInfo.email || "";
      
      // Xử lý address: có thể là string hoặc object với codes
      let addressString = "";
      let codes: AddressCodes | null = null;
      
      const addressData = shopInfo.address || (shopInfo as any).address;
      if (addressData) {
        if (typeof addressData === "string") {
          // Nếu là string, dùng trực tiếp
          addressString = addressData;
        } else if (typeof addressData === "object" && addressData.provinceCode) {
          // Nếu là object với codes, map ra tên địa chỉ
          codes = {
            provinceCode: addressData.provinceCode,
            districtCode: addressData.districtCode,
            wardCode: addressData.wardCode,
          };
          addressString = formatAddressFromCodes(codes, "");
        }
      }
      
      // Lưu codes để hiển thị
      setAddressCodes(codes);

      setFormData({
        name: shopInfo.name || "",
        description: shopInfo.description || "",
        logo: shopInfo.logo || "",
        coverImage: banner, // Use banner from API, store as coverImage in form
        address: addressString,
        phone: phone,
        email: email,
        website: shopInfo.website || "",
      });

      // Cập nhật formatted address để hiển thị
      if (codes) {
        setFormattedAddress(formatAddressFromCodes(codes, "Chưa cập nhật địa chỉ"));
      } else {
        setFormattedAddress(addressString || "Chưa cập nhật địa chỉ");
      }

      if (shopInfo.logo) {
        setLogoFile({ url: shopInfo.logo });
      }
      if (banner) {
        setCoverFile({ url: banner });
      }
    }
  }, [shopInfo]);

  // Refresh form data after successful update
  useEffect(() => {
    if (updateStatus === ReduxStateType.SUCCESS && shopInfo) {
      // Form data will be refreshed automatically via shopInfo dependency above
      // But we can also explicitly reset logoFile and coverFile if needed
      const banner = shopInfo.banner || shopInfo.coverImage || "";
      if (shopInfo.logo) {
        setLogoFile({ url: shopInfo.logo });
      }
      if (banner) {
        setCoverFile({ url: banner });
      }
    }
  }, [updateStatus, shopInfo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = async (file: File): Promise<{ url: string; publicId?: string }> => {
    try {
      const result = await imagesApi.uploadImage(file);
      return { url: result.url, publicId: result.publicId };
    } catch (error) {
      console.error("Error uploading logo:", error);
      dispatch(
        addToast({
          type: "error",
          message: "Lỗi khi upload logo. Vui lòng thử lại.",
        })
      );
      throw error;
    }
  };

  const handleCoverUpload = async (file: File): Promise<{ url: string; publicId?: string }> => {
    try {
      const result = await imagesApi.uploadImage(file);
      return { url: result.url, publicId: result.publicId };
    } catch (error) {
      console.error("Error uploading cover image:", error);
      dispatch(
        addToast({
          type: "error",
          message: "Lỗi khi upload ảnh bìa. Vui lòng thử lại.",
        })
      );
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canEdit) {
      dispatch(
        addToast({
          type: "warning",
          message: "Bạn không có quyền chỉnh sửa thông tin cửa hàng",
        })
      );
      return;
    }

    // Prepare update data - map form fields to backend field names
    const updateData: any = {
      name: formData.name,
      description: formData.description,
      contactPhone: formData.phone, // Backend uses contactPhone
      contactEmail: formData.email, // Backend uses contactEmail
      address: formData.address,
      website: formData.website,
    };

    // Use uploaded image URLs if available, otherwise keep existing ones
    // Images are uploaded immediately when user selects them via handleLogoUpload/handleCoverUpload
    // So logoFile and coverFile should already contain server URLs
    if (logoFile?.url && !logoFile.url.startsWith("blob:")) {
      updateData.logo = logoFile.url;
    } else if (formData.logo && !logoFile) {
      // Keep existing logo if no new one uploaded
      updateData.logo = formData.logo;
    }

    // Backend uses 'banner' field, not 'coverImage'
    if (coverFile?.url && !coverFile.url.startsWith("blob:")) {
      updateData.banner = coverFile.url;
    } else if (formData.coverImage && !coverFile) {
      // Keep existing banner if no new one uploaded
      updateData.banner = formData.coverImage;
    }

    console.log("Updating shop with data:", updateData);
    dispatch(updateShopStart(updateData));
  };

  const isLoading = shopInfoStatus === ReduxStateType.LOADING;
  const isUpdating = updateStatus === ReduxStateType.LOADING;
  const hasError = shopInfoError || updateError;

  if (isLoading) {
    return <Loading layout="centered" message="Đang tải thông tin cửa hàng..." />;
  }

  if (hasError && !shopInfo) {
    return (
      <Empty
        variant="default"
        title="Lỗi tải dữ liệu"
        description={shopInfoError || updateError || undefined}
      />
    );
  }

  return (
    <div className="">
      <div className="flex gap-4 items-center mb-6">
        <div className="flex justify-center items-center w-12 h-12 rounded-lg bg-primary-6">
          <Store className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-neutral-9">Thông tin cửa hàng</h1>
          <p className="text-sm text-neutral-6">
            {canEdit ? "Quản lý thông tin cơ bản của cửa hàng" : "Xem thông tin cửa hàng (chỉ xem)"}
          </p>
        </div>
        {!canEdit && shopStatus && (
          <div className="flex gap-2 items-center px-4 py-2 bg-warning/10 border border-warning rounded-lg">
            <Lock className="w-4 h-4 text-warning" />
            <span className="text-sm text-warning font-medium">
              {shopStatus === "pending_review"
                ? "Đang chờ duyệt"
                : shopStatus === "rejected"
                  ? "Đã bị từ chối"
                  : shopStatus === "not_registered"
                    ? "Chưa đăng ký cửa hàng"
                    : "Chưa được kích hoạt"}
            </span>
          </div>
        )}
      </div>

      <Form.Root onSubmit={handleSubmit} className="space-y-6">
        <Section>
          <SectionTitle>Thông tin cơ bản</SectionTitle>
          <div className="space-y-4">
            <Input
              name="name"
              label="Tên cửa hàng"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Nhập tên cửa hàng"
              disabled={!canEdit}
            />

            <TextArea
              name="description"
              label="Mô tả cửa hàng"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Nhập mô tả về cửa hàng của bạn"
              disabled={!canEdit}
            />
          </div>
        </Section>

        <Section>
          <SectionTitle>Hình ảnh</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUpload
              label="Logo cửa hàng"
              value={logoFile}
              onChange={setLogoFile}
              onUpload={handleLogoUpload}
              aspectRatio="square"
              width="w-full"
              height="h-48"
              disabled={!canEdit}
            />

            <ImageUpload
              label="Ảnh bìa cửa hàng"
              value={coverFile}
              onChange={setCoverFile}
              onUpload={handleCoverUpload}
              aspectRatio="wide"
              width="w-full"
              height="h-48"
              disabled={!canEdit}
            />
          </div>
        </Section>

        <Section>
          <SectionTitle>Thông tin liên hệ</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="phone"
              label="Số điện thoại"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
              disabled={!canEdit}
            />

            <Input
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Nhập email"
              disabled={!canEdit}
            />

            {/* Hiển thị địa chỉ đã được format từ codes */}
            {addressCodes && formattedAddress ? (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-7 mb-2">
                  Địa chỉ
                </label>
                <div className="px-4 py-3 bg-background-2 border border-border-1 rounded-lg">
                  <p className="text-sm text-neutral-9">{formattedAddress}</p>
                  {addressCodes && (
                    <p className="text-xs text-neutral-5 mt-1">
                      Mã: Tỉnh/TP {addressCodes.provinceCode}, Quận/Huyện {addressCodes.districtCode}, Phường/Xã {addressCodes.wardCode}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <Input
                name="address"
                label="Địa chỉ"
                value={formData.address}
                onChange={handleChange}
                placeholder="Nhập địa chỉ"
                className="md:col-span-2"
                disabled={!canEdit}
              />
            )}

            <Input
              name="website"
              label="Website"
              type="url"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
              className="md:col-span-2"
              disabled={!canEdit}
            />
          </div>
        </Section>

        {/* Additional Info - Read Only */}
        {/* {shopInfo && (
          <Section>
            <SectionTitle>Thông tin bổ sung</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-6 mb-1">Trạng thái</p>
                <p className="text-base font-semibold text-neutral-9">
                  {shopInfo.status === "active" || shopInfo.isActive
                    ? "Đang hoạt động"
                    : "Ngừng hoạt động"}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-6 mb-1">Xác minh</p>
                <p className="text-base font-semibold text-neutral-9">
                  {shopInfo.isVerified ? "Đã xác minh" : "Chưa xác minh"}
                </p>
              </div>
              {shopInfo.rating !== undefined && (
                <div>
                  <p className="text-sm text-neutral-6 mb-1">Đánh giá trung bình</p>
                  <p className="text-base font-semibold text-neutral-9">
                    ⭐ {shopInfo.rating.toFixed(1)} ({shopInfo.reviewCount || 0} đánh giá)
                  </p>
                </div>
              )}
              {(shopInfo.followersCount !== undefined || shopInfo.followCount !== undefined) && (
                <div>
                  <p className="text-sm text-neutral-6 mb-1">Người theo dõi</p>
                  <p className="text-base font-semibold text-neutral-9">
                    {shopInfo.followersCount || shopInfo.followCount || 0} người
                  </p>
                </div>
              )}
              {(shopInfo.productsCount !== undefined || shopInfo.productCount !== undefined) && (
                <div>
                  <p className="text-sm text-neutral-6 mb-1">Sản phẩm</p>
                  <p className="text-base font-semibold text-neutral-9">
                    {shopInfo.productsCount || shopInfo.productCount || 0} sản phẩm
                  </p>
                </div>
              )}
              {shopInfo.createdAt && (
                <div>
                  <p className="text-sm text-neutral-6 mb-1">Ngày tạo</p>
                  <p className="text-base font-semibold text-neutral-9">
                    {new Date(shopInfo.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              )}
              {shopInfo.updatedAt && (
                <div>
                  <p className="text-sm text-neutral-6 mb-1">Cập nhật lần cuối</p>
                  <p className="text-base font-semibold text-neutral-9">
                    {new Date(shopInfo.updatedAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              )}
            </div>
          </Section>
        )} */}

        {hasError && (
          <div className="p-4 bg-error/10 border border-error rounded-lg">
            <p className="text-sm text-error">{updateError || shopInfoError}</p>
          </div>
        )}

        {canEdit && (
          <div className="flex gap-4 justify-end">
            <Button
              type="submit"
              color="blue"
              variant="solid"
              size="lg"
              loading={isUpdating}
              disabled={isUpdating || !canEdit}
              icon={<Save className="w-5 h-5" />}
            >
              Lưu thay đổi
            </Button>
          </div>
        )}

        {!canEdit && (
          <div className="p-4 bg-neutral-2 rounded-lg border border-border-1">
            <div className="flex gap-3 items-start">
              <Lock className="w-5 h-5 text-neutral-6 mt-0.5" />
              <div>
                <p className="font-semibold text-neutral-9 mb-1">Chế độ chỉ xem</p>
                <p className="text-sm text-neutral-6">
                  {shopStatus === "pending_review"
                    ? "Cửa hàng của bạn đang chờ được xét duyệt. Sau khi được duyệt, bạn sẽ có thể chỉnh sửa thông tin cửa hàng."
                    : shopStatus === "rejected"
                      ? "Đơn đăng ký cửa hàng của bạn đã bị từ chối. Vui lòng liên hệ quản trị viên để biết thêm chi tiết."
                      : shopStatus === "not_registered"
                        ? "Bạn chưa đăng ký cửa hàng. Vui lòng hoàn tất đăng ký để có thể chỉnh sửa thông tin."
                        : "Cửa hàng chưa được kích hoạt. Vui lòng hoàn tất đăng ký để có thể chỉnh sửa thông tin."}
                </p>
              </div>
            </div>
          </div>
        )}
      </Form.Root>
    </div>
  );
};

export default InfoShop;
