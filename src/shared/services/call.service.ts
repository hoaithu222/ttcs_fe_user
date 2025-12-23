import { socketClients, SOCKET_EVENTS } from "@/core/socket";
import Peer from "simple-peer";

export interface CallServiceOptions {
  channel?: "admin" | "shop" | "ai";
  onIncomingCall?: (callData: IncomingCallData) => void;
  onCallStatusChange?: (status: CallStatus) => void;
  onRemoteStream?: (stream: MediaStream) => void;
  onError?: (error: Error) => void;
  onCallIdReceived?: (callId: string) => void; // Callback when callId is received from backend
}

export interface IncomingCallData {
  callId: string;
  conversationId: string;
  callType: "voice" | "video";
  initiator: {
    userId: string;
    name: string;
    avatar?: string;
  };
}

export type CallStatus = "idle" | "ringing" | "answered" | "rejected" | "ended";

export class CallService {
  private socket: any = null;
  private peer: InstanceType<typeof Peer> | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private currentCallId: string | null = null;
  private currentCallType: "voice" | "video" | null = null;
  private incomingCallType: "voice" | "video" | null = null; // Store incoming call type
  private options: CallServiceOptions = {};
  private channel: "admin" | "shop" | "ai" = "shop";

  constructor(options: CallServiceOptions = {}) {
    this.options = options;
    this.channel = options.channel || "shop";
    this.connect();
  }

  private connect(): void {
    let socketClient;
    switch (this.channel) {
      case "admin":
        socketClient = socketClients.adminChat;
        break;
      case "shop":
        socketClient = socketClients.shopChat;
        break;
      case "ai":
        socketClient = socketClients.aiChat;
        break;
      default:
        socketClient = socketClients.shopChat;
    }

    if (!socketClient) {
      this.options.onError?.(new Error(`Socket client not available for channel: ${this.channel}`));
      return;
    }

    this.socket = socketClient.connect();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Handle incoming call
    this.socket.on(SOCKET_EVENTS.CALL_INCOMING, (payload: any) => {
      this.incomingCallType = payload.callType;
      this.currentCallId = payload.callId;
      this.options.onIncomingCall?.({
        callId: payload.callId,
        conversationId: payload.conversationId,
        callType: payload.callType,
        initiator: payload.initiator,
      });
      this.options.onCallStatusChange?.("ringing");
    });

    // Handle call ringing (when we initiate a call, backend sends this back)
    this.socket.on(SOCKET_EVENTS.CALL_RINGING, (payload: any) => {
      if (payload?.callId && !this.currentCallId) {
        // Store callId from backend response
        this.currentCallId = payload.callId;
        this.options.onCallIdReceived?.(payload.callId);
      }
    });

    // Handle call status updates
    this.socket.on(SOCKET_EVENTS.CALL_STATUS, (payload: any) => {
      if (payload?.callId && !this.currentCallId) {
        this.currentCallId = payload.callId;
        this.options.onCallIdReceived?.(payload.callId);
      }
      if (payload.status === "answered") {
        // Create peer connection as initiator when call is answered
        if (!this.peer && this.localStream) {
          this.createPeerConnection(payload.conversationId || "", true);
        }
        this.options.onCallStatusChange?.("answered");
      } else if (payload.status === "rejected" || payload.status === "cancelled") {
        this.options.onCallStatusChange?.("ended");
        this.cleanup();
      } else if (payload.status === "ended") {
        this.options.onCallStatusChange?.("ended");
        this.cleanup();
      }
    });

    // Handle WebRTC offer
    this.socket.on(SOCKET_EVENTS.CALL_OFFER, async (payload: any) => {
      if (this.currentCallId === payload.callId) {
        await this.handleOffer(payload.offer);
      }
    });

    // Handle WebRTC answer
    this.socket.on(SOCKET_EVENTS.CALL_ANSWER_SDP, async (payload: any) => {
      if (this.peer && this.currentCallId === payload.callId) {
        this.peer.signal(payload.answer);
      }
    });

    // Handle ICE candidates
    this.socket.on(SOCKET_EVENTS.CALL_ICE_CANDIDATE, (payload: any) => {
      if (this.peer && this.currentCallId === payload.callId && payload.candidate) {
        this.peer.signal(payload.candidate);
      }
    });
  }

  /**
   * Check if media devices are available
   */
  private async checkMediaDevices(callType: "voice" | "video"): Promise<{ audio: boolean; video: boolean }> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("MediaDevices API không được hỗ trợ trong trình duyệt này");
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    const hasAudio = devices.some((device) => device.kind === "audioinput");
    const hasVideo = devices.some((device) => device.kind === "videoinput");

    if (!hasAudio) {
      throw new Error("Không tìm thấy microphone trên thiết bị của bạn");
    }

    if (callType === "video" && !hasVideo) {
      throw new Error("Không tìm thấy camera trên thiết bị của bạn");
    }

