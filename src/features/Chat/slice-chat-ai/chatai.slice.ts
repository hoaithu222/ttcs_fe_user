import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AiChatMessage, AiChatState } from "./chatai.type";

const initialState: AiChatState = {
  messagesByUser: {},
  metaByUser: {},
};

const ensureThread = (state: AiChatState, userId: string) => {
  if (!state.messagesByUser[userId]) {
    state.messagesByUser[userId] = [];
  }
  if (!state.metaByUser[userId]) {
    state.metaByUser[userId] = { status: "idle" };
  }
};

export const aiChatSlice = createSlice({
  name: "aiChat",
  initialState,
  reducers: {
    hydrateThreadRequested(state, action: PayloadAction<{ userId: string }>) {
      const { userId } = action.payload;
      ensureThread(state, userId);
      state.metaByUser[userId].status = "hydrating";
      state.metaByUser[userId].error = undefined;
    },
    hydrateThreadSucceeded(
      state,
      action: PayloadAction<{ userId: string; messages: AiChatMessage[]; lastSyncedAt?: string }>
    ) {
      const { userId, messages, lastSyncedAt } = action.payload;
      ensureThread(state, userId);
      state.messagesByUser[userId] = messages;
      state.metaByUser[userId].status = "idle";
      state.metaByUser[userId].lastSyncedAt = lastSyncedAt;
      state.metaByUser[userId].error = undefined;
    },
    hydrateThreadFailed(
      state,
      action: PayloadAction<{ userId: string; error: string }>
    ) {
      const { userId, error } = action.payload;
      ensureThread(state, userId);
      state.metaByUser[userId].status = "error";
      state.metaByUser[userId].error = error;
    },
    sendMessageRequested(
      state,
      action: PayloadAction<{ userId: string; message: string; userName?: string }>
    ) {
      const { userId } = action.payload;
      ensureThread(state, userId);
      state.metaByUser[userId].status = "sending";
      state.metaByUser[userId].error = undefined;
    },
    sendMessageSuccess(state, action: PayloadAction<{ userId: string; syncedAt?: string }>) {
      const { userId, syncedAt } = action.payload;
      ensureThread(state, userId);
      state.metaByUser[userId].status = "idle";
      state.metaByUser[userId].lastSyncedAt = syncedAt;
    },
    sendMessageFailure(
      state,
      action: PayloadAction<{ userId: string; error: string }>
    ) {
      const { userId, error } = action.payload;
      ensureThread(state, userId);
      state.metaByUser[userId].status = "error";
      state.metaByUser[userId].error = error;
    },
    appendMessage(
      state,
      action: PayloadAction<{ userId: string; message: AiChatMessage }>
    ) {
      const { userId, message } = action.payload;
      ensureThread(state, userId);
      state.messagesByUser[userId].push(message);
    },
    updateMessageStatus(
      state,
      action: PayloadAction<{ userId: string; messageId: string; status: AiChatMessage["status"]; error?: string }>
    ) {
      const { userId, messageId, status, error } = action.payload;
      ensureThread(state, userId);
      const target = state.messagesByUser[userId].find((msg) => msg._id === messageId);
      if (target) {
        target.status = status;
        if (!target.metadata) {
          target.metadata = {};
        }
        target.metadata.error = error;
        target.isDelivered = status === "sent";
        target.isRead = status === "sent";
      }
    },
    clearThread(state, action: PayloadAction<{ userId: string }>) {
      const { userId } = action.payload;
      state.messagesByUser[userId] = [];
      state.metaByUser[userId] = { status: "idle" };
    },
  },
});

export const aiChatActions = aiChatSlice.actions;
export const aiChatReducer = aiChatSlice.reducer;

export default aiChatSlice;

