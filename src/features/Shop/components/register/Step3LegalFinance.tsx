import { Card } from "@/foundation/components/info/Card";
import Input from "@/foundation/components/input/Input";
import Select from "@/foundation/components/input/Select";
import * as Form from "@radix-ui/react-form";

export interface Step3Data {
  businessType: string;
  taxId: string;
  repId: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
}

interface Step3LegalFinanceProps {
  data: Step3Data;
  onChange: (data: Partial<Step3Data>) => void;
  errors?: Partial<Record<keyof Step3Data, string>>;
}

const Step3LegalFinance = ({ data, onChange, errors }: Step3LegalFinanceProps) => {
  return (
    <Card className="space-y-4">
      <div className="space-y-1">
        <div className="text-lg font-semibold">Giai đoạn 2B: Pháp lý & Tài chính</div>
        <div className="text-neutral-6 text-sm">
          Thông tin phục vụ xét duyệt và thanh toán.
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Form.Field name="businessType">
          <Select
            name="businessType"
            label="Hình thức kinh doanh (bắt buộc)"
            options={[
              { value: "individual", label: "Cá nhân" },
              { value: "household", label: "Hộ kinh doanh" },
              { value: "enterprise", label: "Doanh nghiệp" },
            ]}
            placeholder="Chọn"
            required
            value={data.businessType}
            onChange={(v) => onChange({ businessType: v || "" })}
            error={errors?.businessType}
          />
        </Form.Field>
        <Form.Field name="taxId">
          <Input
            name="taxId"
            label="Mã số thuế (MST)"
            placeholder="MST (nếu là DN/HKD)"
            value={data.taxId}
            onChange={(e) => onChange({ taxId: e.target.value })}
            error={errors?.taxId}
          />
        </Form.Field>
        <Form.Field name="repId">
          <Input
            name="repId"
            label="Số CCCD/MST người đại diện (bắt buộc)"
            placeholder="CCCD/MST đại diện"
            required
            value={data.repId}
            onChange={(e) => onChange({ repId: e.target.value })}
            error={errors?.repId}
          />
        </Form.Field>
        <Form.Field name="bankName">
          <Input
            name="bankName"
            label="Tên Ngân hàng (bắt buộc)"
            placeholder="Tên ngân hàng"
            required
            value={data.bankName}
            onChange={(e) => onChange({ bankName: e.target.value })}
            error={errors?.bankName}
          />
        </Form.Field>
        <Form.Field name="bankAccount">
          <Input
            name="bankAccount"
            label="Số Tài khoản Ngân hàng (bắt buộc)"
            placeholder="Số tài khoản"
            required
            value={data.bankAccount}
            onChange={(e) => onChange({ bankAccount: e.target.value })}
            error={errors?.bankAccount}
          />
        </Form.Field>
        <Form.Field name="bankHolder">
          <Input
            name="bankHolder"
            label="Tên Chủ Tài khoản (bắt buộc)"
            placeholder="Họ tên chủ tài khoản"
            required
            value={data.bankHolder}
            onChange={(e) => onChange({ bankHolder: e.target.value })}
            error={errors?.bankHolder}
          />
        </Form.Field>
      </div>
    </Card>
  );
};

export default Step3LegalFinance;