    return { audio: hasAudio, video: hasVideo };
  }

  /**
   * Initiate a call
   */
  async initiateCall(conversationId: string, callType: "voice" | "video"): Promise<void> {
    if (!this.socket) {
      throw new Error("Socket not connected");
    }

    // Check media device availability first
    await this.checkMediaDevices(callType);

    // Get user media
    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: callType === "video" ? {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        } : false,
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);

      // Generate call ID
      const callId = `call_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      this.currentCallId = callId;
      this.currentCallType = callType;

      // Emit call initiate
      this.socket.emit(SOCKET_EVENTS.CALL_INITIATE, {
        conversationId,
        callType,
      });

      // Wait for answer before creating peer connection
      // Peer will be created when receiver answers
    } catch (error: any) {
      this.options.onError?.(error);
      throw error;
    }
  }

  /**
   * Answer an incoming call
   */
  async answerCall(callId: string, conversationId: string): Promise<void> {
    if (!this.socket) {
      throw new Error("Socket not connected");
    }

    this.currentCallId = callId;

    // Get user media
    try {
      // Get call type from incoming call data (should be stored)
      const callType = this.incomingCallType || this.currentCallType || "voice";
      this.currentCallType = callType;
      
      // Check media device availability first
      await this.checkMediaDevices(callType);

      const constraints: MediaStreamConstraints = {
        audio: true,
        video: callType === "video" ? {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        } : false,
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);

      // Create peer connection (initiator: false)
      this.createPeerConnection(conversationId, false);

      // Emit answer
      this.socket.emit(SOCKET_EVENTS.CALL_ANSWER, {
        callId,
        conversationId,
      });

      this.options.onCallStatusChange?.("answered");
    } catch (error: any) {
      this.options.onError?.(error);
      throw error;
    }
  }

  /**
   * Reject a call
   */
  rejectCall(callId: string, conversationId: string, reason?: string): void {
    if (!this.socket) return;

    this.socket.emit(SOCKET_EVENTS.CALL_REJECT, {
      callId,
      conversationId,
      reason,
    });

    this.cleanup();
  }

  /**
   * End a call
   */
  endCall(callId: string, conversationId: string, duration?: number): void {
    if (!this.socket) return;

    this.socket.emit(SOCKET_EVENTS.CALL_END, {
      callId,
      conversationId,
      duration,
    });

    this.cleanup();
  }

  /**
   * Cancel a call (before answer)
   */
  cancelCall(callId: string, conversationId: string): void {
    if (!this.socket) return;

    this.socket.emit(SOCKET_EVENTS.CALL_CANCEL, {
      callId,
      conversationId,
    });

    this.cleanup();
  }

  /**
   * Create peer connection
   */
  private createPeerConnection(conversationId: string, initiator: boolean): void {
    if (!this.localStream) return;

    const peer = new Peer({
      initiator,
      trickle: false,
      stream: this.localStream,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      },
    });

    peer.on("signal", (data: any) => {
      if (!this.socket || !this.currentCallId) return;

      if (data.type === "offer") {
        this.socket.emit(SOCKET_EVENTS.CALL_OFFER, {
          callId: this.currentCallId,
          conversationId,
          offer: data,
        });
      } else if (data.type === "answer") {
        this.socket.emit(SOCKET_EVENTS.CALL_ANSWER_SDP, {
          callId: this.currentCallId,
          conversationId,
          answer: data,
        });
      }
    });

    peer.on("stream", (stream: MediaStream) => {
      this.remoteStream = stream;
      this.options.onRemoteStream?.(stream);
    });

    peer.on("error", (error: Error) => {
      this.options.onError?.(error);
    });

    peer.on("close", () => {
      this.cleanup();
    });

    this.peer = peer;
  }

  /**
   * Handle incoming offer
   */
  private async handleOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.localStream) return;

    // Create peer connection as receiver
    this.createPeerConnection("", false);

    if (this.peer) {
      this.peer.signal(offer);
    }
  }

  /**
   * Get local stream
   */
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  /**
   * Get remote stream
   */
  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  /**
   * Get current call ID
   */
  getCurrentCallId(): string | null {
    return this.currentCallId;
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }

    this.remoteStream = null;
    this.currentCallId = null;
    this.currentCallType = null;
    this.incomingCallType = null;
  }

  /**
   * Disconnect
   */
  disconnect(): void {
    this.cleanup();
    if (this.socket) {
      this.socket.off(SOCKET_EVENTS.CALL_INCOMING);
      this.socket.off(SOCKET_EVENTS.CALL_STATUS);
      this.socket.off(SOCKET_EVENTS.CALL_OFFER);
      this.socket.off(SOCKET_EVENTS.CALL_ANSWER_SDP);
      this.socket.off(SOCKET_EVENTS.CALL_ICE_CANDIDATE);
    }
  }
}

export const createCallService = (options: CallServiceOptions = {}): CallService => {
  return new CallService(options);
};
