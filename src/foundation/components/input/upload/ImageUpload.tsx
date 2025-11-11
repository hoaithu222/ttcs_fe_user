import React, { useRef, useState } from "react";
import { ImageUp, X } from "lucide-react";
import clsx from "clsx";
import Spinner from "@/foundation/components/feedback/Spinner";

export interface ImageUploadProps {
  value?: { url: string; publicId?: string } | null;
  onChange?: (value: { url: string; publicId?: string } | null) => void;
  onUpload?: (file: File) => Promise<{ url: string; publicId?: string }>;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: string;
  aspectRatio?: "square" | "wide" | "portrait";
  maxSizeInMB?: number;
  testId?: string;
  width?: string | number;
  height?: string | number;
  padding?: string | number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onUpload,
  disabled = false,
  className = "",
  label = "Upload Image",
  error,
  aspectRatio = "square",
  maxSizeInMB = 5,
  testId,
  width = "w-40",
  height = "h-40",
  padding = "p-6",
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectRatioClasses = {
    square: "aspect-square",
    wide: "aspect-video",
    portrait: "aspect-[3/4]",
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSizeInMB * 1024 * 1024) {
      setUploadError(`File size exceeds ${maxSizeInMB}MB limit`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file");
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
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onChange?.(null);
    setUploadError(null);
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={clsx("space-y-2", className)} data-testid={testId}>
      {label && <label className="block text-sm font-semibold text-neutral-9">{label}</label>}

      <div
        className="relative"
        style={{ width: typeof width === "number" ? `${width}px` : undefined }}
      >
        {value ? (
          <div className="relative group">
            <div
              className={clsx(
                "overflow-hidden relative rounded-xl border-2 border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md",
                typeof width === "string" ? width : "",
                typeof height === "string" ? height : "",
                aspectRatioClasses[aspectRatio]
              )}
              style={{
                width: typeof width === "number" ? `${width}px` : undefined,
                height: typeof height === "number" ? `${height}px` : undefined,
              }}
            >
              <img
                src={value.url}
                alt="Uploaded"
                className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-105"
              />
              {!disabled && (
                <div className="flex absolute inset-0 justify-center items-center opacity-0 transition-opacity duration-200 bg-black/60 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="flex gap-2 items-center px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg shadow-lg transition-all duration-200 hover:bg-red-600 hover:scale-105"
                    data-testid={`${testId}-remove`}
                  >
                    <X className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div
            className={clsx(
              "relative border-2 border-dashed rounded-xl transition-all duration-200",
              disabled
                ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer active:scale-[0.98]",
              isUploading && "border-blue-400 bg-blue-50/50",
              (error || uploadError) && "border-red-300 bg-red-50/30",
              typeof width === "string" ? width : "",
              typeof height === "string" ? height : "",
              aspectRatioClasses[aspectRatio]
            )}
            style={{
              width: typeof width === "number" ? `${width}px` : undefined,
              height: typeof height === "number" ? `${height}px` : undefined,
            }}
            onClick={handleClick}
            data-testid={`${testId}-upload-area`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={disabled || isUploading}
              className="hidden"
              data-testid={`${testId}-input`}
            />

            {isUploading ? (
              <div className="flex absolute inset-0 flex-col gap-3 justify-center items-center">
                <Spinner />
                <p className="text-sm font-medium text-blue-600">Uploading...</p>
              </div>
            ) : (
              <div
                className={clsx(
                  "flex absolute inset-0 flex-col gap-3 justify-center items-center text-center",
                  padding
                )}
              >
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg">
                  <ImageUp className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Click to upload</p>
                  <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to {maxSizeInMB}MB</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {(error || uploadError) && (
        <div className="flex gap-2 items-start p-3 bg-red-50 rounded-lg border border-red-200">
          <svg
            className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-xs font-medium text-red-700">{error || uploadError}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
