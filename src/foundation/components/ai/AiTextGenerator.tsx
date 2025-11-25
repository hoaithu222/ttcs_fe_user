import React, { useState } from "react";
import { Sparkles, Loader2, CheckCircle2, XCircle } from "lucide-react";
import Button from "@/foundation/components/buttons/Button";
import { aiAssistantApi } from "@/core/api/ai";
import type { GenerateProductDescriptionRequest } from "@/core/api/ai/type";
import { useAppDispatch } from "@/app/store";
import { addToast } from "@/app/store/slices/toast";

interface AiTextGeneratorProps {
  onGenerate: (content: string) => void;
  productName?: string;
  specs?: Record<string, string>;
  category?: string;
  language?: string;
  tone?: "default" | "marketing" | "technical" | "casual";
  placeholder?: string;
  label?: string;
  className?: string;
}

const AiTextGenerator: React.FC<AiTextGeneratorProps> = ({
  onGenerate,
  productName,
  specs,
  category,
  language = "vi",
  tone = "marketing",
  placeholder = "Nhấn nút AI để tạo mô tả tự động",
  label = "Mô tả",
  className = "",
}) => {
  const dispatch = useAppDispatch();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!productName?.trim()) {
      dispatch(addToast({ type: "error", message: "Vui lòng nhập tên sản phẩm trước khi dùng AI" }));
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

    const payload: GenerateProductDescriptionRequest = {
      productName: productName.trim(),
      specs: filteredSpecs && Object.keys(filteredSpecs).length > 0 ? filteredSpecs : undefined,
      tone,
      language,
      keywords: category ? [category] : undefined,
    };

    setIsGenerating(true);
    setError("");

    try {
      const response = await aiAssistantApi.generateProductDescription(payload);
      const content = response.data?.content;

      if (!content) {
        throw new Error("AI chưa trả về nội dung mô tả");
      }

      onGenerate(content);
      dispatch(addToast({ type: "success", message: "Đã tạo mô tả với AI thành công!" }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể tạo nội dung AI";
      setError(message);
      dispatch(addToast({ type: "error", message }));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-neutral-7">{label}</label>
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
          {isGenerating ? "Đang tạo..." : "Tạo với AI"}
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

export default AiTextGenerator;

