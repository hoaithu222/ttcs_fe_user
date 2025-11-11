import { useEffect, useState } from "react";
import { Card } from "@/foundation/components/info/Card";
import Section from "@/foundation/components/sections/Section";
import { useInfoAccount } from "../../hooks/useInfoAccount";

const InfoAccountPanel = () => {
  const { profile, profileStatus, loadProfile, updateProfile } = useInfoAccount();
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [avatar, setAvatar] = useState<string>("");

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (profile) {
      setName((profile as any)?.fullName || (profile as any)?.name || "");
      setPhone((profile as any)?.phone || "");
      setAvatar((profile as any)?.avatar || (profile as any)?.avatarUrl || "");
    }
  }, [profile]);

  return (
    <Section title="Thông tin tài khoản">
      <Card className="space-y-3">
        <div className="text-sm text-neutral-6">Trạng thái: {profileStatus}</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-medium text-neutral-5">Họ và tên</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 mt-1 border rounded-lg border-border-2 bg-background-1"
              placeholder="Nhập họ và tên"
            />
          </div>
          <div>
            <div className="text-xs font-medium text-neutral-5">Email</div>
            <div>{profile?.email || "--"}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-neutral-5">Số điện thoại</div>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 mt-1 border rounded-lg border-border-2 bg-background-1"
              placeholder="Nhập số điện thoại"
            />
          </div>
          <div>
            <div className="text-xs font-medium text-neutral-5">Vai trò</div>
            <div>
              {Array.isArray(profile?.roles)
                ? profile?.roles.join(", ")
                : (profile as any)?.role || "--"}
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="text-xs font-medium text-neutral-5">Avatar URL</div>
            <input
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="w-full px-3 py-2 mt-1 border rounded-lg border-border-2 bg-background-1"
              placeholder="https://..."
            />
            {avatar ? (
              <img src={avatar} alt="avatar" className="w-20 h-20 mt-2 rounded-full object-cover" />
            ) : null}
          </div>
        </div>
        <div>
          <button
            className="px-4 py-2 text-white rounded-lg bg-primary-6 hover:bg-primary-7"
            onClick={() => updateProfile({ name, phone, avatar })}
          >
            Lưu thay đổi
          </button>
        </div>
      </Card>
    </Section>
  );
};

export default InfoAccountPanel;
