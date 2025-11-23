import React, { useRef, useState } from "react";
import { ImageUp, X, Upload } from "lucide-react";

export interface ImageUploadMultiProps {
  value?: { url: string; publicId?: string }[] | null;
  onChange?: (value: { url: string; publicId?: string }[] | null) => void;
  onUpload?: (file: File) => Promise<{ url: string; publicId?: string }>;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: string;
  maxFiles?: number;
  maxSizeInMB?: number;
}

const ImageUploadMulti: React.FC<ImageUploadMultiProps> = ({
  value = [],
  onChange,
  onUpload,
  disabled = false,
  className = "",
  label = "Upload Images",
  error,
  maxFiles = 10,
  maxSizeInMB = 5,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadingCount, setUploadingCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const images = value || [];
  const canUploadMore = images.length < maxFiles;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check if adding these files would exceed max
    if (images.length + files.length > maxFiles) {
      setUploadError(`Maximum ${maxFiles} images allowed`);
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadingCount(files.length);

    const validFiles: File[] = [];

    // Validate files
    for (const file of files) {
      if (file.size > maxSizeInMB * 1024 * 1024) {
        setUploadError(`Some files exceed ${maxSizeInMB}MB limit`);
        continue;
      }
      if (!file.type.startsWith("image/")) {
        setUploadError("Only image files are allowed");
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      setIsUploading(false);
      setUploadingCount(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    try {
      if (onUpload) {
        const uploadPromises = validFiles.map((file) => onUpload(file));
        const results = await Promise.all(uploadPromises);
        onChange?.([...images, ...results]);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      setUploadingCount(0);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange?.(newImages.length > 0 ? newImages : null);
    setUploadError(null);
  };

  const handleClick = () => {
    if (!disabled && !isUploading && canUploadMore) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-neutral-9">
          {label}
          <span className="ml-2 text-xs font-normal text-neutral-5">
            ({images.length}/{maxFiles})
          </span>
        </label>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* Existing Images */}
        {images.map((image, index) => (
          <div
            key={`${image.publicId || image.url}-${index}`}
            className="relative group aspect-square"
          >
            <div className="w-full h-full overflow-hidden rounded-xl border-2 border-border-1 shadow-sm transition-all duration-200 hover:shadow-md">
              <img
                src={image.url}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
              {!disabled && (
                <div className="absolute inset-0 bg-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-error hover:bg-error/90 text-button-text text-xs font-medium rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    <X className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Upload Area */}
        {canUploadMore && (
          <div
            className={`relative aspect-square border-2 border-dashed rounded-xl transition-all duration-200 ${
              disabled
                ? "border-border-1 bg-input-bg-disabled cursor-not-allowed opacity-60"
                : "border-border-2 hover:border-primary-5 hover:bg-primary-1 cursor-pointer active:scale-[0.98]"
            } ${isUploading && "border-primary-5 bg-primary-1"} ${
              (error || uploadError) && "border-error bg-error/10"
            }`}
            onClick={handleClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              disabled={disabled || isUploading}
              className="hidden"
            />

            {isUploading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
                <div className="w-8 h-8 border-3 border-primary-6 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-medium text-primary-6 text-center">
                  Uploading {uploadingCount}...
                </p>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
                <div className="p-2.5 bg-gradient-to-br from-primary-5 to-primary-6 rounded-full shadow-lg">
                  <Upload className="w-5 h-5 text-button-text" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-9">Add Images</p>
                  <p className="mt-0.5 text-[10px] text-neutral-5">Up to {maxSizeInMB}MB</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {(error || uploadError) && (
        <div className="flex items-start gap-2 p-3 bg-error/10 rounded-lg border border-error/30">
          <svg
            className="w-4 h-4 text-error mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-xs font-medium text-error">{error || uploadError}</p>
        </div>
      )}

      {/* Helper Text */}
      {!error && !uploadError && canUploadMore && (
        <p className="text-xs text-neutral-5">
          You can upload up to {maxFiles - images.length} more image
          {maxFiles - images.length !== 1 ? "s" : ""}. Supported formats: PNG, JPG, GIF
        </p>
      )}
    </div>
  );
};

export default ImageUploadMulti;
