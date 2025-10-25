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
import { useNSTranslate } from "@/shared/hooks/language";

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
}

const SmartOtpModal: React.FC<SmartOtpModalProps> = ({ visible }) => {
  const dispatch = useAppDispatch();
  const tOtp = useNSTranslate("otp");
  const tValidation = useNSTranslate("validation");
  const tCommon = useNSTranslate("common");

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
  }, [cancelActionType, dispatch, requestData]);

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
        <Dialog.Overlay className="bg-base-black/50 fixed inset-0 z-[90] backdrop-blur-sm transition-opacity" />
        <Dialog.Content
          className={clsx(
            "shadow-1 fixed left-1/2 top-1/2 z-[100] max-h-[600px] w-full max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-neutral-3 bg-background-popup p-6",
            Boolean(showWarningType) && "max-h-[700px]"
          )}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <Dialog.Title className="text-title-20-bold text-neutral-9">
              <IconCircleWrapper extraBorder>
                <Icon name="SmartOtp" size="base" className="text-neutral-9" />
              </IconCircleWrapper>
            </Dialog.Title>
            <Dialog.Close asChild>
              <Icon name="CloseOutlined" className="text-neutral-6" />
            </Dialog.Close>
          </div>
          {/* Warning section */}
          {showWarningType && <WarningOtp type={showWarningType} typeOtp="M" />}
          <span className="text-title-20-bold text-neutral-7">{tOtp("smartOtpTitle")}</span>
          <p className="mb-6 text-body-14 text-neutral-7">{tOtp("smartOtpDescription")}</p>
          {/* OTP input */}
          <Controller
            name="otp"
            control={control}
            rules={{
              required: tValidation("otp.required"),
              minLength: { value: 6, message: tValidation("otp.minLength") },
              maxLength: { value: 6, message: tValidation("otp.maxLength") },
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
          <div className="mt-2 h-4 text-center text-caption-12 text-red-5">{reason || error}</div>
          {isBlocked && (
            <div className="flex justify-center mb-6 text-center text-body-14 text-neutral-9">
              <Button variant="text" className="cursor-default hover:no-underline">
                {String(tOtp("lockingTimer", { minutes: minutes }))}
              </Button>
            </div>
          )}
          <div className="mb-6">
            <GuideSmartOtp />
          </div>
          {/* Action buttons */}
          <div className="flex gap-2 justify-between w-full">
            <Button variant="outlined" onClick={handleClose} fullWidth size="lg">
              {tCommon("cancel")}
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
                ? String(tOtp("verifying"))
                : isBlocked
                  ? `${String(tOtp("locking"))}`
                  : String(tCommon("confirm"))}
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
