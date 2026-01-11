import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Form from "@radix-ui/react-form";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Pencil, CheckCircle2, FolderTree, Edit, Sparkles, CircleStop, Cpu, MemoryStick } from "lucide-react";
import Input from "@/foundation/components/input/Input";
import Button from "@/foundation/components/buttons/Button";
import ImageUploadMulti from "@/foundation/components/input/upload/ImageUploadMulti";
import Section from "@/foundation/components/sections/Section";
import SectionTitle from "@/foundation/components/sections/SectionTitle";
import CategorySelectionModal from "./CategorySelectionModal";
import SelectAttribute from "./SelectAttribute";
import AddAttributeTypeModal from "./AddAttributeTypeModal";
import { ProductVariantsManager } from "@/features/Shop/components/products/ProductVariants";
import type { ProductVariant } from "@/features/Shop/components/products/ProductVariants";
import type { UploadedImageAsset } from "@/features/Shop/components/products/types";
import { uploadAndRegisterImage } from "@/features/Shop/components/products/utils/imageUpload";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createProductStart } from "@/features/Shop/slice/shop.slice";
import { addToast } from "@/app/store/slices/toast";
import { selectShopInfo } from "@/features/Shop/slice/shop.selector";
import { NAVIGATION_CONFIG } from "@/app/router/naviagtion.config";
import { aiAssistantApi } from "@/core/api/ai";
import type {
  GenerateProductDescriptionRequest,
  GenerateProductMetaRequest,
} from "@/core/api/ai/type";
import AiFullFormGenerator from "@/foundation/components/ai/AiFullFormGenerator";
import { userAttributeTypesApi } from "@/core/api/attribute-type";

type VariantAttribute = {
  id: string;
  name: string;
  code?: string;
  inputType?: string;
  values: Array<{ id: string; value: string; label?: string; colorCode?: string }>;
};

const normalizeVariantAttribute = (attribute: any): VariantAttribute | null => {
  if (!attribute) return null;

  const rawValues = Array.isArray(attribute.values) ? attribute.values : [];
  const values = rawValues
    .map((val: any) => {
      const valueId = val?.id || val?._id || val?.value || `val-${attribute._id || attribute.id}-${Date.now()}`;
      const valueValue = val?.value || val?.label || val?.name || valueId;
      return {
        id: valueId,
        value: valueValue,
        label: val?.label || val?.value || val?.name || valueValue,
        colorCode: val?.colorCode,
      };
    })
    .filter((item: { value?: string }) => !!item.value);

  if (values.length === 0) return null;

  return {
    id: attribute.id || attribute._id || attribute.attributeTypeId || `attr-${Date.now()}`,
    name: attribute.name || attribute.code || "Thuộc tính",
    code: attribute.code,
    inputType: attribute.inputType,
    values,
  };
};

const mapVariantAttributes = (attributeList: any[] | undefined | null): VariantAttribute[] => {
  if (!Array.isArray(attributeList)) return [];
  return attributeList
    .map((attr) => normalizeVariantAttribute(attr))
    .filter((attr): attr is VariantAttribute => !!attr);
};

