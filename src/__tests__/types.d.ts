declare module 'jest-axe' {
  export function axe(element: any): Promise<any>;
  export const toHaveNoViolations: any;
}