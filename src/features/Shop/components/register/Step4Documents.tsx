import { Card } from "@/foundation/components/info/Card";
import ImageUploadMulti from "@/foundation/components/input/upload/ImageUploadMulti";

export interface Step4Data {
  idCardImages: Array<{ url: string; publicId?: string }>;
  businessLicenseImages: Array<{ url: string; publicId?: string }>;
}

interface Step4DocumentsProps {
  data: Step4Data;
  onChange: (data: Partial<Step4Data>) => void;
  errors?: Partial<Record<keyof Step4Data, string>>;
  onIdCardUpload?: (file: File) => Promise<{ url: string; publicId?: string }>;
  onBusinessLicenseUpload?: (file: File) => Promise<{ url: string; publicId?: string }>;
}

const Step4Documents = ({
  data,
  onChange,
  errors,
  onIdCardUpload,
  onBusinessLicenseUpload,
}: Step4DocumentsProps) => {
  return (
    <Card className="space-y-4">
      <div className="space-y-1">
        <div className="text-lg font-semibold">Giai đoạn 2C: Tài liệu kèm theo</div>
        <div className="text-neutral-6 text-sm">Tải lên bản scan/ảnh chụp rõ nét.</div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ImageUploadMulti
          label="Ảnh CCCD/CMND (cả hai mặt, tùy chọn)"
          value={data.idCardImages}
          onChange={(value) => onChange({ idCardImages: value })}
          onUpload={onIdCardUpload}
          error={errors?.idCardImages}
        />
        <ImageUploadMulti
          label="Giấy phép Kinh doanh (nếu là DN/HKD)"
          value={data.businessLicenseImages}
          onChange={(value) => onChange({ businessLicenseImages: value })}
          onUpload={onBusinessLicenseUpload}
          error={errors?.businessLicenseImages}
        />
      </div>
    </Card>
  );
};

export default Step4Documents;

