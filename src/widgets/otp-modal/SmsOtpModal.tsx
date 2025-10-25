import React, { useCallback, useEffect, useRef, useState } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import clsx from "clsx";
import { Controller, useForm } from "react-hook-form";

import { useAppDispatch, useAppSelector } from "@/app/store";
// import { userLoginSelector } from "@/app/store/slices/auth/selectors";
// import {
//   ShowWarningEnum,
//   clearErrorMessage,
//   closeOtpModal,
//   sendOtpRequest,
//   submitOtp,
// } from "@/app/store/slices/otp";
// import {
//   otpActionTypeSelector,
//   otpCancelOtpActionTypeSelector,
//   otpErrorSelector,
//   otpLockedSelector,
//   otpPhoneSelector,
//   otpRequestDataSelector,
//   otpShowWarningTypeSelector,
//   otpVerifyingSelector,
// } from "@/app/store/slices/otp/selectors";
// import { otpStatusOtpSelector } from "@/app/store/slices/otp/selectors";
import Button from "@/foundation/components/buttons/Button";
import Icon from "@/foundation/components/icons/Icon";
import IconCircleWrapper from "@/foundation/components/icons/IconCircleWrapper";
import { useNSTranslate } from "@/shared/hooks/language";
import { maskPhone } from "@/shared/utils/string.utils";

import PinInput, { PinInputRef } from "./PinInput";
// import WarningOtp from "./WarningOtp";
// import { useTempBlock } from "./hooks/use-temp-block";

// Local constants and functions
// const userLoginSelector = (state: any) => state.auth?.user;
const ShowWarningEnum = { WARNING: "WARNING", TRUSTED_DEVICE: "TRUSTED_DEVICE" } as const;
const clearErrorMessage = () => ({ type: "CLEAR_ERROR" });
const closeOtpModal = () => ({ type: "CLOSE_OTP_MODAL" });
const sendOtpRequest = (data: any) => ({ type: "SEND_OTP_REQUEST", payload: data });
const submitOtp = (data: any) => ({ type: "SUBMIT_OTP", payload: data });
const WarningOtp = (_props: any) => null;
const useTempBlock = () => ({ isBlocked: false, remainingMs: 0, reason: "" });

// Local selectors
const otpActionTypeSelector = (state: any) => state.otp?.actionType;
const otpCancelOtpActionTypeSelector = (state: any) => state.otp?.cancelActionType;
const otpErrorSelector = (state: any) => state.otp?.error;
const otpLockedSelector = (state: any) => state.otp?.locked;
const otpPhoneSelector = (state: any) => state.otp?.phone;
const otpRequestDataSelector = (state: any) => state.otp?.requestData;
const otpShowWarningTypeSelector = (state: any) => state.otp?.showWarningType;
const otpVerifyingSelector = (state: any) => state.otp?.verifying;
const otpStatusOtpSelector = (state: any) => state.otp?.status;

interface SmsOtpModalProps {
  visible: boolean;
}
const DEFAULT_TIMER = 60; // sd LONG
const SHORT_TIMER = 30;

