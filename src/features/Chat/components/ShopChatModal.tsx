import React, { useState, useRef, useEffect, useMemo } from "react";
import { Minus, Send, X } from "lucide-react";
import * as Form from "@radix-ui/react-form";
import { useAppDispatch, useAppSelector } from "@/app/store";
import {
  selectCurrentConversation,
  selectChatMessages,
  selectChatStatus,
  selectConversations,
} from "@/app/store/slices/chat/chat.selector";
import { selectUser } from "@/features/Auth/components/slice/auth.selector";
import { getMessagesStart, markAsReadStart, setCurrentConversation } from "@/app/store/slices/chat/chat.slice";
import { createConversationStart } from "@/app/store/slices/chat/chat.slice";
import { socketClients, SOCKET_EVENTS } from "@/core/socket";
import Button from "@/foundation/components/buttons/Button";
import TextArea from "@/foundation/components/input/TextArea";
import MessageItem from "./MessageItem";
import Spinner from "@/foundation/components/feedback/Spinner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { ChatMessage, ProductMetadata } from "@/core/api/chat/type";
import Image from "@/foundation/components/icons/Image";

interface ShopChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopId?: string;
  shopName?: string;
  shopAvatar?: string;
  productId?: string;
  productName?: string;
  productImage?: string;
  productPrice?: number;
}

