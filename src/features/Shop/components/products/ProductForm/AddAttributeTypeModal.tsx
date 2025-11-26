import { useState, useEffect } from "react";
import { Plus, X, Tag } from "lucide-react";
import * as Form from "@radix-ui/react-form";
import Modal from "@/foundation/components/modal/Modal";
import Input from "@/foundation/components/input/Input";
import Select from "@/foundation/components/input/Select";
import Button from "@/foundation/components/buttons/Button";
import { slugify } from "@/shared/utils/slugify";
import { addToast } from "@/app/store/slices/toast";
import { useDispatch } from "react-redux";

interface AttributeValue {
  label: string;
  value: string;
  colorCode?: string;
}

interface AddAttributeTypeModalProps {
  open: boolean;
  onClose: () => void;
  categoryId: string; // Reserved for future API integration
  onSuccess: (attributeType: {
    id: string;
    name: string;
    values: AttributeValue[];
    inputType: string;
  }) => void;
}

const inputTypeOptions = [
  { label: "Chọn một (Select)", value: "select" },
  { label: "Chọn nhiều (Multi-select)", value: "multiselect" },
  { label: "Văn bản (Text)", value: "text" },
  { label: "Số (Number)", value: "number" },
  { label: "Có/Không (Boolean)", value: "boolean" },
];

