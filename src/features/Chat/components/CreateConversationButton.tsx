import React from "react";
import clsx from "clsx";
import { Store, HeadphonesIcon } from "lucide-react";
import Button from "@/foundation/components/buttons/Button";

interface CreateConversationButtonProps {
  type: "admin" | "shop";
  shopId?: string;
  context?: {
    productId?: string;
    orderId?: string;
    context?: string; // "product", "order", "deposit", "shop_registration", etc.
  };
  initialMessage?: string;
  variant?: "button" | "icon";
  className?: string;
  children?: React.ReactNode;
}

const CreateConversationButton: React.FC<CreateConversationButtonProps> = ({
  type,
  shopId,
  context,
  variant = "button",
  className = "",
  children,
}) => {
  const handleCreateConversation = () => {
    const metadata: Record<string, any> = {};
    
    if (context?.productId) {
      metadata.productId = context.productId;
      metadata.context = "product";
    }
    if (context?.orderId) {
      metadata.orderId = context.orderId;
      metadata.context = "order";
    }
    if (context?.context) {
      metadata.context = context.context;
    }

    // Store context in sessionStorage for MessageInput to use when sending first message
    sessionStorage.setItem(
      "chatContext",
      JSON.stringify({
        type,
        targetId: type === "shop" ? shopId : undefined,
        metadata,
      })
    );

    // Navigate to chat page if not already there
    if (window.location.pathname !== "/chat") {
      window.location.href = "/chat";
    }
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleCreateConversation}
        className={clsx(
          "p-2 rounded-lg hover:bg-neutral-2 transition-colors",
          className
        )}
        title={type === "admin" ? "Chat với CSKH" : "Chat với Shop"}
      >
        {type === "admin" ? (
          <HeadphonesIcon className="w-5 h-5 text-primary-6" />
        ) : (
          <Store className="w-5 h-5 text-green-6" />
        )}
      </button>
    );
  }

  return (
    <Button
      onClick={handleCreateConversation}
      icon={type === "admin" ? <HeadphonesIcon className="w-4 h-4" /> : <Store className="w-4 h-4" />}
      className={className}
    >
      {children || (type === "admin" ? "Chat với CSKH" : "Chat với Shop")}
    </Button>
  );
};

export default CreateConversationButton;

