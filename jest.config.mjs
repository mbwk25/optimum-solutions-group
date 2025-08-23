/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  
  // Setup files to run before each test file
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  
  // Module file extensions for importing
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Transform files with ts-jest (removed deprecated isolatedModules option)
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.jest.json',
        useESM: false,
      },
    ],
  },
  
  // Module name mapper for handling path aliases and static assets
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub',
  },
  
  // Test match pattern
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  
  // Collect coverage information
  collectCoverage: false,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/main-test.tsx',
    '!src/vite-env.d.ts',
    '!src/setupTests.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/index.ts',
  ],
  
  // Coverage thresholds based on coding standards
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 90,
      lines: 95,
      statements: 95,
    },
    './src/shared/ui/': {
      statements: 95,
      branches: 90,
      functions: 95,
      lines: 95,
    },
    './src/shared/utils/': {
      statements: 100,
      branches: 95,
      functions: 100,
      lines: 100,
    },
  },
  
  // Ignore patterns for transform
  transformIgnorePatterns: [
    '/node_modules/(?!(react-router-dom|@radix-ui|@tanstack|embla-carousel-react|date-fns|lucide-react|next-themes|react-day-picker|react-hook-form|react-resizable-panels|recharts|sonner|tailwind-merge|tailwindcss-animate|vaul|zod|class-variance-authority|clsx|cmdk|input-otp)/)',
  ],
  

  
  // Test timeout configuration  
  testTimeout: 10000,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks between tests
  restoreMocks: true,
  
  // Performance and accessibility testing configuration
  
  // Additional test environment options
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },
  
  // Verbose output for better debugging
  verbose: true,
  
  // Maximum worker processes for parallel testing
  maxWorkers: '50%',
};
