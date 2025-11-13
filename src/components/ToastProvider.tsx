"use client";

import { ReactNode } from "react";

interface ToastProviderProps {
  children: ReactNode;
}

/**
 * ToastProvider is now deprecated - Sonner Toaster is used directly in layout.tsx
 * This component is kept for backward compatibility but does nothing
 */
export default function ToastProvider({ children }: ToastProviderProps) {
  return <>{children}</>;
}

