import { CartItem } from "@/core/api/cart/type";

type NullableRecord = Record<string, any> | null | undefined;

const isRecord = (value: unknown): value is Record<string, any> => {
  return typeof value === "object" && value !== null;
};

const extractImageUrl = (rawImage: unknown): string | undefined => {
  if (!rawImage) return undefined;
  if (typeof rawImage === "string") return rawImage;
  if (isRecord(rawImage) && typeof rawImage.url === "string") return rawImage.url;
  if (Array.isArray(rawImage) && rawImage.length > 0) {
    const first = rawImage[0];
    if (typeof first === "string") return first;
    if (isRecord(first) && typeof first.url === "string") return first.url;
  }
  return undefined;
};

export interface CartItemVariantInfo {
  attributes?: Record<string, string>;
  sku?: string;
  image?: string;
}

export const getCartItemVariantInfo = (item: CartItem): CartItemVariantInfo => {
  const snapshot = item.variantSnapshot;
  const variantPayload: NullableRecord =
    (isRecord(item.variantId) ? item.variantId : undefined) ||
    (isRecord((item as any).variant) ? (item as any).variant : undefined);

  const attributes: Record<string, string> | undefined =
    (snapshot?.attributes as Record<string, string> | undefined) ||
    (variantPayload?.attributes as Record<string, string> | undefined) ||
    (isRecord((item as any).variantAttributes)
      ? ((item as any).variantAttributes as Record<string, string>)
      : undefined);

  const sku: string | undefined =
    (typeof snapshot?.sku === "string" && snapshot.sku.trim()
      ? snapshot.sku
      : undefined) ||
    (typeof variantPayload?.sku === "string" && variantPayload.sku.trim()
      ? variantPayload.sku
      : undefined) || (item as any).variantSku;

  const image =
    snapshot?.image ||
    extractImageUrl(variantPayload?.image ?? variantPayload?.images);

  return { attributes, sku, image };
};

