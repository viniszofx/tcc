"use client";

import { CheckCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

export function SettingsToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleSettingsSaved = (event: CustomEvent) => {
      const newToast: ToastMessage = {
        id: Date.now().toString(),
        message: event.detail.message,
        type: "success",
      };

      setToasts((prev) => [...prev, newToast]);

      // Remove toast after 3 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== newToast.id));
      }, 3000);
    };

    window.addEventListener(
      "settings-saved",
      handleSettingsSaved as EventListener
    );

    return () => {
      window.removeEventListener(
        "settings-saved",
        handleSettingsSaved as EventListener
      );
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg animate-in slide-in-from-right duration-300"
        >
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-800 font-medium">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-auto text-green-600 hover:text-green-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
