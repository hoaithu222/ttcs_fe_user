import React, { createContext, useContext, useCallback, useRef, ReactNode } from "react";

interface SocketRefreshContextValue {
  subscribePaymentRefresh: (orderId: string, callback: () => void) => () => void;
  subscribeDepositRefresh: (callback: () => void) => () => void;
  triggerPaymentRefresh: (orderId: string) => void;
  triggerDepositRefresh: () => void;
}

const SocketRefreshContext = createContext<SocketRefreshContextValue | undefined>(undefined);

export const useSocketRefresh = () => {
  const context = useContext(SocketRefreshContext);
  if (!context) {
    throw new Error("useSocketRefresh must be used within SocketRefreshProvider");
  }
  return context;
};

export const SocketRefreshProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Map orderId -> callbacks
  const paymentCallbacksRef = useRef<Map<string, Set<() => void>>>(new Map());
  const depositCallbacksRef = useRef<Set<() => void>>(new Set());

  const subscribePaymentRefresh = useCallback((orderId: string, callback: () => void) => {
    if (!paymentCallbacksRef.current.has(orderId)) {
      paymentCallbacksRef.current.set(orderId, new Set());
    }
    paymentCallbacksRef.current.get(orderId)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = paymentCallbacksRef.current.get(orderId);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          paymentCallbacksRef.current.delete(orderId);
        }
      }
    };
  }, []);

  const subscribeDepositRefresh = useCallback((callback: () => void) => {
    depositCallbacksRef.current.add(callback);

    // Return unsubscribe function
    return () => {
      depositCallbacksRef.current.delete(callback);
    };
  }, []);

  const triggerPaymentRefresh = useCallback((orderId: string) => {
    const callbacks = paymentCallbacksRef.current.get(orderId);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback();
        } catch (error) {
          console.error("[SocketRefresh] Error in payment refresh callback:", error);
        }
      });
    }
  }, []);

  const triggerDepositRefresh = useCallback(() => {
    depositCallbacksRef.current.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error("[SocketRefresh] Error in deposit refresh callback:", error);
      }
    });
  }, []);

  return (
    <SocketRefreshContext.Provider
      value={{
        subscribePaymentRefresh,
        subscribeDepositRefresh,
        triggerPaymentRefresh,
        triggerDepositRefresh,
      }}
    >
      {children}
    </SocketRefreshContext.Provider>
  );
};


