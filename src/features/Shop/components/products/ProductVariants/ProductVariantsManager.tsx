import { useState, useEffect } from "react";
import { Plus, Trash2, DollarSign, Package, Lightbulb } from "lucide-react";
import Button from "@/foundation/components/buttons/Button";
import Input from "@/foundation/components/input/Input";
import ImageUpload from "@/foundation/components/input/upload/ImageUpload";
import Select from "@/foundation/components/input/Select";
import { userCategoriesApi } from "@/core/api/categories";

export interface ProductVariant {
  id?: string;
  attributes: Record<string, string>; // { "Màu sắc": "Đỏ", "Kích thước": "M" }
  price: number;
  stock: number;
  image?: { url: string; publicId?: string } | null;
  sku?: string;
}

interface ProductVariantsManagerProps {
  variantAttributes?: Array<{
    id: string;
    name: string;
    values: Array<{ id: string; value: string; label?: string; colorCode?: string }>;
  }>;
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
  basePrice?: number;
  baseStock?: number;
  onImageUpload?: (file: File) => Promise<{ url: string; publicId?: string }>;
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
  const [fetchedVariantAttributes, setFetchedVariantAttributes] = useState<
    Array<{
      id: string;
      name: string;
      values: Array<{ id: string; value: string; label?: string; colorCode?: string }>;
    }>
  >([]);
  const [loadingAttributes, setLoadingAttributes] = useState(false);

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
    }
  }, [variants]);

  // Fetch variant attributes from category when categoryId is provided
  useEffect(() => {
    const fetchCategoryVariantAttributes = async () => {
      if (!categoryId) {
        setFetchedVariantAttributes([]);
        return;
      }

      setLoadingAttributes(true);
      try {
        const categoryResponse = await userCategoriesApi.getCategory(categoryId);
        if (categoryResponse.success && categoryResponse.data) {
          const category = categoryResponse.data as any;
          const categoryAttributes = category.attributes || [];

          // Filter variant attributes (Màu sắc, Kích thước, Size, Giới tính)
          const variantAttrs = categoryAttributes
            .filter(
              (attr: any) =>
                attr.name === "Màu sắc" ||
                attr.name === "Kích thước" ||
                attr.name === "Size" ||
                attr.name === "Giới tính"
            )
            .map((attr: any) => ({
              id: attr.id || attr._id || `attr-${attr.name}`,
              name: attr.name,
              values: (attr.values || []).map((val: any) => ({
                id: val.id || val._id || `val-${val.value}`,
                value: val.value || val.id,
                label: val.label || val.value,
                colorCode: val.colorCode,
              })),
            }));

          setFetchedVariantAttributes(variantAttrs);
        }
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
  const generateCombinations = (): ProductVariant[] => {
    if (variantAttributes.length === 0) return [];

    const combinations: ProductVariant[] = [];

    // Recursive function to generate combinations
    const generate = (index: number, current: Record<string, string>) => {
      if (index === variantAttributes.length) {
        combinations.push({
          attributes: { ...current },
          price: basePrice,
          stock: baseStock,
        });
        return;
      }

      const attr = variantAttributes[index];
      for (const value of attr.values) {
        current[attr.name] = value.value || value.id;
        generate(index + 1, current);
      }
    };

    generate(0, {});
    return combinations;
  };

  const handleGenerateVariants = () => {
    const combinations = generateCombinations();
    setLocalVariants(combinations);
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
    const updated = localVariants.filter((_, i) => i !== index);
    setLocalVariants(updated);
    onChange(updated);
  };

  const handleAddVariant = () => {
    const newVariant: ProductVariant = {
      attributes: {},
      price: basePrice,
      stock: baseStock,
    };
    setLocalVariants([...localVariants, newVariant]);
    onChange([...localVariants, newVariant]);
  };

  // Get display name for variant
  const getVariantDisplayName = (variant: ProductVariant): string => {
    const attrValues = Object.entries(variant.attributes)
      .map(([key, value]) => `${key}: ${value}`)
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
    setLocalVariants(updated);
    onChange(updated);
  };

  const handleRemoveAttribute = (index: number, attrName: string) => {
    const updated = [...localVariants];
    const newAttributes = { ...updated[index].attributes };
    delete newAttributes[attrName];
    updated[index] = {
      ...updated[index],
      attributes: newAttributes,
    };
    setLocalVariants(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-7">Quản lý biến thể sản phẩm</h3>
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
              size="md"
              onClick={handleGenerateVariants}
            >
              Tạo tự động
            </Button>
          )}
          <Button type="button" color="blue" variant="solid" size="md" onClick={handleAddVariant}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm thủ công
          </Button>
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
                {variantAttributes.map((attr) => (
                  <span
                    key={attr.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-6/10 rounded-md border border-primary-6/20"
                  >
                    <span className="text-xs font-medium text-primary-7">{attr.name}</span>
                    <span className="text-xs text-primary-6">({attr.values.length} tùy chọn)</span>
                  </span>
                ))}
              </div>
              <p className="text-xs text-primary-6 mt-1.5">
                Nhấn "Tạo tự động" để tạo tất cả tổ hợp biến thể từ các thuộc tính trên.
              </p>
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
        <div className="space-y-4">
          {localVariants.map((variant, index) => (
            <div
              key={index}
              className="p-4 bg-neutral-2 rounded-lg border border-border-1 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-neutral-7 mb-2">
                    {getVariantDisplayName(variant)}
                  </h4>

                  {/* Attributes Display/Edit */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(variant.attributes).map(([key, value]) => {
                        const attr = variantAttributes.find((a) => a.name === key);
                        const attrValue = attr?.values.find(
                          (v) => v.value === value || v.id === value
                        );
                        return (
                          <span
                            key={key}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-10 rounded-md border border-primary-6/20"
                          >
                            {attrValue?.colorCode && (
                              <div
                                className="w-3 h-3 rounded-full border border-border-1"
                                style={{ backgroundColor: attrValue.colorCode }}
                              />
                            )}
                            <span className="text-xs font-medium text-primary-7">
                              {key}: {attrValue?.label || value}
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
                    <div className="flex gap-2 items-end">
                      {variantAttributes.length > 0 && (
                        <Select
                          name={`variant_attr_select_${index}`}
                          placeholder="Chọn thuộc tính từ danh sách"
                          options={variantAttributes
                            .filter((attr) => !variant.attributes[attr.name])
                            .map((attr) => ({
                              value: attr.name,
                              label: attr.name,
                            }))}
                          onChange={(attrName) => {
                            if (attrName) {
                              const attr = variantAttributes.find((a) => a.name === attrName);
                              if (attr && attr.values.length > 0) {
                                // Auto-select first value
                                handleAttributeChange(
                                  index,
                                  attrName,
                                  attr.values[0].value || attr.values[0].id
                                );
                              } else {
                                handleAttributeChange(index, attrName, "");
                              }
                            }
                          }}
                          clearable
                          className="flex-1"
                        />
                      )}
                      <div
                        className={`flex gap-2 ${variantAttributes.length > 0 ? "flex-1" : "w-full"}`}
                      >
                        <Input
                          name={`variant_attr_custom_name_${index}`}
                          placeholder="Hoặc nhập tên thuộc tính tùy chỉnh"
                          className="flex-1 text-sm"
                          onKeyPress={(e: any) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const attrName = e.target.value.trim();
                              if (attrName && !variant.attributes[attrName]) {
                                handleAttributeChange(index, attrName, "");
                                e.target.value = "";
                              }
                            }
                          }}
                        />
                        <Button
                          type="button"
                          color="blue"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const input = document.querySelector(
                              `input[name="variant_attr_custom_name_${index}"]`
                            ) as HTMLInputElement;
                            if (input) {
                              const attrName = input.value.trim();
                              if (attrName && !variant.attributes[attrName]) {
                                handleAttributeChange(index, attrName, "");
                                input.value = "";
                              }
                            }
                          }}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Attribute Value Input */}
                    {Object.keys(variant.attributes).length > 0 && (
                      <div className="space-y-2">
                        {Object.entries(variant.attributes).map(([key, value]) => {
                          const attr = variantAttributes.find((a) => a.name === key);
                          if (attr && attr.values.length > 0) {
                            // Show select for predefined values
                            return (
                              <div key={key} className="flex gap-2 items-center">
                                <span className="text-xs font-medium text-neutral-7 w-24">
                                  {key}:
                                </span>
                                <Select
                                  name={`variant_attr_value_${index}_${key}`}
                                  placeholder={`Chọn ${key}`}
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
                                <span className="text-xs font-medium text-neutral-7 w-24">
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Variant Image */}
                <div className="space-y-2">
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
                    height="h-32"
                  />
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Input
                    name={`variant_price_${index}`}
                    label="Giá (VNĐ)"
                    type="number"
                    placeholder="Nhập giá"
                    value={variant.price || ""}
                    onChange={(e) =>
                      handleVariantChange(index, "price", Number(e.target.value) || 0)
                    }
                    min={0}
                    iconLeft={<DollarSign className="w-4 h-4 text-primary-6" />}
                  />
                </div>

                {/* Stock */}
                <div className="space-y-2">
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
              </div>

              {/* SKU (Optional) */}
              <div className="max-w-xs">
                <Input
                  name={`variant_sku_${index}`}
                  label="SKU (Mã sản phẩm)"
                  placeholder="Nhập SKU (tùy chọn)"
                  value={variant.sku || ""}
                  onChange={(e) => handleVariantChange(index, "sku", e.target.value)}
                />
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
