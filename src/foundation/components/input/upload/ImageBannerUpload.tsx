import React, { useRef, useState } from "react";
import { ImageUp, X, Image as ImageIcon } from "lucide-react";
import clsx from "clsx";
import Spinner from "@/foundation/components/feedback/Spinner";

export interface ImageBannerUpdateProps {
  value?: { url: string; publicId?: string } | null;
  onChange?: (value: { url: string; publicId?: string } | null) => void;
  onUpload?: (file: File) => Promise<{ url: string; publicId?: string }>;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: string;
  aspectRatio?: "square" | "wide" | "portrait" | "banner";
  maxSizeInMB?: number;
  testId?: string;
  description?: string;
  showPreviewOverlay?: boolean;
}

const ImageBannerUpdate: React.FC<ImageBannerUpdateProps> = ({
  value,
  onChange,
  onUpload,
  disabled = false,
  className = "",
  label = "Banner Image",
  error,
  aspectRatio = "banner",
  maxSizeInMB = 5,
  testId = "image-banner-update",
  description,
  showPreviewOverlay = true,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectRatioClasses = {
    square: "aspect-square",
    wide: "aspect-video",
    portrait: "aspect-[3/4]",
    banner: "aspect-[21/9]", // Ultra-wide banner ratio
  };

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

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
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
    <div className={clsx("w-full space-y-3", className)} data-testid={testId}>
      {/* Label & Description */}
      {(label || description) && (
        <div className="space-y-1">
          {label && <label className="block text-sm font-semibold text-neutral-9">{label}</label>}
          {description && <p className="text-xs text-neutral-6 leading-relaxed">{description}</p>}
        </div>
      )}

      {/* Upload Area */}
      <div className="relative w-full">
        {value ? (
          // Preview State
          <div className="relative group">
            <div
              className={clsx(
                "relative overflow-hidden rounded-2xl border-2 border-gray-200 shadow-md transition-all duration-300",
                !disabled && "hover:shadow-xl hover:border-blue-300",
                aspectRatioClasses[aspectRatio]
              )}
            >
              <img
                src={value.url}
                alt="Banner preview"
                className={clsx(
                  "object-cover w-full h-full",
                  !disabled && "transition-transform duration-300 group-hover:scale-105"
                )}
              />

              {/* Overlay Actions */}
              {!disabled && showPreviewOverlay && (
                <div className="flex absolute inset-0 gap-3 justify-center items-center opacity-0 transition-all duration-300 bg-gradient-to-t from-black/80 via-black/50 to-black/30 backdrop-blur-[2px] group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={handleClick}
                    className="flex gap-2 items-center px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl shadow-lg transition-all duration-200 hover:bg-blue-700 hover:scale-105 active:scale-95"
                    data-testid={`${testId}-change`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    Thay đổi
                  </button>
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="flex gap-2 items-center px-5 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl shadow-lg transition-all duration-200 hover:bg-red-600 hover:scale-105 active:scale-95"
                    data-testid={`${testId}-remove`}
                  >
                    <X className="w-4 h-4" />
                    Xóa
                  </button>
                </div>
              )}

              {/* Remove button (always visible on mobile) */}
              {!disabled && !showPreviewOverlay && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="flex absolute top-3 right-3 gap-2 items-center p-2 text-white bg-red-500 rounded-full shadow-lg transition-all duration-200 hover:bg-red-600 hover:scale-110"
                  data-testid={`${testId}-remove`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          // Upload State
          <div
            className={clsx(
              "relative border-2 border-dashed rounded-2xl transition-all duration-300",
              aspectRatioClasses[aspectRatio],
              disabled
                ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer",
              isUploading && "border-blue-500 bg-blue-50/50",
              isDragging && "border-blue-500 bg-blue-100/60 scale-[1.02]",
              displayError && "border-red-300 bg-red-50/30"
            )}
            onClick={handleClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            data-testid={`${testId}-upload-area`}
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

            <div className="flex absolute inset-0 flex-col gap-4 justify-center items-center p-8 text-center">
              {isUploading ? (
                <>
                  <Spinner />
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-blue-600">Đang tải lên...</p>
                    <p className="text-xs text-blue-500">Vui lòng đợi trong giây lát</p>
                  </div>
                </>
              ) : (
                <>
                  {/* Icon with gradient background */}
                  <div
                    className={clsx(
                      "p-4 rounded-2xl shadow-lg transition-all duration-300",
                      isDragging
                        ? "bg-gradient-to-br from-blue-600 to-blue-700 scale-110"
                        : "bg-gradient-to-br from-blue-500 to-blue-600 hover:scale-105"
                    )}
                  >
                    <ImageUp className="w-8 h-8 text-white" strokeWidth={2} />
                  </div>

                  {/* Text content */}
                  <div className="space-y-2">
                    <div>
                      <p className="text-base font-semibold text-gray-800">
                        {isDragging ? "Thả file vào đây" : "Nhấp để tải lên hoặc kéo thả"}
                      </p>
                      <p className="mt-1.5 text-sm text-gray-600">
                        PNG, JPG, GIF tối đa {maxSizeInMB}MB
                      </p>
                    </div>
                    {aspectRatio === "banner" && (
                      <p className="text-xs text-gray-500 italic">
                        Khuyến nghị: 2100 x 900px hoặc tỷ lệ 21:9
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {displayError && (
        <div className="flex gap-2.5 items-start p-3.5 bg-red-50 rounded-xl border border-red-200 animate-in slide-in-from-top-2 duration-300">
          <svg
            className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm font-medium text-red-700 leading-relaxed">{displayError}</p>
        </div>
      )}
    </div>
  );
};

export default ImageBannerUpdate;
