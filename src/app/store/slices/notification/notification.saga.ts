import { call, put, takeEvery } from "redux-saga/effects";
import { userNotificationsApi } from "@/core/api/notifications";
import { addToast } from "@/app/store/slices/toast";
import {
  getNotificationsStart,
  getNotificationsSuccess,
  getNotificationsFailure,
  markAsReadStart,
  markAsReadSuccess,
  markAsReadFailure,
  markAllAsReadStart,
  markAllAsReadSuccess,
  markAllAsReadFailure,
  deleteNotificationStart,
  deleteNotificationSuccess,
  deleteNotificationFailure,
} from "./notification.slice";

type GetNotificationsAction = ReturnType<typeof getNotificationsStart>;
type MarkAsReadAction = ReturnType<typeof markAsReadStart>;
type MarkAllAsReadAction = ReturnType<typeof markAllAsReadStart>;
type DeleteNotificationAction = ReturnType<typeof deleteNotificationStart>;

// Helper function để lấy error message
const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object") {
    const e = error as { response?: { data?: { message?: string } }; message?: string };
    return e?.response?.data?.message || e?.message || fallback;
  }
  return fallback;
};

// Workers
function* getNotificationsWorker(action: GetNotificationsAction): Generator {
  try {
    const { query } = action.payload;
    const response: any = yield call(
      [userNotificationsApi, userNotificationsApi.getNotifications],
      query
    );

    if (response.success && response.data) {
      yield put(getNotificationsSuccess(response.data));
    } else {
      const errorMessage = "Không thể tải danh sách thông báo";
      yield put(getNotificationsFailure(errorMessage));
      yield put(addToast({ type: "error", message: errorMessage }));
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Không thể tải danh sách thông báo");
    yield put(getNotificationsFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

function* markAsReadWorker(action: MarkAsReadAction): Generator {
  try {
    const { id } = action.payload;
    const response: any = yield call(
      [userNotificationsApi, userNotificationsApi.markAsRead],
      id
    );

    if (response.success && response.data) {
      yield put(markAsReadSuccess(response.data));
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

function* markAllAsReadWorker(_action: MarkAllAsReadAction): Generator {
  try {
    const response: any = yield call(
      [userNotificationsApi, userNotificationsApi.markAllAsRead]
    );

    if (response.success) {
      yield put(markAllAsReadSuccess());
      // yield put(addToast({ type: "success", message: "Đã đánh dấu tất cả là đã đọc" }));
    } else {
      const errorMessage = "Không thể đánh dấu tất cả là đã đọc";
      yield put(markAllAsReadFailure(errorMessage));
      yield put(addToast({ type: "error", message: errorMessage }));
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Không thể đánh dấu tất cả là đã đọc");
    yield put(markAllAsReadFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

function* deleteNotificationWorker(action: DeleteNotificationAction): Generator {
  try {
    const { id } = action.payload;
    const response: any = yield call(
      [userNotificationsApi, userNotificationsApi.deleteNotification],
      id
    );

    if (response.success) {
      yield put(deleteNotificationSuccess({ id }));
      yield put(addToast({ type: "success", message: "Đã xóa thông báo" }));
    } else {
      const errorMessage = "Không thể xóa thông báo";
      yield put(deleteNotificationFailure(errorMessage));
      yield put(addToast({ type: "error", message: errorMessage }));
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Không thể xóa thông báo");
    yield put(deleteNotificationFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

// Root watcher for Notification feature
export function* notificationSaga() {
  yield takeEvery("notification/getNotificationsStart", getNotificationsWorker);
  yield takeEvery("notification/markAsReadStart", markAsReadWorker);
  yield takeEvery("notification/markAllAsReadStart", markAllAsReadWorker);
  yield takeEvery("notification/deleteNotificationStart", deleteNotificationWorker);
}

