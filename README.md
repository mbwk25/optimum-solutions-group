# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/191a8a44-4ca1-4155-9cf6-8342ccbd4142

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/191a8a44-4ca1-4155-9cf6-8342ccbd4142) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/191a8a44-4ca1-4155-9cf6-8342ccbd4142) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Testing

This project uses Jest with React Testing Library for comprehensive testing. The testing setup is configured for long-term maintainability and follows best practices.

### Test Configuration

- **Jest**: JavaScript testing framework
- **ts-jest**: TypeScript support for Jest
- **@testing-library/react**: React component testing utilities
- **@testing-library/jest-dom**: Custom Jest matchers for DOM testing
- **jest-environment-jsdom**: DOM environment for testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Structure

- Tests are located in `__tests__` directories alongside the components they test
- Test files follow the naming convention: `*.test.tsx` or `*.spec.tsx`
- Global test setup is configured in `src/setupTests.ts`

### Configuration Files

- `jest.config.js`: Main Jest configuration
- `tsconfig.jest.json`: TypeScript configuration for Jest
- `src/setupTests.ts`: Global test setup and mocks

### Key Features

- **TypeScript Support**: Full TypeScript support with proper type checking
- **Path Aliases**: Support for `@/` path aliases matching your Vite configuration
- **Asset Mocking**: Static assets (images, fonts, etc.) are properly mocked
- **CSS Mocking**: CSS/SCSS files are mocked for testing
- **Global Mocks**: Common browser APIs (matchMedia, ResizeObserver, etc.) are mocked
- **Coverage Reporting**: Comprehensive coverage reporting with exclusions for setup files

### Writing Tests

Example test structure:

```tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '../button';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Best Practices

1. **Use semantic queries**: Prefer `getByRole`, `getByLabelText`, etc. over `getByTestId`
2. **Test user behavior**: Focus on testing what users see and do, not implementation details
3. **Keep tests simple**: Each test should verify one specific behavior
4. **Use descriptive test names**: Test names should clearly describe what is being tested
5. **Mock external dependencies**: Use Jest mocks for external APIs and services

### Troubleshooting

If you encounter issues:

1. **Multiple config files**: Ensure only `jest.config.js` exists (not `jest.config.cjs`)
2. **Module resolution**: Check that path aliases in `tsconfig.jest.json` match your main `tsconfig.json`
3. **Type errors**: Verify that `@types/jest` and `@types/testing-library__jest-dom` are installed
4. **Coverage issues**: Check that files are not excluded in `collectCoverageFrom` configuration
