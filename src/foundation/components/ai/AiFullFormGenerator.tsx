import React, { useState } from "react";
import { Sparkles, Loader2, XCircle, CheckCircle2, Zap } from "lucide-react";
import Button from "@/foundation/components/buttons/Button";
import { aiAssistantApi } from "@/core/api/ai";
import type { GenerateProductDescriptionRequest, GenerateProductMetaRequest } from "@/core/api/ai/type";
import { useAppDispatch } from "@/app/store";
import { addToast } from "@/app/store/slices/toast";

export interface ProductFormData {
  description?: string;
  metaKeywords?: string;
  warrantyInfo?: string;
  dimensions?: string;
  weight?: number;
}

interface AiFullFormGeneratorProps {
  onGenerate: (data: ProductFormData) => void;
  productName?: string;
  specs?: Record<string, string>;
  category?: string;
  language?: string;
  className?: string;
  existingData?: Partial<ProductFormData>;
}

const AiFullFormGenerator: React.FC<AiFullFormGeneratorProps> = ({
  onGenerate,
  productName,
  specs,
  category,
  language = "vi",
  className = "",
  existingData = {},
}) => {
  const dispatch = useAppDispatch();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [generatedFields, setGeneratedFields] = useState<string[]>([]);

  const handleGenerateAll = async () => {
    if (!productName?.trim()) {
      dispatch(addToast({ type: "error", message: "Vui lòng nhập tên sản phẩm trước khi dùng AI" }));
      return;
    }

    setIsGenerating(true);
    setError("");
    setGeneratedFields([]);

    try {
      const filteredSpecs = specs
        ? Object.entries(specs).reduce<Record<string, string>>((acc, [key, value]) => {
            if (value?.trim()) {
              acc[key] = value.trim();
            }
            return acc;
          }, {})
        : undefined;

      // Generate description and meta in parallel
      const [descriptionResponse, metaResponse] = await Promise.all([
        aiAssistantApi.generateProductDescription({
          productName: productName.trim(),
          specs: filteredSpecs && Object.keys(filteredSpecs).length > 0 ? filteredSpecs : undefined,
          tone: "marketing",
          language,
          keywords: category ? [category] : undefined,
        }),
        aiAssistantApi.generateProductMeta({
          productName: productName.trim(),
          specs: filteredSpecs && Object.keys(filteredSpecs).length > 0 ? filteredSpecs : undefined,
          category: category?.trim(),
          language,
        }),
      ]);

      const result: ProductFormData = {};
      const fields: string[] = [];

      // Description
      if (descriptionResponse.success && descriptionResponse.data?.content && !existingData.description) {
        result.description = descriptionResponse.data.content;
        fields.push("Mô tả");
      }

      // Keywords
      if (metaResponse.success && metaResponse.data?.keywords && metaResponse.data.keywords.length > 0 && !existingData.metaKeywords) {
        result.metaKeywords = metaResponse.data.keywords.join(", ");
        fields.push("Từ khóa");
      }

      // Warranty Info
      if (metaResponse.success && metaResponse.data?.warrantyInfo && !existingData.warrantyInfo) {
        result.warrantyInfo = metaResponse.data.warrantyInfo;
        fields.push("Bảo hành");
      }

      // Generate additional fields using AI chat
      try {
        const additionalPrompt = `Dựa trên sản phẩm "${productName}"${filteredSpecs ? ` với thông số: ${Object.entries(filteredSpecs).map(([k, v]) => `${k}: ${v}`).join(", ")}` : ""}, hãy gợi ý:
1. Kích thước (dimensions) - format: "Dài x Rộng x Cao cm" hoặc "Dài x Rộng x Cao mm"
2. Trọng lượng (weight) - chỉ số gram

Trả về JSON format:
{
  "dimensions": "kích thước",
  "weight": số_gram
}`;

        const additionalResponse = await aiAssistantApi.generateChatResponse({
          message: additionalPrompt,
          language,
        });

        if (additionalResponse.success && additionalResponse.data?.response) {
          // Try to parse JSON from response
          const jsonMatch = additionalResponse.data.response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              const parsed = JSON.parse(jsonMatch[0]);
              
              // Dimensions
              if (parsed.dimensions && typeof parsed.dimensions === "string" && !existingData.dimensions) {
                result.dimensions = parsed.dimensions;
                fields.push("Kích thước");
              }

              // Weight
              if (parsed.weight && typeof parsed.weight === "number" && parsed.weight > 0 && !existingData.weight) {
                result.weight = parsed.weight;
                fields.push("Trọng lượng");
              }
            } catch (parseError) {
              console.warn("Failed to parse additional fields:", parseError);
            }
          }
        }
      } catch (additionalError) {
        console.warn("Failed to generate additional fields:", additionalError);
        // Continue even if additional fields fail
      }

      if (Object.keys(result).length > 0) {
        setGeneratedFields(fields);
        onGenerate(result);
        dispatch(
          addToast({
            type: "success",
            message: `Đã tạo ${fields.length} trường thông tin với AI: ${fields.join(", ")}`,
          })
        );
      } else {
        dispatch(addToast({ type: "info", message: "Tất cả các trường đã được điền sẵn" }));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể tạo thông tin AI";
      setError(message);
      dispatch(addToast({ type: "error", message }));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary-6" />
          <span className="text-sm font-semibold text-neutral-7">AI Tự động điền tất cả</span>
        </div>
        <Button
          type="button"
          size="sm"
          variant="solid"
          color="blue"
          onClick={handleGenerateAll}
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
          {isGenerating ? "Đang tạo..." : "Tạo tất cả với AI"}
        </Button>
      </div>
      
      {generatedFields.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-2 bg-primary-10/20 rounded-lg border border-primary-6/20">
          <CheckCircle2 className="w-4 h-4 text-primary-6 flex-shrink-0" />
          <span className="text-xs text-primary-7">
            Đã tạo: <strong>{generatedFields.join(", ")}</strong>
          </span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-6">
          <XCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <p className="text-xs text-neutral-6">
        💡 AI sẽ tự động điền: Mô tả, Từ khóa, Bảo hành, Kích thước, Trọng lượng (chỉ điền các trường còn trống)
      </p>
    </div>
  );
};

export default AiFullFormGenerator;

