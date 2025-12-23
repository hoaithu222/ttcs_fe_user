import React, { useEffect, useRef, useState } from "react";
import { Phone, Video, PhoneOff, PhoneCall, X } from "lucide-react";
import { CallService, IncomingCallData, CallStatus } from "@/shared/services/call.service";
import Modal from "@/foundation/components/modal/Modal";
import Button from "@/foundation/components/buttons/Button";

interface CallComponentProps {
  conversationId: string;
  channel?: "admin" | "shop" | "ai";
  callType?: "voice" | "video"; // Optional: if provided, auto-initiate call
  onCallEnd?: () => void;
}

export const CallComponent: React.FC<CallComponentProps> = ({
  conversationId,
  channel = "shop",
  callType: initialCallType,
  onCallEnd,
}) => {
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null);
  const [callType, setCallType] = useState<"voice" | "video">(initialCallType || "voice");
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const callServiceRef = useRef<CallService | null>(null);
  const callStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Initialize call service
    callServiceRef.current = new CallService({
      channel,
      onIncomingCall: (callData) => {
        setIncomingCall(callData);
        setCallType(callData.callType);
        setCurrentCallId(callData.callId);
        setCallStatus("ringing");
      },
      onCallStatusChange: (status) => {
        setCallStatus(status);
        if (status === "answered") {
          callStartTimeRef.current = Date.now();
        } else if (status === "ended" || status === "rejected") {
          // Cleanup and close after a short delay
          setTimeout(() => {
            onCallEnd?.();
          }, 1000);
        }
      },
      onRemoteStream: (stream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      },
      onCallIdReceived: (callId) => {
        // When we initiate a call, backend sends back the callId
        if (!currentCallId) {
          setCurrentCallId(callId);
        }
      },
      onError: (error: any) => {
        console.error("Call error:", error);

        // Don't show alert for cleanup errors
        if (error.message && !error.message.includes("cleanup")) {
          let errorMessage = "Đã xảy ra lỗi trong cuộc gọi";

          if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
            errorMessage = "Không tìm thấy thiết bị microphone/camera.";
          } else if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
            errorMessage = "Quyền truy cập bị từ chối. Vui lòng cấp quyền và thử lại.";
          } else if (error.message) {
            errorMessage = error.message;
          }

          alert(errorMessage);
        }

        setCallStatus("ended");
        setTimeout(() => {
          onCallEnd?.();
        }, 1000);
      },
    });

    // Auto-initiate call if callType is provided (only once when component mounts with callType)
    if (initialCallType && callStatus === "idle" && !incomingCall) {
      // Delay slightly to ensure service is ready
      const timer = setTimeout(() => {
        if (callServiceRef.current) {
          handleInitiateCall(initialCallType);
        }
      }, 100);

      return () => {
        clearTimeout(timer);
        callServiceRef.current?.disconnect();
      };
    }

    return () => {
      callServiceRef.current?.disconnect();
    };
  }, [channel, initialCallType]);

  // Setup local video when call is answered
  useEffect(() => {
    if (callStatus === "answered" && callServiceRef.current && localVideoRef.current) {
      const stream = callServiceRef.current.getLocalStream();
      if (stream) {
        localVideoRef.current.srcObject = stream;
      }
    }
  }, [callStatus]);

  const handleInitiateCall = async (type: "voice" | "video") => {
    if (!callServiceRef.current) {
      console.error("Call service not initialized");
      return;
    }

    try {
      setCallType(type);
      await callServiceRef.current.initiateCall(conversationId, type);
      // Note: currentCallId will be set by CallService, but we need to track it
      // For now, we'll rely on the service's internal state
      setCallStatus("ringing");
    } catch (error: any) {
      console.error("Failed to initiate call:", error);

      // Handle specific error types
      let errorMessage = "Không thể bắt đầu cuộc gọi";

      if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        errorMessage =
          type === "video"
            ? "Không tìm thấy camera hoặc microphone. Vui lòng kiểm tra thiết bị của bạn."
            : "Không tìm thấy microphone. Vui lòng kiểm tra thiết bị của bạn.";
      } else if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        errorMessage = "Bạn cần cấp quyền truy cập microphone/camera để thực hiện cuộc gọi.";
      } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        errorMessage = "Thiết bị đang được sử dụng bởi ứng dụng khác. Vui lòng thử lại.";
      } else if (
        error.name === "OverconstrainedError" ||
        error.name === "ConstraintNotSatisfiedError"
      ) {
        errorMessage = "Thiết bị không hỗ trợ yêu cầu của cuộc gọi.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Show user-friendly error
      alert(errorMessage);

      setCallStatus("ended");
      setTimeout(() => {
        onCallEnd?.();
      }, 1000);
    }
  };

  const handleAnswerCall = async () => {
    if (incomingCall) {
      try {
        await callServiceRef.current?.answerCall(incomingCall.callId, incomingCall.conversationId);
        setCurrentCallId(incomingCall.callId);
        setIncomingCall(null);
      } catch (error) {
        console.error("Failed to answer call:", error);
        setCallStatus("ended");
        setTimeout(() => {
          onCallEnd?.();
        }, 1000);
      }
    }
  };

  const handleRejectCall = () => {
    if (incomingCall) {
      callServiceRef.current?.rejectCall(incomingCall.callId, incomingCall.conversationId);
      setIncomingCall(null);
      setCallStatus("idle");
      onCallEnd?.();
    }
  };

  const handleCancelCall = () => {
    // Get callId from service if we don't have it yet
    const callId = currentCallId || callServiceRef.current?.getCurrentCallId();
    if (callId) {
      callServiceRef.current?.cancelCall(callId, conversationId);
      setCurrentCallId(null);
      setCallStatus("idle");
      onCallEnd?.();
    } else {
      // If no callId, just cleanup
      setCallStatus("idle");
      onCallEnd?.();
    }
  };

  const handleEndCall = () => {
    const duration = callStartTimeRef.current
      ? Math.floor((Date.now() - callStartTimeRef.current) / 1000)
      : undefined;

    // Get callId from service if we don't have it yet
    const callId = currentCallId || callServiceRef.current?.getCurrentCallId();
    if (callId) {
      callServiceRef.current?.endCall(callId, conversationId, duration);
    }
    setCallStatus("idle");
    setCurrentCallId(null);
    setIncomingCall(null);
    onCallEnd?.();
  };

  // Show incoming call modal
  if (incomingCall && callStatus === "ringing") {
    return (
      <Modal
        open={true}
        onOpenChange={(open) => {
          if (!open) {
            handleRejectCall();
          }
        }}
        size="sm"
        hideFooter
        contentClassName="!p-6"
      >
        <div className="flex flex-col items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-primary-5 to-primary-7 flex items-center justify-center">
              {incomingCall.initiator.avatar ? (
                <img
                  src={incomingCall.initiator.avatar}
                  alt={incomingCall.initiator.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-semibold text-white">
                  {incomingCall.initiator.name[0].toUpperCase()}
                </span>
              )}
            </div>
            {callType === "video" && (
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-7 rounded-full flex items-center justify-center border-2 border-white">
                <Video className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* Call Info */}
          <div className="text-center">
            <h3 className="text-xl font-semibold text-neutral-10 mb-1">
              {incomingCall.initiator.name}
            </h3>
            <p className="text-sm text-neutral-6">
              {callType === "video" ? "Cuộc gọi video đến" : "Cuộc gọi thoại đến"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 w-full">
            <Button
              onClick={handleRejectCall}
              variant="outline"
              size="lg"
              rounded="full"
              className="flex-1 bg-red-50 border-red-300 text-red-700 hover:bg-red-100"
              icon={<PhoneOff className="w-5 h-5" />}
            >
              Từ chối
            </Button>
            <Button
              onClick={handleAnswerCall}
              size="lg"
              rounded="full"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              icon={<PhoneCall className="w-5 h-5" />}
            >
              Trả lời
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  // Show active call UI
  if (callStatus === "answered") {
    return (
      <Modal
        open={true}
        onOpenChange={(open) => {
          if (!open) {
            handleEndCall();
          }
        }}
        size="lg"
        hideFooter
        contentClassName="!p-0 overflow-hidden"
        className="!max-w-4xl"
      >
        <div className="relative w-full h-[600px] bg-neutral-9 flex flex-col">
          {/* Remote video (main view) */}
          {callType === "video" && (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Fallback for voice call or no video */}
          {callType === "voice" && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-5 to-primary-7">
              <div className="text-center">
                <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-16 h-16 text-white" />
                </div>
                <p className="text-white text-lg font-medium">Đang gọi...</p>
              </div>
            </div>
          )}

          {/* Local video (small picture-in-picture) */}
          {callType === "video" && (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute top-4 right-4 w-32 h-24 rounded-lg object-cover border-2 border-white shadow-lg"
            />
          )}

          {/* Call controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-neutral-9/90 to-transparent">
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={handleEndCall}
                size="lg"
                rounded="full"
                variant="outline"
                className="bg-red-600 border-red-600 text-white hover:bg-red-700 hover:border-red-700"
                icon={<PhoneOff className="w-5 h-5" />}
              >
                Kết thúc
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  // Show ringing/calling UI (initiator waiting)
  if (callStatus === "ringing" && !incomingCall) {
    return (
      <Modal
        open={true}
        onOpenChange={(open) => {
          if (!open) {
            handleCancelCall();
          }
        }}
        size="sm"
        hideFooter
        contentClassName="!p-6"
      >
        <div className="flex flex-col items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-5 to-primary-7 flex items-center justify-center animate-pulse">
            {callType === "video" ? (
              <Video className="w-12 h-12 text-white" />
            ) : (
              <Phone className="w-12 h-12 text-white" />
            )}
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-neutral-10 mb-1">Đang gọi...</h3>
            <p className="text-sm text-neutral-6">
              {callType === "video" ? "Cuộc gọi video" : "Cuộc gọi thoại"}
            </p>
          </div>
          <Button
            onClick={handleCancelCall}
            variant="outline"
            size="lg"
            rounded="full"
            className="w-full bg-red-50 border-red-300 text-red-700 hover:bg-red-100"
            icon={<X className="w-5 h-5" />}
          >
            Hủy cuộc gọi
          </Button>
        </div>
      </Modal>
    );
  }

  // Don't render anything when idle (buttons are in ChatWindow header)
  return null;
};
