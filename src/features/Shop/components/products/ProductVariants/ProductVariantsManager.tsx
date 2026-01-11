import { useState, useEffect, useRef } from "react";
import { Trash2, DollarSign, Package, Lightbulb } from "lucide-react";
import Button from "@/foundation/components/buttons/Button";
import Input from "@/foundation/components/input/Input";
import ImageUpload from "@/foundation/components/input/upload/ImageUpload";
import Select from "@/foundation/components/input/Select";
import Checkbox from "@/foundation/components/input/Checkbox";
import { userAttributeTypesApi } from "@/core/api/attribute-type";
import { toastUtils } from "@/shared/utils/toast.utils";
import type { UploadedImageAsset } from "../types";

const SKU_PREFIX = "SSKU";

const formatNumberVN = (num: number) => new Intl.NumberFormat("vi-VN").format(num);
const parseNumberInput = (value: string) => {
  const numeric = Number((value || "").replace(/[^\d]/g, ""));
  return Number.isNaN(numeric) ? 0 : numeric;
};

const normalizeValue = (value: string): string =>
  (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .trim();

const buildAttributeToken = (value: string): string => {
  const sanitized = normalizeValue(value);
  if (!sanitized) return "";
  const words = sanitized.split(/\s+/);
  if (words.length === 1) {
    return words[0].slice(0, 4).toUpperCase();
  }
  return words
    .map((word) => word[0])
    .join("")
    .slice(0, 4)
    .toUpperCase();
};

const generateSkuCode = (
  attributes: Record<string, string>,
  index: number,
  batchId: string
): string => {
  const tokens = Object.keys(attributes)
    .sort()
    .map((key) => buildAttributeToken(attributes[key]))
    .filter(Boolean);

  const attrSegment = tokens.join("-") || "VAR";
  const suffix = (index + 1).toString().padStart(3, "0");
  return `${SKU_PREFIX}-${batchId}-${attrSegment}-${suffix}`;
};

const shouldAutoUpdateSku = (sku?: string) => !sku || sku.startsWith(`${SKU_PREFIX}-`);

const applyAutoSkuToVariants = (variants: ProductVariant[], batchId: string) =>
  variants.map((variant, idx) =>
    shouldAutoUpdateSku(variant.sku)
      ? {
          ...variant,
          sku: generateSkuCode(variant.attributes, idx, batchId),
        }
      : variant
  );

export interface ProductVariant {
  id?: string;
  attributes: Record<string, string>; // { "Màu sắc": "Đỏ", "Kích thước": "M" }
  price: number;
  stock: number;
  image?: UploadedImageAsset | null;
  sku?: string;
}

interface ProductVariantsManagerProps {
  variantAttributes?: Array<{
    id: string;
    name: string;
    code?: string;
    helperText?: string;
    values: Array<{ id: string; value: string; label?: string; colorCode?: string }>;
  }>;
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
  basePrice?: number;
  baseStock?: number;
  onImageUpload?: (file: File) => Promise<UploadedImageAsset>;
  categoryId?: string; // Category ID to fetch variant attributes
}

export default function ProductVariantsManager({
  variantAttributes: propVariantAttributes = [],
  variants,
  onChange,
  basePrice = 0,
  baseStock = 0,
  onImageUpload,
  categoryId,
}: ProductVariantsManagerProps) {
  const [localVariants, setLocalVariants] = useState<ProductVariant[]>(variants);
  const [priceDisplays, setPriceDisplays] = useState<Record<number, string>>({});
  const [fetchedVariantAttributes, setFetchedVariantAttributes] = useState<
    Array<{
      id: string;
      name: string;
      code?: string;
      helperText?: string;
      values: Array<{ id: string; value: string; label?: string; colorCode?: string }>;
    }>
  >([]);
  const [loadingAttributes, setLoadingAttributes] = useState(false);
  const [selectedAttributeIds, setSelectedAttributeIds] = useState<Record<string, boolean>>({});
  const skuBatchRef = useRef<string>(Date.now().toString(36).toUpperCase());
  const getAttributeKey = (attr: (typeof variantAttributes)[number]) => attr.code || attr.name;
  const findAttributeByKey = (key: string) =>
    variantAttributes.find((attr) => getAttributeKey(attr) === key);

  const ensureAutoSku = (variantsList: ProductVariant[]) =>
    applyAutoSkuToVariants(variantsList, skuBatchRef.current);

  // Merge prop variant attributes with fetched ones
  const variantAttributes = [
    ...propVariantAttributes,
    ...fetchedVariantAttributes.filter(
      (fetched) => !propVariantAttributes.find((prop) => prop.name === fetched.name)
    ),
  ];

  useEffect(() => {
    // Update local variants when variants prop changes
    // Only update if the length or content actually changed
    const variantsChanged =
      localVariants.length !== variants.length ||
      variants.some((v, i) => {
        const localV = localVariants[i];
        return (
          !localV ||
          JSON.stringify(v.attributes) !== JSON.stringify(localV.attributes) ||
          v.price !== localV.price ||
          v.stock !== localV.stock
        );
      });

    if (variantsChanged) {
      setLocalVariants(variants);
      // Initialize price displays
      const newPriceDisplays: Record<number, string> = {};
      variants.forEach((v, idx) => {
        newPriceDisplays[idx] = v.price ? formatNumberVN(v.price) : "";
      });
      setPriceDisplays(newPriceDisplays);
    }
  }, [variants]);

  // Fetch variant attributes from category when categoryId is provided
  useEffect(() => {
    setSelectedAttributeIds((prev) => {
      const next = { ...prev };
      let changed = false;

      // Remove attributes no longer available
      Object.keys(next).forEach((attrId) => {
        if (!variantAttributes.some((attr) => attr.id === attrId)) {
          delete next[attrId];
          changed = true;
        }
      });

      // Add new attributes default to true
      variantAttributes.forEach((attr) => {
        if (next[attr.id] === undefined) {
          next[attr.id] = true;
          changed = true;
        }
      });

      if (!changed) return prev;
      return next;
    });
  }, [variantAttributes]);

  useEffect(() => {
    const fetchCategoryVariantAttributes = async () => {
      if (!categoryId) {
        setFetchedVariantAttributes([]);
        return;
      }

      setLoadingAttributes(true);
      try {
        const response = await userAttributeTypesApi.getAttributeTypesByCategory(categoryId);
        const attributes = Array.isArray(response.data) ? response.data : [];
        const variantAttrs = attributes
          .filter((attr: any) => Array.isArray(attr.values) && attr.values.length > 0)
          .map((attr: any) => ({
            id: attr.id || attr._id || `attr-${attr.name}`,
            name: attr.name,
            code: attr.code,
            helperText: attr.helperText,
            values: (attr.values || []).map((val: any) => ({
              id: val.id || val._id || `val-${val.value}`,
              value: val.value || val.id,
              label: val.label || val.value,
              colorCode: val.colorCode,
            })),
          }));
        setFetchedVariantAttributes(variantAttrs);
      } catch (error) {
        console.error("Error fetching category variant attributes:", error);
        setFetchedVariantAttributes([]);
      } finally {
        setLoadingAttributes(false);
      }
    };

    fetchCategoryVariantAttributes();
  }, [categoryId]);

  // Generate all possible combinations from variant attributes
  const MAX_VARIANT_COMBINATIONS = 500;
  const activeVariantAttributes = variantAttributes.filter(
    (attr) => selectedAttributeIds[attr.id] !== false
  );

  const handleToggleAttributeSelection = (attrId: string, enabled: boolean) => {
    setSelectedAttributeIds((prev) => ({
      ...prev,
      [attrId]: enabled,
    }));
  };

  const countCombinations = () => {
    if (activeVariantAttributes.length === 0) return 0;
    return activeVariantAttributes.reduce((total, attr) => total * (attr.values.length || 1), 1);
  };

  const generateCombinations = (): ProductVariant[] => {
    if (activeVariantAttributes.length === 0) return [];

    const combinations: ProductVariant[] = [];

    // Recursive function to generate combinations
    const generate = (index: number, current: Record<string, string>) => {
      if (index === activeVariantAttributes.length) {
        combinations.push({
          attributes: { ...current },
          price: basePrice,
          stock: baseStock,
        });
        return;
      }

      const attr = activeVariantAttributes[index];
      for (const value of attr.values) {
        const attrKey = getAttributeKey(attr);
        current[attrKey] = value.value || value.id;
        generate(index + 1, current);
      }
    };

    generate(0, {});
    return combinations;
  };

  const handleGenerateVariants = () => {
    const totalCombinations = countCombinations();
    if (totalCombinations === 0) {
      toastUtils.info("Vui lòng bật ít nhất một thuộc tính có giá trị để tạo biến thể.");
      return;
    }

    if (totalCombinations > MAX_VARIANT_COMBINATIONS) {
      toastUtils.warning(
        `Có ${totalCombinations.toLocaleString()} tổ hợp biến thể. Vui lòng giảm số thuộc tính hoặc giá trị trước khi tạo (giới hạn ${MAX_VARIANT_COMBINATIONS}).`
      );
      return;
    }

    const combinations = ensureAutoSku(generateCombinations());
    setLocalVariants(combinations);
    // Initialize price displays for new combinations
    const newPriceDisplays: Record<number, string> = {};
    combinations.forEach((v, idx) => {
      newPriceDisplays[idx] = v.price ? formatNumberVN(v.price) : "";
    });
    setPriceDisplays(newPriceDisplays);
    onChange(combinations);
  };

  const handleVariantChange = (index: number, field: keyof ProductVariant, value: any) => {
    const updated = [...localVariants];
    updated[index] = { ...updated[index], [field]: value };
    setLocalVariants(updated);
    onChange(updated);
  };

  const handleVariantImageChange = (
    index: number,
    image: { url: string; publicId?: string } | null
  ) => {
    const updated = [...localVariants];
    updated[index] = { ...updated[index], image };
    setLocalVariants(updated);
    onChange(updated);
  };

  const handleRemoveVariant = (index: number) => {
    const updated = ensureAutoSku(localVariants.filter((_, i) => i !== index));
    setLocalVariants(updated);
    // Update price displays after removing variant
    setPriceDisplays((prev) => {
      const newDisplays = { ...prev };
      delete newDisplays[index];
      return newDisplays;
    });
    onChange(updated);
  };

  // Get display name for variant
  const getVariantDisplayName = (variant: ProductVariant): string => {
    const attrValues = Object.entries(variant.attributes)
      .map(([key, value]) => {
        const attr = findAttributeByKey(key);
        const displayKey = attr?.name || key;
        const displayValue =
          attr?.values.find((v) => v.value === value || v.id === value)?.label || value;
        return `${displayKey}: ${displayValue}`;
      })
      .join(", ");
    return attrValues || "Biến thể mới";
  };

  const handleAttributeChange = (index: number, attrName: string, attrValue: string) => {
    const updated = [...localVariants];
    updated[index] = {
      ...updated[index],
      attributes: {
        ...updated[index].attributes,
        [attrName]: attrValue,
      },
    };
    const updatedWithSku = ensureAutoSku(updated);
    setLocalVariants(updatedWithSku);
    onChange(updatedWithSku);
  };

  const handleRemoveAttribute = (index: number, attrName: string) => {
    const updated = [...localVariants];
    const newAttributes = { ...updated[index].attributes };
    delete newAttributes[attrName];
    updated[index] = {
      ...updated[index],
      attributes: newAttributes,
    };
    const updatedWithSku = ensureAutoSku(updated);
    setLocalVariants(updatedWithSku);
    onChange(updatedWithSku);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        <div>
          <p className="text-sm text-neutral-5 mt-1">
            Tạo các biến thể với giá, số lượng và hình ảnh riêng cho mỗi tổ hợp thuộc tính
          </p>
        </div>
        <div className="flex gap-2">
          {variantAttributes.length > 0 && (
            <Button
              type="button"
              color="blue"
              variant="outline"
              size="sm"
              onClick={handleGenerateVariants}
            >
              Tạo tự động
            </Button>
          )}
        </div>
      </div>

      {loadingAttributes && (
        <div className="p-3 bg-primary-10/30 rounded-lg border border-primary-6/20">
          <p className="text-xs text-primary-7 flex items-center gap-2">
            <span className="animate-spin">⏳</span>
            Đang tải thuộc tính biến thể từ danh mục...
          </p>
        </div>
      )}

      {!loadingAttributes && variantAttributes.length === 0 && (
        <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
          <p className="text-xs text-warning-7">
            💡 Ngành hàng này không có thuộc tính biến thể. Bạn có thể thêm biến thể thủ công với
            các thuộc tính tùy chỉnh.
          </p>
        </div>
      )}

      {!loadingAttributes && variantAttributes.length > 0 && (
        <div className="p-3 bg-primary-10/30 rounded-lg border border-primary-6/20">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-primary-7 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium text-primary-7 mb-1">
                💡 Gợi ý biến thể từ danh mục:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {variantAttributes.map((attr) => {
                  const isSelected = selectedAttributeIds[attr.id] !== false;
                  return (
                  <span
                    key={attr.id}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border ${
                        isSelected
                          ? "bg-primary-6/10 border-primary-6/20 text-primary-7"
                          : "bg-neutral-2 border-border-1 text-neutral-5"
                      }`}
                  >
                      <span className="text-xs font-medium">{attr.name}</span>
                      <span className="text-xs">({attr.values.length} tùy chọn)</span>
                  </span>
                  );
                })}
              </div>
              <p className="text-xs text-primary-6 mt-1.5">
                Nhấn "Tạo tự động" để tạo tất cả tổ hợp biến thể từ các thuộc tính đang bật bên dưới.
              </p>
              <div className="mt-3 border-t border-primary-6/20 pt-3">
                <p className="text-xs font-semibold text-primary-7 mb-2">
                  Chọn thuộc tính dùng cho "Tạo tự động" ({activeVariantAttributes.length}/
                  {variantAttributes.length})
                </p>
                <div className="grid gap-2 md:grid-cols-2">
                  {variantAttributes.map((attr) => {
                    const isSelected = selectedAttributeIds[attr.id] !== false;
                    return (
                      <div
                        key={attr.id}
                        className={`flex items-center justify-between rounded-md border px-3 py-2 ${
                          isSelected
                            ? "bg-primary-6/10 border-primary-6/40"
                            : "bg-neutral-1 border-border-1"
                        }`}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            handleToggleAttributeSelection(attr.id, checked === true)
                          }
                          label={<span className="text-xs font-medium text-neutral-7">{attr.name}</span>}
                          wrapperClassName="justify-start"
                          className="!p-0"
                          size="sm"
                        />
                        <span className="text-[11px] text-neutral-5">{attr.values.length} tùy chọn</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[11px] text-neutral-5 mt-2">
                  Hệ thống chỉ tạo biến thể cho các thuộc tính đang bật. Tắt bớt để giảm số tổ hợp.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {localVariants.length === 0 ? (
        <div className="p-8 bg-neutral-2 rounded-lg border border-border-1 text-center">
          <Package className="w-12 h-12 text-neutral-4 mx-auto mb-3" />
          <p className="text-sm font-medium text-neutral-6 mb-1">Chưa có biến thể nào</p>
          <p className="text-xs text-neutral-5">
            Nhấn "Tạo tự động" để tạo tất cả tổ hợp hoặc "Thêm thủ công" để tạo từng biến thể
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {localVariants.map((variant, index) => (
            <div
              key={index}
              className="p-3 md:p-4 bg-neutral-2 rounded-lg border border-border-1 space-y-3 md:space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h4 className="text-xs md:text-sm font-semibold text-neutral-7">
                    {getVariantDisplayName(variant)}
                  </h4>
                    {variant.sku && (
                      <span className="text-[11px] font-mono text-neutral-5 bg-neutral-1 border border-border-1 px-2 py-0.5 rounded">
                        {variant.sku}
                      </span>
                    )}
                  </div>

                  {/* Attributes Display/Edit */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(variant.attributes).map(([key, value]) => {
                        const attr = findAttributeByKey(key);
                        const attrValue = attr?.values.find(
                          (v) => v.value === value || v.id === value
                        );
                        return (
                          <span
                            key={key}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-3 rounded-md border border-primary-6/20"
                          >
                            {attrValue?.colorCode && (
                              <div
                                className="w-3 h-3 rounded-full border border-border-1"
                                style={{ backgroundColor: attrValue.colorCode }}
                              />
                            )}
                            <span className="text-[11px] font-medium text-primary-7">
                              {(attr?.name || key)}: {attrValue?.label || value}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveAttribute(index, key)}
                              className="ml-1 text-primary-6 hover:text-primary-8"
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </span>
                        );
                      })}
                    </div>

                    {/* Add Attribute Form */}
                    {variantAttributes.length > 0 && (
                      <Select
                        name={`variant_attr_select_${index}`}
                        placeholder="Chọn thuộc tính từ danh sách"
                        options={variantAttributes
                          .filter((attr) => !variant.attributes[getAttributeKey(attr)])
                          .map((attr) => ({
                            value: getAttributeKey(attr),
                            label: attr.name,
                          }))}
                        onChange={(attrKey) => {
                          if (attrKey) {
                            const attr = findAttributeByKey(attrKey);
                            if (attr && attr.values.length > 0) {
                              handleAttributeChange(
                                index,
                                attrKey,
                                attr.values[0].value || attr.values[0].id
                              );
                            }
                          }
                        }}
                        clearable
                        className="w-full md:w-1/2"
                      />
                    )}

                    {/* Attribute Value Input */}
                    {Object.keys(variant.attributes).length > 0 && (
                      <div className="space-y-1.5">
                        {Object.entries(variant.attributes).map(([key, value]) => {
                          const attr = findAttributeByKey(key);
                          if (attr && attr.values.length > 0) {
                            // Show select for predefined values
                            return (
                              <div key={key} className="flex gap-2 items-center">
                                <span className="text-[11px] font-medium text-neutral-6 w-24">
                                  {attr.name}:
                                </span>
                                <Select
                                  name={`variant_attr_value_${index}_${key}`}
                                  placeholder={`Chọn ${attr.name}`}
                                  options={attr.values.map((v) => ({
                                    value: v.value || v.id,
                                    label: v.label || v.value,
                                  }))}
                                  value={value}
                                  onChange={(newValue) => {
                                    if (newValue) {
                                      handleAttributeChange(index, key, newValue);
                                    }
                                  }}
                                  className="flex-1"
                                />
                              </div>
                            );
                          } else {
                            // Show text input for custom values
                            return (
                              <div key={key} className="flex gap-2 items-center">
                                <span className="text-[11px] font-medium text-neutral-6 w-24">
                                  {key}:
                                </span>
                                <Input
                                  name={`variant_attr_value_${index}_${key}`}
                                  placeholder={`Nhập ${key}`}
                                  value={value}
                                  onChange={(e) =>
                                    handleAttributeChange(index, key, e.target.value)
                                  }
                                  className="flex-1"
                                />
                              </div>
                            );
                          }
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  color="red"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveVariant(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Variant Image */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-7">
                    Hình ảnh biến thể
                  </label>
                  <ImageUpload
                    label=""
                    value={variant.image || null}
                    onChange={(file) => {
                      if (file) {
                        handleVariantImageChange(index, file);
                      } else {
                        handleVariantImageChange(index, null);
                      }
                    }}
                    onUpload={onImageUpload}
                    aspectRatio="square"
                    width="w-full"
                    height="h-24"
                  />
                </div>

                {/* Price */}
                <div className="space-y-1.5">
                  <Input
                    name={`variant_price_${index}`}
                    label="Giá (VNĐ)"
                    type="text"
                    inputMode="numeric"
                    placeholder="Nhập giá"
                    value={priceDisplays[index] || ""}
                    onChange={(e) => {
                      const sanitized = e.target.value.replace(/[^\d]/g, "");
                      setPriceDisplays((prev) => ({
                        ...prev,
                        [index]: sanitized,
                      }));
                      const numeric = parseNumberInput(sanitized);
                      handleVariantChange(index, "price", numeric);
                    }}
                    onBlur={() => {
                      const numeric = parseNumberInput(priceDisplays[index] || "");
                      setPriceDisplays((prev) => ({
                        ...prev,
                        [index]: numeric ? formatNumberVN(numeric) : "",
                      }));
                    }}
                    onFocus={() => {
                      const numeric = parseNumberInput(priceDisplays[index] || "");
                      setPriceDisplays((prev) => ({
                        ...prev,
                        [index]: numeric ? String(numeric) : "",
                      }));
                    }}
                    iconLeft={<DollarSign className="w-4 h-4 text-primary-6" />}
                  />
                </div>

                {/* Stock */}
                <div className="space-y-1.5">
                  <Input
                    name={`variant_stock_${index}`}
                    label="Số lượng"
                    type="number"
                    placeholder="Nhập số lượng"
                    value={variant.stock || ""}
                    onChange={(e) =>
                      handleVariantChange(index, "stock", Number(e.target.value) || 0)
                    }
                    min={0}
                    iconLeft={<Package className="w-4 h-4 text-primary-6" />}
                  />
              </div>

                {/* SKU */}
                <div className="space-y-1.5">
                <Input
                  name={`variant_sku_${index}`}
                    label="SSKU (Tự động)"
                    placeholder="Nhập SKU tùy chỉnh"
                  value={variant.sku || ""}
                  onChange={(e) => handleVariantChange(index, "sku", e.target.value)}
                    description="Có thể sửa lại nếu cần."
                />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {localVariants.length > 0 && (
        <div className="p-3 bg-primary-10/30 rounded-lg border border-primary-6/20">
          <p className="text-xs text-primary-7">
            💡 Tổng số biến thể: <strong>{localVariants.length}</strong> | Tổng số lượng tồn kho:{" "}
            <strong>{localVariants.reduce((sum, v) => sum + (v.stock || 0), 0)}</strong>
          </p>
        </div>
      )}
    </div>
  );
}
