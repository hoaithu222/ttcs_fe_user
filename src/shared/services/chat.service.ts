import { socketClients, SOCKET_EVENTS } from "@/core/socket";
import type { ChatMessage, ChatConversation } from "@/core/api/chat/type";

export interface ChatServiceOptions {
  channel?: "admin" | "shop" | "ai";
  onMessage?: (message: ChatMessage, conversationId: string) => void;
  onConversationUpdate?: (conversation: ChatConversation) => void;
  onTyping?: (userId: string, conversationId: string, isTyping: boolean) => void;
  onError?: (error: Error) => void;
}

/**
 * Chat Service - Helper service for managing realtime chat connections
 */
export class ChatService {
  private socket: any = null;
  private channel: "admin" | "shop" | "ai" = "shop";
  private options: ChatServiceOptions = {};
  private isConnected = false;

  constructor(options: ChatServiceOptions = {}) {
    this.options = options;
    this.channel = options.channel || "shop";
  }

  /**
   * Connect to chat socket
   */
  connect(): void {
    if (this.isConnected) {
      return;
    }

    let socketClient;
    switch (this.channel) {
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
        socketClient = socketClients.shopChat;
    }

    if (!socketClient) {
      this.options.onError?.(new Error(`Chat socket client not available for channel: ${this.channel}`));
      return;
    }

    this.socket = socketClient.connect();
    this.isConnected = true;

    // Setup event listeners
    this.setupEventListeners();
  }

  /**
   * Disconnect from chat socket
   */
  disconnect(): void {
    if (!this.isConnected || !this.socket) {
      return;
    }

    this.removeEventListeners();
    this.socket = null;
    this.isConnected = false;
  }

  /**
   * Join a conversation room
   */
  joinConversation(conversationId: string): void {
    if (!this.isConnected || !this.socket) {
      return;
    }

    this.socket.emit(SOCKET_EVENTS.CHAT_CONVERSATION_JOIN, { conversationId });
  }

  /**
   * Leave a conversation room
   */
  leaveConversation(conversationId: string): void {
    if (!this.isConnected || !this.socket) {
      return;
    }

    this.socket.emit(SOCKET_EVENTS.CHAT_CONVERSATION_LEAVE, { conversationId });
  }

  /**
   * Send a message via socket (for realtime delivery)
   */
  sendMessage(conversationId: string, message: string, attachments?: any[], metadata?: Record<string, any>): void {
    if (!this.isConnected || !this.socket) {
      return;
    }

    this.socket.emit(SOCKET_EVENTS.CHAT_MESSAGE_SEND, {
      conversationId,
      message,
      attachments,
      metadata,
    });
  }

  /**
   * Send typing indicator
   */
  sendTyping(conversationId: string, isTyping: boolean): void {
    if (!this.isConnected || !this.socket) {
      return;
    }

    this.socket.emit(SOCKET_EVENTS.CHAT_TYPING, {
      conversationId,
      isTyping,
    });
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) {
      return;
    }

    // Handle incoming messages
    this.socket.on(SOCKET_EVENTS.CHAT_MESSAGE_RECEIVE, (payload: any) => {
      if (payload?.conversationId && payload?.message) {
        const message: ChatMessage = {
          _id: payload.messageId || payload._id || this.generateId(),
          conversationId: payload.conversationId,
          senderId: payload.senderId || "",
          senderName: payload.senderName,
          senderAvatar: payload.senderAvatar,
          message: payload.message || "",
          attachments: payload.attachments,
          metadata: payload.metadata,
          isRead: false,
          isDelivered: false,
          createdAt: payload.sentAt || payload.createdAt || new Date().toISOString(),
        };

        this.options.onMessage?.(message, payload.conversationId);
      }
    });

    // Handle typing indicators
    this.socket.on(SOCKET_EVENTS.CHAT_TYPING, (payload: any) => {
      if (payload?.conversationId && payload?.userId) {
        this.options.onTyping?.(payload.userId, payload.conversationId, payload.isTyping !== false);
      }
    });

    // Handle errors
    this.socket.on(SOCKET_EVENTS.ERROR, (error: any) => {
      this.options.onError?.(new Error(error?.message || "Chat socket error"));
    });

    // Handle system ready
    this.socket.on(SOCKET_EVENTS.SYSTEM_READY, () => {
      console.log(`[ChatService] Connected to ${this.channel} chat channel`);
    });
  }

  /**
   * Remove event listeners
   */
  private removeEventListeners(): void {
    if (!this.socket) {
      return;
    }

    this.socket.off(SOCKET_EVENTS.CHAT_MESSAGE_RECEIVE);
    this.socket.off(SOCKET_EVENTS.CHAT_TYPING);
    this.socket.off(SOCKET_EVENTS.ERROR);
    this.socket.off(SOCKET_EVENTS.SYSTEM_READY);
  }

  /**
   * Generate a temporary ID
   */
  private generateId(): string {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).slice(2);
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }
}

/**
 * Create a chat service instance
 */
export const createChatService = (options: ChatServiceOptions = {}): ChatService => {
  return new ChatService(options);
};






