import React, { useState, useRef, useEffect, useMemo } from "react";
import { X, Send, Smile, Minus } from "lucide-react";
import * as Form from "@radix-ui/react-form";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { selectUser } from "@/features/Auth/components/slice/auth.selector";
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
import { aiChatActions } from "@/features/Chat/slice-chat-ai/chatai.slice";
import {
  selectAiChatMessages,
  selectAiChatStatus,
  selectAiChatError,
} from "@/features/Chat/slice-chat-ai/chatai.selector";

interface ModalChatWithAiProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ModalChatWithAi: React.FC<ModalChatWithAiProps> = ({ open, onOpenChange }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const currentUserId = user?._id;
  const aiMessagesSelector = useMemo(() => selectAiChatMessages(currentUserId), [currentUserId]);
  const aiStatusSelector = useMemo(() => selectAiChatStatus(currentUserId), [currentUserId]);
  const aiErrorSelector = useMemo(() => selectAiChatError(currentUserId), [currentUserId]);
  const messages = useAppSelector(aiMessagesSelector);
  const status = useAppSelector(aiStatusSelector);
  const aiError = useAppSelector(aiErrorSelector);
  const [message, setMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Hydrate AI thread from local storage whenever modal opens
  useEffect(() => {
    if (open && currentUserId) {
      dispatch(aiChatActions.hydrateThreadRequested({ userId: currentUserId }));
    }
  }, [open, currentUserId, dispatch]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setMessage("");
      setIsMinimized(false);
    }
  }, [open]);

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

  const isSending = status === "sending";

  const handleSend = () => {
    if (!message.trim() || !currentUserId || isSending) return;

    const userName = user?.name || user?.email || user?.phone || "Bạn";

    dispatch(
      aiChatActions.sendMessageRequested({
        userId: currentUserId,
        message: message.trim(),
        userName,
      })
    );

    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
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
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header - Sticky */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-3 bg-background-2 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-full flex-shrink-0">
                <Image src={images.chatAi} alt="AI Assistant" rounded className="w-full h-full" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm text-start font-semibold text-neutral-10 truncate">{displayName}</span>
                <span className="text-xs text-neutral-6">Chatbot đang sẵn sàng</span>
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
          <div className="flex-1 overflow-y-auto px-4 py-3 bg-neutral-1">
            {!currentUserId ? (
              <div className="flex h-64 flex-col items-center justify-center text-center space-y-2">
                <span className="text-sm text-neutral-6">Vui lòng đăng nhập để trò chuyện với AI.</span>
              </div>
            ) : status === "hydrating" && messages.length === 0 ? (
              <div className="flex h-64 items-center justify-center">
                <Spinner size="lg" />
              </div>
            ) : aiError && messages.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center space-y-3">
                <span className="text-sm text-neutral-6 text-center">
                  {aiError || "Không thể tải cuộc trò chuyện AI."}
                </span>
                <Button size="sm" onClick={() => currentUserId && dispatch(aiChatActions.hydrateThreadRequested({ userId: currentUserId }))}>
                  Thử lại
                </Button>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-64 items-center justify-center">
                <span className="text-sm text-neutral-6">Hãy bắt đầu cuộc trò chuyện với AI ngay bây giờ.</span>
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
                        isOwn={msg.senderId === currentUserId || msg.metadata?.role === "user"}
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
                    disabled={!currentUserId || isSending}
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
                    disabled={!currentUserId || isSending}
                  />
                </div>
                <Button
                  onClick={handleSend}
                  disabled={!message.trim() || !currentUserId || isSending}
                  size="md"
                  rounded="full"
                  icon={isSending ? <Spinner size="sm" /> : <Send className="w-4 h-4" />}
                  className="flex-shrink-0"
                >
                  {isSending ? "Đang gửi..." : "Gửi"}
                </Button>
              </div>
            </Form.Root>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default ModalChatWithAi;
