import { PayloadAction } from "@reduxjs/toolkit";
import { call, put, select, takeLatest } from "redux-saga/effects";
import { v4 as uuidv4 } from "uuid";
import { aiChatActions } from "./chatai.slice";
import { getAiConversationId, type AiChatMessage } from "./chatai.type";
import { aiChatStorage } from "@/shared/utils/ai-chat-storage";
import { aiChatApi, type AiChatApiResponse } from "@/core/api/chat/ai-chat.api";
import type { RootState } from "@/app/store";
import { getAiChatThread } from "./chatai.selector";

const extractAiContent = (response: AiChatApiResponse): string => {
  if (!response) return "AI chưa sẵn sàng phản hồi.";
  const potentialFields = [
    response?.data?.reply,
    response?.data?.message,
    response?.data?.content,
    response?.message,
  ];
  return (
    potentialFields.find((value) => typeof value === "string" && value.trim().length > 0)?.trim() ||
    "AI chưa sẵn sàng phản hồi."
  );
};

function* persistThread(userId: string) {
  const thread: AiChatMessage[] = yield select((state: RootState) => getAiChatThread(state, userId));
  yield call([aiChatStorage, aiChatStorage.save], userId, thread);
}

function* hydrateThreadWorker(action: PayloadAction<{ userId: string }>) {
  const { userId } = action.payload;
  if (!userId) return;
  try {
    const cached = aiChatStorage.load(userId);
    yield put(
      aiChatActions.hydrateThreadSucceeded({
        userId,
        messages: cached,
        lastSyncedAt: new Date().toISOString(),
      })
    );
  } catch (error) {
    const message = (error as Error)?.message || "Không thể tải lịch sử chat AI.";
    yield put(aiChatActions.hydrateThreadFailed({ userId, error: message }));
  }
}

function* sendAiMessageWorker(
  action: PayloadAction<{ userId: string; message: string; userName?: string }>
) {
  const { userId, message, userName } = action.payload;
  if (!userId || !message.trim()) return;

  const trimmedMessage = message.trim();
  const conversationId = getAiConversationId(userId);
  const timestamp = new Date().toISOString();
  const tempMessageId = `client-${uuidv4()}`;

  const userMessage: AiChatMessage = {
    _id: tempMessageId,
    conversationId,
    senderId: userId,
    senderName: userName || "Bạn",
    message: trimmedMessage,
    type: "text",
    createdAt: timestamp,
    metadata: {
      role: "user",
    },
    status: "pending",
    isDelivered: false,
    isRead: false,
  };

  yield put(aiChatActions.appendMessage({ userId, message: userMessage }));

  try {
    yield call(persistThread, userId);
    const response: AiChatApiResponse = yield call([aiChatApi, aiChatApi.sendMessage], {
      message: trimmedMessage,
    });

    const aiContent = extractAiContent(response);
    const assistantMessage: AiChatMessage = {
      _id: response?.data?.id || `ai-${uuidv4()}`,
      conversationId,
      senderId: "ai-assistant",
      senderName: "AI Assistant",
      message: aiContent,
      type: "text",
      createdAt: new Date().toISOString(),
      metadata: {
        ...(response?.data || {}),
        role: "assistant",
      },
      status: "sent",
      isDelivered: true,
      isRead: true,
    };

    yield put(
      aiChatActions.updateMessageStatus({
        userId,
        messageId: tempMessageId,
        status: "sent",
      })
    );
    yield put(aiChatActions.appendMessage({ userId, message: assistantMessage }));
    yield put(
      aiChatActions.sendMessageSuccess({
        userId,
        syncedAt: new Date().toISOString(),
      })
    );
  } catch (error) {
    const errorMessage = (error as Error)?.message || "Không thể gửi tin nhắn đến AI.";
    yield put(
      aiChatActions.updateMessageStatus({
        userId,
        messageId: tempMessageId,
        status: "failed",
        error: errorMessage,
      })
    );
    yield put(aiChatActions.sendMessageFailure({ userId, error: errorMessage }));
  } finally {
    yield call(persistThread, userId);
  }
}

export function* aiChatSaga() {
  yield takeLatest(aiChatActions.hydrateThreadRequested.type, hydrateThreadWorker);
  yield takeLatest(aiChatActions.sendMessageRequested.type, sendAiMessageWorker);
}

