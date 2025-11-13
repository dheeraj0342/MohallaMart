import { toast as sonnerToast } from "sonner";

/**
 * Custom hook that wraps Sonner toast for backward compatibility
 * Use this hook to maintain the same API as before
 */
export const useToast = () => {
  return {
    success: (message: string, duration?: number) => {
      sonnerToast.success(message, { duration });
    },
    error: (message: string, duration?: number) => {
      sonnerToast.error(message, { duration });
    },
    warning: (message: string, duration?: number) => {
      sonnerToast.warning(message, { duration });
    },
    info: (message: string, duration?: number) => {
      sonnerToast.info(message, { duration });
    },
    // Direct access to sonner toast for advanced usage
    toast: sonnerToast,
  };
};

// Export toast directly for convenience
export { toast } from "sonner";

