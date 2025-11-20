import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { socketClients, SOCKET_EVENTS } from "@/core/socket";
import { tokenStorage } from "@/core/base";
import { AUTH_TOKENS_CHANGED_EVENT } from "@/shared/constants/events";
import { toastUtils } from "@/shared/utils/toast.utils";
import { useAppDispatch, useAppSelector } from "@/app/store";
import {
  applySocketOrderUpdate,
  getOrdersStart,
} from "@/features/Shop/slice/shop.slice";
import {
  fetchOrdersStart as fetchProfileOrdersStart,
  applyProfileOrderUpdate,
} from "@/features/Profile/slice/profile.slice";

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
    (state) => state.shop.orders.lastQuery
  );
  const profileOrdersQuery = useAppSelector(
    (state) => state.profile.orders.lastQuery
  );
  const [hasTokens, setHasTokens] = useState(() => tokenStorage.hasTokens());
  const [notifications, setNotifications] = useState<RealtimeNotification[]>(
    []
  );

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

      if (type === "order:new") {
        dispatch(
          getOrdersStart({
            page: shopOrdersQuery?.page || 1,
            limit: shopOrdersQuery?.limit || 10,
            orderStatus: shopOrdersQuery?.orderStatus,
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

      if (type === "order:placed") {
        dispatch(
          fetchProfileOrdersStart({
            page: profileOrdersQuery?.page || 1,
            limit: profileOrdersQuery?.limit || 10,
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

  useEffect(() => {
    if (!hasTokens) {
      socketClients.notifications.disconnect(true);
      return;
    }

    const socket = socketClients.notifications.connect(true);

    const handleNotification = (payload: Record<string, any>) => {
      addNotification(payload);
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
    };

    socket.on(SOCKET_EVENTS.NOTIFICATION_SEND, handleNotification);

    return () => {
      socket.off(SOCKET_EVENTS.NOTIFICATION_SEND, handleNotification);
      socketClients.notifications.disconnect();
    };
  }, [
    addNotification,
    hasTokens,
    handleShopOrderEvent,
    handleUserOrderEvent,
  ]);

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


