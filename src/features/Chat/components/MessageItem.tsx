import React, { memo } from "react";
import clsx from "clsx";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Check, CheckCheck } from "lucide-react";
import Image from "@/foundation/components/icons/Image";
import ProductCard from "./ProductCard";
import ProductCarousel from "./ProductCarousel";
import ShopCard from "./ShopCard";
import ShopCarousel from "./ShopCarousel";
import CategoryCard from "./CategoryCard";
import type { ChatMessage, ChatConversation } from "@/core/api/chat/type";
import { images } from "@/assets/image";

interface MessageItemProps {
  message: ChatMessage;
  isOwn: boolean;
  currentUserId?: string;
  conversation?: ChatConversation | null;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isOwn, conversation }) => {
  const messageDate = new Date(message.createdAt);
  const isToday = messageDate.toDateString() === new Date().toDateString();
  const timeStr = format(messageDate, isToday ? "HH:mm" : "dd/MM/yyyy HH:mm", {
    locale: vi,
  });

  return (
    <div
      className={clsx(
        "flex gap-3 mb-3 group",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      {!isOwn && (() => {
        // Get avatar - use CSKH.png for CSKH conversation, AI avatar for AI conversation, otherwise use sender avatar from backend
        const getSenderAvatar = () => {
          if (conversation?.type === "admin" && conversation?.metadata?.context === "CSKH") {
            return images.CSKH;
          }
          // Check if this is an AI message
          const isAiMessage = conversation?.type === "ai" && 
                             (message.metadata?.isAiMessage === true || 
                              message.senderName === "Chatbot");
          if (isAiMessage) {
            return images.chatAi; // Use AI avatar
          }
          return message.senderAvatar;
        };

        const senderAvatar = getSenderAvatar();

        return (
        <div className="flex-shrink-0">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-primary-5 to-primary-7 flex items-center justify-center shadow-sm">
              {senderAvatar ? (
              <Image
                  src={senderAvatar}
                alt={message.senderName || "User"}
                rounded
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary-6 text-neutral-1 flex items-center justify-center text-sm font-semibold">
                {(message.senderName || "U")[0].toUpperCase()}
              </div>
            )}
          </div>
        </div>
        );
      })()}

      <div className={clsx("flex flex-col max-w-[75%] sm:max-w-[65%]", isOwn ? "items-end" : "items-start")}>
        {!isOwn && (
          <span className="text-xs text-neutral-7 mb-1.5 px-1 font-medium">
            {message.senderName || "Người dùng"}
          </span>
        )}

        {/* Product Carousel - Render for messages with suggested products */}
        {/* Show for AI messages that have suggestedProducts in metadata */}
        {message.metadata?.suggestedProducts && 
         Array.isArray(message.metadata.suggestedProducts) &&
         message.metadata.suggestedProducts.length > 0 && (
          <div className="mb-2 w-full">
            {message.metadata.suggestedProducts.length > 1 ? (
              <ProductCarousel
                products={message.metadata.suggestedProducts.map((product: any) => ({
                  productId: product.productId,
                  productName: product.productName,
                  productImage: product.productImage,
                  productPrice: product.productPrice,
                  shopId: product.shopId,
                  shopName: product.shopName,
                }))}
              />
            ) : (
              <ProductCard
                productId={message.metadata.suggestedProducts[0]?.productId}
                productName={message.metadata.suggestedProducts[0]?.productName}
                productImage={message.metadata.suggestedProducts[0]?.productImage}
                productPrice={message.metadata.suggestedProducts[0]?.productPrice}
                shopId={message.metadata.suggestedProducts[0]?.shopId}
                shopName={message.metadata.suggestedProducts[0]?.shopName}
                showActions={true}
              />
            )}
          </div>
        )}

        {/* Single Product Card - Render for messages with single product metadata (backward compatibility) */}
        {!message.metadata?.suggestedProducts &&
         message.metadata?.productId && 
         message.metadata?.productName && (
          <div className="mb-2 w-full">
            <ProductCard
              productId={message.metadata.productId}
              productName={message.metadata.productName}
              productImage={message.metadata.productImage}
              productPrice={message.metadata.productPrice}
            />
          </div>
        )}

        {/* Shop Carousel - Render for messages with suggested shops */}
        {message.metadata?.suggestedShops && 
         Array.isArray(message.metadata.suggestedShops) &&
         message.metadata.suggestedShops.length > 0 && (
          <div className="mb-2 w-full">
            {message.metadata.suggestedShops.length > 1 ? (
              <ShopCarousel
                shops={message.metadata.suggestedShops.map((shop: any) => ({
                  shopId: shop.shopId,
                  shopName: shop.shopName,
                  shopLogo: shop.shopLogo,
                  shopDescription: shop.shopDescription,
                  rating: shop.rating,
                  followCount: shop.followCount,
                  productCount: shop.productCount,
                  reviewCount: shop.reviewCount,
                  isVerified: shop.isVerified,
                }))}
              />
            ) : (
              <ShopCard
                shopId={message.metadata.suggestedShops[0]?.shopId}
                shopName={message.metadata.suggestedShops[0]?.shopName}
                shopLogo={message.metadata.suggestedShops[0]?.shopLogo}
                shopDescription={message.metadata.suggestedShops[0]?.shopDescription}
                rating={message.metadata.suggestedShops[0]?.rating}
                followCount={message.metadata.suggestedShops[0]?.followCount}
                productCount={message.metadata.suggestedShops[0]?.productCount}
                reviewCount={message.metadata.suggestedShops[0]?.reviewCount}
                isVerified={message.metadata.suggestedShops[0]?.isVerified}
              />
            )}
          </div>
        )}

        {/* Category Cards - Render for messages with suggested categories */}
        {message.metadata?.suggestedCategories && 
         Array.isArray(message.metadata.suggestedCategories) &&
         message.metadata.suggestedCategories.length > 0 && (
          <div className="mb-2 w-full space-y-2">
            {message.metadata.suggestedCategories.map((category: any, index: number) => (
              <CategoryCard
                key={category.categoryId || category._id || index}
                categoryId={category.categoryId || category._id}
                categoryName={category.categoryName || category.name}
                categoryImage={category.categoryImage || category.image}
                categoryDescription={category.categoryDescription || category.description}
                productCount={category.productCount}
                slug={category.slug}
              />
            ))}
          </div>
        )}

        {/* Check if message has text content */}
        {(() => {
          const hasText = message.message && typeof message.message === 'string' && message.message.trim();
          const hasAttachments = message.attachments && message.attachments.length > 0;
          const onlyImages = hasAttachments && !hasText;

          // If only images, render without background bubble
          if (onlyImages) {
            return (
              <div className="space-y-2">
                {message.attachments.map((attachment, idx) => (
                  <div key={idx} className="rounded-lg overflow-hidden">
                    {attachment.type?.startsWith("image/") ? (
                      <Image
                        src={attachment.url}
                        alt={attachment.name || "Attachment"}
                        className="max-w-full h-auto rounded-lg"
                      />
                    ) : (
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 bg-neutral-2 rounded hover:bg-neutral-3 transition-colors"
                      >
                        <span className="text-sm">{attachment.name || "File"}</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            );
          }

          // If has text or both text and attachments, render with background bubble
          return (
            <div
              className={clsx(
                "rounded-2xl px-4 py-2.5 shadow-sm transition-all duration-200",
                isOwn
                  ? "bg-gradient-to-br from-primary-6 to-primary-7 text-white rounded-br-md"
                  : "bg-gradient-to-br from-background-2 to-background-1 text-neutral-10 rounded-bl-md border border-neutral-3"
              )}
            >
              {hasText && (
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.message}</p>
              )}

              {hasAttachments && (
                <div className={clsx("space-y-2", hasText ? "mt-2" : "")}>
                  {message.attachments.map((attachment, idx) => (
                    <div key={idx} className="rounded-lg overflow-hidden">
                      {attachment.type?.startsWith("image/") ? (
                        <Image
                          src={attachment.url}
                          alt={attachment.name || "Attachment"}
                          className="max-w-full h-auto rounded-lg"
                        />
                      ) : (
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 bg-neutral-2 rounded hover:bg-neutral-3 transition-colors"
                        >
                          <span className="text-sm">{attachment.name || "File"}</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        <div className={clsx("flex items-center gap-1.5 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity", isOwn ? "flex-row-reverse" : "")}>
          <span className="text-xs text-neutral-5">{timeStr}</span>
          {isOwn && (
            <div className="flex items-center">
              {message.isRead ? (
                <CheckCheck className="w-3.5 h-3.5 text-primary-6" />
              ) : message.isDelivered ? (
                <CheckCheck className="w-3.5 h-3.5 text-neutral-5" />
              ) : (
                <Check className="w-3.5 h-3.5 text-neutral-5" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(MessageItem);

