import { Card } from "@/foundation/components/info/Card";
import Input from "@/foundation/components/input/Input";
import * as Form from "@radix-ui/react-form";

export interface Step1Data {
  contactEmail: string;
  contactPhone: string;
  contactName: string;
}

interface Step1AccountContactProps {
  data: Step1Data;
  onChange: (data: Partial<Step1Data>) => void;
  errors?: Partial<Record<keyof Step1Data, string>>;
}

const Step1AccountContact = ({ data, onChange, errors }: Step1AccountContactProps) => {
  return (
    <Card className="space-y-4">
      <div className="space-y-1">
        <div className="text-lg font-semibold">Giai đoạn 1: Tài khoản & Liên hệ</div>
        <div className="text-neutral-6 text-sm">
          Thông tin bắt buộc để tạo tài khoản và kênh liên lạc chính thức.
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Form.Field name="contactEmail">
          <Input
            name="contactEmail"
            label="Email (bắt buộc, duy nhất)"
            type="email"
            placeholder="email@domain.com"
            required
            value={data.contactEmail}
            onChange={(e) => onChange({ contactEmail: e.target.value })}
            error={errors?.contactEmail}
          />
        </Form.Field>
        <Form.Field name="contactPhone">
          <Input
            name="contactPhone"
            label="Số điện thoại (bắt buộc, duy nhất)"
            type="tel"
            placeholder="Số điện thoại"
            required
            value={data.contactPhone}
            onChange={(e) => onChange({ contactPhone: e.target.value })}
            error={errors?.contactPhone}
          />
        </Form.Field>

        <div className="md:col-span-2">
          <Form.Field name="contactName">
            <Input
              name="contactName"
              label="Tên người liên hệ"
              placeholder="Họ và tên người đại diện"
              required
              value={data.contactName}
              onChange={(e) => onChange({ contactName: e.target.value })}
              error={errors?.contactName}
            />
          </Form.Field>
        </div>
      </div>
    </Card>
  );
};

export default Step1AccountContact;
