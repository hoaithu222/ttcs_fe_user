import type { ChatMessage } from "@/core/api/chat/type";

export type AiChatRole = "user" | "assistant";

export interface AiChatMessage extends ChatMessage {
  metadata?: ChatMessage["metadata"] & { role?: AiChatRole; error?: string };
  status?: "pending" | "sent" | "failed";
}

export interface AiChatThreadMeta {
  status: "idle" | "hydrating" | "sending" | "error";
  error?: string;
  lastSyncedAt?: string;
}

export interface AiChatState {
  messagesByUser: Record<string, AiChatMessage[]>;
  metaByUser: Record<string, AiChatThreadMeta>;
}

export const getAiConversationId = (userId: string) => `ai-thread-${userId}`;

