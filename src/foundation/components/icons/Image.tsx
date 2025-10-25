import React, { useState } from "react";

import { images } from "@/assets/image";

export type ImageName = keyof typeof images;

const objectFitMap = {
  cover: "object-cover",
  contain: "object-contain",
  fill: "object-fill",
  none: "object-none",
} as const;

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  name?: ImageName;
  src?: string;
  publicSrc?: string;
  alt: string;
  rounded?: boolean;
  objectFit?: keyof typeof objectFitMap;
  fallbackType?: "none" | "default"; // 'none' = không hiển thị gì, 'default' = box rỗng
  loading?: "eager" | "lazy";
  className?: string;
  testId?: string;
}

/**
 * Image
 *
 * Props:
 * - name?: ImageName — Tên ảnh (key từ bộ Images).
 * - src?: string — Đường dẫn ảnh (ưu tiên sau name).
 * - alt: string — Mô tả alt bắt buộc (cho accessibility).
 * - rounded?: boolean — Bo góc ảnh (default: false).
 * - objectFit?: 'cover' | 'contain' | 'fill' | 'none' — Cách ảnh co giãn trong khung (default: 'cover').
 * - fallbackType?: 'none' | 'default' — Xử lý khi lỗi load ảnh ('none' = không render gì, 'default' = box trống).
 * - className?: string — Class bổ sung cho thẻ img hoặc fallback box.
 * - Các props HTML img gốc khác (React.ImgHTMLAttributes).
 *
 * Notes:
 * - Nếu name có giá trị → ưu tiên lấy từ bộ Images, nếu không sẽ dùng src.
 * - Nếu ảnh lỗi và fallbackType = 'default', sẽ render box placeholder "No image".
 * - Nếu onClick có truyền → ảnh sẽ có cursor-pointer.
 *
 * Example:
 * ```tsx
 * <Image name="logo" alt="Company logo" objectFit="contain" />
 * ```
 */
const Image: React.FC<ImageProps> = ({
  name,
  src,
  alt,
  rounded = false,
  objectFit = "cover",
  fallbackType = "default",
  loading = "lazy",
  className = "",
  onClick,
  testId,
  publicSrc,
  ...props
}) => {
  const actualSrc = publicSrc || (name ? images[name] : src);

  const [imgSrc] = useState(actualSrc);
  const [hasError, setHasError] = useState(false);

  if (!actualSrc || hasError) {
    if (fallbackType === "none") return null;
    return (
      <div
        className={`text-caption-10 flex items-center justify-center text-neutral-9 ${rounded ? "rounded" : ""} ${className}`}
        style={{ aspectRatio: "1/1" }}
      ></div>
    );
  }

  if (!actualSrc) {
    console.warn("⚠️ [Image]: No valid image source provided");
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      loading={loading}
      onClick={onClick}
      onError={() => {
        setHasError(true);
      }}
      className={`${objectFitMap[objectFit]} ${rounded ? "rounded" : ""} ${onClick ? "cursor-pointer" : ""} ${className}`}
      {...props}
      data-testid={testId}
    />
  );
};

export default React.memo(Image);
