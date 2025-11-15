import { useEffect, useState } from "react";
import * as Form from "@radix-ui/react-form";
import { Pencil, CheckCircle2, FolderTree, Edit } from "lucide-react";
import Input from "@/foundation/components/input/Input";
import TextArea from "@/foundation/components/input/TextArea";
import Button from "@/foundation/components/buttons/Button";
import ImageUploadMulti from "@/foundation/components/input/upload/ImageUploadMulti";
import Section from "@/foundation/components/sections/Section";
import SectionTitle from "@/foundation/components/sections/SectionTitle";
import CategorySelectionModal from "./CategorySelectionModal";
import SelectAttribute from "./SelectAttribute";
import { ProductVariantsManager } from "@/features/Shop/components/products/ProductVariants";
import type { ProductVariant } from "@/features/Shop/components/products/ProductVariants";
import { useSelector, useDispatch } from "react-redux";
import { ProductService } from "@/features/Shop/api";
import { userCategoriesApi } from "@/core/api/categories";
import { imagesApi } from "@/core/api/images";
import { addToast } from "@/app/store/slices/toast";
import Loading from "@/foundation/components/loading/Loading";
import { useNavigate, useParams } from "react-router-dom";
import { selectShopInfo } from "@/features/Shop/slice/shop.selector";
import { NAVIGATION_CONFIG } from "@/app/router/naviagtion.config";

