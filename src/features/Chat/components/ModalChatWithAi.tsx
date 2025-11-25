import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { X, Send, Image as ImageIcon, Smile, Minus } from "lucide-react";
import * as Form from "@radix-ui/react-form";
import { useAppDispatch, useAppSelector } from "@/app/store";
import {
  selectCurrentConversation,
  selectChatMessages,
  selectChatStatus,
} from "@/app/store/slices/chat/chat.selector";
import { selectUser } from "@/features/Auth/components/slice/auth.selector";
import { getMessagesStart, markAsReadStart, updateMessageFromSocket } from "@/app/store/slices/chat/chat.slice";
import { imagesApi } from "@/core/api/images";
import { chatApi } from "@/core/api/chat";
import { aiAssistantApi } from "@/core/api/ai";
import Button from "@/foundation/components/buttons/Button";
import TextArea from "@/foundation/components/input/TextArea";
import MessageItem from "./MessageItem";
import Spinner from "@/foundation/components/feedback/Spinner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { ChatMessage } from "@/core/api/chat/type";
import Image from "@/foundation/components/icons/Image";
import { images } from "@/assets/image";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import Popover from "@/foundation/components/popover/Popever";

interface ModalChatWithAiProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ModalChatWithAi: React.FC<ModalChatWithAiProps> = ({ open, onOpenChange }) => {
  const dispatch = useAppDispatch();
  const currentConversation = useAppSelector(selectCurrentConversation);
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
  const [attachments, setAttachments] = useState<Array<{
    url: string;
    type: string;
    name?: string;
    file?: File;
  }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper function to scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    } else if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, []);

  // Auto scroll to bottom when messages change or AI is responding
  useEffect(() => {
    if (open && !isMinimized) {
      // Use setTimeout to ensure DOM is updated
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, open, isMinimized, isAiResponding, scrollToBottom]);

  // Focus input when modal opens
  useEffect(() => {
    if (open && !isMinimized && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [open, isMinimized]);

  // Load messages when current conversation is set
  useEffect(() => {
    if (!open || !currentConversation?._id) return;

    // Check if this is AI conversation
    const isAiConversation = currentConversation.type === "ai" || currentConversation.channel === "ai";

    if (!isAiConversation) return;

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
  }, [open, currentConversation?._id, currentConversation?.type, currentConversation?.channel, messages.length, dispatch]);

  // Mark as read when modal is open and messages are loaded
  useEffect(() => {
    if (
      currentConversation && 
      messages.length > 0 && 
      open && 
      status !== "LOADING"
    ) {
      dispatch(markAsReadStart({ conversationId: currentConversation._id }));
    }
  }, [currentConversation?._id, messages.length, open, status, dispatch]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setAttachments([]);
      setMessage("");
      setIsMinimized(false);
      setIsAiResponding(false);
    }
  }, [open]);

  // Handle file selection and upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Filter only image files
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      alert("Vui lòng chọn file ảnh");
      return;
    }

    // Check file size (max 5MB per image)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validFiles = imageFiles.filter((file) => {
      if (file.size > maxSize) {
        alert(`File ${file.name} vượt quá 5MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);

    try {
      const uploadPromises = validFiles.map(async (file) => {
        const result = await imagesApi.uploadImage(file);
        return {
          url: result.url,
          type: file.type,
          name: file.name,
          file: file, // Keep for preview
        };
      });

      const uploadedAttachments = await Promise.all(uploadPromises);
      setAttachments((prev) => [...prev, ...uploadedAttachments]);
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Lỗi khi upload ảnh. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

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

  // Get other participant info (AI)
  const displayName = "Chatbot";

  const handleSend = async () => {
    if ((!message.trim() && attachments.length === 0) || !currentConversation || !isAiConversation || isSending) return;

    const messageText = message.trim();
    const attachmentsToSend = attachments.map((att) => ({
      url: att.url,
      type: att.type,
      name: att.name,
    }));

    // Determine message type based on content
    let messageType: "text" | "image" | "file" = "text";
    if (attachmentsToSend.length > 0) {
      const hasImages = attachmentsToSend.some((att) => att.type.startsWith("image/"));
      messageType = hasImages ? "image" : "file";
    }

    setIsSending(true);

    try {
      // Step 1: Send user message via API
      const userMessageResponse = await chatApi.sendMessage(currentConversation._id, {
        message: messageText || "",
        type: messageType,
        attachments: attachmentsToSend.length > 0 ? attachmentsToSend : undefined,
      });

      if (userMessageResponse.success && userMessageResponse.data) {
        // Add user message to Redux store
        dispatch(updateMessageFromSocket({
          conversationId: currentConversation._id,
          message: userMessageResponse.data,
          isSender: true,
        }));

        // Clear state
        setMessage("");
        setAttachments([]);
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }

        // Scroll to bottom immediately after user message
        setTimeout(() => {
          scrollToBottom();
        }, 50);

        // Step 2: Get AI response (only for text messages without attachments)
        if (messageText && attachmentsToSend.length === 0) {
          setIsAiResponding(true);
          try {
            // Build conversation history from current messages
            const conversationHistory = messages
              .slice(-10) // Last 10 messages
              .map((msg) => {
                // Check if message is from AI
                const isAiMsg = currentConversation?.type === "ai" && 
                              (msg.metadata?.isAiMessage === true || 
                               msg.senderName === "Chatbot");
                return {
                  role: (isAiMsg ? "assistant" : "user") as "user" | "assistant",
                  content: msg.message || "",
                };
              });

            // Add current user message to history
            conversationHistory.push({
              role: "user",
              content: messageText,
            });

            // Call AI endpoint
            const aiResponse = await aiAssistantApi.generateChatResponse({
              message: messageText,
              conversationHistory,
              language: "vi",
            });

            if (aiResponse.success && aiResponse.data) {
              // Step 3: Send AI response as a message with AI flag and suggested products/shops
              const aiMessageResponse = await chatApi.sendMessage(currentConversation._id, {
                message: aiResponse.data.response,
                type: "text",
                metadata: {
                  isAiMessage: true, // Mark as AI message
                  // Store suggested products for display
                  suggestedProducts: aiResponse.data.suggestedProducts?.map((product) => ({
                    productId: product._id,
                    productName: product.name,
                    productPrice: product.finalPrice,
                    productImage: product.images?.[0]?.url,
                    shopId: product.shop?._id,
                    shopName: product.shop?.name,
                  })),
                  // Store suggested shops for display
                  suggestedShops: aiResponse.data.suggestedShops?.map((shop) => ({
                    shopId: shop._id,
                    shopName: shop.name,
                    shopLogo: shop.logo,
                    shopDescription: shop.description,
                    rating: shop.rating,
                    followCount: shop.followCount,
                    productCount: shop.productCount,
                    reviewCount: shop.reviewCount,
                    isVerified: shop.isVerified,
                  })),
                  // Store suggested categories for display
                  suggestedCategories: aiResponse.data.suggestedCategories?.map((category) => ({
                    categoryId: category._id,
                    categoryName: category.name,
                    categoryImage: category.image,
                    categoryDescription: category.description,
                    productCount: category.productCount,
                    slug: category.slug,
                  })),
                  responseType: aiResponse.data.responseType,
                },
              });

              if (aiMessageResponse.success && aiMessageResponse.data) {
                // Add AI message to Redux store
                dispatch(updateMessageFromSocket({
                  conversationId: currentConversation._id,
                  message: aiMessageResponse.data,
                  isSender: false,
                }));

                // Scroll to bottom immediately after AI response
                setTimeout(() => {
                  scrollToBottom();
                }, 100);
              }
            }
          } catch (aiError) {
            console.error("Error getting AI response:", aiError);
            // Don't show error to user, just continue without AI response
          } finally {
            setIsAiResponding(false);
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Lỗi khi gửi tin nhắn. Vui lòng thử lại.");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    const cursorPosition = textareaRef.current?.selectionStart || 0;
    const textBefore = message.substring(0, cursorPosition);
    const textAfter = message.substring(cursorPosition);
    setMessage(textBefore + emojiData.emoji + textAfter);
    
    // Focus back to textarea and set cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        const newPosition = cursorPosition + emojiData.emoji.length;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  if (!open) return null;

  // Check if current conversation is AI conversation (if exists)
  const isAiConversation = currentConversation 
    ? (currentConversation.type === "ai" || currentConversation.channel === "ai")
    : true; // Allow showing UI even if no conversation yet (will be created)

  return (
    <div
      className={`fixed right-4 bottom-4 z-50 flex flex-col transition-all duration-300 ${
        isMinimized
          ? "h-[60px] w-[60px]"
          : "h-[600px] w-[420px] lg:h-[650px] lg:w-[480px] xl:h-[750px] xl:w-[580px] 2xl:h-[800px] 2xl:w-[600px]"
      }`}
      style={{
        borderRadius: isMinimized ? "50%" : "12px",
      }}
    >
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="relative flex h-full w-full items-center justify-center rounded-full bg-white shadow-2xl border-2 border-purple-6 transition-transform hover:scale-105"
          aria-label="Mở chat AI"
        >
          <div className="relative h-12 w-12 overflow-hidden rounded-full">
            <Image src={images.chatAi} alt="AI Assistant" rounded className="w-full h-full" />
          </div>
        </button>
      ) : (
        <div className="flex h-full w-full flex-col overflow-hidden rounded-xl bg-white shadow-2xl border border-neutral-3">
          {/* Header - Sticky */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-3 bg-background-2 px-4 py-3 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-full flex-shrink-0">
                <Image src={images.chatAi} alt="AI Assistant" rounded className="w-full h-full" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm text-start font-semibold text-neutral-10 truncate">{displayName}</span>
                <span className="text-xs text-neutral-6">
                  {isAiResponding ? "Đang phản hồi..." : "Chatbot đang sẵn sàng"}
                </span>
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
                onClick={() => onOpenChange(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-neutral-2"
              >
                <X className="w-4 h-4 text-neutral-7" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto min-h-0 px-4 py-3 bg-neutral-1">
            {!currentConversation ? (
              <div className="flex h-64 items-center justify-center">
                <span className="text-sm text-neutral-6">Đang tạo cuộc trò chuyện AI...</span>
              </div>
            ) : !isAiConversation ? (
              <div className="flex h-64 items-center justify-center">
                <span className="text-sm text-neutral-6">Chưa có cuộc trò chuyện AI</span>
              </div>
            ) : status === "LOADING" && messages.length === 0 ? (
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
                    {(dateMessages as ChatMessage[]).map((msg: ChatMessage) => {
                      // Normalize IDs to string for comparison (handle ObjectId vs string)
                      const msgSenderId = String(msg.senderId || "").trim();
                      const userSenderId = String(currentUserId || "").trim();
                      const isSenderMe = msgSenderId === userSenderId && msgSenderId !== "";
                      
                      // Message is "own" (user's message) if:
                      // 1. senderId matches currentUserId AND
                      // 2. It's NOT explicitly marked as AI message (metadata.isAiMessage !== true)
                      // IMPORTANT: AI messages should ALWAYS be isOwn = false (display on left)
                      // This logic ensures user messages are on the right, AI messages on the left
                      const isOwn = isSenderMe && msg.metadata?.isAiMessage !== true;
                      
                      return (
                        <MessageItem
                          key={msg._id}
                          message={msg}
                          isOwn={isOwn}
                          currentUserId={currentUserId}
                          conversation={currentConversation}
                        />
                      );
                    })}
                  </div>
                ))}
                {/* Show loading indicator when AI is responding */}
                {isAiResponding && (
                  <div className="flex justify-start gap-3 mb-3">
                    <div className="flex-shrink-0">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-primary-5 to-primary-7 flex items-center justify-center shadow-sm">
                        <Image src={images.chatAi} alt="AI Assistant" rounded className="w-full h-full" />
                      </div>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-xs text-neutral-7 mb-1.5 font-medium">Chatbot</span>
                      <div className="rounded-2xl px-4 py-2.5 bg-gradient-to-br from-background-2 to-background-1 text-neutral-10 rounded-bl-md border border-neutral-3 shadow-sm">
                        <div className="flex items-center gap-2">
                          <Spinner size="sm" />
                          <span className="text-sm text-neutral-6">Đang soạn tin nhắn...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-neutral-3 bg-background-2 p-3 flex-shrink-0">
            <Form.Root onSubmit={(e) => e.preventDefault()}>
              {/* Image previews */}
              {attachments.length > 0 && (
                <div className="mb-2 p-2 bg-background-2 rounded-lg border border-neutral-3">
                  <div className="flex gap-2 overflow-x-auto">
                    {attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-neutral-3 group"
                      >
                        {attachment.file ? (
                          <img
                            src={URL.createObjectURL(attachment.file)}
                            alt={attachment.name || "Preview"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Image
                            src={attachment.url}
                            alt={attachment.name || "Preview"}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(index)}
                          className="absolute top-1 right-1 w-5 h-5 bg-neutral-9/80 hover:bg-neutral-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Xóa ảnh"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-end gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || !isAiConversation || status === "LOADING" || isSending}
                  className="p-2 text-neutral-6 hover:text-neutral-10 hover:bg-neutral-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  title="Đính kèm ảnh"
                >
                  {isUploading ? (
                    <Spinner size="sm" />
                  ) : (
                    <ImageIcon className="w-4 h-4" />
                  )}
                </button>
                <Popover
                  open={isEmojiPickerOpen}
                  onOpenChange={setIsEmojiPickerOpen}
                  side="top"
                  align="start"
                  contentClassName="!p-0 border border-neutral-3 rounded-lg shadow-lg overflow-hidden"
                  content={
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      width={350}
                      height={400}
                      previewConfig={{ showPreview: false }}
                      skinTonesDisabled
                    />
                  }
                >
                  <button
                    type="button"
                    onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                    disabled={!isAiConversation || status === "LOADING" || isSending}
                    className="p-2 text-neutral-6 hover:text-neutral-10 hover:bg-neutral-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    title="Emoji"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                </Popover>
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
                    disabled={!isAiConversation || status === "LOADING" || isSending}
                  />
                </div>
                <Button
                  onClick={handleSend}
                  disabled={(!message.trim() && attachments.length === 0) || !isAiConversation || status === "LOADING" || isUploading || isSending}
                  size="md"
                  rounded="full"
                  icon={ <Send className="w-4 h-4 text-white" />}
                  className="flex-shrink-0"
                >
                  <span className="text-sm text-neutral-6">Gửi</span>
                </Button>
              </div>
            </Form.Root>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModalChatWithAi;
