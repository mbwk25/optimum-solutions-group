interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

export function useToast() {
  return {
    toasts: [],
    toast: (_options?: ToastOptions) => {},
    dismiss: () => {}
  };
}

export const toast = (_options?: ToastOptions) => {};