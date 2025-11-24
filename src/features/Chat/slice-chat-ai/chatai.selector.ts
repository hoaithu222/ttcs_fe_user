import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";
import type { AiChatMessage } from "./chatai.type";

const selectAiChatState = (state: RootState) => state.aiChat;

export const getAiChatThread = (state: RootState, userId?: string): AiChatMessage[] => {
  if (!userId || !state.aiChat) return [];
  return state.aiChat.messagesByUser[userId] || [];
};

export const selectAiChatMessages = (userId?: string) =>
  createSelector([selectAiChatState], (aiChat): AiChatMessage[] => {
    if (!userId || !aiChat) return [];
    return aiChat.messagesByUser[userId] || [];
  });

export const selectAiChatStatus = (userId?: string) =>
  createSelector([selectAiChatState], (aiChat) => {
    if (!userId || !aiChat) return "idle";
    return aiChat.metaByUser[userId]?.status || "idle";
  });

export const selectAiChatError = (userId?: string) =>
  createSelector([selectAiChatState], (aiChat) => {
    if (!userId || !aiChat) return undefined;
    return aiChat.metaByUser[userId]?.error;
  });

export const selectAiChatLastSyncedAt = (userId?: string) =>
  createSelector([selectAiChatState], (aiChat) => {
    if (!userId || !aiChat) return undefined;
    return aiChat.metaByUser[userId]?.lastSyncedAt;
  });

