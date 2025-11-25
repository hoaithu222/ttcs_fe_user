import { useCallback, useEffect, useMemo, useState } from "react";
import * as Form from "@radix-ui/react-form";
import { Scale, Sparkles, Loader2, Search, Info } from "lucide-react";
import Section from "@/foundation/components/sections/Section";
import SectionTitle from "@/foundation/components/sections/SectionTitle";
import Button from "@/foundation/components/buttons/Button";
import Input from "@/foundation/components/input/Input";
import { Card } from "@/foundation/components/info/Card";
import type { Product } from "@/core/api/products/type";
import { ProductService } from "@/features/Products/api";
import { useDebounce } from "@/shared/hooks";
import { useLanguage } from "@/shared/hooks/language";
import { useAiComparison } from "../hooks/useAiComparison";
import { MAX_SUGGESTIONS, SEARCH_DEBOUNCE_MS } from "../constants/aiComparison";

interface CompareAiPanelProps {
  primaryProduct: Product;
  relatedProducts?: Product[];
}

const copy = {
  vi: {
    title: "So sánh sản phẩm thông minh",
    subtitle:
      "AI phân tích ưu / nhược điểm và gợi ý sản phẩm phù hợp chỉ với một lần bấm.",
    primaryLabel: "Sản phẩm hiện tại",
    secondaryLabel: "Chọn sản phẩm để so sánh",
    inputPlaceholder: "Nhập tên sản phẩm muốn so sánh...",
    helperSuggestion: "Hoặc chọn nhanh từ danh sách gợi ý:",
    helperSameProduct: "Vui lòng chọn sản phẩm khác để so sánh.",
    helperMissing: "Bạn cần chọn sản phẩm thứ hai trước khi so sánh.",
    buttonIdle: "So sánh bằng AI",
    buttonLoading: "AI đang phân tích...",
    buttonRefresh: "Phân tích lại",
    sectionSummaryTitle: "Tóm tắt từ AI",
    sectionProsTitle: "Ưu điểm",
    sectionConsTitle: "Nhược điểm",
    sectionAudienceTitle: "Gợi ý người dùng phù hợp",
    sectionTipsTitle: "Mẹo & lưu ý thêm",
    providerLabel: "Nguồn AI",
    lastUpdated: "Cập nhật lúc",
  },
  en: {
    title: "Smart product comparison",
    subtitle: "AI highlights pros / cons and buyer fit with a single tap.",
    primaryLabel: "Current product",
    secondaryLabel: "Pick another product",
    inputPlaceholder: "Type a product name...",
    helperSuggestion: "Or pick from suggestions:",
    helperSameProduct: "Please choose a different product to compare.",
    helperMissing: "Select a second product before running the comparison.",
    buttonIdle: "Compare with AI",
    buttonLoading: "AI is analyzing...",
    buttonRefresh: "Refresh analysis",
    sectionSummaryTitle: "AI summary",
    sectionProsTitle: "Pros",
    sectionConsTitle: "Cons",
    sectionAudienceTitle: "Who should buy",
    sectionTipsTitle: "Extra tips",
    providerLabel: "AI provider",
    lastUpdated: "Updated at",
  },
};

const getImageUrl = (product?: Product) => {
  if (!product?.images || product.images.length === 0) return undefined;
  const first = product.images[0];
  if (typeof first === "string") return first;
  return first.url;
};

const formatCurrency = (value?: number) => {
  if (!value && value !== 0) return "--";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
};

