import {
  ManagerOptions,
  SocketOptions as ClientSocketOptions,
  io,
  Socket,
} from "socket.io-client";

import {
  SOCKET_AUTO_CONNECT,
  SOCKET_BASE_URL,
  SOCKET_DEBUG,
  SOCKET_PATH,
  SOCKET_RECONNECT_ATTEMPTS,
  SOCKET_RECONNECT_DELAY,
} from "@/app/config/env.config";
import { tokenStorage } from "@/core/base/http-client";

import { SocketNamespace, SOCKET_NAMESPACES } from "./constants";

type AuthPayload = Record<string, unknown> | undefined;

export interface CreateSocketOptions
  extends Omit<Partial<ManagerOptions & ClientSocketOptions>, "auth"> {
  namespace?: SocketNamespace | string;
  auth?:
    | Record<string, unknown>
    | (() => Record<string, unknown> | undefined);
  debug?: boolean;
  debugLabel?: string;
}

const trimTrailingSlash = (url: string) =>
  url.endsWith("/") ? url.slice(0, -1) : url;

const normalizeNamespace = (namespace: string) =>
  namespace.startsWith("/") ? namespace : `/${namespace}`;

const defaultAuthProvider = (): AuthPayload => {
  const token = tokenStorage.getAccessToken();
  return token ? { token } : undefined;
};

const resolveAuthPayload = (
  auth?:
    | Record<string, unknown>
    | (() => Record<string, unknown> | undefined)
): AuthPayload => {
  if (!auth) {
    return undefined;
  }
  if (typeof auth === "function") {
    return auth() ?? undefined;
  }
  return auth;
};

const attachDebugListeners = (socket: Socket, label: string) => {
  socket.on("connect", () => {
    console.log(`[socket][${label}] connected ${socket.id}`);
  });
  socket.on("disconnect", (reason) => {
    console.log(`[socket][${label}] disconnected (${reason})`);
  });
  socket.io.on("reconnect_attempt", (attempt) => {
    console.log(`[socket][${label}] reconnect attempt #${attempt}`);
  });
  socket.io.on("reconnect", (attempt) => {
    console.log(`[socket][${label}] reconnected after ${attempt} tries`);
  });
  socket.io.on("reconnect_error", (error) => {
    console.error(`[socket][${label}] reconnect error`, error);
  });
  socket.on("connect_error", (error) => {
    console.error(`[socket][${label}] connect error`, error);
  });
  socket.on("error", (error) => {
    console.error(`[socket][${label}] error`, error);
  });
};

export const createNamespaceSocket = (
  options: CreateSocketOptions = {}
): Socket => {
  if (!SOCKET_BASE_URL) {
    throw new Error("Missing SOCKET_BASE_URL configuration");
  }

  const {
    namespace = SOCKET_NAMESPACES.ROOT,
    debug,
    debugLabel,
    auth,
    ...rest
  } = options;

  const baseUrl = trimTrailingSlash(SOCKET_BASE_URL);
  const namespacePath = normalizeNamespace(namespace);
  const endpoint = `${baseUrl}${namespacePath}`;
  const authPayload = resolveAuthPayload(auth) ?? defaultAuthProvider();

  const socketOptions: Partial<ManagerOptions & ClientSocketOptions> = {
    path: SOCKET_PATH,
    transports: ["websocket"],
    withCredentials: true,
    autoConnect: SOCKET_AUTO_CONNECT,
    reconnectionAttempts: SOCKET_RECONNECT_ATTEMPTS,
    reconnectionDelay: SOCKET_RECONNECT_DELAY,
    ...rest,
  };

  socketOptions.auth = authPayload;
  if (rest.transports) {
    socketOptions.transports = rest.transports;
  }
  if (typeof rest.autoConnect === "boolean") {
    socketOptions.autoConnect = rest.autoConnect;
  }
  if (typeof rest.reconnectionAttempts === "number") {
    socketOptions.reconnectionAttempts = rest.reconnectionAttempts;
  }
  if (typeof rest.reconnectionDelay === "number") {
    socketOptions.reconnectionDelay = rest.reconnectionDelay;
  }

  const socket = io(endpoint, socketOptions);

  const debugEnabled = debug ?? SOCKET_DEBUG;
  if (debugEnabled) {
    attachDebugListeners(socket, debugLabel ?? namespacePath);
  }

  return socket;
};

export type SocketConnectionStatus = "idle" | "connecting" | "connected";

export class SocketNamespaceClient {
  private socket?: Socket;
  private status: SocketConnectionStatus = "idle";

  constructor(private readonly options: CreateSocketOptions) {
    if (!options.namespace) {
      this.options.namespace = SOCKET_NAMESPACES.ROOT;
    }
    if (typeof this.options.autoConnect === "undefined") {
      this.options.autoConnect = false;
    }
  }

  private ensureSocket(force = false): Socket {
    if (!this.socket || force) {
      if (this.socket) {
        this.socket.removeAllListeners();
        this.socket.disconnect();
      }
      this.status = "connecting";
      this.socket = createNamespaceSocket(this.options);
      if (this.options.autoConnect) {
        this.socket.connect();
      }
      this.status = this.socket.connected ? "connected" : "connecting";
    }
    return this.socket;
  }

  connect(force = false): Socket {
    const socket = this.ensureSocket(force);
    if (!socket.connected && socket.disconnected) {
      this.status = "connecting";
      socket.connect();
    }
    socket.once("connect", () => {
      this.status = "connected";
    });
    socket.once("connect_error", () => {
      this.status = "idle";
    });
    return socket;
  }

  get instance(): Socket {
    return this.ensureSocket();
  }

  get connectionStatus(): SocketConnectionStatus {
    if (!this.socket) {
      return "idle";
    }
    if (this.socket.connected) {
      return "connected";
    }
    if (this.socket.active) {
      return "connecting";
    }
    return this.status;
  }

  disconnect(clearInstance = false): void {
    if (!this.socket) return;
    this.socket.disconnect();
    if (clearInstance) {
      this.socket.removeAllListeners();
      this.socket = undefined;
      this.status = "idle";
    }
  }

  refreshAuth(auth?: Record<string, unknown>): void {
    if (!this.socket) return;
    this.socket.auth = auth ?? defaultAuthProvider();
    if (this.socket.connected) {
      this.socket.disconnect().connect();
    }
  }

  emit<T>(event: string, payload?: T): void {
    this.ensureSocket().emit(event, payload);
  }

  on<T>(event: string, listener: (payload: T) => void): () => void {
    const socket = this.ensureSocket();
    socket.on(event, listener as any);
    return () => socket.off(event, listener as any);
  }

  once<T>(event: string, listener: (payload: T) => void): void {
    this.ensureSocket().once(event, listener as any);
  }
}


