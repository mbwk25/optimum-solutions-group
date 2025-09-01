# Optimum Solutions Group

🚀 A modern, performance-optimized React application with enterprise-grade monitoring and testing.

## 📊 Project Status

![Performance](https://img.shields.io/badge/Performance-95%2F100-brightgreen?logo=speedometer&style=flat-square) ![Accessibility](https://img.shields.io/badge/Accessibility-100%2F100-brightgreen?logo=universal-access&style=flat-square) ![Bundle Size](https://img.shields.io/badge/Bundle%20Size-250KB-yellow?logo=package&style=flat-square) ![Workflow](https://img.shields.io/badge/Workflow-passing-brightgreen?logo=github-actions&style=flat-square) [![Dashboard](https://img.shields.io/badge/Dashboard-Live-blue?logo=github&style=flat-square)](https://mbwk25.github.io/optimum-solutions-group)

> Badges are automatically updated based on the latest performance monitoring data.

## 📊 Performance Dashboard

**Live Dashboard**: <https://mbwk25.github.io/optimum-solutions-group>

Our automated performance monitoring system tracks:

- **Lighthouse Performance Scores** - Core Web Vitals, Speed Index, and more
- **Accessibility Compliance** - WCAG standards and best practices
- **Bundle Size Analysis** - JavaScript bundle optimization tracking
- **Regression Detection** - Automatic alerts for performance degradation

## Project info

**URL**: <https://lovable.dev/projects/191a8a44-4ca1-4155-9cf6-8342ccbd4142>

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

## 🔍 Performance Monitoring

This project includes a comprehensive performance monitoring system powered by GitHub Actions.

### Automated Monitoring

The performance monitoring system runs automatically:

- **On every push** to main/develop branches
- **On pull requests** with detailed performance reports
- **Daily scheduled runs** at 6 AM UTC
- **Manual triggers** via GitHub Actions interface

### Performance Metrics Tracked

#### Lighthouse Scores

- **Performance**: Speed Index, LCP, FID, CLS, and more
- **Accessibility**: WCAG compliance and a11y best practices
- **Best Practices**: Security, HTTPS usage, console errors
- **SEO**: Meta tags, structured data, mobile-friendliness

#### Core Web Vitals

- **LCP (Largest Contentful Paint)**: Loading performance
- **FID (First Input Delay)**: Interactivity responsiveness
- **CLS (Cumulative Layout Shift)**: Visual stability

#### Bundle Analysis

- **JavaScript bundle size** tracking
- **Dependency analysis** and optimization recommendations
- **Asset optimization** monitoring

### Dashboard Features

📊 **Live Dashboard**: <https://mbwk25.github.io/optimum-solutions-group>

- **Real-time metrics** updated after each successful build
- **Performance trends** with historical data visualization
- **Interactive charts** powered by Chart.js
- **Responsive design** optimized for all devices
- **Automatic updates** via GitHub Pages deployment

### Local Performance Testing

```bash
# Test performance monitoring locally
npm run test:workflow:local

# Run custom performance benchmark
node scripts/performance-benchmark.js audit --url http://localhost:4173

# Analyze bundle size
npm run analyze:bundle
```

### Performance Thresholds

The system monitors these performance thresholds:

- **Performance Score**: ≥ 90 (excellent)
- **Accessibility Score**: ≥ 95 (WCAG AA compliant)
- **Bundle Size**: ≤ 300KB (gzipped)
- **LCP**: ≤ 2.5s (good)
- **FID**: ≤ 100ms (good)
- **CLS**: ≤ 0.1 (good)

### Regression Detection

Automated regression detection:

- **Performance score drops** > 5 points
- **Core Web Vitals degradation** beyond thresholds
- **Bundle size increases** > 10%
- **Accessibility score decreases**

### Notifications

Optional Slack notifications for:

- **Performance regressions** detected
- **Daily monitoring reports** (when scheduled)
- **Critical accessibility issues**

To enable notifications, add `SLACK_WEBHOOK_URL` to repository secrets.

### Workflow Commands

```bash
# Deploy workflow and get instructions
npm run deploy:workflow

# Test workflow components locally
npm run test:workflow:local

# Manual performance audit
node scripts/performance-benchmark.js --help
```

### Performance Optimization Tips

1. **Code Splitting**: Use React.lazy() for route-based code splitting
2. **Bundle Analysis**: Regular review of bundle analyzer reports
3. **Image Optimization**: Use modern formats (WebP, AVIF) with proper sizing
4. **Lazy Loading**: Implement intersection observer for below-the-fold content
5. **Service Workers**: Cache static assets for better repeat visits
6. **Critical CSS**: Inline critical styles and defer non-critical CSS

### Contributing to Performance

When contributing:

1. Check the performance dashboard before and after your changes
2. Run local performance tests during development
3. Monitor PR performance reports for regressions
4. Follow performance best practices in the codebase
