export interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
}

export interface ToastState {
  messages: ToastMessage[];
}

export const initialState: ToastState = {
  messages: [],
};
