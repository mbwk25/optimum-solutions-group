interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

// Safe minimal use-toast without hooks
export function useToast() {
  return {
    toasts: [],
    toast: (options?: ToastOptions) => {},
    dismiss: () => {}
  };
}

export const toast = (options?: ToastOptions) => {};