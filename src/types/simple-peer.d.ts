declare module 'simple-peer' {
  interface SignalData extends RTCSessionDescriptionInit {
    [key: string]: any;
  }

  interface PeerOptions {
    initiator?: boolean;
    trickle?: boolean;
    stream?: MediaStream;
    config?: {
      iceServers?: Array<{ urls: string | string[]; username?: string; credential?: string }>;
    };
    wrtc?: any;
    channelName?: string;
    channelConfig?: any;
    sdpTransform?: (sdp: string) => string;
    allowHalfTrickle?: boolean;
  }

  interface Instance {
    signal(data: string | SignalData): void;
    send(data: string | ArrayBuffer | ArrayBufferView): void;
    destroy(): void;
    on(event: 'signal', listener: (data: SignalData) => void): this;
    on(event: 'stream', listener: (stream: MediaStream) => void): this;
    on(event: 'error', listener: (error: Error) => void): this;
    on(event: 'close', listener: () => void): this;
    on(event: 'connect', listener: () => void): this;
    on(event: string, listener: (...args: any[]) => void): this;
    readonly destroyed: boolean;
    readonly connecting: boolean;
    readonly connected: boolean;
  }

  class Peer implements Instance {
    constructor(opts?: PeerOptions);

    signal(data: string | SignalData): void;
    send(data: string | ArrayBuffer | ArrayBufferView): void;
    destroy(): void;
    on(event: 'signal', listener: (data: SignalData) => void): this;
    on(event: 'stream', listener: (stream: MediaStream) => void): this;
    on(event: 'error', listener: (error: Error) => void): this;
    on(event: 'close', listener: () => void): this;
    on(event: 'connect', listener: () => void): this;
    on(event: string, listener: (...args: any[]) => void): this;
    readonly destroyed: boolean;
    readonly connecting: boolean;
    readonly connected: boolean;

    static readonly WEBRTC_SUPPORT: boolean;
  }

  export = Peer;
}

