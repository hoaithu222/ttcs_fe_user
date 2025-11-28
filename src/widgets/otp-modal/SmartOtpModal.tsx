import React, { useCallback, useEffect, useRef } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import clsx from "clsx";
import { Controller, useForm } from "react-hook-form";

import { useAppDispatch, useAppSelector } from "@/app/store";
// import { userLoginSelector } from "@/app/store/slices/auth/selectors";
// import { clearErrorMessage, closeOtpModal, submitOtp } from "@/app/store/slices/otp";
// import {
//   otpCancelOtpActionTypeSelector,
//   otpErrorSelector,
//   otpLockedSelector,
//   otpRequestDataSelector,
//   otpShowWarningTypeSelector,
//   otpStatusOtpSelector,
//   otpVerifyingSelector,
// } from "@/app/store/slices/otp/selectors";
import Button from "@/foundation/components/buttons/Button";
import Icon from "@/foundation/components/icons/Icon";
import IconCircleWrapper from "@/foundation/components/icons/IconCircleWrapper";
import { ShieldCheck, X } from "lucide-react";

import GuideSmartOtp from "./GuideSmartOtp";
import PinInput, { PinInputRef } from "./PinInput";
// import WarningOtp from "./WarningOtp";
// import { useTempBlock } from "./hooks/use-temp-block";

// Local constants and functions
// const userLoginSelector = (state: any) => state.auth?.user;
const clearErrorMessage = () => ({ type: "CLEAR_ERROR" });
const closeOtpModal = () => ({ type: "CLOSE_OTP_MODAL" });
const submitOtp = (data: any) => ({ type: "SUBMIT_OTP", payload: data });
const WarningOtp = (_props: any) => null;
const useTempBlock = () => ({ isBlocked: false, remainingMs: 0, reason: "" });

// Local selectors
const otpCancelOtpActionTypeSelector = (state: any) => state.otp?.cancelActionType;
const otpErrorSelector = (state: any) => state.otp?.error;
const otpLockedSelector = (state: any) => state.otp?.locked;
const otpRequestDataSelector = (state: any) => state.otp?.requestData;
const otpShowWarningTypeSelector = (state: any) => state.otp?.showWarningType;
const otpStatusOtpSelector = (state: any) => state.otp?.status;
const otpVerifyingSelector = (state: any) => state.otp?.verifying;

interface SmartOtpModalProps {
  visible: boolean;
  onClose?: () => void;
}

const SmartOtpModal: React.FC<SmartOtpModalProps> = ({ visible, onClose }) => {
  const dispatch = useAppDispatch();

  // Redux state selectors
  const loading = useAppSelector(otpVerifyingSelector);
  const error = useAppSelector(otpErrorSelector);
  const locked = useAppSelector(otpLockedSelector);
  const cancelActionType = useAppSelector(otpCancelOtpActionTypeSelector);
  const requestData = useAppSelector(otpRequestDataSelector);
  const showWarningType = useAppSelector(otpShowWarningTypeSelector);
  // const userId = useAppSelector(userLoginSelector);

  const statusOtp = useAppSelector(otpStatusOtpSelector);

  // Client-side block state
  const { isBlocked, remainingMs, reason } = useTempBlock();

  // Form setup
  const {
    handleSubmit,
    control,
    getValues,
    reset,
    formState: { isValid },
  } = useForm<{ otp: string }>({ defaultValues: { otp: "" } });
  const pinRef = useRef<PinInputRef>(null);

  // Countdown formatting
  const blockSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.ceil(blockSeconds / 60);

  // Close modal handler
  const handleClose = useCallback(() => {
    if (cancelActionType) {
      dispatch({ type: cancelActionType as string, payload: requestData });
    }
    dispatch(closeOtpModal());
    onClose?.();
  }, [cancelActionType, dispatch, onClose, requestData]);

  // Verify OTP handler
  const onVerify = useCallback(() => {
    const otp = getValues("otp");
    dispatch(submitOtp({ otp }));
  }, [getValues, dispatch]);

  // Reset form on open
  useEffect(() => {
    if (visible) reset();
  }, [visible, reset]);

  // Reset form and focus on error
  useEffect(() => {
    if (error) {
      reset();
      pinRef.current?.focus(0);
    }
  }, [error, reset]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && isValid && !isBlocked) {
        onVerify();
      } else if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visible, isValid, isBlocked, onVerify, handleClose]);

  return (
    <Dialog.Root open={visible} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-overlay fixed inset-0 z-[90] backdrop-blur-sm transition-opacity" />
        <Dialog.Content
          className={clsx(
            "shadow-1 fixed left-1/2 top-1/2 z-[100] max-h-[600px] w-full max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-neutral-3 bg-background-dialog text-neutral-9 p-6",
            Boolean(showWarningType) && "max-h-[700px]"
          )}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <Dialog.Title className="text-2xl font-bold text-neutral-9">
              <IconCircleWrapper extraBorder>
                <Icon icon={ShieldCheck} size="base" className="text-primary-7" />
              </IconCircleWrapper>
            </Dialog.Title>
            <Dialog.Close asChild>
              <Icon icon={X} className="text-neutral-6" />
            </Dialog.Close>
          </div>
          {/* Warning section */}
          {showWarningType && <WarningOtp type={showWarningType} typeOtp="M" />}
          <span className="text-2xl font-bold text-neutral-9">Xác thực Smart OTP</span>
          <p className="mb-6 text-sm text-neutral-6">Nhập mã OTP 6 số từ ứng dụng Smart OTP của bạn</p>
          {/* OTP input */}
          <Controller
            name="otp"
            control={control}
            rules={{
              required: "OTP là bắt buộc",
              minLength: { value: 6, message: "OTP phải có 6 ký tự" },
              maxLength: { value: 6, message: "OTP phải có 6 ký tự" },
            }}
            render={({ field }) => (
              <PinInput
                {...field}
                ref={pinRef}
                disabled={Boolean(locked || loading || isBlocked)}
                onChange={(val) => {
                  dispatch(clearErrorMessage());
                  field.onChange(val);
                }}
              />
            )}
          />
          <div className="mt-2 h-4 text-center text-xs text-error">{reason || error}</div>
          {isBlocked && (
            <div className="flex justify-center mb-6 text-center text-sm text-neutral-9">
              <Button variant="text" className="cursor-default hover:no-underline">
                Tài khoản bị khóa trong {minutes} phút
              </Button>
            </div>
          )}
          <div className="mb-6">
            <GuideSmartOtp />
          </div>
          {/* Action buttons */}
          <div className="flex gap-2 justify-between w-full">
            <Button variant="outlined" onClick={handleClose} fullWidth size="lg">
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit(onVerify)}
              disabled={Boolean(
                !isValid || locked || loading || isBlocked || statusOtp === "LOADING"
              )}
              fullWidth
              size="lg"
            >
              {loading
                ? "Đang xác minh..."
                : isBlocked
                  ? "Đang khóa..."
                  : "Xác nhận"}
            </Button>
          </div>
          <VisuallyHidden>
            <Dialog.Description>SmartOTP modal</Dialog.Description>
          </VisuallyHidden>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default React.memo(SmartOtpModal);
