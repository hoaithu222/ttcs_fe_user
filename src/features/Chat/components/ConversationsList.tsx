import React, { useEffect, useState, useMemo } from "react";
import clsx from "clsx";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Search, MoreVertical } from "lucide-react";
import * as Form from "@radix-ui/react-form";
import { useAppDispatch, useAppSelector } from "@/app/store";
import {
  selectConversations,
  selectCurrentConversation,
  selectChatStatus,
} from "@/app/store/slices/chat/chat.selector";
import { selectUser } from "@/features/Auth/components/slice/auth.selector";
import { getConversationsStart, setCurrentConversation, createConversationStart } from "@/app/store/slices/chat/chat.slice";
import Image from "@/foundation/components/icons/Image";
import Spinner from "@/foundation/components/feedback/Spinner";
import Input from "@/foundation/components/input/Input";
import Tabs from "@/foundation/components/navigation/tabs/Tab";
import Popover from "@/foundation/components/popover/Popever";
import type { ChatConversation } from "@/core/api/chat/type";
import { images } from "@/assets/image";

type FilterTab = "all" | "unread";
type SortOption = "time" | "name";

const ConversationsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const conv = useAppSelector(selectConversations);
  const currentConversation = useAppSelector(selectCurrentConversation);
  const status = useAppSelector(selectChatStatus);
  const user = useAppSelector(selectUser);
  const currentUserId = user?._id;

  // Filter states
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("time");
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  // loc khong lay type "type": "ai" 
  const conversations = conv.filter((conv: ChatConversation) => conv.type !== "ai");

  useEffect(() => {
    dispatch(getConversationsStart({ query: { page: 1, limit: 50 } }));
  }, [dispatch]);

  const handleSelectConversation = (conversation: ChatConversation) => {
    dispatch(setCurrentConversation(conversation));
  };

  const getOtherParticipant = (conversation: ChatConversation) => {
    if (!currentUserId) return conversation.participants[0];
    return conversation.participants.find((p) => p.userId !== currentUserId) || conversation.participants[0];
  };

  // Helper function to get avatar for conversation
  const getConversationAvatar = (conversation: ChatConversation, participantAvatar?: string) => {
    // If CSKH conversation, use CSKH.png
    if (conversation.type === "admin" && conversation.metadata?.context === "CSKH") {
      return images.CSKH;
    }
    // Otherwise use participant avatar from backend
    return participantAvatar;
  };

  // Component to render conversation item with unread count calculation
  const ConversationItem: React.FC<{ conversation: ChatConversation }> = ({ conversation }) => {
    const otherParticipant = getOtherParticipant(conversation);
    const isActive = currentConversation?._id === conversation._id;
    
    // Use unread counts from backend (calculated correctly per user)
    // unreadCountMe: messages from others that current user hasn't read
    // IMPORTANT: Always use unreadCountMe, never fallback to unreadCount (could be wrong value)
    const myUnread = typeof conversation.unreadCountMe === 'number' 
      ? conversation.unreadCountMe 
      : 0; // If unreadCountMe is not provided, default to 0
    
    // unreadCountTo: messages from current user that others haven't read
    const theirUnread = typeof conversation.unreadCountTo === 'number' 
      ? conversation.unreadCountTo 
      : 0;
    
    const hasUnread = myUnread > 0;
    const avatar = getConversationAvatar(conversation, otherParticipant?.avatar);

    return (
      <div
        key={conversation._id}
        onClick={() => handleSelectConversation(conversation)}
        className={clsx(
          "flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200",
          "border-b border-neutral-2",
          isActive
            ? "bg-background-1 border-l-4 border-primary-6 shadow-sm"
            : "hover:bg-background-2 active:bg-background-1"
        )}
      >
        <div className="flex-shrink-0 relative">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-neutral-3 flex items-center justify-center shadow-sm">
            {avatar ? (
              <Image
                src={avatar}
                alt={otherParticipant?.name || "User"}
                rounded
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-6 to-primary-7 text-neutral-1 flex items-center justify-center text-base font-bold">
                {(otherParticipant?.name || "U")[0].toUpperCase()}
              </div>
            )}
          </div>
          {hasUnread && (
            <div className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-error rounded-full flex items-center justify-center text-xs text-white font-bold shadow-md">
              {myUnread > 9 ? "9+" : myUnread}
            </div>
          )}
          {theirUnread > 0 && (
            <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 bg-primary-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold shadow-md border-2 border-background-1">
              {theirUnread > 9 ? "9+" : theirUnread}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className={clsx(
              "text-sm truncate",
              isActive ? "text-primary-9 font-bold" : "text-neutral-10 font-semibold",
              hasUnread && !isActive && "font-bold"
            )}>
              {otherParticipant?.name || "Người dùng"}
            </h3>
            {conversation.lastMessage && (
              <span className="text-xs text-neutral-6 flex-shrink-0 ml-2 font-medium">
                {formatLastMessageTime(conversation.lastMessage.createdAt)}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            {(() => {
              const lastMessage = conversation.lastMessage;
              const hasText = lastMessage?.message && typeof lastMessage.message === 'string' && lastMessage.message.trim();
              const hasImageAttachments = lastMessage?.attachments && lastMessage.attachments.some((att: { type?: string }) => att.type?.startsWith("image/"));
              const firstImage = lastMessage?.attachments?.find((att: { type?: string }) => att.type?.startsWith("image/"));
              
              // If only images (no text), show image preview
              if (!hasText && hasImageAttachments && firstImage) {
                return (
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden border border-neutral-3">
                      <Image
                        src={firstImage.url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className={clsx(
                      "text-sm truncate",
                      isActive ? "text-neutral-8" : "text-neutral-7",
                      hasUnread && !isActive && "font-medium text-neutral-9"
                    )}>
                      📷 Ảnh
                    </span>
                  </div>
                );
              }
              
              // If has text or no message, show text
              return (
                <p className={clsx(
                  "text-sm truncate",
                  isActive ? "text-neutral-8" : "text-neutral-7",
                  hasUnread && !isActive && "font-medium text-neutral-9"
                )}>
                  {hasText ? lastMessage.message : "Chưa có tin nhắn"}
                </p>
              );
            })()}
          </div>
        </div>
      </div>
    );
  };

  const formatLastMessageTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const isToday = date.toDateString() === new Date().toDateString();
    const isYesterday = date.toDateString() === new Date(Date.now() - 86400000).toDateString();

    if (isToday) return format(date, "HH:mm", { locale: vi });
    if (isYesterday) return "Hôm qua";
    return format(date, "dd/MM/yyyy", { locale: vi });
  };

  const handleCreateAdminChat = () => {
    dispatch(
      createConversationStart({
        data: {
          type: "admin",
          metadata: { context: "CSKH" },
        },
      })
    );
  };

  // Find CSKH conversation
  const cskhConversation = conversations.find(
    (conv: ChatConversation) => conv.type === "admin" && conv.metadata?.context === "CSKH"
  );

  const handleSelectCSKH = () => {
    if (cskhConversation) {
      // If conversation exists, select it
      dispatch(setCurrentConversation(cskhConversation));
    } else {
      // If not exists, create new conversation
      handleCreateAdminChat();
    }
  };

  // Check if CSKH should be displayed
  const shouldShowCSKH = useMemo(() => {
    if (!cskhConversation) return false;
    
    // Filter by tab (all/unread)
    if (activeTab === "unread") {
      const hasUnread = (cskhConversation.unreadCountMe ?? cskhConversation.unreadCount ?? 0) > 0;
      if (!hasUnread) return false;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const cskhName = "Chăm sóc khách hàng".toLowerCase();
      const cskhKeyword = "cskh".toLowerCase();
      // Show if search query matches CSKH name or keyword
      if (!cskhName.includes(query) && !cskhKeyword.includes(query)) {
        return false;
      }
    }

    return true;
  }, [cskhConversation, activeTab, searchQuery]);

  // Filter and sort conversations
  const filteredAndSortedConversations = useMemo(() => {
    let filtered = conversations.filter(
      (conv: ChatConversation) => !(conv.type === "admin" && conv.metadata?.context === "CSKH")
    );

    // Filter by tab (all/unread)
    if (activeTab === "unread") {
      filtered = filtered.filter((conv: ChatConversation) => (conv.unreadCountMe ?? conv.unreadCount ?? 0) > 0);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((conv: ChatConversation) => {
        const otherParticipant = getOtherParticipant(conv);
        const name = (otherParticipant?.name || "").toLowerCase();
        return name.includes(query);
      });
    }

    // Sort conversations
    filtered = [...filtered].sort((a: ChatConversation, b: ChatConversation) => {
      if (sortBy === "name") {
        const nameA = (getOtherParticipant(a)?.name || "").toLowerCase();
        const nameB = (getOtherParticipant(b)?.name || "").toLowerCase();
        return nameA.localeCompare(nameB, "vi");
      } else {
        // Sort by time (most recent first)
        const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
        const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
        return timeB - timeA;
      }
    });

    return filtered;
  }, [conversations, activeTab, searchQuery, sortBy, currentUserId]);

  // Render CSKH item component
  const renderCSKHItem = () => {
    if (!shouldShowCSKH || !cskhConversation) return null;
    
    const isActive = currentConversation?._id === cskhConversation._id;
    // Use unreadCountMe (messages from others that current user hasn't read)
    const myUnread = cskhConversation.unreadCountMe ?? 0;
    const hasUnread = myUnread > 0;

    return (
      <div
        onClick={handleSelectCSKH}
        className={clsx(
          "flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200",
          "border-b border-neutral-2",
          isActive
            ? "bg-background-1 border-l-4 border-primary-6 shadow-sm"
            : "hover:bg-background-2 active:bg-background-1"
        )}
      >
        <div className="flex-shrink-0 relative">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-neutral-3 flex items-center justify-center shadow-sm">
            <Image
              src={images.CSKH}
              alt="Chăm sóc khách hàng"
              rounded
              className="w-full h-full object-cover"
            />
          </div>
          {hasUnread && (
            <div className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-error rounded-full flex items-center justify-center text-xs text-white font-bold shadow-md">
              {myUnread > 9 ? "9+" : myUnread}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className={clsx(
              "text-sm font-semibold truncate",
              isActive ? "text-primary-9" : "text-neutral-10",
              hasUnread && !isActive && "font-bold"
            )}>
              CSKH
            </h3>
            {cskhConversation.lastMessage && (
              <span className="text-xs text-neutral-6 flex-shrink-0 ml-2 font-medium">
                {formatLastMessageTime(cskhConversation.lastMessage.createdAt)}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            {(() => {
              const lastMessage = cskhConversation.lastMessage;
              const hasText = lastMessage?.message && typeof lastMessage.message === 'string' && lastMessage.message.trim();
              const hasImageAttachments = lastMessage?.attachments && lastMessage.attachments.some((att: { type?: string }) => att.type?.startsWith("image/"));
              const firstImage = lastMessage?.attachments?.find((att: { type?: string }) => att.type?.startsWith("image/"));
              
              // If only images (no text), show image preview
              if (!hasText && hasImageAttachments && firstImage) {
                return (
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden border border-neutral-3">
                      <Image
                        src={firstImage.url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className={clsx(
                      "text-sm truncate",
                      isActive ? "text-neutral-8" : "text-neutral-7",
                      hasUnread && !isActive && "font-medium text-neutral-9"
                    )}>
                      📷 Ảnh
                    </span>
                  </div>
                );
              }
              
              // If has text or no message, show text
              return (
                <p className={clsx(
                  "text-sm truncate",
                  isActive ? "text-neutral-8" : "text-neutral-7",
                  hasUnread && !isActive && "font-medium text-neutral-9"
                )}>
                  {hasText ? lastMessage.message : "Nhắn tin để được hỗ trợ"}
                </p>
              );
            })()}
          </div>
        </div>
      </div>
    );
  };

  // Render header section
  const renderHeader = () => (
    <div className="bg-background-base border-b border-neutral-3">
      <Form.Root>
        <div className="px-4 pt-4 pb-3">
         

          {/* Search Input */}
          <div className="mb-3">
            <Input
              name="search"
              placeholder="Tìm kiếm theo tên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              iconLeft={<Search className="w-4 h-4 text-neutral-6" />}
              sizeInput="full"
              textSize="small"
              className="bg-background-1"
              inputCustomClass="border-neutral-3 focus:border-primary-6"
            />
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)} className="flex-1">
              <Tabs.List variant="solid" fullWidth className="bg-background-1">
                <Tabs.Trigger value="all" className="text-sm font-medium">
                  Tất cả
                </Tabs.Trigger>
                <Tabs.Trigger value="unread" className="text-sm font-medium">
                  Chưa đọc
                </Tabs.Trigger>
              </Tabs.List>
            </Tabs>

            <Popover
              open={isSortMenuOpen}
              onOpenChange={setIsSortMenuOpen}
              side="bottom"
              align="end"
              contentClassName="bg-background-1 border border-neutral-3 rounded-lg shadow-lg p-1 min-w-[160px]"
              content={
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy("time");
                      setIsSortMenuOpen(false);
                    }}
                    className={clsx(
                      "w-full text-left px-3 py-2 text-sm transition-colors rounded-md",
                      sortBy === "time"
                        ? "bg-background-1 text-primary-9 font-medium"
                        : "text-neutral-10 hover:bg-background-2"
                    )}
                  >
                    Theo thời gian
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy("name");
                      setIsSortMenuOpen(false);
                    }}
                    className={clsx(
                      "w-full text-left px-3 py-2 text-sm transition-colors rounded-md",
                      sortBy === "name"
                        ? "bg-background-1 text-primary-9 font-medium"
                        : "text-neutral-10 hover:bg-background-2"
                    )}
                  >
                    Theo tên
                  </button>
                </div>
              }
            >
              <button
                type="button"
                className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-background-2 transition-colors text-neutral-7 hover:text-neutral-10"
                aria-label="Sắp xếp"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </Popover>
          </div>
        </div>
      </Form.Root>
    </div>
  );


  if (status === "LOADING") {
    return (
      <div className="flex flex-col h-full min-h-[calc(100vh-65px)] bg-background-1">
        {renderHeader()}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {shouldShowCSKH && renderCSKHItem()}
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  const hasConversations = filteredAndSortedConversations.length > 0;
  const showEmptyState = !hasConversations && !shouldShowCSKH;

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-65px)] bg-background-1">
      {renderHeader()}

      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* CSKH Fixed Item */}
        {shouldShowCSKH && renderCSKHItem()}

        {/* Filtered Conversations */}
        {hasConversations ? (
          filteredAndSortedConversations.map((conversation: ChatConversation) => (
            <ConversationItem key={conversation._id} conversation={conversation} />
          ))
        ) : showEmptyState ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="text-center">
              <p className="text-sm font-medium text-neutral-7 mb-1">
                {searchQuery.trim()
                  ? "Không tìm thấy cuộc trò chuyện nào"
                  : activeTab === "unread"
                  ? "Không có tin nhắn chưa đọc"
                  : "Chưa có cuộc trò chuyện nào"}
              </p>
              {searchQuery.trim() && (
                <p className="text-xs text-neutral-6">
                  Thử tìm kiếm với từ khóa khác
                </p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ConversationsList;