export default function AddAttributeTypeModal({
  open,
  onClose,
  categoryId: _categoryId, // Reserved for future API integration
  onSuccess,
}: AddAttributeTypeModalProps) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    inputType: "select" as "text" | "number" | "select" | "multiselect" | "boolean" | "date" | "color",
    description: "",
  });
  const [values, setValues] = useState<AttributeValue[]>([]);
  const [newValueLabel, setNewValueLabel] = useState("");
  const [newValueColor, setNewValueColor] = useState("");
  const [isCodeManual, setIsCodeManual] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      // Reset form when modal opens
      setFormData({
        name: "",
        code: "",
        inputType: "select",
        description: "",
      });
      setValues([]);
      setNewValueLabel("");
      setNewValueColor("");
      setIsCodeManual(false);
    }
  }, [open]);

  useEffect(() => {
    if (!isCodeManual && formData.name && !formData.code) {
      setFormData((prev) => ({ ...prev, code: slugify(prev.name, "_") }));
    }
  }, [formData.name, formData.code, isCodeManual]);

  const handleAddValue = () => {
    if (!newValueLabel.trim()) {
      dispatch(addToast({ type: "error", message: "Vui lòng nhập tên giá trị" }));
      return;
    }

    const value = slugify(newValueLabel.trim(), "_");
    if (values.some((v) => v.value === value)) {
      dispatch(addToast({ type: "error", message: "Giá trị này đã tồn tại" }));
      return;
    }

    setValues((prev) => [
      ...prev,
      {
        label: newValueLabel.trim(),
        value,
        colorCode: newValueColor.trim() || undefined,
      },
    ]);
    setNewValueLabel("");
    setNewValueColor("");
  };

  const handleRemoveValue = (index: number) => {
    setValues((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      dispatch(addToast({ type: "error", message: "Vui lòng nhập tên loại thuộc tính" }));
      return;
    }

    if (!formData.code.trim()) {
      dispatch(addToast({ type: "error", message: "Vui lòng nhập mã hệ thống" }));
      return;
    }

    // For select/multiselect, require at least one value
    if ((formData.inputType === "select" || formData.inputType === "multiselect") && values.length === 0) {
      dispatch(
        addToast({
          type: "error",
          message: "Vui lòng thêm ít nhất một giá trị cho loại thuộc tính này",
        })
      );
      return;
    }

    setLoading(true);
    try {
      // TODO: Call API to create attribute type
      // For now, we'll create a temporary attribute type object
      const newAttributeType = {
        id: `temp-${Date.now()}`,
        name: formData.name.trim(),
        values: values.length > 0 ? values : [],
        inputType: formData.inputType,
        code: formData.code.trim(),
        description: formData.description.trim(),
        isRequired: false,
      };

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      onSuccess(newAttributeType);
      dispatch(addToast({ type: "success", message: "Đã thêm loại thuộc tính thành công" }));
      onClose();
    } catch (error) {
      dispatch(
        addToast({
          type: "error",
          message: error instanceof Error ? error.message : "Có lỗi xảy ra khi thêm loại thuộc tính",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const customTitle = (
    <div className="flex gap-3 items-center">
      <div className="flex justify-center items-center w-10 h-10 rounded-lg bg-primary-10">
        <Tag className="w-5 h-5 text-primary-6" />
      </div>
      <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-6 to-primary-8 bg-clip-text text-transparent">
        Thêm loại thuộc tính mới
      </h2>
    </div>
  );

  const footer = (
    <div className="flex gap-4 justify-end">
      <Button type="button" color="gray" variant="outline" size="lg" onClick={onClose}>
        Hủy
      </Button>
      <Button type="button" color="blue" variant="solid" size="lg" loading={loading} onClick={handleSubmit}>
        Thêm loại thuộc tính
      </Button>
    </div>
  );

  return (
    <Modal
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      size="2xl"
      customTitle={customTitle}
      footer={footer}
      hideFooter={false}
    >
      <Form.Root>
        <div className="space-y-6">
          <div className="p-4 bg-primary-10/30 rounded-lg border border-primary-6/20">
            <p className="text-sm font-medium text-primary-7">
              💡 Tạo loại thuộc tính mới để mô tả sản phẩm của bạn tốt hơn. Bạn có thể thêm các giá trị ngay sau khi tạo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="attributeName"
            label="Tên loại thuộc tính"
            placeholder="Ví dụ: Dung lượng RAM, Màu sắc, Kích thước màn hình"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            required
            iconLeft={<Tag className="w-5 h-5 text-primary-6" />}
          />

          <Input
            name="attributeCode"
            label="Mã hệ thống (tự động)"
            placeholder="Tự động tạo từ tên"
            value={formData.code}
            onChange={(e) => {
              setIsCodeManual(true);
              setFormData((prev) => ({ ...prev, code: slugify(e.target.value, "_") }));
            }}
            description="Mã dùng để nhận diện trong hệ thống"
            iconLeft={<Tag className="w-5 h-5 text-neutral-5" />}
          />

          <Select
            name="inputType"
            label="Loại trường nhập"
            value={formData.inputType}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, inputType: value as any }))
            }
            options={inputTypeOptions}
            description="Chọn cách người dùng sẽ nhập giá trị"
          />

          <div className="md:col-span-2">
            <Input
              name="description"
              label="Mô tả (tùy chọn)"
              placeholder="Mô tả ngắn về loại thuộc tính này"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>
        </div>

        {/* Add values section - only show for select/multiselect */}
        {(formData.inputType === "select" || formData.inputType === "multiselect") && (
          <div className="space-y-4 p-4 bg-neutral-2 rounded-lg border border-border-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-neutral-7">Giá trị thuộc tính</p>
                <p className="text-xs text-neutral-5">
                  Thêm các giá trị có thể chọn cho loại thuộc tính này
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                name="newValueLabel"
                placeholder="Nhập tên giá trị (ví dụ: 8GB, Đỏ, 6.1 inch)"
                value={newValueLabel}
                onChange={(e) => setNewValueLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddValue();
                  }
                }}
                className="flex-1"
                iconLeft={<Plus className="w-4 h-4 text-neutral-5" />}
              />
              <Input
                name="newValueColor"
                type="color"
                placeholder="Mã màu (tùy chọn)"
                value={newValueColor}
                onChange={(e) => setNewValueColor(e.target.value)}
                className="w-20"
                title="Chọn màu cho giá trị này"
              />
              <Button
                type="button"
                color="blue"
                variant="outline"
                size="lg"
                icon={<Plus className="w-4 h-4" />}
                onClick={handleAddValue}
              >
                Thêm
              </Button>
            </div>

            {values.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {values.map((value, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-border-1"
                  >
                    {value.colorCode && (
                      <div
                        className="w-4 h-4 rounded-full border border-border-1"
                        style={{ backgroundColor: value.colorCode }}
                      />
                    )}
                    <span className="text-sm font-medium text-neutral-7">{value.label}</span>
                    <span className="text-xs text-neutral-5">({value.value})</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveValue(index)}
                      className="ml-1 p-1 rounded hover:bg-neutral-3 transition-colors"
                    >
                      <X className="w-4 h-4 text-neutral-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {values.length === 0 && (
              <p className="text-xs text-neutral-5 text-center py-2">
                Chưa có giá trị nào. Hãy thêm ít nhất một giá trị.
              </p>
            )}
          </div>
        )}
        </div>
      </Form.Root>
    </Modal>
  );
}

