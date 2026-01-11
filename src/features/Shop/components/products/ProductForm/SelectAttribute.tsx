import { useState, useEffect } from "react";
import { Tag, CheckCircle2, Plus, X } from "lucide-react";
import Select from "@/foundation/components/input/Select";
import Input from "@/foundation/components/input/Input";
import Button from "@/foundation/components/buttons/Button";
import { slugify } from "@/shared/utils/slugify";
import { addToast } from "@/app/store/slices/toast";
import { useDispatch } from "react-redux";

interface AttributeValue {
  id: string;
  value: string;
  label?: string;
  colorCode?: string;
}

interface Attribute {
  id: string;
  name: string;
  values: AttributeValue[];
  inputType?: "text" | "number" | "select" | "multiselect" | "boolean" | "date" | "color";
  isRequired?: boolean;
}

interface SelectAttributeProps {
  attribute: Attribute;
  setData: React.Dispatch<React.SetStateAction<any>>;
  initialValue?: string;
  initialValues?: string[];
  onAttributeUpdate?: (attributeId: string, newValues: AttributeValue[]) => void;
}

export default function SelectAttribute({
  attribute,
  setData,
  initialValue,
  initialValues,
  onAttributeUpdate,
}: SelectAttributeProps) {
  const dispatch = useDispatch();
  const [selectedValue, setSelectedValue] = useState<string>(initialValue || "");
  const [selectedValues, setSelectedValues] = useState<string[]>(initialValues || []);
  const [textValue, setTextValue] = useState<string>(initialValue || "");
  const [numberValue, setNumberValue] = useState<number>(
    initialValue ? Number(initialValue) : 0
  );
  const [showAddValue, setShowAddValue] = useState(false);
  const [newValueLabel, setNewValueLabel] = useState("");
  const [newValueColor, setNewValueColor] = useState("");
  const [localValues, setLocalValues] = useState<AttributeValue[]>(attribute.values || []);

  const inputType = attribute.inputType || "select";
  const isMultiSelect = inputType === "multiselect";
  const isText = inputType === "text";
  const isNumber = inputType === "number";
  const isBoolean = inputType === "boolean";
  const isSelect = inputType === "select" || inputType === "multiselect";

  // Update local values when attribute changes
  useEffect(() => {
    setLocalValues(attribute.values || []);
  }, [attribute.values]);

  useEffect(() => {
    if (initialValue !== undefined) {
      if (isText) {
        setTextValue(initialValue);
      } else if (isNumber) {
        setNumberValue(Number(initialValue));
      } else {
        setSelectedValue(initialValue);
      }
    }
  }, [initialValue, isText, isNumber]);

  useEffect(() => {
    if (initialValues !== undefined && isMultiSelect) {
      setSelectedValues(initialValues);
    }
  }, [initialValues, isMultiSelect]);

  const handleSelectChange = (value: string) => {
    setSelectedValue(value);
    updateProductAttributes(value);
  };

  const handleMultiSelectChange = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    setSelectedValues(newValues);
    updateProductAttributes(newValues);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTextValue(value);
    updateProductAttributes(value);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setNumberValue(value);
    updateProductAttributes(value.toString());
  };

  const handleBooleanChange = (value: string) => {
    setSelectedValue(value);
    updateProductAttributes(value);
  };

  const handleAddNewValue = () => {
    if (!newValueLabel.trim()) {
      dispatch(addToast({ type: "error", message: "Vui lòng nhập tên giá trị" }));
      return;
    }

    const value = slugify(newValueLabel.trim(), "_");
    if (localValues.some((v) => v.value === value || v.id === value)) {
      dispatch(addToast({ type: "error", message: "Giá trị này đã tồn tại" }));
      return;
    }

    const newValue: AttributeValue = {
      id: `temp-${Date.now()}`,
      value,
      label: newValueLabel.trim(),
      colorCode: newValueColor.trim() || undefined,
    };

    const updatedValues = [...localValues, newValue];
    setLocalValues(updatedValues);

    // Update parent attribute if callback provided
    if (onAttributeUpdate) {
      onAttributeUpdate(attribute.id, updatedValues);
    }

    // Auto-select the new value
    if (isMultiSelect) {
      const newSelected = [...selectedValues, value];
      setSelectedValues(newSelected);
      updateProductAttributes(newSelected);
    } else {
      setSelectedValue(value);
      updateProductAttributes(value);
    }

    setNewValueLabel("");
    setNewValueColor("");
    setShowAddValue(false);
    dispatch(addToast({ type: "success", message: "Đã thêm giá trị mới" }));
  };

  const updateProductAttributes = (value: string | string[]) => {
    setData((prev: any) => {
      const currentAttributes = prev.product_attributes || prev.attributes || [];
      const attributeValueId = isMultiSelect
        ? (value as string[]).map((v) => {
            const attrValue = localValues.find((val) => val.value === v || val.id === v);
            return attrValue?.id || v;
          })
        : (() => {
            const attrValue = localValues.find(
              (val) => val.value === value || val.id === value
            );
            return attrValue?.id || value;
          })();

      // Remove existing attribute entries for this attribute type
      const filteredAttributes = currentAttributes.filter(
        (attr: any) => attr.attribute_type_id !== attribute.id && attr.attributeTypeId !== attribute.id
      );

      // Add new attribute entries
      if (isMultiSelect && Array.isArray(value)) {
        const newAttributes = value.map((v) => {
          const attrValue = localValues.find((val) => val.value === v || val.id === v);
          return {
            attribute_type_id: attribute.id,
            attributeTypeId: attribute.id,
            attribute_value_id: attrValue?.id || v,
            attributeValueId: attrValue?.id || v,
            value: attrValue?.value || v,
          };
        });
        return {
          ...prev,
          product_attributes: [...filteredAttributes, ...newAttributes],
          attributes: [...filteredAttributes, ...newAttributes],
        };
      } else {
        const newAttribute = {
          attribute_type_id: attribute.id,
          attributeTypeId: attribute.id,
          attribute_value_id: Array.isArray(attributeValueId) ? attributeValueId[0] : attributeValueId,
          attributeValueId: Array.isArray(attributeValueId) ? attributeValueId[0] : attributeValueId,
          value: typeof value === "string" ? value : value[0],
        };
        return {
          ...prev,
          product_attributes: [...filteredAttributes, newAttribute],
          attributes: [...filteredAttributes, newAttribute],
        };
      }
    });
  };

  // Render based on input type
  if (isText) {
    return (
      <div className="space-y-2">
        <Input
          name={`attribute_${attribute.id}`}
          label={attribute.name}
          value={textValue}
          onChange={handleTextChange}
          placeholder={`Nhập ${attribute.name.toLowerCase()}`}
          required={attribute.isRequired}
          iconLeft={<Tag className="w-5 h-5 text-primary-6" />}
        />
      </div>
    );
  }

  if (isNumber) {
    return (
      <div className="space-y-2">
        <Input
          name={`attribute_${attribute.id}`}
          label={attribute.name}
          type="number"
          value={numberValue || ""}
          onChange={handleNumberChange}
          placeholder={`Nhập ${attribute.name.toLowerCase()}`}
          required={attribute.isRequired}
          iconLeft={<Tag className="w-5 h-5 text-primary-6" />}
        />
      </div>
    );
  }

  if (isBoolean) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-neutral-7">
          {attribute.name}
          {attribute.isRequired && <span className="text-error"> *</span>}
        </label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => handleBooleanChange("true")}
            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
              selectedValue === "true"
                ? "border-primary-6 bg-primary-5 text-primary-1"
                : "border-border-1 bg-neutral-2 text-neutral-7 hover:border-primary-6"
            }`}
          >
            <CheckCircle2 className={`w-5 h-5 ${selectedValue === "true" ? "text-primary-6" : "text-neutral-4"}`} />
            Có
          </button>
          <button
            type="button"
            onClick={() => handleBooleanChange("false")}
            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
              selectedValue === "false"
                ? "border-primary-6 bg-primary-4 text-primary-1"
                : "border-border-1 bg-neutral-2 text-neutral-7 hover:border-primary-6"
            }`}
          >
            <CheckCircle2 className={`w-5 h-5 ${selectedValue === "false" ? "text-primary-6" : "text-neutral-4"}`} />
            Không
          </button>
        </div>
      </div>
    );
  }

  if (isMultiSelect) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-neutral-7">
            {attribute.name}
            {attribute.isRequired && <span className="text-error"> *</span>}
          </label>
          <Button
            type="button"
            color="blue"
            variant="ghost"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowAddValue(!showAddValue)}
          >
            Thêm giá trị
          </Button>
        </div>

        {showAddValue && (
          <div className="p-3 bg-neutral-2 rounded-lg border border-border-1 space-y-2">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-5" />
                <input
                  type="text"
                  placeholder="Nhập tên giá trị mới"
                  value={newValueLabel}
                  onChange={(e) => setNewValueLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddNewValue();
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border-1 bg-white text-sm text-neutral-7 placeholder:text-neutral-4 focus:outline-none focus:ring-2 focus:ring-primary-6 focus:border-primary-6"
                />
              </div>
              <input
                type="color"
                value={newValueColor}
                onChange={(e) => setNewValueColor(e.target.value)}
                className="w-20 h-10 rounded-lg border border-border-1 cursor-pointer"
                title="Chọn màu (tùy chọn)"
              />
              <Button
                type="button"
                color="blue"
                variant="outline"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={handleAddNewValue}
              >
                Thêm
              </Button>
              <Button
                type="button"
                color="gray"
                variant="ghost"
                size="sm"
                icon={<X className="w-4 h-4" />}
                onClick={() => {
                  setShowAddValue(false);
                  setNewValueLabel("");
                  setNewValueColor("");
                }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {localValues.map((value) => {
            const isSelected = selectedValues.includes(value.value) || selectedValues.includes(value.id);
            return (
              <button
                key={value.id}
                type="button"
                onClick={() => handleMultiSelectChange(value.value || value.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                  isSelected
                    ? "border-primary-6 bg-primary-4 text-primary-1"
                    : "border-border-1 bg-neutral-2 text-neutral-7 hover:border-primary-6"
                }`}
              >
                {value.colorCode && (
                  <div
                    className="w-4 h-4 rounded-full border border-border-1"
                    style={{ backgroundColor: value.colorCode }}
                  />
                )}
                <span>{value.label || value.value}</span>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-primary-6" />}
              </button>
            );
          })}
        </div>
        {selectedValues.length === 0 && (
          <p className="text-xs text-neutral-5">Chưa chọn giá trị nào</p>
        )}
      </div>
    );
  }

  // Default: Select dropdown
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-neutral-7">
          {attribute.name}
          {attribute.isRequired && <span className="text-error"> *</span>}
        </label>
        <Button
          type="button"
          color="blue"
          variant="ghost"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setShowAddValue(!showAddValue)}
        >
          Thêm giá trị
        </Button>
      </div>

      {showAddValue && (
        <div className="p-3 bg-neutral-2 rounded-lg border border-border-1 space-y-2 mb-2">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-5" />
              <input
                type="text"
                placeholder="Nhập tên giá trị mới"
                value={newValueLabel}
                onChange={(e) => setNewValueLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddNewValue();
                  }
                }}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border-1 bg-white text-sm text-neutral-7 placeholder:text-neutral-4 focus:outline-none focus:ring-2 focus:ring-primary-6 focus:border-primary-6"
              />
            </div>
            <input
              type="color"
              value={newValueColor}
              onChange={(e) => setNewValueColor(e.target.value)}
              className="w-20 h-10 rounded-lg border border-border-1 cursor-pointer"
              title="Chọn màu (tùy chọn)"
            />
            <Button
              type="button"
              color="blue"
              variant="outline"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleAddNewValue}
            >
              Thêm
            </Button>
            <Button
              type="button"
              color="gray"
              variant="ghost"
              size="sm"
              icon={<X className="w-4 h-4" />}
              onClick={() => {
                setShowAddValue(false);
                setNewValueLabel("");
                setNewValueColor("");
              }}
            />
          </div>
        </div>
      )}

      <Select
        name={`attribute_${attribute.id}`}
        options={localValues.map((val) => ({
          value: val.value || val.id,
          label: val.label || val.value,
        }))}
        value={selectedValue}
        onChange={handleSelectChange}
        placeholder={`Chọn ${attribute.name.toLowerCase()}`}
        required={attribute.isRequired}
        clearable
        iconLeft={<Tag className="w-5 h-5 text-primary-6" />}
      />
    </div>
  );
}

