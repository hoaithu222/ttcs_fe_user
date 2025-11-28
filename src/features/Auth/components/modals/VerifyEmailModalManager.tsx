import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store";
import {
  closeVerifyEmailFlow,
  submitVerifyEmailOtp,
  resendVerifyEmailOtp,
} from "@/features/Auth/components/slice/auth.slice";
import { selectVerifyEmailFlow } from "@/features/Auth/components/slice/auth.selector";
import VerifyEmailOtpModal from "./VerifyEmailOtpModal";

const VerifyEmailModalManager = () => {
  const dispatch = useAppDispatch();
  const flow = useAppSelector(selectVerifyEmailFlow);

  const handleSubmit = useCallback(
    (otp: string) => {
      dispatch(submitVerifyEmailOtp({ token: otp }));
    },
    [dispatch]
  );

  const handleResend = useCallback(() => {
    if (!flow.email) return;
    dispatch(resendVerifyEmailOtp({ email: flow.email }));
  }, [dispatch, flow.email]);

  return (
    <VerifyEmailOtpModal
      open={flow.open}
      email={flow.email}
      submitting={flow.submitting}
      resending={flow.resending}
      onClose={() => dispatch(closeVerifyEmailFlow())}
      onSubmit={handleSubmit}
      onResend={handleResend}
    />
  );
};

export default VerifyEmailModalManager;


