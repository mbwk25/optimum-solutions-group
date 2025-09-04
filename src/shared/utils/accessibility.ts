// Simple accessibility utilities

export interface AccessibilityOptions {
  checkFocus?: boolean;
  checkContrast?: boolean;
  checkLabels?: boolean;
}

export interface AccessibilityIssue {
  type: 'error' | 'warning';
  message: string;
  element?: HTMLElement;
}

export const checkAccessibility = (
  element: HTMLElement,
  options: AccessibilityOptions = {}
): AccessibilityIssue[] => {
  const issues: AccessibilityIssue[] = [];
  
  if (options.checkLabels) {
    // Check for missing labels
    const inputs = element.querySelectorAll('input, select, textarea');
    inputs.forEach((input) => {
      const htmlInput = input as HTMLInputElement;
      if (!htmlInput.labels?.length && !htmlInput.getAttribute('aria-label')) {
        issues.push({
          type: 'error',
          message: 'Form control missing label',
          element: htmlInput
        });
      }
    });
  }
  
  return issues;
};

export const announceToScreenReader = (message: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};