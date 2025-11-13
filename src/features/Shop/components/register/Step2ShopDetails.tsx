import { Card } from "@/foundation/components/info/Card";
import Input from "@/foundation/components/input/Input";
import TextArea from "@/foundation/components/input/TextArea";
import ImageIconUpload from "@/foundation/components/input/upload/ImageIconUpload";
import ImageBannerUpdate from "@/foundation/components/input/upload/ImageBannerUpload";
import AddressSelector, { AddressSelectorValue } from "@/shared/components/AddressSelector";
import * as Form from "@radix-ui/react-form";

export interface Step2Data {
  shopName: string;
  shopSlug: string;
  shopDescription: string;
  logo: { url: string; publicId?: string } | null;
  banner: { url: string; publicId?: string } | null;
  address: AddressSelectorValue;
}

interface Step2ShopDetailsProps {
  data: Step2Data;
  onChange: (data: Partial<Step2Data>) => void;
  errors?: Partial<Record<keyof Step2Data, string>>;
  onLogoUpload?: (file: File) => Promise<{ url: string; publicId?: string }>;
  onBannerUpload?: (file: File) => Promise<{ url: string; publicId?: string }>;
}

const Step2ShopDetails = ({
  data,
  onChange,
  errors,
  onLogoUpload,
  onBannerUpload,
}: Step2ShopDetailsProps) => {
  return (
    <Card className="space-y-4">
      <div className="space-y-1">
        <div className="text-lg font-semibold">Giai đoạn 2A: Thông tin Gian hàng</div>
        <div className="text-neutral-6 text-sm">
          Thông tin thương hiệu hiển thị cho khách hàng.
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Form.Field name="shopName">
          <Input
            name="shopName"
            label="Tên Gian hàng (bắt buộc, duy nhất)"
            placeholder="Tên gian hàng"
            required
            value={data.shopName}
            onChange={(e) => onChange({ shopName: e.target.value })}
            error={errors?.shopName}
          />
        </Form.Field>
        <Form.Field name="shopSlug">
          <Input
            name="shopSlug"
            label="Đường dẫn Shop (slug, bắt buộc, duy nhất)"
            placeholder="ten-gian-hang"
            required
            autoStripDiacritics
            blockSpecialChars
            value={data.shopSlug}
            onChange={(e) => onChange({ shopSlug: e.target.value })}
            error={errors?.shopSlug}
          />
        </Form.Field>
        <div className="md:col-span-2">
          <Form.Field name="shopDescription">
            <TextArea
              name="shopDescription"
              label="Mô tả ngắn về Shop (bắt buộc)"
              placeholder="Giới thiệu chung về sản phẩm/lĩnh vực kinh doanh"
              rows={4}
              required
              value={data.shopDescription}
              onChange={(e) => onChange({ shopDescription: e.target.value })}
              error={errors?.shopDescription}
            />
          </Form.Field>
        </div>
        <div>
          <ImageIconUpload
            label="Cửa hàng logo (bắt buộc)"
            placeholder="Logo"
            size="xl"
            value={data.logo}
            onChange={(value) => onChange({ logo: value })}
            onUpload={onLogoUpload}
            error={errors?.logo}
          />
        </div>
        <div>
          <ImageBannerUpdate
            label="Ảnh bìa/Banner (bắt buộc)"
            value={data.banner}
            onChange={(value) => onChange({ banner: value })}
            onUpload={onBannerUpload}
            error={errors?.banner}
          />
        </div>
        <div className="md:col-span-2">
          <AddressSelector
            value={data.address}
            onChange={(value) => onChange({ address: value })}
            labels={{
              province: "Tỉnh/Thành phố (bắt buộc)",
              district: "Quận/Huyện (bắt buộc)",
              ward: "Phường/Xã (bắt buộc)",
            }}
          />
          {errors?.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default Step2ShopDetails;

