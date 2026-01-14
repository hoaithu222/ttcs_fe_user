import { useEffect, useRef, useState } from "react";
import * as Form from "@radix-ui/react-form";
import { Card } from "@/foundation/components/info/Card";
import Section from "@/foundation/components/sections/Section";
import { useInfoAccount } from "../../hooks/useInfoAccount";
import { API_BASE_URL } from "@/app/config/env.config";

import AlertMessage from "@/foundation/components/info/AlertMessage";
import Input from "@/foundation/components/input/Input";
import Button from "@/foundation/components/buttons/Button";
import { Chip } from "@/foundation/components/info/Chip";
const InfoAccountPanel = () => {
  const { profile, loadProfile, updateProfile } = useInfoAccount();
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [avatar, setAvatar] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);


  console.log("profile", profile);

  useEffect(() => {
    loadProfile();
  }, []);

  const profileData = (profile as any)?._doc ?? profile;
  const statusMeta = (() => {
    const status = profileData?.status;
    if (status === "active") {
      return {
        id: "status-active",
        label: "Trạng thái: Đã kích hoạt",
        colorClass: "border border-success text-success bg-success/10",
      };
    }
    if (status === "inactive") {
      return {
        id: "status-inactive",
        label: "Trạng thái: Chưa kích hoạt",
        colorClass: "border border-warning text-warning bg-warning/10",
      };
    }
    if (status === "suspended") {
      return {
        id: "status-suspended",
        label: "Trạng thái: Bị khóa",
        colorClass: "border border-error text-error bg-error/10",
      };
    }
    return status
      ? {
        id: "status-generic",
        label: `Trạng thái: ${status}`,
        colorClass: "border border-neutral-3 text-neutral-7 bg-neutral-2",
      }
      : null;
  })();

  const roleMeta = profileData?.role
    ? {
      id: "role",
      label: `Vai trò: ${profileData.role === "admin" ? "Quản trị" : profileData.role}`,
      colorClass: "border border-primary-6 text-primary-6 bg-primary-10",
    }
    : null;

  const shopStatusMeta = profileData?.shopStatus
    ? {
      id: "shop-status",
      label:
        profileData.shopStatus === "not_registered"
          ? "Cửa hàng: Chưa đăng ký"
          : `Cửa hàng: ${profileData.shopStatus}`,
      colorClass: "border border-neutral-4 text-neutral-7 bg-background-2",
    }
    : null;

  const overviewChips = [statusMeta, roleMeta, shopStatusMeta].filter(
    (chip): chip is { id: string; label: string; colorClass: string } => Boolean(chip)
  );

  useEffect(() => {
    if (profileData) {
      setName((profileData as any)?.fullName || (profileData as any)?.name || "");
      setPhone((profileData as any)?.phone || "");
      setAvatar((profileData as any)?.avatar || (profileData as any)?.avatarUrl || "");
    }
  }, [profileData]);

  const handleUploadAvatar = async (file: File) => {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    setIsUploading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/images/upload`, {
        method: "POST",
        body: form,
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data && data.message) || "Tải ảnh thất bại");
      }
      const url = data?.data?.url || data?.url;
      if (typeof url === "string") setAvatar(url);
    } catch (e) {
      // noop; optionally show toast via global system if desired
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await Promise.resolve(
        updateProfile({
          name,
          phone,
          avatar,
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Section title="Thông tin tài khoản">
      <Card className="space-y-6 py-7 mr-6 lg:mr-0  max-h-[calc(100vh-110px)] min-h-[calc(100vh-110px)] overflow-y-auto" >
        {profileData?.status === "suspended" && (
          <AlertMessage
            type="error"
            title="Tài khoản bị khóa"
            message="Tài khoản của bạn đã bị khóa bởi quản trị viên(CSKH). Bạn không thể thực hiện các thao tác như đăng ký shop, đặt hàng, hoặc thanh toán. Vui lòng liên hệ với quản trị viên để biết thêm chi tiết."
          />
        )}
        <AlertMessage
          type="info"
          title="Cập nhật hồ sơ"
          message="Vui lòng đảm bảo thông tin liên hệ luôn chính xác để hoàn tất xác thực tài khoản và nhận thông báo quan trọng."
        />
        <div className="flex flex-col-reverse gap-16 md:grid md:grid-cols-3">
          <Form.Root
            className="space-y-4 md:col-span-2"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSave();
            }}
          >
            <Input
              name="profile-fullname"
              label="Họ và tên"
              placeholder="Nhập họ và tên"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              sizeInput="lg"
            />
            <Input
              name="profile-email"
              label="Email"
              value={profileData?.email || ""}
              readOnly
              disabled
              sizeInput="lg"
              description="Email được sử dụng cho đăng nhập và thông báo hệ thống."
            />
            <Input
              name="profile-phone"
              label="Số điện thoại"
              placeholder="Nhập số điện thoại"
              value={phone}
              sizeInput="lg"
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
            />
            <Button
              color="blue"
              variant="primary"
              size="md"
              loading={isSubmitting}
              fullWidth={false}
              type="submit"
            >
              Lưu thay đổi
            </Button>
          </Form.Root>
          <div className="flex flex-col gap-4 items-center">
            <div className="relative">
              <div className="p-1 rounded-full bg-background-1">
                {isUploading ? (
                  <div className="flex justify-center items-center w-28 h-28 rounded-full bg-background-2">
                    <span className="text-xs text-neutral-6">Đang tải...</span>
                  </div>
                ) : avatar ? (
                  <img src={avatar} alt="avatar" className="object-cover w-28 h-28 rounded-full" />
                ) : (
                  <div className="flex justify-center items-center w-28 h-28 rounded-full bg-background-2 text-neutral-6">
                    <span className="text-sm">No avatar</span>
                  </div>
                )}
              </div>
            </div>
            <div className="w-full">
              <Button
                color="blue"
                variant="outlined"
                fullWidth
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? "Đang tải ảnh..." : "Chọn ảnh đại diện"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.currentTarget.files?.[0];
                  if (file) void handleUploadAvatar(file);
                }}
                disabled={isUploading}
              />
            </div>
            <div className="text-xs text-center text-neutral-6">
              Dung lượng tối đa 1MB. Định dạng: JPEG, PNG
            </div>
          </div>
        </div>

      </Card>
    </Section>
  );
};

export default InfoAccountPanel;
