import React, { useState } from "react";
import { Sparkles, Loader2, CheckCircle2, XCircle } from "lucide-react";
import Button from "@/foundation/components/buttons/Button";
import { aiAssistantApi } from "@/core/api/ai";
import type { GenerateProductMetaRequest } from "@/core/api/ai/type";
import { useAppDispatch } from "@/app/store";
import { addToast } from "@/app/store/slices/toast";

interface AiMetaGeneratorProps {
  onGenerate: (meta: { keywords?: string[]; warrantyInfo?: string; highlights?: string[] }) => void;
  productName?: string;
  specs?: Record<string, string>;
  category?: string;
  language?: string;
  className?: string;
}

const AiMetaGenerator: React.FC<AiMetaGeneratorProps> = ({
  onGenerate,
  productName,
  specs,
  category,
  language = "vi",
  className = "",
}) => {
  const dispatch = useAppDispatch();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!productName?.trim()) {
      dispatch(addToast({ type: "error", message: "Vui lòng nhập tên sản phẩm trước" }));
      return;
    }

    const filteredSpecs = specs
      ? Object.entries(specs).reduce<Record<string, string>>((acc, [key, value]) => {
          if (value?.trim()) {
            acc[key] = value.trim();
          }
          return acc;
        }, {})
      : undefined;

    const payload: GenerateProductMetaRequest = {
      productName: productName.trim(),
      specs: filteredSpecs && Object.keys(filteredSpecs).length > 0 ? filteredSpecs : undefined,
      category: category?.trim(),
      language,
    };

    setIsGenerating(true);
    setError("");

    try {
      const response = await aiAssistantApi.generateProductMeta(payload);
      const meta = response.data;

      if (meta) {
        onGenerate({
          keywords: meta.keywords,
          warrantyInfo: meta.warrantyInfo,
          highlights: meta.highlights,
        });
        dispatch(addToast({ type: "success", message: "Đã tạo thông tin meta với AI thành công!" }));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể tạo thông tin meta";
      setError(message);
      dispatch(addToast({ type: "error", message }));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-end">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleGenerate}
          disabled={isGenerating || !productName?.trim()}
          icon={
            isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )
          }
          className="text-xs"
        >
          {isGenerating ? "Đang tạo..." : "Tạo Meta với AI"}
        </Button>
      </div>
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-6">
          <XCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default AiMetaGenerator;

