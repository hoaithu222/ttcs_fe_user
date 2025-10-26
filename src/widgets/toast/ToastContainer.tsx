import { useEffect } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/app/store";
import { selectToastMessages } from "@/app/store/slices/toast";
import { removeToast } from "@/app/store/slices/toast";
import { MAX_VISIBLE_TOAST, TOAST_DURATION } from "./toast.constants";
import { ToastMessage } from "@/app/store/slices/toast/types";

const ToastContainer = () => {
  const dispatch = useAppDispatch();
  const messages = useAppSelector(selectToastMessages);

  // Auto remove toast after duration
  useEffect(() => {
    messages.forEach((toast: ToastMessage) => {
      if (toast.duration !== 0) {
        const duration = toast.duration || TOAST_DURATION;
        const timer = setTimeout(() => {
          dispatch(removeToast(toast.id));
        }, duration);

        return () => clearTimeout(timer);
      }
    });
  }, [messages, dispatch]);

  const getToastStyles = (type: string) => {
    switch (type) {
      case "success":
        return "bg-success text-neutral-0 border-success";
      case "error":
        return "bg-error text-neutral-0 border-error";
      case "warning":
        return "bg-warning text-neutral-0 border-warning";
      case "info":
        return "bg-primary-6 text-neutral-0 border-primary-6";
      default:
        return "bg-neutral-7 text-neutral-0 border-neutral-7";
    }
  };

  const getToastIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5" />;
      case "error":
        return <XCircle className="w-5 h-5" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      case "info":
        return <Info className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {messages.slice(0, MAX_VISIBLE_TOAST).map((toast: ToastMessage) => (
        <div
          key={toast.id}
          className={`
            flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg border-l-4
            transform transition-all duration-300 ease-in-out
            animate-in slide-in-from-right-full
            ${getToastStyles(toast.type)}
          `}
        >
          <div className="flex-shrink-0">{getToastIcon(toast.type)}</div>
          <span className="flex-1 text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => dispatch(removeToast(toast.id))}
            className="flex-shrink-0 p-1 rounded transition-colors text-neutral-0 hover:text-neutral-2 hover:bg-neutral-8/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
