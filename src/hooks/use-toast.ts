// Safe minimal use-toast without hooks
export function useToast() {
  return {
    toasts: [],
    toast: (options?: any) => {},
    dismiss: () => {}
  };
}

export const toast = (options?: any) => {};