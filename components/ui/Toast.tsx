"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import styles from "./Toast.module.css";

export type ToastTone = "success" | "danger" | "neutral";

type ToastState = {
  message: string;
  tone: ToastTone;
  key: number;
};

type ToastContextValue = {
  showToast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 2600;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, tone: ToastTone = "neutral") => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ message, tone, key: Date.now() });
    timer.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast ? (
        <div key={toast.key} role="status" className={`${styles.toast} ${styles[toast.tone]}`}>
          {toast.message}
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
