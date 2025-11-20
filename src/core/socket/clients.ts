import { SOCKET_DEBUG } from "@/app/config/env.config";

import { SOCKET_NAMESPACES } from "./constants";
import { SocketNamespaceClient } from "./socket-client";

const baseOptions = {
  autoConnect: false,
  debug: SOCKET_DEBUG,
};

export const notificationSocketClient = new SocketNamespaceClient({
  ...baseOptions,
  namespace: SOCKET_NAMESPACES.NOTIFICATIONS,
  debugLabel: "notifications",
});

export const adminChatSocketClient = new SocketNamespaceClient({
  ...baseOptions,
  namespace: SOCKET_NAMESPACES.ADMIN_CHAT,
  debugLabel: "chat:admin",
});

export const shopChatSocketClient = new SocketNamespaceClient({
  ...baseOptions,
  namespace: SOCKET_NAMESPACES.SHOP_CHAT,
  debugLabel: "chat:shop",
});

export const aiChatSocketClient = new SocketNamespaceClient({
  ...baseOptions,
  namespace: SOCKET_NAMESPACES.AI_CHAT,
  debugLabel: "chat:ai",
});

export const socketClients = {
  notifications: notificationSocketClient,
  adminChat: adminChatSocketClient,
  shopChat: shopChatSocketClient,
  aiChat: aiChatSocketClient,
};


