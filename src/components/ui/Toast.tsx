"use client";

import { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const ToastIcon = ({ type }: { type: ToastType }) => {
  const iconClasses = "h-5 w-5";
  
  switch (type) {
    case "success":
      return <CheckCircle className={`${iconClasses} text-green-600`} />;
    case "error":
      return <AlertCircle className={`${iconClasses} text-red-600`} />;
    case "warning":
      return <AlertTriangle className={`${iconClasses} text-amber-600`} />;
    case "info":
      return <Info className={`${iconClasses} text-blue-600`} />;
    default:
      return <Info className={`${iconClasses} text-blue-600`} />;
  }
};

export default function Toast({ toast, onClose }: ToastProps) {
  const duration = toast.duration || 5000;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, duration, onClose]);

  const getBgColor = () => {
    switch (toast.type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-amber-50 border-amber-200";
      case "info":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const getTextColor = () => {
    switch (toast.type) {
      case "success":
        return "text-green-800";
      case "error":
        return "text-red-800";
      case "warning":
        return "text-amber-800";
      case "info":
        return "text-blue-800";
      default:
        return "text-blue-800";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className={`
        relative flex items-start gap-3 p-4 rounded-xl border-2 shadow-lg
        ${getBgColor()}
        max-w-md
      `}
    >
      <ToastIcon type={toast.type} />
      <div className="flex-1">
        <p className={`text-sm font-semibold ${getTextColor()}`}>
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className={`
          p-1 rounded-lg hover:bg-opacity-20 transition-colors
          ${getTextColor()} hover:bg-black/10
        `}
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
}

