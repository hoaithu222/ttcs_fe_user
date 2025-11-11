import React, { useRef, useState } from "react";
import { ImageUp, X, Image as ImageIcon } from "lucide-react";
import clsx from "clsx";
import Spinner from "@/foundation/components/feedback/Spinner";

export interface ImageIconUploadProps {
  value?: { url: string; publicId?: string } | null;
  onChange?: (value: { url: string; publicId?: string } | null) => void;
  onUpload?: (file: File) => Promise<{ url: string; publicId?: string }>;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: string;
  maxSizeInMB?: number;
  testId?: string;
  size?: "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "square" | "rounded";
  showRemoveButton?: boolean;
  placeholder?: string;
}

const sizeConfig = {
  sm: {
    container: "w-16 h-16",
    icon: "w-5 h-5",
    uploadIcon: "w-4 h-4",
    text: "text-[10px]",
    removeButton: "w-5 h-5 -top-1 -right-1",
    removeIcon: "w-3 h-3",
  },
  md: {
    container: "w-24 h-24",
    icon: "w-7 h-7",
    uploadIcon: "w-5 h-5",
    text: "text-xs",
    removeButton: "w-6 h-6 -top-2 -right-2",
    removeIcon: "w-3.5 h-3.5",
  },
  lg: {
    container: "w-32 h-32",
    icon: "w-9 h-9",
    uploadIcon: "w-6 h-6",
    text: "text-sm",
    removeButton: "w-7 h-7 -top-2 -right-2",
    removeIcon: "w-4 h-4",
  },
  xl: {
    container: "w-40 h-40",
    icon: "w-11 h-11",
    uploadIcon: "w-7 h-7",
    text: "text-base",
    removeButton: "w-8 h-8 -top-3 -right-3",
    removeIcon: "w-4 h-4",
  },
};

const shapeConfig = {
  circle: "rounded-full",
  square: "rounded-none",
  rounded: "rounded-2xl",
};

const ImageIconUpload: React.FC<ImageIconUploadProps> = ({
  value,
  onChange,
  onUpload,
  disabled = false,
  className = "",
  label,
  error,
  maxSizeInMB = 2,
  testId = "image-icon-upload",
  size = "md",
  shape = "rounded",
  showRemoveButton = true,
  placeholder = "Icon",
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const config = sizeConfig[size];
  const shapeClass = shapeConfig[shape];

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file size
    if (file.size > maxSizeInMB * 1024 * 1024) {
      setUploadError(`Kích thước file vượt quá ${maxSizeInMB}MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Vui lòng chọn file ảnh hợp lệ");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      if (onUpload) {
        const result = await onUpload(file);
        onChange?.(result);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Tải lên thất bại");
    } finally {
      setIsUploading(false);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileSelect(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(null);
    setUploadError(null);
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const displayError = error || uploadError;

  return (
    <div className={clsx("inline-flex flex-col gap-2", className)} data-testid={testId}>
      {/* Label */}
      {label && <label className="block text-sm font-semibold text-neutral-9">{label}</label>}

      {/* Upload Container */}
      <div className="relative inline-block">
        <div
          className={clsx(
            "relative overflow-hidden border-2 transition-all duration-200",
            config.container,
            shapeClass,
            disabled
              ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
              : "cursor-pointer hover:shadow-lg active:scale-95",
            isUploading && "border-blue-400 bg-blue-50",
            displayError && "border-red-300 bg-red-50",
            !value &&
              !isUploading &&
              !displayError &&
              "border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/30"
          )}
          onClick={handleClick}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          data-testid={`${testId}-container`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            disabled={disabled || isUploading}
            className="hidden"
            data-testid={`${testId}-input`}
          />

          {isUploading ? (
            // Loading State
            <div className="flex absolute inset-0 flex-col gap-1 justify-center items-center bg-blue-50">
              <Spinner size="sm" />
            </div>
          ) : value ? (
            // Preview State
            <div className="relative w-full h-full group">
              <img
                src={value.url}
                alt={placeholder}
                className={clsx(
                  "object-cover w-full h-full transition-all duration-200",
                  isHovering && !disabled && "scale-110 opacity-80"
                )}
              />
              {/* Hover Overlay */}
              {isHovering && !disabled && (
                <div className="flex absolute inset-0 justify-center items-center bg-black/40 backdrop-blur-[1px]">
                  <ImageIcon className={clsx("text-white", config.uploadIcon)} strokeWidth={2} />
                </div>
              )}
            </div>
          ) : (
            // Empty State
            <div className="flex absolute inset-0 flex-col gap-1 justify-center items-center">
              <div
                className={clsx(
                  "p-2 rounded-lg transition-all duration-200",
                  isHovering ? "bg-blue-500 scale-110" : "bg-gray-200"
                )}
              >
                <ImageUp
                  className={clsx(config.uploadIcon, isHovering ? "text-white" : "text-gray-500")}
                  strokeWidth={2}
                />
              </div>
              <span className={clsx(config.text, "font-medium text-gray-400 text-center px-1")}>
                {placeholder}
              </span>
            </div>
          )}
        </div>

        {/* Remove Button */}
        {value && !disabled && showRemoveButton && (
          <button
            type="button"
            onClick={handleRemove}
            className={clsx(
              "absolute flex justify-center items-center bg-red-500 shadow-lg transition-all duration-200 hover:bg-red-600 hover:scale-110 active:scale-95",
              config.removeButton,
              shape === "circle" ? "rounded-full" : "rounded-lg"
            )}
            data-testid={`${testId}-remove`}
          >
            <X className={clsx("text-white", config.removeIcon)} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Error Message */}
      {displayError && (
        <div className="flex gap-1.5 items-start p-2 max-w-xs bg-red-50 rounded-lg border border-red-200">
          <svg
            className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-xs font-medium text-red-700 leading-tight">{displayError}</p>
        </div>
      )}

      {/* Helper Text */}
      {!displayError && (
        <p className="text-[10px] text-gray-500 text-center max-w-xs">
          PNG, JPG tối đa {maxSizeInMB}MB
        </p>
      )}
    </div>
  );
};

export default ImageIconUpload;
