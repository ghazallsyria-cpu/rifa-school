"use client";

import { useState, createContext, useContext, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

const ToastContext = createContext<{ toast: (msg: string, type?: Toast["type"]) => void }>({ toast: () => {} });

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const icons = { success: CheckCircle, error: AlertCircle, info: Info };
  const colors = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  return (
    <div className="fixed bottom-4 left-4 z-[100] space-y-2">
      {toasts.map((t) => {
        const Icon = icons[t.type];
        return (
          <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm animate-slide-up ${colors[t.type]}`}>
            <Icon size={18} className="flex-shrink-0" />
            <span className="text-sm font-medium flex-1">{t.message}</span>
            <button onClick={() => remove(t.id)} className="opacity-60 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function useToast() {
  const { toast } = useContext(ToastContext);
  return toast;
}

export function toast(message: string, type: Toast["type"] = "info") {
  // Simple toast - attach to DOM
  const event = new CustomEvent("show-toast", { detail: { message, type } });
  window.dispatchEvent(event);
}
