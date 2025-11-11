import { useEffect, useState } from "react";
import { Card } from "@/foundation/components/info/Card";
import Section from "@/foundation/components/sections/Section";
import { useInfoAccount } from "../../hooks/useInfoAccount";
import { API_BASE_URL } from "@/app/config/env.config";

const InfoAccountPanel = () => {
  const { profile, profileStatus, loadProfile, updateProfile } = useInfoAccount();
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [avatar, setAvatar] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  console.log("profile", profile);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      setName((profile as any)?.fullName || (profile as any)?.name || "");
      setPhone((profile as any)?.phone || "");
      setAvatar((profile as any)?.avatar || (profile as any)?.avatarUrl || "");
    }
  }, [profile]);

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
      <Card className="space-y-4">
        <div className="flex flex-col-reverse gap-6 md:grid md:grid-cols-3">
          <div className="space-y-4 md:col-span-2">
            <div>
              <div className="text-xs font-medium text-neutral-5">Họ và tên</div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-3 py-2 mt-1 w-full rounded-lg border border-border-2 bg-background-1"
                placeholder="Nhập họ và tên"
              />
            </div>
            <div>
              <div className="text-xs font-medium text-neutral-5">Email</div>
              <div className="px-3 py-2 mt-1 rounded-lg bg-background-2">
                {profile?.email || "--"}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-neutral-5">Số điện thoại</div>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="px-3 py-2 mt-1 w-full rounded-lg border border-border-2 bg-background-1"
                placeholder="Nhập số điện thoại"
                inputMode="numeric"
              />
            </div>
            <div>
              <button
                className="px-4 py-2 w-full text-white rounded-lg md:w-auto bg-primary-6 hover:bg-primary-7 disabled:opacity-60"
                onClick={handleSave}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
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
            <label className="px-4 py-2 text-white rounded-lg cursor-pointer bg-primary-6 hover:bg-primary-7">
              Chọn ảnh
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.currentTarget.files?.[0];
                  if (file) void handleUploadAvatar(file);
                }}
                disabled={isUploading}
              />
            </label>
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
