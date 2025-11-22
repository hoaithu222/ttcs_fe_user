import { call, put, takeEvery } from "redux-saga/effects";
import { chatApi } from "@/core/api/chat";
import { addToast } from "@/app/store/slices/toast";
import {
  getConversationsStart,
  getConversationsSuccess,
  getConversationsFailure,
  getMessagesStart,
  getMessagesSuccess,
  getMessagesFailure,
  sendMessageStart,
  sendMessageSuccess,
  sendMessageFailure,
  markAsReadStart,
  markAsReadSuccess,
  markAsReadFailure,
} from "./chat.slice";

type GetConversationsAction = ReturnType<typeof getConversationsStart>;
type GetMessagesAction = ReturnType<typeof getMessagesStart>;
type SendMessageAction = ReturnType<typeof sendMessageStart>;
type MarkAsReadAction = ReturnType<typeof markAsReadStart>;

// Helper function để lấy error message
const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object") {
    const e = error as { response?: { data?: { message?: string } }; message?: string };
    return e?.response?.data?.message || e?.message || fallback;
  }
  return fallback;
};

// Workers
function* getConversationsWorker(action: GetConversationsAction): Generator {
  try {
    const { query } = action.payload;
    const response: any = yield call(
      [chatApi, chatApi.getConversations],
      query
    );

    if (response.success && response.data) {
      yield put(getConversationsSuccess(response.data));
    } else {
      const errorMessage = "Không thể tải danh sách cuộc trò chuyện";
      yield put(getConversationsFailure(errorMessage));
      yield put(addToast({ type: "error", message: errorMessage }));
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Không thể tải danh sách cuộc trò chuyện");
    yield put(getConversationsFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

function* getMessagesWorker(action: GetMessagesAction): Generator {
  try {
    const { conversationId, query } = action.payload;
    const response: any = yield call(
      [chatApi, chatApi.getMessages],
      conversationId,
      query
    );

    if (response.success && response.data) {
      yield put(
        getMessagesSuccess({
          conversationId,
          response: response.data,
        })
      );
    } else {
      const errorMessage = "Không thể tải tin nhắn";
      yield put(getMessagesFailure(errorMessage));
      yield put(addToast({ type: "error", message: errorMessage }));
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Không thể tải tin nhắn");
    yield put(getMessagesFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

function* sendMessageWorker(action: SendMessageAction): Generator {
  try {
    const { conversationId, data } = action.payload;
    const response: any = yield call(
      [chatApi, chatApi.sendMessage],
      conversationId,
      data
    );

    if (response.success && response.data) {
      yield put(
        sendMessageSuccess({
          conversationId,
          message: response.data,
        })
      );
    } else {
      const errorMessage = "Không thể gửi tin nhắn";
      yield put(sendMessageFailure(errorMessage));
      yield put(addToast({ type: "error", message: errorMessage }));
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Không thể gửi tin nhắn");
    yield put(sendMessageFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

function* markAsReadWorker(action: MarkAsReadAction): Generator {
  try {
    const { conversationId } = action.payload;
    const response: any = yield call(
      [chatApi, chatApi.markAsRead],
      conversationId
    );

    if (response.success) {
      yield put(markAsReadSuccess({ conversationId }));
    } else {
      const errorMessage = "Không thể đánh dấu đã đọc";
      yield put(markAsReadFailure(errorMessage));
      yield put(addToast({ type: "error", message: errorMessage }));
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Không thể đánh dấu đã đọc");
    yield put(markAsReadFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

// Root watcher for Chat feature
export function* chatSaga() {
  yield takeEvery("chat/getConversationsStart", getConversationsWorker);
  yield takeEvery("chat/getMessagesStart", getMessagesWorker);
  yield takeEvery("chat/sendMessageStart", sendMessageWorker);
  yield takeEvery("chat/markAsReadStart", markAsReadWorker);
}

