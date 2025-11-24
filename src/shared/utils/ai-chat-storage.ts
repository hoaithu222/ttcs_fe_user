import type { AiChatMessage } from "@/features/Chat/slice-chat-ai/chatai.type";

const STORAGE_PREFIX = "aiChatThread";
const THREAD_LIMIT = 200;

const buildKey = (userId: string) => `${STORAGE_PREFIX}:${userId}`;

const safeParse = (raw: string | null): AiChatMessage[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
};

const safeStringify = (payload: AiChatMessage[]) => {
  try {
    return JSON.stringify(payload.slice(-THREAD_LIMIT));
  } catch {
    return "[]";
  }
};

export const aiChatStorage = {
  load(userId: string): AiChatMessage[] {
    if (typeof window === "undefined") return [];
    const key = buildKey(userId);
    return safeParse(localStorage.getItem(key));
  },

  save(userId: string, messages: AiChatMessage[]): void {
    if (typeof window === "undefined") return;
    const key = buildKey(userId);
    localStorage.setItem(key, safeStringify(messages));
  },

  clear(userId: string): void {
    if (typeof window === "undefined") return;
    const key = buildKey(userId);
    localStorage.removeItem(key);
  },
};

export default aiChatStorage;