type ProductFormState = {
  shopId: string;
  subCategoryId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  images: UploadedImageAsset[];
  stock: number;
  weight: number;
  isActive: boolean;
  warrantyInfo: string;
  dimensions: string;
  metaKeywords: string;
  attributes: any[];
  product_attributes: any[];
  variants: ProductVariant[];
};

 export default function AddProduct() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const shopInfo = useSelector(selectShopInfo);

  const [data, setData] = useState<ProductFormState>({
    shopId: shopInfo?._id || "",
    subCategoryId: "",
    categoryId: "",
    name: "",
    description: "",
    price: 0,
    discount: 0,
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
  const [openCategory, setOpenCategory] = useState(false);
  const [openAddAttributeType, setOpenAddAttributeType] = useState(false);
  const [attributes, setAttributes] = useState<any[]>([]);
  const [variantAttributes, setVariantAttributes] = useState<VariantAttribute[]>([]);
  const [selectedPath, setSelectedPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [productImages, setProductImages] = useState<UploadedImageAsset[]>([]);
  const [aiSpecs, setAiSpecs] = useState({ ram: "", chip: "" });
  const [aiState, setAiState] = useState({
    isGenerating: false,
    isStreaming: false,
    isGeneratingMeta: false,
    error: "",
  });
  // Hiển thị giá với format nghìn (VNĐ) trong input
  const [priceDisplay, setPriceDisplay] = useState<string>("");
  const streamingTimerRef = useRef<number | null>(null);
  const streamingPlainRef = useRef("");

  const convertPlainToHtml = useCallback((plain: string) => {
    if (!plain.trim()) return "";
    return plain
      .split(/\n{2,}/)
      .map((paragraph) => `<p>${paragraph.trim().replace(/\n/g, "<br/>")}</p>`)
      .join("");
  }, []);

  const clearStreamingTimer = useCallback(() => {
    if (streamingTimerRef.current && typeof window !== "undefined") {
      window.clearInterval(streamingTimerRef.current);
    }
    streamingTimerRef.current = null;
  }, []);

  const stopStreaming = useCallback(() => {
    clearStreamingTimer();
    setAiState((prev) => ({ ...prev, isStreaming: false }));
  }, [clearStreamingTimer]);

  const startStreamingDescription = useCallback(
    (rawContent: string) => {
      clearStreamingTimer();
      const cleaned = rawContent.replace(/\r/g, "").trim();
      if (!cleaned) {
        setData((prev) => ({ ...prev, description: "" }));
        setAiState((prev) => ({ ...prev, isStreaming: false }));
        return;
      }
      if (typeof window === "undefined") {
        setData((prev) => ({ ...prev, description: convertPlainToHtml(cleaned) }));
        setAiState((prev) => ({ ...prev, isStreaming: false }));
        return;
      }
      streamingPlainRef.current = "";
      const chunkSize = 32;
      let cursor = 0;

      setAiState((prev) => ({ ...prev, isStreaming: true, error: "" }));
      setData((prev) => ({ ...prev, description: "" }));

      streamingTimerRef.current = window.setInterval(() => {
        const nextCursor = Math.min(cursor + chunkSize, cleaned.length);
        streamingPlainRef.current += cleaned.slice(cursor, nextCursor);
        cursor = nextCursor;
        setData((prev) => ({
          ...prev,
          description: convertPlainToHtml(streamingPlainRef.current),
        }));
        if (cursor >= cleaned.length) {
          stopStreaming();
        }
      }, 45);
    },
    [clearStreamingTimer, convertPlainToHtml, stopStreaming]
  );

  const quillModules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"],
      ],
    }),
    []
  );

  const quillFormats = useMemo(
    () => ["header", "bold", "italic", "underline", "strike", "list", "bullet", "link"],
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "stock" || name === "weight") {
      setData((prev) => ({
        ...prev,
        [name]: Number(value) || 0,
      }));
      return;
    }

    if (name === "discount") {
      const numericValue = Math.min(100, Math.max(0, Number(value) || 0));
      setData((prev) => ({
        ...prev,
        discount: numericValue,
      }));
      return;
    }

    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Helpers cho format giá VNĐ
  const formatNumberVN = (num: number) => new Intl.NumberFormat("vi-VN").format(num);
  const parseNumber = (str: string) => {
    const n = Number((str || "").replace(/[^\d]/g, ""));
    return Number.isNaN(n) ? 0 : n;
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const numeric = parseNumber(raw);
    setPriceDisplay(raw);
    setData((prev) => ({ ...prev, price: numeric }));
  };

  const handlePriceBlur = () => {
    setPriceDisplay(data.price ? formatNumberVN(data.price) : "");
  };

  const handlePriceFocus = () => {
    setPriceDisplay(data.price ? String(data.price) : "");
  };

  // Đồng bộ hiển thị khi giá thay đổi từ nơi khác (AI fill/reset)
  useEffect(() => {
    setPriceDisplay(data.price ? formatNumberVN(data.price) : "");
  }, [data.price]);

  const handleClose = () => {
    setOpenCategory(false);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchVariantAttributes = async () => {
      if (!data.categoryId) {
        if (isMounted) {
          setVariantAttributes([]);
        }
        return;
      }

      try {
        const response = await userAttributeTypesApi.getAttributeTypesByCategory(data.categoryId);
        if (!isMounted) return;
        const normalized = mapVariantAttributes(response.data);
        setVariantAttributes(normalized);
      } catch (error) {
        if (isMounted) {
          setVariantAttributes([]);
        }
      }
    };

    fetchVariantAttributes();

    return () => {
      isMounted = false;
    };
  }, [data.categoryId]);

  useEffect(() => {
    if (!shopInfo) {
      navigate(NAVIGATION_CONFIG.shop.path);
      return;
    }
    if (shopInfo._id) {
      setData((prev) => ({
        ...prev,
        shopId: shopInfo._id,
      }));
    }
  }, [shopInfo, navigate]);

  useEffect(
    () => () => {
      stopStreaming();
    },
    [stopStreaming]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (aiState.isStreaming) {
      stopStreaming();
    }

    if (!shopInfo) {
      dispatch(addToast({ type: "error", message: "Bạn chưa có shop. Vui lòng tạo shop trước." }));
      navigate(NAVIGATION_CONFIG.shop.path);
      return;
    }

    if (!data.subCategoryId) {
      dispatch(addToast({ type: "error", message: "Vui lòng chọn ngành hàng" }));
      return;
    }

    if (!data.shopId) {
      dispatch(addToast({ type: "error", message: "Không tìm thấy thông tin cửa hàng" }));
      return;
    }

    if (data.images.length === 0) {
      dispatch(addToast({ type: "error", message: "Vui lòng tải lên ít nhất một ảnh sản phẩm" }));
      return;
    }

    if (!data.warrantyInfo.trim()) {
      dispatch(addToast({ type: "error", message: "Vui lòng nhập thông tin bảo hành" }));
      return;
    }

    if (!data.dimensions.trim()) {
      dispatch(addToast({ type: "error", message: "Vui lòng nhập kích thước sản phẩm" }));
      return;
    }

    if (!data.metaKeywords.trim()) {
      dispatch(addToast({ type: "error", message: "Vui lòng nhập từ khóa tìm kiếm" }));
      return;
    }

    setLoading(true);
    try {
      const variantsData = data.variants.map((variant) => ({
        attributes: variant.attributes,
        price: variant.price,
        stock: variant.stock,
        image: variant.image ? { ...variant.image } : null,
        sku: variant.sku || undefined,
      }));

      dispatch(
        createProductStart({
          ...data,
          shopId: data.shopId,
          categoryId: data.categoryId,
          variants: variantsData.length > 0 ? variantsData : undefined,
        })
      );

      setData({
        shopId: shopInfo._id,
        subCategoryId: "",
        categoryId: "",
        name: "",
        description: "",
        price: 0,
        discount: 0,
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
      setAiSpecs({ ram: "", chip: "" });
      setAiState((prev) => ({ ...prev, error: "", isStreaming: false }));

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

  const handleImageUpload = async (file: File): Promise<UploadedImageAsset> => {
    try {
      return await uploadAndRegisterImage(file);
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

  const handleDescriptionChange = (value: string) => {
    setData((prev) => ({
      ...prev,
      description: value,
    }));
  };

  const handleGenerateContent = async () => {
    if (!data.name.trim()) {
      dispatch(addToast({ type: "error", message: "Vui lòng nhập tên sản phẩm trước khi dùng AI" }));
      return;
    }

    const filteredSpecs = Object.entries(aiSpecs).reduce<Record<string, string>>((acc, [key, value]) => {
      if (value.trim()) {
        acc[key] = value.trim();
      }
      return acc;
    }, {});

    const payload: GenerateProductDescriptionRequest = {
      productName: data.name.trim(),
      specs: Object.keys(filteredSpecs).length ? filteredSpecs : undefined,
      tone: "marketing",
      language: "vi",
    };

    setAiState((prev) => ({ ...prev, isGenerating: true, error: "" }));

    try {
      const response = await aiAssistantApi.generateProductDescription(payload);
      const content = response.data?.content;

      if (!content) {
        throw new Error("AI chưa trả về nội dung mô tả");
      }

      if (!data.metaKeywords && response.data?.meta?.keywords?.length) {
        const keywordsStr = response.data.meta.keywords.join(", ");
        if (keywordsStr) {
          setData((prev) => ({
            ...prev,
            metaKeywords: keywordsStr,
          }));
        }
      }

      startStreamingDescription(content);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể tạo nội dung AI";
      setAiState((prev) => ({ ...prev, error: message }));
      dispatch(addToast({ type: "error", message }));
    } finally {
      setAiState((prev) => ({ ...prev, isGenerating: false }));
    }
  };

  const handleGenerateMeta = async () => {
    if (!data.name.trim()) {
      dispatch(addToast({ type: "error", message: "Vui lòng nhập tên sản phẩm trước" }));
      return;
    }

    const filteredSpecs = Object.entries(aiSpecs).reduce<Record<string, string>>((acc, [key, value]) => {
      if (value.trim()) {
        acc[key] = value.trim();
      }
      return acc;
    }, {});

    const payload: GenerateProductMetaRequest = {
      productName: data.name.trim(),
      specs: Object.keys(filteredSpecs).length ? filteredSpecs : undefined,
      category: selectedPath || undefined,
      language: "vi",
    };

    setAiState((prev) => ({ ...prev, isGeneratingMeta: true, error: "" }));

    try {
      const response = await aiAssistantApi.generateProductMeta(payload);
      const meta = response.data;

      if (meta) {
        if (meta.keywords?.length && !data.metaKeywords) {
          const keywordsStr = meta.keywords.join(", ");
          if (keywordsStr) {
            setData((prev) => ({
              ...prev,
              metaKeywords: keywordsStr,
            }));
          }
        }

        if (meta.warrantyInfo && !data.warrantyInfo) {
          setData((prev) => ({
            ...prev,
            warrantyInfo: meta.warrantyInfo!,
          }));
        }

        dispatch(addToast({ type: "success", message: "Đã tạo thông tin meta với AI" }));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể tạo thông tin meta";
      setAiState((prev) => ({ ...prev, error: message }));
      dispatch(addToast({ type: "error", message }));
    } finally {
      setAiState((prev) => ({ ...prev, isGeneratingMeta: false }));
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
            <div className="space-y-4 border border-border-1 rounded-lg p-4">
              <p className="text-sm font-semibold text-neutral-7">Hình ảnh sản phẩm</p>
              <ImageUploadMulti
                label="Upload nhiều ảnh sản phẩm (tối đa 10 ảnh)"
                value={productImages}
                onChange={(images) => {
                  const normalized = images || [];
                  setProductImages(normalized);
                  setData((prev) => ({
                    ...prev,
                    images: normalized,
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
                    {/* AI Full Form Generator - Generate all fields at once */}
        {data.name && (
          <div className="p-4 bg-gradient-to-r from-primary-10/30 to-primary-6/10 rounded-xl border border-primary-6/20">
            <AiFullFormGenerator
              onGenerate={(generatedData) => {
                setData((prev) => ({
                  ...prev,
                  ...(generatedData.description && !prev.description && { description: generatedData.description }),
                  ...(generatedData.metaKeywords && !prev.metaKeywords && { metaKeywords: generatedData.metaKeywords }),
                  ...(generatedData.warrantyInfo && !prev.warrantyInfo && { warrantyInfo: generatedData.warrantyInfo }),
                  ...(generatedData.dimensions && !prev.dimensions && { dimensions: generatedData.dimensions }),
                  ...(generatedData.weight && !prev.weight && { weight: generatedData.weight }),
                }));
              }}
              productName={data.name}
              specs={aiSpecs}
              category={selectedPath}
              language="vi"
              existingData={{
                description: data.description,
                metaKeywords: data.metaKeywords,
                warrantyInfo: data.warrantyInfo,
                dimensions: data.dimensions,
                weight: data.weight,
              }}
              className="mb-4"
            />
          </div>
        )}

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

            <div className="space-y-3 rounded-xl border border-border-1 bg-neutral-1/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-7">Mô tả sản phẩm & AI hỗ trợ</p>
                  <p className="text-xs text-neutral-5">
                    Nhập vài thông số (RAM, Chip) rồi để AI tạo mô tả dài, chuẩn SEO. Bạn vẫn có thể chỉnh
                    sửa thủ công.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {aiState.isStreaming && (
                    <Button
                      type="button"
                      color="gray"
                      variant="outline"
                      size="sm"
                      icon={<CircleStop className="w-4 h-4" />}
                      onClick={stopStreaming}
                    >
                      Dừng phát
                    </Button>
                  )}
                  <Button
                    type="button"
                    color="blue"
                    variant="solid"
                    size="sm"
                    icon={<Sparkles className="w-4 h-4" />}
                    loading={aiState.isGenerating}
                    disabled={aiState.isStreaming}
                    onClick={handleGenerateContent}
                  >
                    Generate Content
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Input
                  name="ramSpec"
                  label="RAM (tùy chọn)"
                  placeholder="Ví dụ: 12GB"
                  value={aiSpecs.ram}
                  onChange={(event) =>
                    setAiSpecs((prev) => ({
                      ...prev,
                      ram: event.target.value,
                    }))
                  }
                  iconLeft={<MemoryStick className="w-4 h-4 text-neutral-5" />}
                />
                <Input
                  name="chipSpec"
                  label="Chip (tùy chọn)"
                  placeholder="Ví dụ: Apple A17 Pro"
                  value={aiSpecs.chip}
                  onChange={(event) =>
                    setAiSpecs((prev) => ({
                      ...prev,
                      chip: event.target.value,
                    }))
                  }
                  iconLeft={<Cpu className="w-4 h-4 text-neutral-5" />}
                />
              </div>
              {aiState.error && <p className="text-sm text-error">{aiState.error}</p>}
              {aiState.isStreaming && (
                <p className="flex items-center gap-2 text-xs font-medium text-warning">
                  <Sparkles className="w-4 h-4" />
                  AI đang tự động điền mô tả...
                </p>
              )}
              <div
                className={`rounded-lg border border-border-1 bg-white ${
                  aiState.isStreaming ? "ring-2 ring-primary-6/30" : ""
                }`}
              >
                <ReactQuill
                  theme="snow"
                  value={data.description}
                  onChange={handleDescriptionChange}
                  readOnly={aiState.isStreaming}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Nhập mô tả sản phẩm hoặc để AI hỗ trợ..."
                  className="min-h-[220px] bg-background-1"
                />
              </div>
            </div>
          </div>
        </Section>

        

        <Section>
          <SectionTitle>Thông tin bán hàng</SectionTitle>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                name="price"
                label="Giá sản phẩm (VNĐ)"
                type="text"
                inputMode="numeric"
                placeholder="Nhập giá sản phẩm"
                value={priceDisplay}
                onChange={handlePriceChange}
                onBlur={handlePriceBlur}
                onFocus={handlePriceFocus}
                required
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
              <Input
                name="discount"
                label="Khuyến mãi (%)"
                type="number"
                placeholder="Ví dụ: 10"
                value={data.discount}
                onChange={handleChange}
                min={0}
                max={100}
                description="Nhập phần trăm giảm giá (0-100)."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-neutral-7">
                    Thông tin bảo hành
                  </label>
                  {/* <Button
                    type="button"
                    color="blue"
                    variant="ghost"
                    size="sm"
                    icon={<Sparkles className="w-3 h-3" />}
                    loading={aiState.isGeneratingMeta}
                    disabled={!data.name.trim() || aiState.isGeneratingMeta}
                    onClick={() => {
                      if (!data.warrantyInfo) {
                        handleGenerateMeta();
                      }
                    }}
                  >
                    AI
                  </Button> */}
                </div>
                <Input
                  name="warrantyInfo"
                  placeholder="Ví dụ: 12 tháng, đổi mới trong 7 ngày"
                  value={data.warrantyInfo}
                  onChange={handleChange}
                />
              </div>
              <Input
                name="dimensions"
                label="Kích thước (Dài x Rộng x Cao)"
                placeholder="Ví dụ: 30x20x15 cm"
                value={data.dimensions}
                onChange={handleChange}
              />
            </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-neutral-7">
                    Từ khóa tìm kiếm
                  </label>
                  <Button
                    type="button"
                    color="blue"
                    variant="ghost"
                    size="sm"
                    icon={<Sparkles className="w-3 h-3" />}
                    loading={aiState.isGeneratingMeta}
                    disabled={!data.name.trim() || aiState.isGeneratingMeta}
                    onClick={() => {
                      if (!data.metaKeywords) {
                        handleGenerateMeta();
                      }
                    }}
                  >
                    AI
                  </Button>
                </div>
                <Input
                  name="metaKeywords"
                  placeholder="Nhập các từ khóa cách nhau bởi dấu phẩy"
                  value={data.metaKeywords}
                  onChange={handleChange}
                  description="Các từ khóa giúp khách hàng dễ dàng tìm thấy sản phẩm của bạn"
                />
              </div>
          </div>
        </Section>

        <Section>
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Thông tin chi tiết</SectionTitle>
          </div>
          {attributes?.length > 0 ? (
            <div className="space-y-6">
              <div className="p-4 bg-primary-10/30 rounded-lg border border-primary-6/20">
                <p className="text-sm font-medium text-primary-7">
                  💡 Điền thông tin thuộc tính để tăng mức độ hiển thị và tìm kiếm cho sản phẩm. Bạn có thể thêm loại thuộc tính mới hoặc thêm giá trị cho các thuộc tính hiện có.
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
                      onAttributeUpdate={(attributeId, newValues) => {
                        setAttributes((prev) =>
                          prev.map((attr) =>
                            (attr.id || attr._id) === attributeId
                              ? { ...attr, values: newValues }
                              : attr
                          )
                        );
                      }}
                    />
                  ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-neutral-2 rounded-lg border border-border-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-neutral-6 mb-2">
                    ℹ️ Chọn ngành hàng để hiển thị các thuộc tính có sẵn, hoặc tạo thuộc tính mới cho sản phẩm của bạn.
                  </p>
                  {!data.categoryId && (
                    <p className="text-xs text-neutral-5">
                      💡 Vui lòng chọn ngành hàng trước để xem các thuộc tính có sẵn
                    </p>
                  )}
                </div>
                {data.categoryId && (
                  <Button
                    type="button"
                    color="blue"
                    variant="outline"
                    size="sm"
                    icon={<Pencil className="w-4 h-4" />}
                    onClick={() => setOpenAddAttributeType(true)}
                  >
                    Thêm thuộc tính
                  </Button>
                )}
              </div>
            </div>
          )}
        </Section>

        {/* Product Variants Section */}
        <Section>
          <SectionTitle>Biến thể sản phẩm</SectionTitle>
          <div className="space-y-4">
            <ProductVariantsManager
              variantAttributes={variantAttributes}
              variants={data.variants}
              onChange={(variants) => {
                setData((prev) => ({ ...prev, variants }));
              }}
              basePrice={data.price}
              baseStock={data.stock}
              onImageUpload={handleImageUpload}
              categoryId={data.categoryId}
            />
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

      <AddAttributeTypeModal
        open={openAddAttributeType}
        onClose={() => setOpenAddAttributeType(false)}
        categoryId={data.categoryId}
        onSuccess={(newAttributeType) => {
          const normalizedValues = newAttributeType.values.map((v) => ({
            id: `temp-${Date.now()}-${Math.random()}`,
            value: v.value,
            label: v.label,
            colorCode: v.colorCode,
          }));

          // Add the new attribute type to the attributes list
          setAttributes((prev) => [
            ...prev,
            {
              id: newAttributeType.id,
              _id: newAttributeType.id,
              name: newAttributeType.name,
              values: normalizedValues,
              inputType: newAttributeType.inputType,
              isRequired: false,
            },
          ]);

          const normalizedAttr = normalizeVariantAttribute({
            ...newAttributeType,
            _id: newAttributeType.id,
            values: normalizedValues,
          });
          if (normalizedAttr) {
            setVariantAttributes((prev) => [...prev, normalizedAttr]);
          }
        }}
      />
    </div>
  );
}
