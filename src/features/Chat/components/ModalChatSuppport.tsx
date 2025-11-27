import React, { useState, useRef, useEffect, useMemo } from "react";
import { X, Send, Image as ImageIcon, Smile, Minus } from "lucide-react";
import * as Form from "@radix-ui/react-form";
import { useAppDispatch, useAppSelector } from "@/app/store";
import {
  selectCurrentConversation,
  selectChatMessages,
  selectChatStatus,
  selectTypingUsers,
} from "@/app/store/slices/chat/chat.selector";
import { selectUser } from "@/features/Auth/components/slice/auth.selector";
import { getMessagesStart, markAsReadStart, setTyping } from "@/app/store/slices/chat/chat.slice";
import { socketClients, SOCKET_EVENTS } from "@/core/socket";
import { imagesApi } from "@/core/api/images";
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

interface ModalChatSupportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ModalChatSupport: React.FC<ModalChatSupportProps> = ({ open, onOpenChange }) => {
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
  const typingUsers = useAppSelector((state) =>
    currentConversation ? selectTypingUsers(currentConversation._id)(state) : []
  );
  const [message, setMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [attachments, setAttachments] = useState<Array<{
    url: string;
    type: string;
    name?: string;
    file?: File;
  }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingEmitRef = useRef<number>(0);

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current && open && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, isMinimized]);

  // Focus input when modal opens
  useEffect(() => {
    if (open && !isMinimized && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [open, isMinimized]);

  // Load messages and join socket room when current conversation is set
  useEffect(() => {
    if (!open || !currentConversation?._id) return;

    // Check if this is CSKH conversation
    const isCSKHConversation = currentConversation.type === "admin" && 
      currentConversation.metadata?.context === "CSKH";

    if (!isCSKHConversation) return;

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
    const socketClient = socketClients.adminChat;
    if (socketClient) {
      const socket = socketClient.connect();
      if (socket && socket.connected) {
        socket.emit(SOCKET_EVENTS.CHAT_CONVERSATION_JOIN, {
          conversationId: currentConversation._id,
        });

        // Listen for typing events
        socket.on(SOCKET_EVENTS.CHAT_TYPING, (payload: any) => {
          if (payload?.conversationId === currentConversation._id && payload?.userId !== currentUserId) {
            dispatch(setTyping({
              conversationId: payload.conversationId,
              userId: payload.userId,
              isTyping: payload.isTyping !== false,
            }));
            
            // Auto clear typing after 3 seconds
            if (payload.isTyping !== false) {
              setTimeout(() => {
                dispatch(setTyping({
                  conversationId: payload.conversationId,
                  userId: payload.userId,
                  isTyping: false,
                }));
              }, 3000);
            }
          }
        });
      }
    }

    return () => {
      // Cleanup: remove typing listener when leaving conversation
      if (socketClient) {
        const socket = socketClient.connect();
        if (socket) {
          socket.off(SOCKET_EVENTS.CHAT_TYPING);
        }
      }
    };
  }, [open, currentConversation?._id, currentConversation?.type, currentConversation?.metadata?.context, messages.length, currentUserId, dispatch]);

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

  // Get other participant info
  const otherParticipant = useMemo(() => {
    if (!currentConversation || !currentUserId) return null;
    return currentConversation.participants.find((p: { userId: string }) => p.userId !== currentUserId) || currentConversation.participants[0];
  }, [currentConversation, currentUserId]);

  // Get avatar - use CSKH.png for CSKH conversation
  const displayAvatar = useMemo(() => {
    if (currentConversation?.type === "admin" && currentConversation?.metadata?.context === "CSKH") {
      return images.CSKH;
    }
    return otherParticipant?.avatar;
  }, [currentConversation, otherParticipant?.avatar]);

  const displayName = "CSKH";
  const isOtherUserTyping = otherParticipant && typingUsers.includes(otherParticipant.userId);

  // Emit typing indicator
  const emitTyping = (isTyping: boolean) => {
    if (!currentConversation) return;
    
    const now = Date.now();
    // Throttle typing events (max once per 2 seconds)
    if (isTyping && now - lastTypingEmitRef.current < 2000) {
      return;
    }
    lastTypingEmitRef.current = now;
    
    const socketClient = socketClients.adminChat;
    if (socketClient) {
      const socket = socketClient.connect();
      if (socket && socket.connected) {
        socket.emit(SOCKET_EVENTS.CHAT_TYPING, {
          conversationId: currentConversation._id,
          isTyping,
        });
      }
    }

    // Clear typing after 3 seconds of inactivity
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        emitTyping(false);
      }, 3000);
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (e.target.value.trim()) {
      emitTyping(true);
    } else {
      emitTyping(false);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSend = () => {
    if ((!message.trim() && attachments.length === 0) || !currentConversation) return;

    const messageText = message.trim();
    const attachmentsToSend = attachments.map((att) => ({
      url: att.url,
      type: att.type,
      name: att.name,
    }));

    // Clear state
    setMessage("");
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Stop typing when sending
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    emitTyping(false);

    const socketClient = socketClients.adminChat;
    if (!socketClient) {
      console.error("Socket client not available");
      return;
    }

    const socket = socketClient.connect();
    if (!socket || !socket.connected) {
      console.error("Socket not connected");
      return;
    }

    // Determine message type based on content
    let messageType: "text" | "image" | "file" = "text";
    if (attachmentsToSend.length > 0) {
      const hasImages = attachmentsToSend.some((att) => att.type.startsWith("image/"));
      messageType = hasImages ? "image" : "file";
    }

    // Send message via socket
    socket.emit(SOCKET_EVENTS.CHAT_MESSAGE_SEND, {
      conversationId: currentConversation._id,
      message: messageText || "",
      type: messageType,
      attachments: attachmentsToSend.length > 0 ? attachmentsToSend : undefined,
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

  const isConnected = true; // TODO: Get from socket status

  if (!open) return null;

  // Check if current conversation is CSKH conversation (if exists)
  const isCSKHConversation = currentConversation 
    ? (currentConversation.type === "admin" && currentConversation.metadata?.context === "CSKH")
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
          className="relative flex h-full w-full items-center justify-center rounded-full bg-white shadow-2xl border-2 border-primary-6 transition-transform hover:scale-105"
          aria-label="Mở chat CSKH"
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
        </button>
      ) : (
        <div className="flex h-full w-full flex-col overflow-hidden rounded-xl bg-white shadow-2xl border border-neutral-3">
          {/* Header - Sticky */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-3 bg-background-2 px-4 py-3 flex-shrink-0">
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
                <span className="text-sm text-start font-semibold text-neutral-10 truncate">{displayName}</span>
                <div className="flex items-center gap-2">
                  {isOtherUserTyping ? (
                    <span className="text-xs text-primary-7 italic">Đang nhập...</span>
                  ) : (
                    <>
                      <span
                        className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
                      />
                      <span className={`text-xs ${isConnected ? "text-green-600" : "text-red-600"}`}>
                        {isConnected ? "Đang hoạt động" : "Mất kết nối"}
                      </span>
                    </>
                  )}
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
                onClick={() => onOpenChange(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-neutral-2"
              >
                <X className="w-4 h-4 text-neutral-7" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto min-h-0 px-4 py-3 bg-neutral-1">
            {!currentConversation ? (
              <div className="flex h-64 items-center justify-center">
                <span className="text-sm text-neutral-6">Đang tạo cuộc trò chuyện CSKH...</span>
              </div>
            ) : !isCSKHConversation ? (
              <div className="flex h-64 items-center justify-center">
                <span className="text-sm text-neutral-6">Chưa có cuộc trò chuyện CSKH</span>
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
                    {(dateMessages as ChatMessage[]).map((msg: ChatMessage) => (
                      <MessageItem
                        key={msg._id}
                        message={msg}
                        isOwn={msg.senderId === currentUserId}
                        currentUserId={currentUserId}
                        conversation={currentConversation}
                      />
                    ))}
                  </div>
                ))}
                {isOtherUserTyping && (
                  <div className="flex gap-3 mb-3">
                    {otherParticipant && otherParticipant.userId !== currentUserId && (
                      <div className="flex-shrink-0">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-primary-5 to-primary-7 flex items-center justify-center shadow-sm">
                          {displayAvatar ? (
                            <Image
                              src={displayAvatar}
                              alt={displayName}
                              rounded
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-primary-6 text-neutral-1 flex items-center justify-center text-sm font-semibold">
                              {displayName[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col max-w-[75%] sm:max-w-[65%]">
                      <div className="rounded-2xl px-4 py-2.5 bg-gradient-to-br from-background-2 to-background-1 text-neutral-10 rounded-bl-md border border-neutral-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-neutral-6 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-2 h-2 bg-neutral-6 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-2 h-2 bg-neutral-6 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
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
                  disabled={isUploading || !currentConversation || status === "LOADING"}
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
                    disabled={!currentConversation || status === "LOADING"}
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
                    onChange={handleMessageChange}
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
                  disabled={(!message.trim() && attachments.length === 0) || !currentConversation || status === "LOADING" || isUploading}
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

export default ModalChatSupport;
