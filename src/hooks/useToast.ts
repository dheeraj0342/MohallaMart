import { create } from "zustand";
import { Toast, ToastType } from "@/components/ui/Toast";

interface ToastStore {
  toasts: Toast[];
  showToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const toastStore = create<ToastStore>((set) => ({
  toasts: [],
  
  showToast: (message: string, type: ToastType = "info", duration?: number) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      id,
      message,
      type,
      duration,
    };
    set((state) => ({ toasts: [...state.toasts, newToast] }));
  },
  
  removeToast: (id: string) => {
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }));
  },
  
  success: (message: string, duration?: number) => {
    const store = toastStore.getState();
    store.showToast(message, "success", duration);
  },
  
  error: (message: string, duration?: number) => {
    const store = toastStore.getState();
    store.showToast(message, "error", duration);
  },
  
  warning: (message: string, duration?: number) => {
    const store = toastStore.getState();
    store.showToast(message, "warning", duration);
  },
  
  info: (message: string, duration?: number) => {
    const store = toastStore.getState();
    store.showToast(message, "info", duration);
  },
}));

export const useToast = toastStore;

