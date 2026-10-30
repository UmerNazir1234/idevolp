"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type ToastData = {
  id: number;
  message: string;
  variant: "success" | "error" | "info";
};

export function useToast() {
  const [toast, setToast] = useState<ToastData | null>(null);
  const nextId = useRef(0);

  const showToast = useCallback((message: string, variant: ToastData["variant"] = "success") => {
    nextId.current += 1;
    setToast({ id: nextId.current, message, variant });
  }, []);

  const dismissToast = useCallback((id?: number) => {
    setToast((current) => !id || current?.id === id ? null : current);
  }, []);

  return { toast, showToast, dismissToast };
}

export default function ToastNotification({
  toast,
  onDismiss,
}: {
  toast: ToastData | null;
  onDismiss: (id: number) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const dismissRef = useRef(onDismiss);
  const dismissTimer = useRef<number | null>(null);
  const exitTimer = useRef<number | null>(null);
  const animationFrame = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (dismissTimer.current !== null) window.clearTimeout(dismissTimer.current);
      if (exitTimer.current !== null) window.clearTimeout(exitTimer.current);
      if (animationFrame.current !== null) window.cancelAnimationFrame(animationFrame.current);
    };
  }, []);

  useEffect(() => {
    dismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (dismissTimer.current !== null) window.clearTimeout(dismissTimer.current);
    if (exitTimer.current !== null) window.clearTimeout(exitTimer.current);
    if (animationFrame.current !== null) window.cancelAnimationFrame(animationFrame.current);

    if (!toast) {
      setVisible(false);
      return;
    }

    setVisible(false);
    animationFrame.current = window.requestAnimationFrame(() => {
      setVisible(true);
      dismissTimer.current = window.setTimeout(() => {
        setVisible(false);
        exitTimer.current = window.setTimeout(() => {
          dismissRef.current(toast.id);
        }, 220);
      }, 3000);
    });

    return () => {
      if (dismissTimer.current !== null) window.clearTimeout(dismissTimer.current);
      if (exitTimer.current !== null) window.clearTimeout(exitTimer.current);
      if (animationFrame.current !== null) window.cancelAnimationFrame(animationFrame.current);
    };
  }, [toast?.id]);

  function close() {
    if (!toast) return;
    if (dismissTimer.current !== null) window.clearTimeout(dismissTimer.current);
    if (animationFrame.current !== null) window.cancelAnimationFrame(animationFrame.current);
    setVisible(false);
    if (exitTimer.current !== null) window.clearTimeout(exitTimer.current);
    exitTimer.current = window.setTimeout(() => {
      dismissRef.current(toast.id);
    }, 220);
  }

  if (!mounted || !toast) return null;

  const colorClass = toast.variant === "error"
    ? "bg-red-700"
    : toast.variant === "info"
      ? "bg-neutral-900"
      : "bg-green-700";

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[10000] flex justify-end p-4 sm:p-5">
      <div
        role={toast.variant === "error" ? "alert" : "status"}
        aria-live={toast.variant === "error" ? "assertive" : "polite"}
        className={`pointer-events-auto flex max-w-[calc(100vw-2rem)] items-center gap-4 rounded-lg ${colorClass} px-4 py-3 text-sm font-semibold text-white shadow-2xl transition-all duration-200 ease-out sm:max-w-md ${visible ? "translate-y-0 scale-100 opacity-100" : "-translate-y-2 scale-95 opacity-0"}`}
      >
        <span>{toast.message}</span>
        <button type="button" onClick={close} aria-label="Close notification" className="shrink-0 rounded px-1 text-lg leading-none hover:bg-white/15">×</button>
      </div>
    </div>,
    document.body,
  );
}