const SmsOtpModal: React.FC<SmsOtpModalProps> = ({ visible }) => {
  const dispatch = useAppDispatch();
  const tOtp = useNSTranslate("otp");
  const tValidation = useNSTranslate("validation");
  const tCommon = useNSTranslate("common");

  // Redux selectors
  const phone = useAppSelector(otpPhoneSelector);
  const loading = useAppSelector(otpVerifyingSelector);
  const error = useAppSelector(otpErrorSelector);
  const locked = useAppSelector(otpLockedSelector);
  const actionType = useAppSelector(otpActionTypeSelector);
  const cancelType = useAppSelector(otpCancelOtpActionTypeSelector);
  const requestData = useAppSelector(otpRequestDataSelector);
  const showWarningType = useAppSelector(otpShowWarningTypeSelector);
  // const userId = useAppSelector(userLoginSelector);
  const statusOtp = useAppSelector(otpStatusOtpSelector);

  // Client-side block state
  const { isBlocked, remainingMs, reason } = useTempBlock();

  // Resend countdown
  const initialTimer =
    showWarningType === ShowWarningEnum.TRUSTED_DEVICE ? SHORT_TIMER : DEFAULT_TIMER;
  const [resendTimer, setResendTimer] = useState(initialTimer);

  // Format remaining block time
  const blockSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.ceil(blockSeconds / 60);

  // React Hook Form
  const {
    handleSubmit,
    control,
    getValues,
    reset,
    formState: { isValid },
  } = useForm<{ otp: string }>({ defaultValues: { otp: "" } });
  const pinRef = useRef<PinInputRef>(null);

  // Handlers
  const handleClose = useCallback(() => {
    if (cancelType) dispatch({ type: cancelType as string, payload: requestData });
    dispatch(closeOtpModal());
  }, [cancelType, dispatch, requestData]);

  const onResend = useCallback(() => {
    dispatch(sendOtpRequest({}));
    setResendTimer(initialTimer);
  }, [dispatch, initialTimer]);

  const onVerify = useCallback(() => {
    const otp = getValues("otp");
    if (actionType) dispatch(submitOtp({ otp }));
  }, [actionType, dispatch, getValues]);

  // Format resend timer
  useEffect(() => {
    if (visible) {
      setResendTimer(initialTimer);
      reset();
    }
  }, [visible, initialTimer, reset]);

  useEffect(() => {
    if (resendTimer > 0 && !isBlocked) {
      const timeout = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(timeout);
    }
  }, [resendTimer, isBlocked]);

  // Reset form on error
  useEffect(() => {
    if (error) {
      reset();
      pinRef.current?.focus(0);
    }
  }, [error, reset]);

  // Keyboard events
  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && isValid && !isBlocked) onVerify();
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visible, isValid, isBlocked, onVerify, handleClose]);

  // Auto send OTP on open
  useEffect(() => {
    if (visible) dispatch(sendOtpRequest({}));
  }, [visible, dispatch]);

  // Render
  return (
    <Dialog.Root open={visible} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-base-black/50 fixed inset-0 z-[90] backdrop-blur-sm transition-opacity" />
        <Dialog.Content
          className={clsx(
            "shadow-1 fixed left-1/2 top-1/2 z-[100] max-h-[396px] w-full max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-neutral-3 bg-background-popup p-6",
            Boolean(showWarningType) && "max-h-[600px]"
          )}
        >
          <div className="flex justify-between items-start mb-4">
            <Dialog.Title className="text-title-20-bold text-neutral-9">
              <IconCircleWrapper>
                <Icon name="SmartOtp" size="base" className="text-neutral-9" />
              </IconCircleWrapper>
            </Dialog.Title>
            <Dialog.Close asChild>
              <Icon name="CloseOutlined" className="text-neutral-6" />
            </Dialog.Close>
          </div>

          {Boolean(showWarningType) && <WarningOtp type={showWarningType as string} typeOtp="O" />}
          <span className="text-title-20-bold text-neutral-7">{tOtp("title")}</span>
          <p className="mb-6 text-body-14 text-neutral-7">
            {tOtp("description", { phone: maskPhone(String(phone ?? "")) })}
          </p>

          <Controller
            name="otp"
            control={control}
            rules={{
              required: tValidation("otp.required"),
              minLength: { value: 6, message: tValidation("otp.minLength") },
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

          {/* Resend */}
          <div className="flex justify-center mb-6 text-center text-body-14 text-neutral-9">
            {resendTimer > 0 || isBlocked ? (
              <Button variant="text" className="cursor-default hover:no-underline">
                {isBlocked
                  ? `${String(tOtp("lockingTimer", { minutes: minutes }))}`
                  : String(tOtp("resendTimer", { resendTimer }))}
              </Button>
            ) : (
              <Button variant="text" onClick={onResend} disabled={loading}>
                {tOtp("resend")}
              </Button>
            )}
          </div>

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
            <Dialog.Description>OTP modal</Dialog.Description>
          </VisuallyHidden>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default React.memo(SmsOtpModal);