const CompareAiPanel: React.FC<CompareAiPanelProps> = ({ primaryProduct, relatedProducts = [] }) => {
  const language = useLanguage() as keyof typeof copy;
  const dict = copy[language] ?? copy.vi;

  const [secondaryProduct, setSecondaryProduct] = useState<Product | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>(() =>
    relatedProducts.slice(0, MAX_SUGGESTIONS)
  );
  const [isSearching, setIsSearching] = useState(false);
  const [helperMessage, setHelperMessage] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchValue, SEARCH_DEBOUNCE_MS);

  const {
    comparison,
    triggerComparison,
    isLoading,
    hasError,
    isStale,
  } = useAiComparison(primaryProduct, secondaryProduct);

  useEffect(() => {
    setSuggestions(relatedProducts.slice(0, MAX_SUGGESTIONS));
  }, [relatedProducts]);

  useEffect(() => {
    let ignore = false;

    const fetchSuggestions = async () => {
      if (!debouncedSearch || debouncedSearch.trim().length < 2) {
        setSuggestions(relatedProducts.slice(0, MAX_SUGGESTIONS));
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await ProductService.searchProducts({
          q: debouncedSearch.trim(),
          limit: MAX_SUGGESTIONS + 2,
        });

        if (!ignore && response?.success && response.data?.products) {
          const filtered = response.data.products.filter(
            (item) => item._id !== primaryProduct._id
          );
          setSuggestions(filtered.slice(0, MAX_SUGGESTIONS));
        }
      } catch (error) {
        console.error("Failed to search products for comparison", error);
      } finally {
        if (!ignore) {
          setIsSearching(false);
        }
      }
    };

    fetchSuggestions();

    return () => {
      ignore = true;
    };
  }, [debouncedSearch, primaryProduct._id, relatedProducts]);

  const handleSelectProduct = useCallback(
    (product: Product) => {
      if (product._id === primaryProduct._id) {
        setHelperMessage(dict.helperSameProduct);
        return;
      }
      setSecondaryProduct(product);
      setSearchValue(product.name);
      setHelperMessage(null);
    },
    [dict.helperSameProduct, primaryProduct._id]
  );

  const handleCompare = useCallback(() => {
    if (!secondaryProduct) {
      setHelperMessage(dict.helperMissing);
      return;
    }
    setHelperMessage(null);
    triggerComparison("product-detail");
  }, [dict.helperMissing, secondaryProduct, triggerComparison]);

  const canCompare = Boolean(secondaryProduct) && !isLoading;

  const renderProductSnapshot = useCallback(
    (product: Product, label: string) => (
      <Card className="bg-background-1 border border-border-1 rounded-2xl shadow-sm h-full p-4">
        <div className="text-xs font-semibold text-neutral-5 mb-3 uppercase tracking-wide">{label}</div>
        <div className="flex items-start gap-3">
          <div className="w-20 h-20 rounded-xl bg-neutral-2 overflow-hidden flex items-center justify-center flex-shrink-0">
            {getImageUrl(product) ? (
              <img src={getImageUrl(product)} alt={product.name} className="object-cover w-full h-full" />
            ) : (
              <PackagePlaceholder />
            )}
          </div>
          <div className="flex-1 min-w-0 space-y-1.5">
            <p className="text-sm font-semibold text-neutral-9 line-clamp-2 leading-snug">{product.name}</p>
            <p className="text-base text-primary-7 font-bold">
              {formatCurrency(product.finalPrice ?? product.price)}
            </p>
            {product.rating ? (
              <div className="flex items-center gap-1 text-xs text-neutral-6">
                <span className="text-yellow-500">★</span>
                <span className="font-medium">{product.rating.toFixed(1)}</span>
                <span className="text-neutral-5">({product.reviewCount || 0})</span>
              </div>
            ) : (
              <p className="text-xs text-neutral-5">Chưa có đánh giá</p>
            )}
          </div>
        </div>
      </Card>
    ),
    []
  );

  const secondarySnapshot = useMemo(() => {
    if (!secondaryProduct) return null;
    return renderProductSnapshot(secondaryProduct, dict.secondaryLabel);
  }, [dict.secondaryLabel, renderProductSnapshot, secondaryProduct]);

  const summaryBlocks = useMemo(() => {
    if (!comparison?.prosCons) return null;
    const ids = [comparison.productAId, comparison.productBId].filter(Boolean);

    return ids.map((productId) => {
      const productMeta = comparison.products?.[productId];
      const prosCons = comparison.prosCons?.[productId];
      if (!productMeta || !prosCons) return null;

      return (
        <div
          key={productId}
          className="p-3 bg-background-1 border border-border-1 rounded-2xl space-y-3"
        >
          <div className="pb-2 border-b border-border-1">
            <p className="text-sm font-semibold text-neutral-8 line-clamp-1">{productMeta.name}</p>
            <p className="text-xs text-neutral-5">
              {formatCurrency(productMeta.finalPrice ?? productMeta.price)}
            </p>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-success-7 mb-1.5 flex items-center gap-1">
                ✓ {dict.sectionProsTitle}
              </p>
              <ul className="space-y-0.5 text-xs text-neutral-7 list-disc pl-4">
                {prosCons.pros?.length
                  ? prosCons.pros.map((item, index) => <li key={index} className="leading-snug">{item}</li>)
                  : <li>Đang cập nhật...</li>}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-warning mb-1.5 flex items-center gap-1">
                ⚠ {dict.sectionConsTitle}
              </p>
              <ul className="space-y-0.5 text-xs text-neutral-7 list-disc pl-4">
                {prosCons.cons?.length
                  ? prosCons.cons.map((item, index) => <li key={index} className="leading-snug">{item}</li>)
                  : <li>Đang cập nhật...</li>}
              </ul>
            </div>
          </div>
        </div>
      );
    });
  }, [comparison?.productAId, comparison?.productBId, comparison?.products, comparison?.prosCons, dict.sectionConsTitle, dict.sectionProsTitle]);

  return (
    <Section className="bg-background-2 border border-border-1 rounded-2xl p-5 lg:p-6 shadow-sm mb-12">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 mb-5">
        <div className="flex-1">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-primary-6/10 flex items-center justify-center flex-shrink-0">
              <Scale className="w-5 h-5 text-primary-7" />
            </div>
            <SectionTitle className="!mb-0 !text-lg">{dict.title}</SectionTitle>
          </div>
          <p className="text-xs text-neutral-6 max-w-2xl leading-relaxed">{dict.subtitle}</p>
        </div>
        {comparison?.provider && (
          <div className="flex items-center gap-1.5 text-xs text-neutral-6 bg-background-1 px-3 py-1.5 rounded-full border border-border-1">
            <Sparkles className="w-3.5 h-3.5 text-primary-6" />
            <span>
              <strong className="text-neutral-8">{comparison.provider}</strong>
            </span>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-4">
        {/* Product Cards Row */}
        <div className="grid gap-4 md:grid-cols-2">
          {renderProductSnapshot(primaryProduct, dict.primaryLabel)}
          {secondaryProduct ? (
            renderProductSnapshot(secondaryProduct, dict.secondaryLabel)
          ) : (
            <Card className="bg-background-1 border border-dashed border-border-2 rounded-2xl shadow-sm h-full flex items-center justify-center p-6">
              <div className="text-center">
                <Search className="w-12 h-12 text-neutral-4 mx-auto mb-3" />
                <p className="text-sm font-semibold text-neutral-7">{dict.secondaryLabel}</p>
                <p className="text-xs text-neutral-5 mt-1">Tìm kiếm bên dưới để chọn</p>
              </div>
            </Card>
          )}
        </div>

        {/* Search & Action Row */}
        <div className="grid gap-4 lg:grid-cols-[1fr,auto]">
          <div className="bg-background-1 border border-border-2 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-neutral-8">{dict.inputPlaceholder}</p>
              {isSearching && <Loader2 className="w-4 h-4 animate-spin text-neutral-5" />}
            </div>
            <Form.Root onSubmit={(event) => event.preventDefault()}>
              <Input
                name="compare-search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder={dict.inputPlaceholder}
                iconLeft={<Search className="w-4 h-4 text-neutral-5" />}
              />
            </Form.Root>
            {helperMessage && (
              <p className="text-xs text-warning flex items-center gap-1">
                <Info className="w-3 h-3" />
                {helperMessage}
              </p>
            )}
            <div className="space-y-2">
              <p className="text-xs text-neutral-5">{dict.helperSuggestion}</p>
              <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                {suggestions.length === 0 ? (
                  <span className="text-xs text-neutral-5">Không có gợi ý phù hợp</span>
                ) : (
                  suggestions.map((item) => (
                    <button
                      key={item._id}
                      onClick={() => handleSelectProduct(item)}
                      className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap ${
                        secondaryProduct?._id === item._id
                          ? "border-primary-6 bg-primary-6/10 text-primary-8"
                          : "border-border-2 text-neutral-7 hover:border-primary-4"
                      } transition-colors`}
                    >
                      {item.name}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 lg:w-64">
            <Button
              type="button"
              color="blue"
              variant="solid"
              size="lg"
              icon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              disabled={!canCompare}
              onClick={handleCompare}
              className="w-full justify-center h-full lg:h-auto"
            >
              {isLoading ? dict.buttonLoading : isStale && comparison ? dict.buttonRefresh : dict.buttonIdle}
            </Button>
            {comparison?.updatedAt && (
              <p className="text-xs text-neutral-5 text-center">
                {dict.lastUpdated}:{" "}
                {new Date(comparison.updatedAt).toLocaleTimeString(language === "en" ? "en-US" : "vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
            {hasError && comparison?.error && (
              <div className="text-xs text-red-6 text-center bg-red-50 border border-red-100 rounded-lg p-2">
                {comparison.error}
              </div>
            )}
          </div>
        </div>
      </div>

      {comparison?.summary && (
        <div className="mt-6 space-y-4">
          {/* AI Summary - Compact */}
          <div className="bg-gradient-to-br from-primary-10/60 via-primary-9/30 to-background-1 border border-primary-6/20 rounded-2xl p-4">
            <p className="text-xs font-semibold text-primary-8 uppercase tracking-wide mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {dict.sectionSummaryTitle}
            </p>
            <p className="text-sm text-neutral-8 leading-relaxed">{comparison.summary}</p>
            {comparison.verdict && (
              <p className="mt-2 text-sm font-semibold text-neutral-9 pl-3 border-l-2 border-primary-6">
                {comparison.verdict}
              </p>
            )}
          </div>

          {/* Pros & Cons - Side by side */}
          {summaryBlocks && <div className="grid gap-3 md:grid-cols-2">{summaryBlocks}</div>}

          {/* Bottom Info Grid */}
          <div className="grid gap-3 lg:grid-cols-2">
            {comparison.audienceFit && (
              <div className="p-4 border border-border-1 rounded-2xl bg-background-1 space-y-2">
                <p className="text-xs font-semibold text-neutral-6 uppercase tracking-wide flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  {dict.sectionAudienceTitle}
                </p>
                <div className="space-y-2">
                  {Object.entries(comparison.audienceFit).map(([productId, recommendation]) => {
                    const productMeta = comparison.products?.[productId];
                    if (!productMeta) return null;
                    return (
                      <div key={productId} className="p-2.5 rounded-lg bg-neutral-1 border border-border-1">
                        <p className="text-xs font-semibold text-neutral-8">{productMeta.name}</p>
                        <p className="text-xs text-neutral-6 mt-0.5">
                          {typeof recommendation === "string"
                            ? recommendation
                            : `${recommendation.title} ${recommendation.description ?? ""}`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {comparison.tips && comparison.tips.length > 0 && (
              <div className="p-4 border border-dashed border-primary-6/40 rounded-2xl bg-primary-10/10 space-y-2">
                <p className="text-xs font-semibold text-primary-7 uppercase tracking-wide">
                  {dict.sectionTipsTitle}
                </p>
                <ul className="list-disc pl-4 text-xs text-neutral-8 space-y-1">
                  {comparison.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </Section>
  );
};

const PackagePlaceholder = () => (
  <div className="w-full h-full flex items-center justify-center text-neutral-4 text-xs text-center px-2">
    <span>Ảnh sản phẩm</span>
  </div>
);

export default CompareAiPanel;