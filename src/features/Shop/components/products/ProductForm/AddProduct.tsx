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
import { useNavigate } from "react-router-dom";
import { createProductStart } from "@/features/Shop/slice/shop.slice";
import { imagesApi } from "@/core/api/images";
import { addToast } from "@/app/store/slices/toast";
import { selectShopInfo } from "@/features/Shop/slice/shop.selector";
import { NAVIGATION_CONFIG } from "@/app/router/naviagtion.config";

export default function AddProduct() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const shopInfo = useSelector(selectShopInfo);

  const [data, setData] = useState({
    subCategoryId: "",
    categoryId: "", // Parent category ID for fetching variant attributes
    name: "",
    description: "",
    price: 0,
    images: [] as string[],
    stock: 0,
    weight: 0,
    isActive: true,
    warrantyInfo: "",
    dimensions: "",
    metaKeywords: "",
    attributes: [] as any[],
    product_attributes: [] as any[],
    variants: [] as ProductVariant[],
  });
  const [openCategory, setOpenCategory] = useState(false);
  const [attributes, setAttributes] = useState<any[]>([]);
  const [selectedPath, setSelectedPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [productImages, setProductImages] = useState<{ url: string; publicId?: string }[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "price" || name === "stock" || name === "weight") {
      setData((prev) => ({
        ...prev,
        [name]: Number(value) || 0,
      }));
    } else {
      setData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleClose = () => {
    setOpenCategory(false);
  };

  useEffect(() => {
    if (!shopInfo) {
      navigate(NAVIGATION_CONFIG.shop.path);
    }
  }, [shopInfo, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shopInfo) {
      dispatch(addToast({ type: "error", message: "Bạn chưa có shop. Vui lòng tạo shop trước." }));
      navigate(NAVIGATION_CONFIG.shop.path);
      return;
    }

    if (!data.subCategoryId) {
      dispatch(addToast({ type: "error", message: "Vui lòng chọn ngành hàng" }));
      return;
    }

    setLoading(true);
    try {
      // Prepare variants data - keep image URLs, saga will handle conversion
      const variantsData = data.variants.map((variant) => ({
        attributes: variant.attributes,
        price: variant.price,
        stock: variant.stock,
        image: variant.image?.url || null,
        sku: variant.sku || undefined,
      }));

      dispatch(
        createProductStart({
          ...data,
          categoryId: data.categoryId,
          variants: variantsData.length > 0 ? variantsData : undefined,
        })
      );

      // Reset form
      setData({
        subCategoryId: "",
        categoryId: "",
        name: "",
        description: "",
        price: 0,
        images: [],
        stock: 0,
        weight: 0,
        isActive: true,
        warrantyInfo: "",
        dimensions: "",
        metaKeywords: "",
        attributes: [],
        product_attributes: [],
        variants: [],
      });
      setSelectedPath("");
      setAttributes([]);
      setProductImages([]);

      navigate(NAVIGATION_CONFIG.listProduct.path);
    } catch (error) {
      dispatch(
        addToast({
          type: "error",
          message: error instanceof Error ? error.message : "Có lỗi xảy ra khi thêm sản phẩm",
        })
      );
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex justify-center items-center w-12 h-12 rounded-lg bg-warning/20">
          <Pencil className="w-6 h-6 text-warning" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-6 to-primary-8 bg-clip-text text-transparent">
          Nhập thông tin cho sản phẩm
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
                    images: (images || []).map((img) => img.url),
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
                  .map((attribute, index) => (
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
                    />
                  ))}
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
                name="price"
                label="Giá sản phẩm (VNĐ)"
                type="number"
                placeholder="Nhập giá sản phẩm"
                value={data.price || ""}
                onChange={handleChange}
                required
                min={0}
              />
              <Input
                name="stock"
                label="Số lượng tồn kho"
                type="number"
                placeholder="Nhập số lượng"
                value={data.stock || ""}
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
              const variantAttributes = attributes
                ? attributes.filter(
                    (attr: any) =>
                      attr.name === "Màu sắc" ||
                      attr.name === "Kích thước" ||
                      attr.name === "Size" ||
                      attr.name === "Giới tính"
                  )
                : [];

              return (
                <ProductVariantsManager
                  variantAttributes={variantAttributes.map((attr: any) => ({
                    id: attr.id || attr._id,
                    name: attr.name,
                    values: attr.values || [],
                  }))}
                  variants={data.variants}
                  onChange={(variants) => {
                    setData((prev) => ({ ...prev, variants }));
                  }}
                  basePrice={data.price}
                  baseStock={data.stock}
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
            onClick={() => setData((prev) => ({ ...prev, isActive: false }))}
          >
            Lưu & Ẩn
          </Button>
          <Button
            type="submit"
            color="blue"
            variant="solid"
            size="lg"
            loading={loading}
            onClick={() => setData((prev) => ({ ...prev, isActive: true }))}
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
      />
    </div>
  );
}
