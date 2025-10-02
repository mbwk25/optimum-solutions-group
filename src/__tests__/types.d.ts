/*
* File_name: __tests__/types.d.ts
* File_path: src/__tests__/types.d.ts
* File_description: This file is used to declare the types for the jest-axe library.
* File_author: Optimum Solutions Group
* File_date: 2025-09-09
* File_version: 1.0.0
* File_status: Development
* File_last_modified: 2025-09-09
*/

declare module 'jest-axe' {
  export function axe(
    html?: Element | Element[] | Document | DocumentFragment | string,
    options?: import('axe-core').RunOptions
  ): Promise<import('axe-core').AxeResults>;  export const toHaveNoViolations: jest.ExpectExtendMap;
}

declare global {
  namespace jest {
    interface Matchers<R = void> {
      toHaveNoViolations(): R;
    }
  }
}

export {};