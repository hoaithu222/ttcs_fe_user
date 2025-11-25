import React, { useState, useEffect, useCallback } from "react";
import { Sparkles, Loader2, X, Check } from "lucide-react";
import Button from "@/foundation/components/buttons/Button";
import { aiAssistantApi } from "@/core/api/ai";
import { useAppDispatch } from "@/app/store";
import { addToast } from "@/app/store/slices/toast";

interface AiSmartSuggestionsProps {
  productName?: string;
  onSuggestionSelect?: (suggestion: string) => void;
  fieldType?: "name" | "description" | "keywords" | "warranty";
  className?: string;
}

const AiSmartSuggestions: React.FC<AiSmartSuggestionsProps> = ({
  productName,
  onSuggestionSelect,
  fieldType = "name",
  className = "",
}) => {
  const dispatch = useAppDispatch();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const generateSuggestions = useCallback(async () => {
    if (!productName?.trim() || productName.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Generate suggestions based on field type
      let prompt = "";
      switch (fieldType) {
        case "name":
          prompt = `Gợi ý 3 tên sản phẩm tốt hơn cho: "${productName}". Mỗi tên trên một dòng, ngắn gọn, bao gồm thương hiệu và model.`;
          break;
        case "keywords":
          prompt = `Gợi ý 5 từ khóa SEO tốt nhất cho sản phẩm: "${productName}". Mỗi từ khóa trên một dòng.`;
          break;
        case "warranty":
          prompt = `Gợi ý 3 thông tin bảo hành phù hợp cho sản phẩm: "${productName}". Mỗi gợi ý trên một dòng, ngắn gọn.`;
          break;
        default:
          return;
      }

      // Use chat API to get suggestions
      const response = await aiAssistantApi.generateChatResponse({
        message: prompt,
        language: "vi",
      });

      if (response.success && response.data?.response) {
        const lines = response.data.response
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0 && !line.match(/^\d+[\.\)]/))
          .slice(0, 5);
        setSuggestions(lines);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Error generating suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [productName, fieldType]);

  useEffect(() => {
    // Debounce suggestion generation
    const timer = setTimeout(() => {
      if (productName && productName.trim().length >= 3) {
        generateSuggestions();
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [productName, generateSuggestions]);

  const handleSelectSuggestion = (suggestion: string) => {
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
    setShowSuggestions(false);
  };

  if (!showSuggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className={`mt-2 space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-xs text-neutral-6">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Gợi ý từ AI:
        </span>
        <button
          type="button"
          onClick={() => setShowSuggestions(false)}
          className="text-neutral-5 hover:text-neutral-7"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
      <div className="space-y-1">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleSelectSuggestion(suggestion)}
            className="w-full text-left px-3 py-2 text-sm bg-neutral-1 hover:bg-neutral-2 border border-neutral-3 rounded-lg transition-colors flex items-center justify-between group"
          >
            <span className="text-neutral-8 group-hover:text-neutral-10">{suggestion}</span>
            <Check className="w-4 h-4 text-primary-6 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default AiSmartSuggestions;

