import { useState, useEffect, useCallback } from "react";
import Section from "@/foundation/components/sections/Section";
import { Card } from "@/foundation/components/info/Card";
import { AlertTriangle, Ban, MessageCircle } from "lucide-react";
import Button from "@/foundation/components/buttons/Button";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { selectUser } from "@/features/Auth/components/slice/auth.selector";
import {
  selectShopStatusByUser,
  selectShopInfo,
} from "../slice/shop.selector";
import { fetchShopStatusByUserStart, getShopInfoStart } from "../slice/shop.slice";
import { 
  createConversationStart, 
  setCurrentConversation,
} from "@/app/store/slices/chat/chat.slice";
import {
  selectCurrentConversation,
  selectConversations,
} from "@/app/store/slices/chat/chat.selector";
import ModalChatSupport from "@/features/Chat/components/ModalChatSuppport";
import type { ChatConversation } from "@/core/api/chat/type";
import { socketClients, SOCKET_EVENTS } from "@/core/socket";
import { tokenStorage } from "@/core/base";

const ShopSuspendedPage = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser) as any;
  const shopStatusByUser = useAppSelector(selectShopStatusByUser);
  const shopInfo = useAppSelector(selectShopInfo);
  const conversations = useAppSelector(selectConversations);
  const currentConversation = useAppSelector(selectCurrentConversation);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [shouldSendUnlockMessage, setShouldSendUnlockMessage] = useState(false);

  // Listen to socket notifications for shop status updates
  useEffect(() => {
    const hasTokens = tokenStorage.hasTokens();
    if (!hasTokens || !user?._id) {
      return;
    }

    const socket = socketClients.notifications.connect();

    const handleShopNotification = (payload: Record<string, any>) => {
      // Check if notification is about shop status
      if (payload?.type?.startsWith("shop:")) {
        console.log("[ShopSuspendedPage] Received shop notification:", payload);
        
        // Immediately refetch shop status and info to get latest information
        dispatch(fetchShopStatusByUserStart({ userId: user._id }));
        dispatch(getShopInfoStart());
      }
    };

    socket.on(SOCKET_EVENTS.NOTIFICATION_SEND, handleShopNotification);

    return () => {
      socket.off(SOCKET_EVENTS.NOTIFICATION_SEND, handleShopNotification);
    };
  }, [dispatch, user?._id]);

  const sendUnlockSupportMessage = useCallback(() => {
    if (!currentConversation?._id) return;

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

    const shopName = shopInfo?.name || shopStatusByUser?.shop?.name || "cửa hàng của tôi";
    const unlockMessage = `Xin chào! Cửa hàng ${shopName} của tôi đang bị khóa/hạn chế. Tôi cần hỗ trợ để mở khóa cửa hàng. Vui lòng kiểm tra và hỗ trợ tôi khôi phục hoạt động của cửa hàng. Cảm ơn!`;

    socket.emit(SOCKET_EVENTS.CHAT_MESSAGE_SEND, {
      conversationId: currentConversation._id,
      message: unlockMessage,
      type: "text",
    });
  }, [currentConversation?._id, shopInfo?.name, shopStatusByUser?.shop?.name]);

  // Listen for conversation creation success to send unlock message
  useEffect(() => {
    if (shouldSendUnlockMessage && currentConversation?._id) {
      // Wait a bit for conversation to be fully set up
      const timer = setTimeout(() => {
        sendUnlockSupportMessage();
        setShouldSendUnlockMessage(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [shouldSendUnlockMessage, currentConversation?._id, sendUnlockSupportMessage]);

  const handleOpenSupportChat = useCallback(async () => {
    try {
      // Find existing CSKH conversation
      const cskhConversation = conversations.find(
        (conv: ChatConversation) => conv.type === "admin" && conv.metadata?.context === "CSKH"
      );

      if (cskhConversation) {
        // If conversation exists, set it as current
        dispatch(setCurrentConversation(cskhConversation));
        setShouldSendUnlockMessage(true);
      } else {
        // Create new CSKH conversation with unlock message
        dispatch(
          createConversationStart({
            data: {
              type: "admin",
              metadata: { context: "CSKH", isSupport: true },
              initialMessage: "Xin chào! Tôi cần hỗ trợ mở khóa cửa hàng.",
            },
          })
        );
        setShouldSendUnlockMessage(true);
      }

      setIsChatModalOpen(true);
    } catch (error) {
      console.error("[ShopSuspendedPage] Failed to open support chat", error);
    }
  }, [dispatch, conversations]);

  const shopName = shopInfo?.name || shopStatusByUser?.shop?.name || "";

  return (
    <>
      <Section title="Cửa hàng bị hạn chế">
        <Card className="container mx-auto my-6" paddingX="lg" paddingY="lg" shadow="md">
          <Card.Body className="flex flex-col items-center space-y-6 text-center">
            {/* Icon Container */}
            <div className="relative">
              <div className="flex justify-center items-center w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-full shadow-lg">
                <Ban className="w-10 h-10 text-red-600" />
              </div>
              <div className="flex absolute -top-1 -right-1 justify-center items-center w-6 h-6 bg-red-500 rounded-full shadow-md">
                <AlertTriangle className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-neutral-10">Cửa hàng đang bị hạn chế</h2>
              <p className="max-w-md text-base text-neutral-6">
                {shopName 
                  ? `Cửa hàng ${shopName} của bạn đã bị tạm ngưng hoạt động do vi phạm quy định của nền tảng.`
                  : "Cửa hàng của bạn đã bị tạm ngưng hoạt động do vi phạm quy định của nền tảng."}
              </p>
            </div>

            {/* Warning Box */}
            <div className="p-4 space-y-3 w-full bg-red-50 rounded-lg border border-red-200">
              <div className="flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-left">
                  <p className="text-sm font-semibold text-red-900">Lý do hạn chế</p>
                  <p className="text-sm text-red-700">
                    Vui lòng kiểm tra email hoặc thông báo trong hệ thống để xem chi tiết vi phạm và
                    các bước cần thực hiện để khôi phục cửa hàng.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 w-full sm:flex-row">
              <Button
                variant="solid"
                color="blue"
                fullWidth
                icon={<MessageCircle className="w-4 h-4" />}
                onClick={handleOpenSupportChat}
              >
                Liên hệ hỗ trợ
              </Button>
              {/* <Button
                variant="outline"
                color="blue"
                fullWidth
                icon={<ExternalLink className="w-4 h-4" />}
              >
                Xem thông báo vi phạm
              </Button> */}
            </div>

            {/* Status Info */}
            <div className="flex gap-2 items-center text-sm text-neutral-6">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Trạng thái: Bị hạn chế</span>
            </div>
          </Card.Body>
        </Card>
      </Section>

      {/* Chat Support Modal */}
      <ModalChatSupport open={isChatModalOpen} onOpenChange={setIsChatModalOpen} />
    </>
  );
};

export default ShopSuspendedPage;
