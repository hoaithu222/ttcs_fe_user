import React, { useState, useEffect } from "react";
import { useAppSelector } from "@/app/store";
import { selectCurrentConversation, selectConversations } from "@/app/store/slices/chat/chat.selector";
import ConversationsList from "../components/ConversationsList";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";
import { MessageSquare } from "lucide-react";
import { getConversationsStart } from "@/app/store/slices/chat/chat.slice";
import { useAppDispatch } from "@/app/store";

const ChatPage: React.FC = () => {
  const currentConversation = useAppSelector(selectCurrentConversation);
  const conversations = useAppSelector(selectConversations);
  const [isMobile, setIsMobile] = useState(false);
  const dispatch = useAppDispatch();


  console.log("conversations", conversations);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    // dispatch lấy conversations 
    dispatch(getConversationsStart({ query: { page: 1, limit: 50 } }));
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div className="h-full bg-background-base overflow-hidden overflow-x-hidden">
        <div className="flex bg-neutral-1 h-full overflow-hidden overflow-x-hidden">
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


  return (
    <div className="h-[calc(100vh-65px)] flex bg-neutral-1 overflow-hidden">
      {/* Sidebar - Conversations List */}
      <div className="w-80 border-r border-neutral-3 bg-background-base flex flex-col h-full overflow-hidden overflow-x-hidden flex-shrink-0 max-w-[320px]">
        <ConversationsList />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-[calc(100vh-65px)] max-h-[calc(100vh-65px)] overflow-hidden">
        {currentConversation ? (    
          <>
            <ChatWindow />
            <MessageInput />
          </>
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

