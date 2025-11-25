import { useCallback, useRef, useState } from "react";
import { UploadCloud, Image as ImageIcon, Sparkles, Loader2, RefreshCw } from "lucide-react";
import Button from "@/foundation/components/buttons/Button";
import Section from "@/foundation/components/sections/Section";
import { Card } from "@/foundation/components/info/Card";
import ProductCard from "./ProductCard";
import type { Product } from "@/core/api/products/type";
import { aiAssistantApi } from "@/core/api/ai";
import { useAppDispatch } from "@/app/store";
import { addToast } from "@/app/store/slices/toast";

const VisualSearchSection = () => {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [results, setResults] = useState<Product[]>([]);
  const [rawDescription, setRawDescription] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file hình ảnh hợp lệ.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
      setFileName(file.name);
      setError(null);
      setKeywords([]);
      setResults([]);
      setRawDescription("");
    };
    reader.onerror = () => {
      setError("Không thể đọc file, vui lòng thử lại.");
    };
    reader.readAsDataURL(file);
  }, []);

  const handleVisualSearch = useCallback(async () => {
    if (!preview) {
      setError("Hãy chọn một hình ảnh trước khi tìm kiếm.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await aiAssistantApi.visualSearch({
        image: preview,
        mimeType: preview.startsWith("data:") ? undefined : "image/jpeg",
        limit: 8,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Không thể tìm kiếm bằng hình ảnh.");
      }

      setKeywords(response.data.keywords || []);
      setRawDescription(response.data.rawDescription || "");
      const normalized = Array.isArray(response.data.products)
        ? (response.data.products as Product[]).map((product: any) => ({
            ...product,
            finalPrice: product.finalPrice ?? product.price ?? 0,
            images: product.images || [],
          }))
        : [];
      setResults(normalized);
      dispatch(
        addToast({
          type: "success",
          message: "Đã tìm kiếm sản phẩm tương tự thành công!",
        })
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể tìm kiếm bằng hình ảnh.";
      setError(message);
      dispatch(addToast({ type: "error", message }));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, preview]);

  const handleClear = () => {
    setPreview(null);
    setFileName("");
    setKeywords([]);
    setResults([]);
    setRawDescription("");
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Section className="mb-10 rounded-2xl border border-border-1 bg-background-2 p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary-6/10 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary-7" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-neutral-9">Tìm kiếm bằng hình ảnh</h2>
            <p className="text-sm text-neutral-6">
              Tải ảnh sản phẩm bạn yêu thích và để AI gợi ý các sản phẩm tương tự đang bán trên sàn.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-background-1 border border-dashed border-border-2 rounded-2xl h-full flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-neutral-8">1. Tải ảnh sản phẩm</div>
            {preview && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleClear}
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Đổi ảnh
              </Button>
            )}
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-6">
            {preview ? (
              <img
                src={preview}
                alt="Ảnh tải lên"
                className="max-h-64 w-full rounded-2xl object-contain border border-border-1"
              />
            ) : (
              <>
                <div className="w-24 h-24 rounded-full bg-neutral-2 flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-neutral-5" />
                </div>
                <p className="text-sm text-neutral-6">
                  Hỗ trợ định dạng JPG, PNG, WebP (tối đa 5MB).
                </p>
              </>
            )}
          </div>
          {fileName && <p className="text-xs text-neutral-5 truncate">Đã chọn: {fileName}</p>}
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={handlePickFile} icon={<UploadCloud className="w-4 h-4" />}>
              Chọn ảnh
            </Button>
            <Button
              type="button"
              color="blue"
              variant="solid"
              disabled={!preview || isLoading}
              onClick={handleVisualSearch}
              icon={
                isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />
              }
            >
              {isLoading ? "Đang phân tích..." : "Tìm sản phẩm tương tự"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          {error && <p className="text-xs text-red-6">{error}</p>}
        </Card>

        <div className="space-y-4">
          <div className="p-4 rounded-2xl border border-border-1 bg-background-1">
            <p className="text-sm font-semibold text-neutral-8 mb-2">2. Từ khóa gợi ý</p>
            {keywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {keywords.map((kw) => (
                  <span
                    key={kw}
                    className="px-3 py-1 rounded-full bg-primary-10/30 text-primary-7 text-xs font-medium"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-5">Từ khóa tương tự sẽ hiển thị tại đây sau khi phân tích ảnh.</p>
            )}
            {rawDescription && (
              <p className="mt-3 text-xs text-neutral-6">
                <span className="font-semibold text-neutral-7">AI mô tả:</span> {rawDescription}
              </p>
            )}
          </div>

          <div className="p-4 rounded-2xl border border-border-1 bg-background-1">
            <p className="text-sm font-semibold text-neutral-8 mb-3">3. Sản phẩm tương tự</p>
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-neutral-6">
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang tìm kiếm sản phẩm phù hợp...
              </div>
            )}
            {!isLoading && results.length === 0 && (
              <p className="text-xs text-neutral-5">
                Chưa có dữ liệu. Hãy tải ảnh để bắt đầu tìm kiếm sản phẩm tương tự.
              </p>
            )}
            {!isLoading && results.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {results.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
};

export default VisualSearchSection;

