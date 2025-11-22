import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Smile } from "lucide-react";
import * as Form from "@radix-ui/react-form";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { selectCurrentConversation } from "@/app/store/slices/chat/chat.selector";
import { selectUser } from "@/features/Auth/components/slice/auth.selector";
import { socketClients, SOCKET_EVENTS } from "@/core/socket";
import Button from "@/foundation/components/buttons/Button";
import TextArea from "@/foundation/components/input/TextArea";

interface MessageInputProps {
  onSend?: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend }) => {
  const dispatch = useAppDispatch();
  const currentConversation = useAppSelector(selectCurrentConversation);
  const currentUser = useAppSelector(selectUser);
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!message.trim()) return;

    const messageText = message.trim();
    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Determine channel and socket client
    let socketClient;
    let channel: "admin" | "shop" | "ai" = "shop";
    let conversationId = currentConversation?._id;
    let type: "admin" | "shop" | undefined;
    let targetId: string | undefined;
    let metadata: Record<string, any> = {};
    const storedContext = sessionStorage.getItem("chatContext");

    if (currentConversation) {
      // Use existing conversation
      conversationId = currentConversation._id;
      channel = (currentConversation.channel as "admin" | "shop" | "ai") || "shop";
      metadata = currentConversation.metadata || {};
    } else {
      // No conversation - determine type from metadata or default to admin
      // This should be set by CreateConversationButton or ChatTypeSelector
      if (storedContext) {
        try {
          const context = JSON.parse(storedContext);
          type = context.type || "admin";
          targetId = context.targetId;
          metadata = context.metadata || {};
          // Set channel based on type
          channel = type === "admin" ? "admin" : "shop";
        } catch (e) {
          // Default to admin chat
          type = "admin";
          channel = "admin";
        }
      } else {
        // Default to admin chat
        type = "admin";
        channel = "admin";
      }
    }

    // Get appropriate socket client based on channel
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
        socketClient = socketClients.adminChat;
    }

    if (!socketClient) {
      console.error("Socket client not available");
      return;
    }

    // Connect and get socket instance
    const socket = socketClient.connect();
    if (!socket || !socket.connected) {
      console.error("Socket not connected");
      return;
    }

    // Send message via socket
    // Socket will emit the message back immediately, so no need for optimistic update
    socket.emit(SOCKET_EVENTS.CHAT_MESSAGE_SEND, {
      conversationId,
      message: messageText,
      type: "text", // Message type: text (default)
      conversationType: type, // Conversation type for creating new conversation
      targetId,
      metadata,
    });

    // Clear stored context after first message
    if (!currentConversation && storedContext) {
      sessionStorage.removeItem("chatContext");
    }

    onSend?.();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  if (!currentConversation) {
    return null;
  }

  return (
    <div className="p-4 bg-background-2 border-t border-neutral-3">
      <Form.Root onSubmit={(e) => e.preventDefault()}>
        <div className="flex items-end gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-2 text-neutral-6 hover:text-neutral-10 hover:bg-neutral-2 rounded-lg transition-colors"
              title="Đính kèm file"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 text-neutral-6 hover:text-neutral-10 hover:bg-neutral-2 rounded-lg transition-colors"
              title="Emoji"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 relative">
            <TextArea
              name="message"
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Nhập tin nhắn..."
              rows={1}
              className="resize-none min-h-[44px] max-h-[120px] pr-12"
              textSize="large"
            />
          </div>

          <Button
            onClick={handleSend}
            disabled={!message.trim()}
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
  );
};

export default MessageInput;

