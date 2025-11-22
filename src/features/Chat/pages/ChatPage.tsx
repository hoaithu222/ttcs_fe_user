import React, { useState, useEffect } from "react";
import { useAppSelector } from "@/app/store";
import { selectCurrentConversation, selectConversations } from "@/app/store/slices/chat/chat.selector";
import ConversationsList from "../components/ConversationsList";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";
import ChatTypeSelector from "../components/ChatTypeSelector";
import { MessageSquare } from "lucide-react";

const ChatPage: React.FC = () => {
  const currentConversation = useAppSelector(selectCurrentConversation);
  const conversations = useAppSelector(selectConversations);
  const [isMobile, setIsMobile] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Show type selector if no conversations and no current conversation
  useEffect(() => {
    setShowTypeSelector(conversations.length === 0 && !currentConversation);
  }, [conversations.length, currentConversation]);

  if (isMobile) {
    return (
      <div className="h-full bg-background-base overflow-hidden">
        <div className="flex bg-neutral-1 h-full overflow-hidden">
        {currentConversation ? (
          <>
            <ChatWindow />
            <MessageInput />
          </>
        ) : (
          <ConversationsList />
        )}
        </div>
      </div>
    );
  }

  const handleSelectChatType = (type: "admin" | "shop", shopId?: string) => {
    const metadata: Record<string, any> = {};
    if (type === "admin") {
      metadata.context = "CSKH";
    }

    // Store context in sessionStorage for MessageInput to use
    sessionStorage.setItem(
      "chatContext",
      JSON.stringify({
        type,
        targetId: type === "shop" ? shopId : undefined,
        metadata,
      })
    );

    setShowTypeSelector(false);
  };

  return (
    <div className="h-full flex bg-neutral-1 overflow-hidden">
      {/* Sidebar - Conversations List */}
      <div className="w-80 border-r border-neutral-3 bg-background-base flex flex-col h-full overflow-hidden flex-shrink-0">
        <ConversationsList />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-[calc(100vh-65px)] max-h-[calc(100vh-65px)] overflow-hidden">
        {currentConversation ? (    
          <>
            <ChatWindow />
            <MessageInput />
          </>
        ) : showTypeSelector ? (
          <div className="flex-1 flex items-center justify-center bg-background-base">
            <div className="w-full max-w-2xl">
              <ChatTypeSelector onSelectType={handleSelectChatType} />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-neutral-4 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-8 mb-2">
                Chọn cuộc trò chuyện
              </h3>
              <p className="text-sm text-neutral-6">
                Chọn một cuộc trò chuyện từ danh sách để bắt đầu nhắn tin
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;