export default function EditProduct() {
  const { productId } = useParams<{ productId: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const shopInfo = useSelector(selectShopInfo);

  const [data, setData] = useState({
    shop_id: "",
    subcategory_id: "",
    subCategoryId: "",
    categoryId: "", // Parent category ID for fetching variant attributes
    name: "",
    description: "",
    base_price: 0,
    product_images: [] as string[],
    product_attributes: [] as any[],
    attributes: [] as any[],
    product_variants: [] as any[],
    variants: [] as ProductVariant[],
    stock_quantity: 0,
    weight: 0,
    is_active: true,
    warrantyInfo: "",
    dimensions: "",
    metaKeywords: "",
  });

  const [openCategory, setOpenCategory] = useState(false);
  const [attributes, setAttributes] = useState<any[]>([]);
  const [selectedPath, setSelectedPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [productImages, setProductImages] = useState<{ url: string; publicId?: string }[]>([]);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!productId) return;

      setLoading(true);
      try {
        const productResponse = await ProductService.getProduct(productId);
        if (productResponse.success && productResponse.data) {
          const product = productResponse.data;

          if (product) {
            const productAttrs = (product as any).attributes || [];
            // Handle images - can be ObjectIds or populated objects
            const images = Array.isArray(product.images)
              ? product.images.map((img: any) => {
                  // If populated, use url directly
                  if (typeof img === "object" && img.url) {
                    return img.url;
                  }
                  // If ObjectId string, return as is (will be handled by backend)
                  return typeof img === "string" ? img : img._id || img;
                })
              : [];

            // Convert variants to ProductVariant format
            const convertedVariants: ProductVariant[] = (product.variants || []).map((v: any) => ({
              id: v._id || v.id,
              attributes: v.attributes || {},
              price: v.price || product.price || 0,
              stock: v.stock || 0,
              image: v.image
                ? typeof v.image === "string"
                  ? { url: v.image }
                  : { url: v.image.url || v.image }
                : null,
              sku: v.sku || undefined,
            }));

            setData({
              shop_id: (product as any).shopId || shopInfo?._id || "",
              subcategory_id: product.subCategoryId || "",
              subCategoryId: product.subCategoryId || "",
              categoryId: product.categoryId || "",
              name: product.name || "",
              description: product.description || "",
              base_price: product.price || 0,
              product_images: images,
              product_attributes: productAttrs,
              attributes: productAttrs,
              product_variants: product.variants || [],
              variants: convertedVariants,
              stock_quantity: product.stock || 0,
              weight: product.weight || 0,
              is_active: product.isActive !== false,
              warrantyInfo: product.warrantyInfo || "",
              dimensions: product.dimensions || "",
              metaKeywords: product.metaKeywords || "",
            });

            // Set product images - convert URLs to image objects
            if (images.length > 0) {
              setProductImages(
                images.map((img: any) => {
                  if (typeof img === "string") {
                    return { url: img };
                  }
                  return { url: img.url || img._id, publicId: img.publicId };
                })
              );
            }

            // Fetch category info if subcategory_id exists
            if (product.subCategoryId) {
              try {
                const categoriesResponse = await userCategoriesApi.getCategories();
                if (categoriesResponse.success && categoriesResponse.data) {
                  const categories =
                    categoriesResponse.data.categories || categoriesResponse.data || [];
                  // Find parent category by checking subcategories
                  for (const cat of categories) {
                    try {
                      const subCatsResponse = await userCategoriesApi.getSubCategories(cat._id);
                      if (subCatsResponse.success) {
                        const subCats = subCatsResponse.data?.subCategories || [];
                        const foundSub = subCats.find((sub) => sub._id === product.subCategoryId);
                        if (foundSub) {
                          setAttributes((cat as any).attributes || []);
                          setSelectedPath(`${cat.name} > ${foundSub.name}`);
                          setData((prev) => ({
                            ...prev,
                            categoryId: cat._id, // Save parent category ID
                          }));
                          break;
                        }
                      }
                    } catch {
                      continue;
                    }
                  }
                }
              } catch (error) {
                console.error("Error fetching categories:", error);
              }
            }
          } else {
            dispatch(addToast({ type: "error", message: "Không tìm thấy sản phẩm" }));
            navigate(NAVIGATION_CONFIG.listProduct.path);
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        dispatch(addToast({ type: "error", message: "Không thể tải thông tin sản phẩm" }));
      }
      setLoading(false);
    };

    fetchProductData();
  }, [productId, dispatch, navigate]);

  useEffect(() => {
    if (shopInfo?._id) {
      setData((prev) => ({
        ...prev,
        shop_id: shopInfo._id,
      }));
    }
  }, [shopInfo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClose = () => {
    setOpenCategory(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Prepare variants data
      const variantsData = data.variants.map((variant) => ({
        attributes: variant.attributes,
        price: variant.price,
        stock: variant.stock,
        image: variant.image?.url || null,
        sku: variant.sku || undefined,
      }));

      const updateData = {
        name: data.name,
        description: data.description,
        price: data.base_price,
        images: data.product_images,
        stock: data.stock_quantity,
        weight: data.weight,
        isActive: data.is_active,
        subCategoryId: data.subcategory_id || data.subCategoryId,
        attributes: data.product_attributes || data.attributes,
        variants: variantsData.length > 0 ? variantsData : data.product_variants,
        warrantyInfo: data.warrantyInfo,
        dimensions: data.dimensions,
        metaKeywords: data.metaKeywords,
      };

      const response = await ProductService.updateProduct(productId!, updateData);
      if (response.success) {
        dispatch(addToast({ type: "success", message: "Đã cập nhật sản phẩm thành công" }));
        navigate(NAVIGATION_CONFIG.listProduct.path);
      } else {
        dispatch(
          addToast({ type: "error", message: response.message || "Cập nhật sản phẩm thất bại" })
        );
      }
    } catch (error: any) {
      console.error("Error updating product:", error);
      dispatch(
        addToast({
          type: "error",
          message: error?.message || "Có lỗi xảy ra khi cập nhật sản phẩm",
        })
      );
    }
    setLoading(false);
  };

  const handleImageUpload = async (file: File): Promise<{ url: string; publicId?: string }> => {
    try {
      const result = await imagesApi.uploadImage(file);
      return {
        url: result.url,
        publicId: result.publicId,
      };
    } catch (error) {
      dispatch(
        addToast({
          type: "error",
          message: error instanceof Error ? error.message : "Upload ảnh thất bại",
        })
      );
      throw error;
    }
  };

  if (loading && !data.name) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading layout="centered" message="Đang tải thông tin sản phẩm..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex justify-center items-center w-12 h-12 rounded-lg bg-primary-6/20">
          <Pencil className="w-6 h-6 text-primary-6" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-6 to-primary-8 bg-clip-text text-transparent">
          Chỉnh sửa thông tin sản phẩm
        </h2>
      </div>

      <Form.Root onSubmit={handleSubmit} className="space-y-6">
        <Section>
          <SectionTitle>Thông tin cơ bản</SectionTitle>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-neutral-7">Hình ảnh sản phẩm</p>
              <ImageUploadMulti
                label="Upload nhiều ảnh sản phẩm (tối đa 10 ảnh)"
                value={productImages}
                onChange={(images) => {
                  setProductImages(images || []);
                  setData((prev) => ({
                    ...prev,
                    product_images: (images || []).map((img) => img.url),
                  }));
                }}
                onUpload={handleImageUpload}
                maxFiles={10}
                maxSizeInMB={5}
              />
              <p className="text-xs text-neutral-5">
                💡 Ảnh đầu tiên sẽ được sử dụng làm ảnh đại diện của sản phẩm
              </p>
            </div>

            <Input
              name="name"
              label="Tên sản phẩm"
              placeholder="Vui lòng nhập tên sản phẩm + Thương hiệu + Model + Thông số kĩ thuật"
              value={data.name}
              onChange={handleChange}
              required
              iconRight={<CheckCircle2 className="w-5 h-5 text-success" />}
            />

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-neutral-7">Ngành hàng</label>
              <div
                className="flex items-center p-3 bg-neutral-2 rounded-lg border border-border-1 transition-all cursor-pointer hover:border-primary-6 hover:bg-primary-10/10"
                onClick={() => setOpenCategory(true)}
              >
                <FolderTree className="mr-3 w-5 h-5 text-primary-6" />
                <p className="flex-1 text-neutral-7">
                  {selectedPath || "Vui lòng chọn ngành hàng"}
                </p>
                <Edit className="w-5 h-5 text-neutral-4 hover:text-primary-6 transition-colors" />
              </div>
            </div>

            <TextArea
              name="description"
              label="Mô tả sản phẩm"
              value={data.description}
              onChange={handleChange}
              placeholder="Nhập mô tả sản phẩm"
              rows={4}
              required
            />
          </div>
        </Section>

        <Section>
          <SectionTitle>Thông tin chi tiết</SectionTitle>
          {attributes?.length > 0 ? (
            <div className="space-y-6">
              <div className="p-4 bg-primary-10/30 rounded-lg border border-primary-6/20">
                <p className="text-sm font-medium text-primary-7">
                  💡 Điền thông tin thuộc tính để tăng mức độ hiển thị và tìm kiếm cho sản phẩm
                </p>
              </div>
              <div className="space-y-4">
                {attributes
                  .filter(
                    (attr) =>
                      attr.name !== "Màu sắc" &&
                      attr.name !== "Kích thước" &&
                      attr.name !== "Giới tính" &&
                      attr.name !== "Size"
                  )
                  .map((attribute, index) => {
                    // Find initial value from product attributes
                    const productAttr = data.product_attributes.find(
                      (attr: any) =>
                        attr.attribute_type_id === attribute.id ||
                        attr.attributeTypeId === attribute.id ||
                        attr.attribute_type_id === attribute._id ||
                        attr.attributeTypeId === attribute._id
                    );
                    const initialValue = productAttr
                      ? attribute.values?.find(
                          (val: any) =>
                            val.id === productAttr.attribute_value_id ||
                            val.id === productAttr.attributeValueId ||
                            val.value === productAttr.value
                        )?.value || productAttr.value
                      : undefined;

                    return (
                      <SelectAttribute
                        key={`${attribute.id || attribute._id || index}`}
                        attribute={{
                          id: attribute.id || attribute._id || `attr-${index}`,
                          name: attribute.name,
                          values: attribute.values || [],
                          inputType: attribute.inputType || "select",
                          isRequired: attribute.isRequired || false,
                        }}
                        setData={setData}
                        initialValue={initialValue}
                      />
                    );
                  })}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-neutral-2 rounded-lg border border-border-1">
              <p className="text-sm text-neutral-6">
                ℹ️ Có thể điều chỉnh thuộc tính sau khi chọn ngành hàng
              </p>
            </div>
          )}
        </Section>

        <Section>
          <SectionTitle>Thông tin bán hàng</SectionTitle>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                name="base_price"
                label="Giá sản phẩm (VNĐ)"
                type="number"
                placeholder="Nhập giá sản phẩm"
                value={data.base_price || ""}
                onChange={handleChange}
                required
                min={0}
              />
              <Input
                name="stock_quantity"
                label="Số lượng tồn kho"
                type="number"
                placeholder="Nhập số lượng"
                value={data.stock_quantity || ""}
                onChange={handleChange}
                required
                min={0}
              />
              <Input
                name="weight"
                label="Trọng lượng (gram)"
                type="number"
                placeholder="Nhập trọng lượng"
                value={data.weight || ""}
                onChange={handleChange}
                min={0}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="warrantyInfo"
                label="Thông tin bảo hành"
                placeholder="Ví dụ: 12 tháng, đổi mới trong 7 ngày"
                value={data.warrantyInfo}
                onChange={handleChange}
              />
              <Input
                name="dimensions"
                label="Kích thước (Dài x Rộng x Cao)"
                placeholder="Ví dụ: 30x20x15 cm"
                value={data.dimensions}
                onChange={handleChange}
              />
            </div>
            <Input
              name="metaKeywords"
              label="Từ khóa tìm kiếm"
              placeholder="Nhập các từ khóa cách nhau bởi dấu phẩy"
              value={data.metaKeywords}
              onChange={handleChange}
              description="Các từ khóa giúp khách hàng dễ dàng tìm thấy sản phẩm của bạn"
            />
          </div>
        </Section>

        {/* Product Variants Section */}
        <Section>
          <SectionTitle>Biến thể sản phẩm</SectionTitle>
          <div className="space-y-4">
            {(() => {
              const variantAttributes =
                attributes?.filter(
                  (attr: any) =>
                    attr.name === "Màu sắc" ||
                    attr.name === "Kích thước" ||
                    attr.name === "Size" ||
                    attr.name === "Giới tính"
                ) || [];

              // Always show ProductVariantsManager, even if no variant attributes
              // This allows manual variant creation and displays existing variants
              return (
                <ProductVariantsManager
                  variantAttributes={variantAttributes.map((attr: any) => ({
                    id: attr.id || attr._id,
                    name: attr.name,
                    values: attr.values || [],
                  }))}
                  variants={data.variants || []}
                  onChange={(variants) => {
                    setData((prev) => ({ ...prev, variants }));
                  }}
                  basePrice={data.base_price}
                  baseStock={data.stock_quantity}
                  onImageUpload={handleImageUpload}
                  categoryId={data.categoryId}
                />
              );
            })()}
          </div>
        </Section>

        <div className="flex gap-4 justify-end pt-4">
          <Button
            type="button"
            color="gray"
            variant="outline"
            size="lg"
            onClick={() => navigate(NAVIGATION_CONFIG.listProduct.path)}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            color="blue"
            variant="outline"
            size="lg"
            loading={loading}
            onClick={() => setData((prev) => ({ ...prev, is_active: false }))}
          >
            Lưu & Ẩn
          </Button>
          <Button
            type="submit"
            color="blue"
            variant="solid"
            size="lg"
            loading={loading}
            onClick={() => setData((prev) => ({ ...prev, is_active: true }))}
          >
            Lưu & Hiển thị
          </Button>
        </div>
      </Form.Root>

      <CategorySelectionModal
        open={openCategory}
        onClose={handleClose}
        setData={setData}
        setAttribute={setAttributes}
        onPathChange={setSelectedPath}
        initialCategoryId={data.subcategory_id || data.subCategoryId}
      />
    </div>
  );
}
