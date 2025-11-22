import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { socketClients, SOCKET_EVENTS } from "@/core/socket";
import { tokenStorage } from "@/core/base";
import { AUTH_TOKENS_CHANGED_EVENT } from "@/shared/constants/events";
import { toastUtils } from "@/shared/utils/toast.utils";
import { useAppDispatch, useAppSelector } from "@/app/store";
import {
  applySocketOrderUpdate,
  fetchShopStatusByUserStart,
  getOrdersStart,
} from "@/features/Shop/slice/shop.slice";
import {
  fetchOrdersStart as fetchProfileOrdersStart,
  applyProfileOrderUpdate,
} from "@/features/Profile/slice/profile.slice";
import { updateNotificationFromSocket } from "@/app/store/slices/notification/notification.slice";
import { updateMessageFromSocket, updateConversationFromSocket } from "@/app/store/slices/chat/chat.slice";

const MAX_NOTIFICATIONS = 50;

export interface RealtimeNotification {
  id: string;
  title?: string;
  content?: string;
  type?: string;
  icon?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  priority?: string;
  createdAt?: string;
  isRead?: boolean;
  raw?: Record<string, unknown>;
}

interface NotificationCenterValue {
  notifications: RealtimeNotification[];
  unreadCount: number;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationCenterContext = createContext<
  NotificationCenterValue | undefined
>(undefined);

export const useNotificationCenter = () => {
  const context = useContext(NotificationCenterContext);
  if (!context) {
    throw new Error(
      "useNotificationCenter must be used within RealtimeProvider"
    );
  }
  return context;
};

const generateNotificationId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

const toRealtimeNotification = (
  payload: Record<string, any>
): RealtimeNotification => {
  const id =
    (payload.notificationId && String(payload.notificationId)) ||
    (payload.id && String(payload.id)) ||
    generateNotificationId();

  return {
    id,
    title: payload.title,
    content: payload.content,
    type: payload.type,
    icon: payload.icon,
    actionUrl: payload.actionUrl,
    metadata: payload.metadata,
    priority: payload.priority,
    createdAt: payload.createdAt || new Date().toISOString(),
    isRead: false,
    raw: payload,
  };
};

const RealtimeProvider = ({ children }: PropsWithChildren) => {
  const dispatch = useAppDispatch();
  const shopOrdersQuery = useAppSelector(
    (state) => (state as any).shop.orders.lastQuery
  );
  const profileOrdersQuery = useAppSelector(
    (state) => (state as any).profile.orders.lastQuery
  );
  const authUser = useAppSelector((state) => (state as any).auth.user);
  const profileUserId = useAppSelector(
    (state) => (state as any).profile.profile.data?._id
  );
  const shopOwnerUserId = profileUserId || authUser?._id;
  const [hasTokens, setHasTokens] = useState(() => tokenStorage.hasTokens());
  const [notifications, setNotifications] = useState<RealtimeNotification[]>(
    []
  );
  const shopOrdersQueryRef = useRef(shopOrdersQuery);
  const profileOrdersQueryRef = useRef(profileOrdersQuery);
  const shopOwnerUserIdRef = useRef(shopOwnerUserId);

  useEffect(() => {
    shopOrdersQueryRef.current = shopOrdersQuery;
  }, [shopOrdersQuery]);

  useEffect(() => {
    profileOrdersQueryRef.current = profileOrdersQuery;
  }, [profileOrdersQuery]);

  useEffect(() => {
    shopOwnerUserIdRef.current = shopOwnerUserId;
  }, [shopOwnerUserId]);

  useEffect(() => {
    const handleTokenChange = (event: Event) => {
      const detail = (event as CustomEvent<{ hasTokens?: boolean }>).detail;
      if (detail && typeof detail.hasTokens === "boolean") {
        setHasTokens(detail.hasTokens);
      } else {
        setHasTokens(tokenStorage.hasTokens());
      }
    };
    const refreshFromFocus = () => setHasTokens(tokenStorage.hasTokens());

    window.addEventListener(
      AUTH_TOKENS_CHANGED_EVENT,
      handleTokenChange as EventListener
    );
    window.addEventListener("focus", refreshFromFocus);

    return () => {
      window.removeEventListener(
        AUTH_TOKENS_CHANGED_EVENT,
        handleTokenChange as EventListener
      );
      window.removeEventListener("focus", refreshFromFocus);
    };
  }, []);

  const addNotification = useCallback((payload: Record<string, any>) => {
    const notification = toRealtimeNotification(payload);
    setNotifications((prev) => {
      const next = [notification, ...prev];
      if (next.length > MAX_NOTIFICATIONS) {
        next.length = MAX_NOTIFICATIONS;
      }
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((item) => (item.isRead ? item : { ...item, isRead: true }))
    );
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id && !item.isRead ? { ...item, isRead: true } : item
      )
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  const handleShopOrderEvent = useCallback(
    (payload: Record<string, any>) => {
      const type = payload?.type;
      if (!type || !payload?.metadata) return;
      const metadata = payload.metadata as Record<string, any>;
      const orderId = metadata.orderId as string | undefined;
      if (!orderId) return;
      const currentQuery = shopOrdersQueryRef.current;

      if (type === "order:new") {
        dispatch(
          getOrdersStart({
            page: currentQuery?.page || 1,
            limit: currentQuery?.limit || 10,
            orderStatus: currentQuery?.orderStatus,
          })
        );
        return;
      }

      const orderStatus =
        metadata.status || metadata.orderStatus || metadata.state;

      dispatch(
        applySocketOrderUpdate({
          orderId,
          orderStatus,
          patch: {
            trackingNumber: metadata.trackingNumber,
            notes: metadata.note || metadata.notes,
            totalAmount: metadata.totalAmount,
            shippingFee: metadata.shippingFee,
            discount: metadata.discountAmount,
            updatedAt: payload.createdAt,
          } as any,
        })
      );
    },
    [dispatch, shopOrdersQuery]
  );

  const handleUserOrderEvent = useCallback(
    (payload: Record<string, any>) => {
      const type = payload?.type;
      if (!type || !payload?.metadata) return;
      const metadata = payload.metadata as Record<string, any>;
      const orderId = metadata.orderId as string | undefined;
      if (!orderId) return;
      const currentQuery = profileOrdersQueryRef.current;

      if (type === "order:placed") {
        dispatch(
          fetchProfileOrdersStart({
            page: currentQuery?.page || 1,
            limit: currentQuery?.limit || 10,
          })
        );
        return;
      }

      if (type === "order:status") {
        const orderStatus =
          metadata.status || metadata.orderStatus || metadata.state;
        dispatch(
          applyProfileOrderUpdate({
            orderId,
            orderStatus,
            patch: {
              notes: metadata.note || metadata.notes,
              trackingNumber: metadata.trackingNumber,
              updatedAt: payload.createdAt,
              totalAmount: metadata.totalAmount,
              shippingFee: metadata.shippingFee,
              discountAmount: metadata.discountAmount,
            } as any,
          })
        );
      }
    },
    [dispatch, profileOrdersQuery]
  );

  const handleShopStatusEvent = useCallback(() => {
    const currentUserId = shopOwnerUserIdRef.current;
    if (!currentUserId) return;
    dispatch(fetchShopStatusByUserStart({ userId: currentUserId }));
  }, [dispatch]);

  useEffect(() => {
    if (!hasTokens) {
      socketClients.notifications.disconnect(true);
      return;
    }

    const socket = socketClients.notifications.connect();

    const handleNotification = (payload: Record<string, any>) => {
      addNotification(payload);
      
      // Update notification in Redux store
      dispatch(
        updateNotificationFromSocket({
          notification: {
            _id: payload.notificationId || payload.id || generateNotificationId(),
            userId: authUser?._id || "",
            title: payload.title || "",
            message: payload.content || payload.title || "",
            type: payload.type || "system",
            isRead: false,
            data: payload.metadata || {},
            actionUrl: payload.actionUrl,
            createdAt: payload.createdAt || new Date().toISOString(),
          },
          notificationId: payload.notificationId || payload.id,
        })
      );

      const message =
        payload?.content ||
        payload?.title ||
        "Bạn vừa nhận được thông báo mới";
      toastUtils.info(message);

      if (payload?.type?.startsWith("order:")) {
        if (
          payload.type === "order:new" ||
          payload.type === "order:customer:update"
        ) {
          handleShopOrderEvent(payload);
        } else if (
          payload.type === "order:status" ||
          payload.type === "order:placed"
        ) {
          handleUserOrderEvent(payload);
        } else {
          handleShopOrderEvent(payload);
          handleUserOrderEvent(payload);
        }
      }

      if (payload?.type?.startsWith("shop:")) {
        handleShopStatusEvent();
      }
    };

    socket.on(SOCKET_EVENTS.NOTIFICATION_SEND, handleNotification);

    return () => {
      socket.off(SOCKET_EVENTS.NOTIFICATION_SEND, handleNotification);
      socketClients.notifications.disconnect(true);
    };
  }, [
    addNotification,
    hasTokens,
    handleShopOrderEvent,
    handleUserOrderEvent,
    handleShopStatusEvent,
    dispatch,
    authUser,
  ]);

  // Handle chat socket events
  useEffect(() => {
    if (!hasTokens) {
      socketClients.shopChat?.disconnect(true);
      socketClients.adminChat?.disconnect(true);
      socketClients.aiChat?.disconnect(true);
      return;
    }

    // Handle shop chat messages
    const shopChatSocket = socketClients.shopChat?.connect();
    if (shopChatSocket) {
      const handleShopChatMessage = (payload: Record<string, any>) => {
        // Handle both old format (flat) and new format (nested message object)
        let messageData = payload.message;
        if (!messageData && payload.conversationId) {
          // Old format: message fields are at root level
          messageData = {
            _id: payload._id || payload.messageId,
            conversationId: payload.conversationId,
            senderId: payload.senderId,
            senderName: payload.senderName,
            senderAvatar: payload.senderAvatar,
            message: payload.message || payload.messageText,
            attachments: payload.attachments,
            metadata: payload.metadata,
            isRead: payload.isRead || false,
            isDelivered: payload.isDelivered || false,
            createdAt: payload.createdAt || payload.sentAt,
          };
        }

        if (payload?.conversationId && messageData) {
          const message = {
            _id: messageData._id || payload.messageId || payload._id || generateNotificationId(),
            conversationId: payload.conversationId,
            senderId: messageData.senderId || payload.senderId || "",
            senderName: messageData.senderName || payload.senderName,
            senderAvatar: messageData.senderAvatar || payload.senderAvatar,
            message: messageData.message || payload.message || "",
            attachments: messageData.attachments || payload.attachments || [],
            metadata: messageData.metadata || payload.metadata || {},
            isRead: messageData.isRead || payload.isRead || false,
            isDelivered: messageData.isDelivered || payload.isDelivered || false,
            createdAt: messageData.createdAt || payload.sentAt || payload.createdAt || new Date().toISOString(),
          };

          dispatch(
            updateMessageFromSocket({
              conversationId: payload.conversationId,
              message,
              isSender: message.senderId === authUser?._id,
            })
          );

          // Update conversation if provided
          if (payload.conversation) {
            dispatch(
              updateConversationFromSocket({
                conversation: payload.conversation,
              })
            );
          }
        }
      };

      const handleShopConversationUpdate = (payload: Record<string, any>) => {
        console.log("[Shop Chat] Conversation update received:", payload);
        if (payload?.conversation) {
          dispatch(
            updateConversationFromSocket({
              conversation: payload.conversation,
            })
          );
        } else if (payload?.conversationId) {
          // If only conversationId is provided, we might need to fetch it
          // But for now, just log it
          console.warn("[Shop Chat] Conversation update without conversation object:", payload);
        }
      };

      shopChatSocket.on(SOCKET_EVENTS.CHAT_MESSAGE_RECEIVE, handleShopChatMessage);
      shopChatSocket.on(SOCKET_EVENTS.CHAT_CONVERSATION_JOIN, handleShopConversationUpdate);

      return () => {
        shopChatSocket.off(SOCKET_EVENTS.CHAT_MESSAGE_RECEIVE, handleShopChatMessage);
        shopChatSocket.off(SOCKET_EVENTS.CHAT_CONVERSATION_JOIN, handleShopConversationUpdate);
        socketClients.shopChat?.disconnect(true);
      };
    }
  }, [hasTokens, dispatch, authUser]);

  // Handle admin chat messages
  useEffect(() => {
    if (!hasTokens) {
      return;
    }

    const adminChatSocket = socketClients.adminChat?.connect();
    if (adminChatSocket) {
      const handleAdminChatMessage = (payload: Record<string, any>) => {
        // Handle both old format (flat) and new format (nested message object)
        let messageData = payload.message;
        if (!messageData && payload.conversationId) {
          // Old format: message fields are at root level
          messageData = {
            _id: payload._id || payload.messageId,
            conversationId: payload.conversationId,
            senderId: payload.senderId,
            senderName: payload.senderName,
            senderAvatar: payload.senderAvatar,
            message: payload.message || payload.messageText,
            attachments: payload.attachments,
            metadata: payload.metadata,
            isRead: payload.isRead || false,
            isDelivered: payload.isDelivered || false,
            createdAt: payload.createdAt || payload.sentAt,
          };
        }

        if (payload?.conversationId && messageData) {
          const message = {
            _id: messageData._id || payload.messageId || payload._id || generateNotificationId(),
            conversationId: payload.conversationId,
            senderId: messageData.senderId || payload.senderId || "",
            senderName: messageData.senderName || payload.senderName,
            senderAvatar: messageData.senderAvatar || payload.senderAvatar,
            message: messageData.message || payload.message || "",
            attachments: messageData.attachments || payload.attachments || [],
            metadata: messageData.metadata || payload.metadata || {},
            isRead: messageData.isRead || payload.isRead || false,
            isDelivered: messageData.isDelivered || payload.isDelivered || false,
            createdAt: messageData.createdAt || payload.sentAt || payload.createdAt || new Date().toISOString(),
          };

          dispatch(
            updateMessageFromSocket({
              conversationId: payload.conversationId,
              message,
              isSender: message.senderId === authUser?._id,
            })
          );

          // Update conversation if provided
          if (payload.conversation) {
            dispatch(
              updateConversationFromSocket({
                conversation: payload.conversation,
              })
            );
          }
        }
      };

      const handleAdminConversationUpdate = (payload: Record<string, any>) => {
        console.log("[Admin Chat] Conversation update received:", payload);
        if (payload?.conversation) {
          dispatch(
            updateConversationFromSocket({
              conversation: payload.conversation,
            })
          );
        } else if (payload?.conversationId) {
          // If only conversationId is provided, we might need to fetch it
          // But for now, just log it
          console.warn("[Admin Chat] Conversation update without conversation object:", payload);
        }
      };

      adminChatSocket.on(SOCKET_EVENTS.CHAT_MESSAGE_RECEIVE, handleAdminChatMessage);
      adminChatSocket.on(SOCKET_EVENTS.CHAT_CONVERSATION_JOIN, handleAdminConversationUpdate);

      return () => {
        adminChatSocket.off(SOCKET_EVENTS.CHAT_MESSAGE_RECEIVE, handleAdminChatMessage);
        adminChatSocket.off(SOCKET_EVENTS.CHAT_CONVERSATION_JOIN, handleAdminConversationUpdate);
        socketClients.adminChat?.disconnect(true);
      };
    }
  }, [hasTokens, dispatch, authUser]);

  const contextValue = useMemo(
    () => ({
      notifications,
      unreadCount,
      markAllAsRead,
      markAsRead,
      clearNotifications,
    }),
    [notifications, unreadCount, markAllAsRead, markAsRead, clearNotifications]
  );

  return (
    <NotificationCenterContext.Provider value={contextValue}>
      {children}
    </NotificationCenterContext.Provider>
  );
};

export default RealtimeProvider;


