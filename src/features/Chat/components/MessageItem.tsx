import React, { memo } from "react";
import clsx from "clsx";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Check, CheckCheck } from "lucide-react";
import Image from "@/foundation/components/icons/Image";
import ProductCard from "./ProductCard";
import type { ChatMessage } from "@/core/api/chat/type";

interface MessageItemProps {
  message: ChatMessage;
  isOwn: boolean;
  currentUserId?: string;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isOwn }) => {
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
      {!isOwn && (
        <div className="flex-shrink-0">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-primary-5 to-primary-7 flex items-center justify-center shadow-sm">
            {message.senderAvatar ? (
              <Image
                src={message.senderAvatar}
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
      )}

      <div className={clsx("flex flex-col max-w-[75%] sm:max-w-[65%]", isOwn ? "items-end" : "items-start")}>
        {!isOwn && (
          <span className="text-xs text-neutral-7 mb-1.5 px-1 font-medium">
            {message.senderName || "Người dùng"}
          </span>
        )}

        {/* Product Card - Render for messages with product metadata */}
        {/* Show for user's messages (isOwn) or if message type is "product" */}
        {message.metadata?.productId && 
         message.metadata?.productName && 
         (isOwn || message.type === "product") && (
          <div className="mb-2 w-full">
            <ProductCard
              productId={message.metadata.productId}
              productName={message.metadata.productName}
              productImage={message.metadata.productImage}
              productPrice={message.metadata.productPrice}
            />
          </div>
        )}

        <div
          className={clsx(
            "rounded-2xl px-4 py-2.5 shadow-sm transition-all duration-200",
            isOwn
              ? "bg-gradient-to-br from-primary-6 to-primary-7 text-white rounded-br-md"
              : "bg-gradient-to-br from-background-2 to-background-1 text-neutral-10 rounded-bl-md border border-neutral-3"
          )}
        >
          {message.message && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.message}</p>
          )}

          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
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

