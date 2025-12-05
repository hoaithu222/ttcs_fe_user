import { Card } from "@/foundation/components/info/Card";
import Input from "@/foundation/components/input/Input";
import TextArea from "@/foundation/components/input/TextArea";
import * as Form from "@radix-ui/react-form";

export interface Step5Data {
  shippingPolicy: string;
  returnPolicy: string;
  openHour: string;
  closeHour: string;
  workingDays: string;
  facebook: string;
  zalo: string;
  instagram: string;
}

interface Step5InitialSetupProps {
  data: Step5Data;
  onChange: (data: Partial<Step5Data>) => void;
  errors?: Partial<Record<keyof Step5Data, string>>;
}

const Step5InitialSetup = ({ data, onChange, errors }: Step5InitialSetupProps) => {
  return (
    <Card className="space-y-4">
      <div className="space-y-1">
        <div className="text-lg font-semibold">Giai đoạn 3: Cấu hình ban đầu</div>
        <div className="text-neutral-6 text-sm">
          Thiết lập vận hành trước khi bắt đầu bán hàng.
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <Form.Field name="shippingPolicy">
          <TextArea
            name="shippingPolicy"
            label="Chính sách Vận chuyển (tùy chọn)"
            placeholder="Đơn vị vận chuyển, phí ship..."
            rows={4}
            value={data.shippingPolicy}
            onChange={(e) => onChange({ shippingPolicy: e.target.value })}
            error={errors?.shippingPolicy}
          />
        </Form.Field>
        <Form.Field name="returnPolicy">
          <TextArea
            name="returnPolicy"
            label="Chính sách Đổi trả (bắt buộc)"
            placeholder="Điều kiện và thời gian đổi trả..."
            rows={4}
            required
            value={data.returnPolicy}
            onChange={(e) => onChange({ returnPolicy: e.target.value })}
            error={errors?.returnPolicy}
          />
        </Form.Field>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Form.Field name="openHour">
            <Input
              name="openHour"
              label="Giờ mở cửa"
              placeholder="08:00"
              value={data.openHour}
              onChange={(e) => onChange({ openHour: e.target.value })}
              error={errors?.openHour}
            />
          </Form.Field>
          <Form.Field name="closeHour">
            <Input
              name="closeHour"
              label="Giờ đóng cửa"
              placeholder="17:00"
              value={data.closeHour}
              onChange={(e) => onChange({ closeHour: e.target.value })}
              error={errors?.closeHour}
            />
          </Form.Field>
          <Form.Field name="workingDays">
            <Input
              name="workingDays"
              label="Ngày làm việc"
              placeholder="T2 - T7"
              value={data.workingDays}
              onChange={(e) => onChange({ workingDays: e.target.value })}
              error={errors?.workingDays}
            />
          </Form.Field>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Form.Field name="facebook">
            <Input
              name="facebook"
              label="Facebook (tuỳ chọn)"
              placeholder="https://facebook.com/..."
              value={data.facebook}
              onChange={(e) => onChange({ facebook: e.target.value })}
              error={errors?.facebook}
            />
          </Form.Field>
          <Form.Field name="zalo">
            <Input
              name="zalo"
              label="Zalo (tuỳ chọn)"
              placeholder="SĐT Zalo / Link OA"
              value={data.zalo}
              onChange={(e) => onChange({ zalo: e.target.value })}
              error={errors?.zalo}
            />
          </Form.Field>
          <Form.Field name="instagram">
            <Input
              name="instagram"
              label="Instagram (tuỳ chọn)"
              placeholder="https://instagram.com/..."
              value={data.instagram}
              onChange={(e) => onChange({ instagram: e.target.value })}
              error={errors?.instagram}
            />
          </Form.Field>
        </div>
      </div>
    </Card>
  );
};

export default Step5InitialSetup;

