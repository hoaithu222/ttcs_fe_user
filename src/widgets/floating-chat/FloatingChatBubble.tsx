import React, { useState, useRef, useEffect, useMemo } from "react";
import { MessageCircle, X, Headphones, Bot } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { selectUser } from "@/features/Auth/components/slice/auth.selector";
import { createConversationStart, setCurrentConversation } from "@/app/store/slices/chat/chat.slice";
import { selectConversations } from "@/app/store/slices/chat/chat.selector";
import type { ChatConversation } from "@/core/api/chat/type";
import ModalChatSupport from "@/features/Chat/components/ModalChatSuppport";
import ModalChatWithAi from "@/features/Chat/components/ModalChatWithAi";

const HIDE_PATH_PREFIXES = ['/chat'];
const HIDE_PATH_KEYWORDS = ['/payment'];

const BUBBLE_ID = 'floating-chat-bubble';
const POSITION_STORAGE_KEY = 'floating-chat-bubble-position';

interface Position {
  x: number;
  y: number;
}

const FloatingChatBubble: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const user = useAppSelector(selectUser);
  const conversations = useAppSelector(selectConversations);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const bubbleButtonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Get current pathname from React Router
  const pathname = location.pathname;

  const shouldHide = useMemo(() => {
    if (!user?._id) {
      return true;
    }
    if (pathname.includes("/chat")  || pathname.includes("/payment")) {
      return true;
    }

    // Don't hide when modals are open - we still need to render modals
    // Just hide the button/panel when modals are open

    if (HIDE_PATH_KEYWORDS.some((keyword) => pathname.includes(keyword))) {
      return true;
    }

    if (HIDE_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
      return true;
    }

    return false;
  }, [user?._id, pathname]);

  // Load position from localStorage on mount
  useEffect(() => {
    const savedPosition = localStorage.getItem(POSITION_STORAGE_KEY);
    if (savedPosition) {
      try {
        const parsed = JSON.parse(savedPosition) as Position;
        setPosition(parsed);
      } catch (error) {
        console.error("[FloatingChatBubble] Failed to parse saved position", error);
        // Fallback to default position
        const defaultX = window.innerWidth - 80;
        const defaultY = window.innerHeight - 80;
        setPosition({ x: defaultX, y: defaultY });
      }
    } else {
      // Default position: bottom right (center of button)
      const defaultX = window.innerWidth - 80; // 64px button + 16px margin
      const defaultY = window.innerHeight - 80;
      setPosition({ x: defaultX, y: defaultY });
    }
  }, []);

  // Save position to localStorage when it changes
  useEffect(() => {
    if (position.x !== 0 || position.y !== 0) {
      localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(position));
    }
  }, [position]);

  // Keep bubble within viewport on window resize
  useEffect(() => {
    const handleResize = () => {
      const bubbleSize = 64;
      const halfBubble = bubbleSize / 2;
      const maxX = window.innerWidth - halfBubble;
      const maxY = window.innerHeight - halfBubble;
      const minX = halfBubble;
      const minY = halfBubble;

      setPosition((prev) => ({
        x: Math.max(minX, Math.min(maxX, prev.x)),
        y: Math.max(minY, Math.min(maxY, prev.y)),
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (shouldHide) {
      setIsPanelOpen(false);
    }
  }, [shouldHide]);

  useEffect(() => {
    if (!isPanelOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (
        target &&
        !bubbleButtonRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        setIsPanelOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isPanelOpen]);

  const handleTogglePanel = () => {
    setIsPanelOpen((prev) => !prev);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isPanelOpen) return; // Don't drag when panel is open
    
    setIsDragging(true);
    hasMovedRef.current = false;
    
    // Get actual position of the button element
    const rect = bubbleButtonRef.current?.getBoundingClientRect();
    if (rect) {
      // Calculate offset from mouse position to center of button
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      setDragOffset({
        x: e.clientX - centerX,
        y: e.clientY - centerY,
      });
    } else {
      // Fallback to using position state
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleClick = () => {
    // Only toggle if we didn't drag
    if (!hasMovedRef.current) {
      handleTogglePanel();
    }
    hasMovedRef.current = false;
  };

  useEffect(() => {
    if (!isDragging) return;

    const rect = bubbleButtonRef.current?.getBoundingClientRect();
    let startX = rect ? rect.left + rect.width / 2 : position.x;
    let startY = rect ? rect.top + rect.height / 2 : position.y;

    const handleMouseMove = (e: MouseEvent) => {
      const bubbleSize = 64; // Button size (p-4 = 16px * 2 + icon 24px + padding)
      
      // Calculate new position based on mouse position minus offset
      let newX = e.clientX - dragOffset.x;
      let newY = e.clientY - dragOffset.y;

      // Constrain to viewport (accounting for transform translate -50%)
      const halfBubble = bubbleSize / 2;
      const maxX = window.innerWidth - halfBubble;
      const maxY = window.innerHeight - halfBubble;
      const minX = halfBubble;
      const minY = halfBubble;

      newX = Math.max(minX, Math.min(maxX, newX));
      newY = Math.max(minY, Math.min(maxY, newY));

      // Check if we've moved enough to consider it a drag (threshold: 5px)
      const deltaX = Math.abs(newX - startX);
      const deltaY = Math.abs(newY - startY);
      if (deltaX > 5 || deltaY > 5) {
        hasMovedRef.current = true;
      }

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUpGlobal = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUpGlobal);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUpGlobal);
    };
  }, [isDragging, dragOffset, position]);

  const handleOpenSupport = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      // Find existing CSKH conversation
      const cskhConversation = conversations.find(
        (conv: ChatConversation) => conv.type === "admin" && conv.metadata?.context === "CSKH"
      );

      if (cskhConversation) {
        // If conversation exists, set it as current
        dispatch(setCurrentConversation(cskhConversation));
      } else {
        // Create new CSKH conversation
        dispatch(
          createConversationStart({
            data: {
              type: "admin",
              metadata: { context: "CSKH", isSupport: true },
              initialMessage: "Xin chào! Tôi cần hỗ trợ.",
            },
          })
        );
      }

      setIsSupportModalOpen(true);
      setIsPanelOpen(false);
    } catch (error) {
      console.error("[FloatingChatBubble] Failed to open support chat", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenAi = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      // Find existing AI conversation
      const aiConversation = conversations.find(
        (conv: ChatConversation) => conv.type === "ai" || conv.channel === "ai"
      );

      if (aiConversation) {
        // If conversation exists, set it as current
        dispatch(setCurrentConversation(aiConversation));
      } else {
        // Create new AI conversation
        // Note: AI conversation might need to be created via socket or API
        // For now, we'll try to create it via the standard flow
        dispatch(
          createConversationStart({
            data: {
              type: "ai" as any, // Type assertion needed until backend fully supports it
              metadata: {},
            },
          })
        );
      }

      setIsAiModalOpen(true);
      setIsPanelOpen(false);
    } catch (error) {
      console.error("[FloatingChatBubble] Failed to open AI chat", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  // Always render modals, but conditionally render button/panel
  return (
    <>
      {!shouldHide && (
        <div
          ref={containerRef}
          className="fixed z-[9999] flex cursor-pointer flex-col items-end gap-2"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: 'translate(-50%, -50%)',
            willChange: isDragging ? 'transform' : 'auto',
          }}
        >
          {isPanelOpen && !isSupportModalOpen && !isAiModalOpen && (
          <div
            id={`${BUBBLE_ID}-panel`}
            ref={panelRef}
            className="w-56 rounded-2xl bg-background-2 p-4 shadow-[0_12px_40px_rgba(15,23,42,0.15)] ring-1 ring-black/5 border border-neutral-3 pointer-events-auto"
          >
            <button
              type="button"
              onClick={handleOpenSupport}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-6 px-4 py-3 text-sm font-medium text-white transition hover:bg-primary-7 disabled:cursor-not-allowed disabled:opacity-70 mb-2"
              disabled={isProcessing}
            >
              <Headphones className="w-4 h-4 text-neutral-10" />
              <span className="text-neutral-10">Chat với CSKH</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAi}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-6 to-purple-7 px-4 py-3 text-sm font-medium text-white transition hover:from-purple-7 hover:to-purple-8 disabled:cursor-not-allowed disabled:opacity-70 mb-2"
              disabled={isProcessing}
            >
              <Bot className="w-4 h-4 text-neutral-10" />
              <span className="text-neutral-10">Chat với AI</span>
            </button>

            <button
              type="button"
              onClick={handleClosePanel}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-2 px-4 py-3 text-sm font-medium text-neutral-10 transition hover:bg-neutral-3"
            >
              <X className="w-4 h-4" />
              <span className="text-neutral-10">Đóng</span>
            </button>
          </div>
          )}

          {!isSupportModalOpen && !isAiModalOpen && (
            <button
              id={BUBBLE_ID}
              ref={bubbleButtonRef}
              type="button"
              aria-expanded={isPanelOpen}
              aria-controls={isPanelOpen ? `${BUBBLE_ID}-panel` : undefined}
              className={`flex bg-background-2 items-center justify-center rounded-full p-4 text-primary-6 shadow-[0_12px_30px_rgba(15,23,42,0.25)] ring-1 ring-black/5 border-2 border-primary-6 transition-all hover:scale-105 hover:shadow-[0_16px_40px_rgba(15,23,42,0.3)] focus-visible:ring-2 focus-visible:ring-primary-6 focus-visible:outline-none ${isDragging ? 'scale-110 cursor-grabbing' : 'cursor-grab'}`}
              onMouseDown={handleMouseDown}
              onClick={handleClick}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              <MessageCircle className="w-6 h-6" />
            </button>
          )}
        </div>
      )}

      {/* Modals - Always render, controlled by open prop */}
      <ModalChatSupport
        open={isSupportModalOpen}
        onOpenChange={setIsSupportModalOpen}
      />
      <ModalChatWithAi
        open={isAiModalOpen}
        onOpenChange={setIsAiModalOpen}
      />
    </>
  );
};

export default FloatingChatBubble;

