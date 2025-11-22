import React, { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store";
import {
  selectCurrentConversation,
  selectChatMessages,
  selectChatStatus,
} from "@/app/store/slices/chat/chat.selector";
import { selectUser } from "@/features/Auth/components/slice/auth.selector";
import { getMessagesStart, markAsReadStart } from "@/app/store/slices/chat/chat.slice";
import { socketClients, SOCKET_EVENTS } from "@/core/socket";
import ScrollView from "@/foundation/components/scroll/ScrollView";
import Spinner from "@/foundation/components/feedback/Spinner";
import Empty from "@/foundation/components/empty/Empty";
import MessageItem from "./MessageItem";
import type { ChatMessage } from "@/core/api/chat/type";

const ChatWindow: React.FC = () => {
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentConversation) {
      dispatch(
        getMessagesStart({
          conversationId: currentConversation._id,
          query: { page: 1, limit: 50 },
        })
      );

      // Join conversation room to receive real-time messages
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
          socketClient = socketClients.adminChat;
      }

      if (socketClient) {
        const socket = socketClient.connect();
        if (socket && socket.connected) {
          socket.emit(SOCKET_EVENTS.CHAT_CONVERSATION_JOIN, {
            conversationId: currentConversation._id,
          });
        }
      }
    }
  }, [currentConversation?._id, dispatch]);

  useEffect(() => {
    if (currentConversation && messages.length > 0) {
      // Mark as read when viewing conversation
      dispatch(markAsReadStart({ conversationId: currentConversation._id }));
    }
  }, [currentConversation?._id, dispatch]);

  useEffect(() => {
    // Auto scroll to bottom when new messages arrive
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!currentConversation) {
    return (
      <div className="flex items-center justify-center h-full bg-neutral-1">
        <Empty
          variant="mail"
          title="Chọn cuộc trò chuyện"
          description="Chọn một cuộc trò chuyện từ danh sách để bắt đầu nhắn tin"
          size="medium"
        />
      </div>
    );
  }

  const otherParticipant = currentConversation.participants.find(
    (p: { userId: string }) => p.userId !== currentUserId
  ) || currentConversation.participants[0];

  return (
    <div className="flex flex-col h-full bg-neutral-1">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 p-4 bg-background-2 border-b border-neutral-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-3 flex items-center justify-center flex-shrink-0">
          {otherParticipant?.avatar ? (
            <img
              src={otherParticipant.avatar}
              alt={otherParticipant.name || "User"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-primary-6 text-white flex items-center justify-center text-sm font-semibold">
              {(otherParticipant?.name || "U")[0].toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base text-start font-semibold text-neutral-10 truncate">
            {otherParticipant?.name || "Người dùng"}
          </h3>
          <p className="text-xs text-neutral-6 text-start">Đang hoạt động</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        {status === "LOADING" && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Spinner size="lg" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Empty
              variant="mail"
              title="Chưa có tin nhắn"
              description="Bắt đầu cuộc trò chuyện bằng cách gửi tin nhắn đầu tiên"
              size="small"
            />
          </div>
        ) : (
          <ScrollView scrollRef={scrollRef} className="h-full ">
            <div className="p-4 pb-6">
              {messages.map((message) => {
                const msg = message as ChatMessage;
                return (
                  <MessageItem
                    key={msg._id}
                    message={msg}
                    isOwn={msg.senderId === currentUserId}
                    currentUserId={currentUserId}
                  />
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </ScrollView>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;

