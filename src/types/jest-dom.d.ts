import '@testing-library/jest-dom';
import type { NormalizerFn } from '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveFocus(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toHaveValue(value?: string | string[] | number): R;
      toBeChecked(): R;
      toBePartiallyChecked(): R;
      toHaveFormValues(expectedValues: Record<string, unknown>): R;
      toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): R;
      toBeRequired(): R;
      toBeValid(): R;
      toBeInvalid(): R;
      toHaveAccessibleDescription(description?: string | RegExp): R;
      toHaveAccessibleName(name?: string | RegExp): R;
      toHaveDescription(description?: string | RegExp): R;
      toHaveTextContent(
         text: string | RegExp | (string | RegExp)[],
         options?: {
           normalizeWhitespace?: boolean;
           normalizer?: NormalizerFn;
         }
       ): R;
      toHaveStyle(css: string | Record<string, unknown>): R;
      toBeVisible(): R;
      toBeEmptyDOMElement(): R;
      toContainElement(element: HTMLElement | null): R;
      toHaveErrorMessage(text?: string | RegExp): R;
      toHaveRole(role: string, options?: { hidden?: boolean; name?: string | RegExp }): R;
    }
  }
}

export {};