const ShopChatModal: React.FC<ShopChatModalProps> = ({
  isOpen,
  onClose,
  shopId,
  shopName = "Cửa hàng",
  shopAvatar,
  productId,
  productName,
  productImage,
  productPrice,
}) => {
  const dispatch = useAppDispatch();
  const currentConversation = useAppSelector(selectCurrentConversation);
  const conversations = useAppSelector(selectConversations);
  const messages = useAppSelector((state) =>
    currentConversation
      ? selectChatMessages(currentConversation._id)(state)
      : []
  );
  const status = useAppSelector(selectChatStatus);
  const user = useAppSelector(selectUser);
  const currentUserId = user?._id;
  const [message, setMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasCreatedConversationRef = useRef(false);
  const hasSentProductMessageRef = useRef(false);
  const conversationIdForProductRef = useRef<string | null>(null);
  const isNewlyCreatedConversationRef = useRef(false);

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current && isOpen && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && !isMinimized && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isMinimized]);

  // Auto create/open conversation when modal opens
  useEffect(() => {
    if (!isOpen || !shopId) return;

    // Find existing conversation between user and this shop (check all conversations, not just current)
    // Look for conversation with type "shop" and metadata.shopId matching
    const existingShopConversation = conversations.find(
      (conv: any) => 
        conv.type === "shop" && 
        conv.metadata?.shopId === shopId &&
        conv._id // Make sure it's a real conversation, not temp
    );

    if (existingShopConversation?._id) {
      // Conversation exists, set it as current and load messages
      if (currentConversation?._id !== existingShopConversation._id) {
        dispatch(setCurrentConversation(existingShopConversation));
      }
      
      if (!hasCreatedConversationRef.current) {
        hasCreatedConversationRef.current = true;
        // Mark that this is NOT a newly created conversation
        isNewlyCreatedConversationRef.current = false;
        // Mark to send product message if productId exists and not already sent
        if (productId) {
          conversationIdForProductRef.current = `pending_${shopId}_${productId}`;
        }
      }
      
      return;
    }

    // Check current conversation as fallback
    const isCurrentShopConversation = currentConversation?.type === "shop" && 
      currentConversation?.metadata?.shopId === shopId;

    if (isCurrentShopConversation && currentConversation?._id) {
      if (!hasCreatedConversationRef.current) {
        hasCreatedConversationRef.current = true;
        // Mark that this is NOT a newly created conversation
        isNewlyCreatedConversationRef.current = false;
        // Mark to send product message if productId exists and not already sent
        if (productId) {
          conversationIdForProductRef.current = `pending_${shopId}_${productId}`;
        }
      }
      
      return;
    }

    // No existing conversation found, create new one
    // Note: Don't include productId in metadata to avoid creating separate conversations
    // Product info will be sent as a message instead
    if (!hasCreatedConversationRef.current) {
      const metadata: Record<string, any> = {
        shopId,
        shopName,
      };

      dispatch(
        createConversationStart({
          data: {
            type: "shop",
            targetId: shopId,
            metadata,
          },
        })
      );

      hasCreatedConversationRef.current = true;
      // Mark that this IS a newly created conversation - don't auto-send product message
      isNewlyCreatedConversationRef.current = true;
      // Mark that we're creating a conversation with product for this shop
      if (productId) {
        conversationIdForProductRef.current = `pending_${shopId}_${productId}`;
      }
    }
  }, [isOpen, shopId, shopName, productId, productName, productImage, productPrice, currentConversation, conversations, dispatch]);

  // Load messages and join socket room when current conversation is set for this shop
  useEffect(() => {
    if (!isOpen || !shopId || !currentConversation?._id) return;

    // Check if this conversation is for the current shop
    const isShopConversation = currentConversation.type === "shop" && 
      currentConversation.metadata?.shopId === shopId;

    if (!isShopConversation) return;

    // Load messages if not already loaded
    const hasMessages = messages.length > 0;
    if (!hasMessages) {
      dispatch(
        getMessagesStart({
          conversationId: currentConversation._id,
          query: { page: 1, limit: 50 },
        })
      );
    }

    // Join socket room to receive real-time messages
    const channel = (currentConversation.channel as "admin" | "shop" | "ai") || "shop";
    let socketClient;

    switch (channel) {
      case "admin":
        socketClient = socketClients.adminChat;
        break;
      case "shop":
        socketClient = socketClients.shopChat;
        break;
      case "ai":
        socketClient = socketClients.aiChat;
        break;
      default:
        socketClient = socketClients.shopChat;
    }

    if (socketClient) {
      const socket = socketClient.connect();
      if (socket && socket.connected) {
        socket.emit(SOCKET_EVENTS.CHAT_CONVERSATION_JOIN, {
          conversationId: currentConversation._id,
        });
      }
    }
  }, [isOpen, shopId, currentConversation?._id, currentConversation?.type, currentConversation?.metadata?.shopId, messages.length, dispatch]);

  // Auto send product message when opening from DetailProduct (has productId)
  // Only send if conversation already existed (not newly created)
  useEffect(() => {
    if (
      !isOpen ||
      !productId ||
      !currentConversation?._id ||
      hasSentProductMessageRef.current ||
      !user?._id ||
      isNewlyCreatedConversationRef.current // Don't send if this is a newly created conversation
    ) {
      return;
    }

    // Wait a bit for conversation to be fully ready
    const timer = setTimeout(() => {
      // Check if we should send (only if not already sent in this session)
      if (hasSentProductMessageRef.current) {
        return;
      }

      const channel = (currentConversation.channel as "admin" | "shop" | "ai") || "shop";
      let socketClient;

      switch (channel) {
        case "admin":
          socketClient = socketClients.adminChat;
          break;
        case "shop":
          socketClient = socketClients.shopChat;
          break;
        case "ai":
          socketClient = socketClients.aiChat;
          break;
        default:
          socketClient = socketClients.shopChat;
      }

      if (!socketClient) {
        console.error("Socket client not available");
        return;
      }

      const socket = socketClient.connect();
      if (!socket || !socket.connected) {
        console.error("Socket not connected");
        return;
      }

      // Send product message with metadata (always send when opening from DetailProduct)
      const productMetadata: ProductMetadata = {
        productId,
        productName,
        productImage,
        productPrice,
        shopId,
        shopName,
      };

      socket.emit(SOCKET_EVENTS.CHAT_MESSAGE_SEND, {
        conversationId: currentConversation._id,
        message: productName ? `Tôi đang quan tâm đến sản phẩm: ${productName}` : "Tôi đang quan tâm đến sản phẩm này",
        type: "product", // Set message type to "product"
        metadata: productMetadata, // Always send product metadata when opening from DetailProduct
      });

      hasSentProductMessageRef.current = true;
    }, 500);

    return () => clearTimeout(timer);
  }, [
    isOpen,
    productId, // Key: only send when productId exists (opening from DetailProduct)
    productName,
    productImage,
    productPrice,
    shopId,
    shopName,
    currentConversation?._id,
    user?._id,
  ]);

  // Reset flag when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Reset flags when modal closes to allow reloading when reopening
      hasCreatedConversationRef.current = false;
      hasSentProductMessageRef.current = false;
      conversationIdForProductRef.current = null;
      isNewlyCreatedConversationRef.current = false;
      setIsMinimized(false);
    }
  }, [isOpen]);

  // Mark as read only when modal is open, visible, and messages are loaded
  useEffect(() => {
    if (
      currentConversation && 
      messages.length > 0 && 
      isOpen && 
      !isMinimized && // Only mark as read when modal is not minimized
      status !== "LOADING" // Only mark as read after messages are loaded
    ) {
      // Mark as read when viewing conversation (modal is open and visible)
      dispatch(markAsReadStart({ conversationId: currentConversation._id }));
    }
  }, [currentConversation?._id, messages.length, isOpen, isMinimized, status, dispatch]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hôm nay";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hôm qua";
    } else {
      return format(date, "dd/MM/yyyy", { locale: vi });
    }
  };

  // Group messages by date
  const groupedMessages = useMemo(() => {
    return messages.reduce(
      (groups, message) => {
        const date = formatDate(message.createdAt);
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(message);
        return groups;
      },
      {} as Record<string, ChatMessage[]>
    );
  }, [messages]);

  // Get other participant info
  const otherParticipant = useMemo(() => {
    if (!currentConversation || !currentUserId) return null;
    return currentConversation.participants.find((p: { userId: string }) => p.userId !== currentUserId) || currentConversation.participants[0];
  }, [currentConversation, currentUserId]);

  const displayName = otherParticipant?.name || shopName;
  const displayAvatar = otherParticipant?.avatar || shopAvatar;

  const handleSend = () => {
    if (!message.trim() || !currentConversation) return;

    const messageText = message.trim();
    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const channel = (currentConversation.channel as "admin" | "shop" | "ai") || "shop";
    let socketClient;

    switch (channel) {
      case "admin":
        socketClient = socketClients.adminChat;
        break;
      case "shop":
        socketClient = socketClients.shopChat;
        break;
      case "ai":
        socketClient = socketClients.aiChat;
        break;
      default:
        socketClient = socketClients.shopChat;
    }

    if (!socketClient) {
      console.error("Socket client not available");
      return;
    }

    const socket = socketClient.connect();
    if (!socket || !socket.connected) {
      console.error("Socket not connected");
      return;
    }

    // Send message without product metadata
    // Product metadata should only be sent in the initial product message (auto-sent when opening from product)
    // For subsequent messages, don't send any metadata to avoid showing product card in shop replies
    socket.emit(SOCKET_EVENTS.CHAT_MESSAGE_SEND, {
      conversationId: currentConversation._id,
      message: messageText,
      type: "text", // Message type: text (default)
      conversationType: "shop", // Conversation type for backward compatibility
      targetId: shopId,
      // Don't send metadata for subsequent messages - only the first auto-sent product message has metadata
    });

    // Scroll to bottom
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  const isConnected = true; // TODO: Get from socket status

  return (
    <div
      className={`fixed right-4 bottom-4 z-50 flex flex-col transition-all duration-300 ${
        isMinimized
          ? "h-[60px] w-[60px]"
          : "h-[550px] w-[400px] lg:h-[600px] lg:w-[450px]  xl:h-[640px] xl:w-[500px]"
      }`}
      style={{
        borderRadius: isMinimized ? "50%" : "12px",
      }}
    >
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="relative flex h-full w-full items-center justify-center rounded-full bg-white shadow-2xl border-2 border-primary-6 transition-transform hover:scale-105"
          aria-label="Mở chat"
        >
          <div className="relative h-12 w-12 overflow-hidden rounded-full">
            {displayAvatar ? (
              <Image src={displayAvatar} alt={displayName} rounded className="w-full h-full" />
            ) : (
              <div className="w-full h-full bg-primary-6 text-white flex items-center justify-center text-lg font-semibold">
                {displayName[0].toUpperCase()}
              </div>
            )}
          </div>
          <span
            className={`absolute right-1 bottom-1 h-3 w-3 rounded-full border-2 border-white ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
        </button>
      ) : (
        <div className="flex h-full w-full flex-col overflow-hidden rounded-xl bg-white shadow-2xl border border-neutral-3">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-3 bg-background-2 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-full flex-shrink-0">
                {displayAvatar ? (
                  <Image src={displayAvatar} alt={displayName} rounded className="w-full h-full" />
                ) : (
                  <div className="w-full h-full bg-primary-6 text-white flex items-center justify-center text-sm font-semibold">
                    {displayName[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-neutral-10 truncate">{displayName}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
                  />
                  <span className={`text-xs ${isConnected ? "text-green-600" : "text-red-600"}`}>
                    {isConnected ? "Đang hoạt động" : "Mất kết nối"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(true)}
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-neutral-2"
              >
                <Minus className="w-4 h-4 text-neutral-7" />
              </button>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-neutral-2"
              >
                <X className="w-4 h-4 text-neutral-7" />
              </button>
            </div>
          </div>



          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-3 bg-neutral-1">
            {status === "LOADING" && messages.length === 0 ? (
              <div className="flex h-64 items-center justify-center">
                <Spinner size="lg" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-64 items-center justify-center">
                <span className="text-sm text-neutral-6">Chưa có tin nhắn nào</span>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                  <div key={date}>
                    {/* Date separator */}
                    <div className="my-4 flex items-center gap-2">
                      <div className="h-px flex-1 bg-neutral-3" />
                      <div className="rounded-full border border-neutral-3 bg-white px-3 py-1 text-xs text-neutral-6">
                        {date}
                      </div>
                      <div className="h-px flex-1 bg-neutral-3" />
                    </div>

                    {/* Messages for this date */}
                    {(dateMessages as ChatMessage[]).map((msg: ChatMessage) => (
                      <MessageItem
                        key={msg._id}
                        message={msg}
                        isOwn={msg.senderId === currentUserId}
                        currentUserId={currentUserId}
                      />
                    ))}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-neutral-3 bg-background-2 p-3">
            <Form.Root onSubmit={(e) => e.preventDefault()}>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <TextArea
                    name="message"
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Nhập tin nhắn..."
                    rows={1}
                    className="resize-none min-h-[44px] max-h-[120px]"
                    textSize="large"
                    disabled={!currentConversation || status === "LOADING"}
                  />
                </div>
                <Button
                  onClick={handleSend}
                  disabled={!message.trim() || !currentConversation || status === "LOADING"}
                  size="md"
                  rounded="full"
                  icon={<Send className="w-4 h-4" />}
                  className="flex-shrink-0"
                >
                  Gửi
                </Button>
              </div>
            </Form.Root>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopChatModal;

