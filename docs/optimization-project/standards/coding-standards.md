# Coding Standards & Guidelines
## Optimum Solutions Group Optimization Project

### 📋 Overview

This document establishes the coding standards, conventions, and best practices for the optimization project. All code changes must comply with these standards to ensure consistency, maintainability, and quality.

**Enforcement Level**: ⚠️ Required - CI/CD pipeline will enforce these standards
**Review Process**: All code changes require peer review before merge
**Tools**: ESLint, Prettier, TypeScript compiler, Husky pre-commit hooks

---

## 🔧 TypeScript Standards

### Type Safety Requirements

#### Strict Mode Configuration (REQUIRED)
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

#### Type Definitions
```typescript
// ✅ DO: Use explicit types for complex objects
interface UserProfile {
  id: string;
  name: string;
  email: string;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

// ✅ DO: Use generic types for reusable components
interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// ❌ DON'T: Use 'any' type
const data: any = fetchData(); // ❌

// ✅ DO: Use proper typing instead
const data: ApiResponse<UserProfile> = fetchData(); // ✅
```

#### Utility Types Usage
```typescript
// ✅ DO: Leverage TypeScript utility types
type PartialUser = Partial<UserProfile>;
type RequiredUserFields = Required<Pick<UserProfile, 'id' | 'name'>>;
type UserWithoutId = Omit<UserProfile, 'id'>;
```

#### Null Safety
```typescript
// ✅ DO: Handle null/undefined explicitly
function getUserName(user: UserProfile | null): string {
  return user?.name ?? 'Unknown User';
}

// ✅ DO: Use non-null assertion only when certain
const element = document.getElementById('required-element')!;

// ❌ DON'T: Ignore null checks
const name = user.name; // ❌ if user could be null
```

---

## ⚛️ React Standards

### Component Structure

#### Functional Components (REQUIRED)
```typescript
// ✅ DO: Use functional components with TypeScript
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
};

export default Button;
```

#### Props Interface Naming
```typescript
// ✅ DO: Use ComponentNameProps pattern
interface NavigationProps {
  items: NavItem[];
  onItemClick: (item: NavItem) => void;
}

// ❌ DON'T: Generic or unclear naming
interface Props { // ❌
  data: any; // ❌
}
```

### Hook Usage Standards

#### Custom Hooks
```typescript
// ✅ DO: Proper custom hook structure
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}
```

#### Performance Optimization
```typescript
// ✅ DO: Use React.memo for expensive components
const ExpensiveComponent = React.memo<ExpensiveComponentProps>(({ data }) => {
  const expensiveValue = useMemo(() => {
    return data.reduce((sum, item) => sum + item.value, 0);
  }, [data]);

  const handleClick = useCallback((id: string) => {
    console.log('Clicked:', id);
  }, []);

  return <div>{expensiveValue}</div>;
});

// ✅ DO: Use useCallback for event handlers passed to children
const ParentComponent: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);

  const handleItemClick = useCallback((id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  }, []);

  return (
    <div>
      {items.map(item => (
        <ItemComponent
          key={item.id}
          item={item}
          onClick={handleItemClick}
        />
      ))}
    </div>
  );
};
```

### Error Boundaries
```typescript
// ✅ DO: Implement proper error boundaries
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

---

## 🎨 Styling Standards

### Tailwind CSS Guidelines

#### Class Organization
```typescript
// ✅ DO: Organize classes logically
const buttonClasses = clsx(
  // Base styles
  'inline-flex items-center justify-center',
  'px-4 py-2 rounded-md',
  'font-medium text-sm',
  'transition-colors duration-200',
  // Variant styles
  variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
  variant === 'secondary' && 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  // State styles
  disabled && 'opacity-50 cursor-not-allowed',
  className // Allow override
);
```

#### Responsive Design
```typescript
// ✅ DO: Mobile-first responsive design
<div className="
  flex flex-col space-y-4
  sm:flex-row sm:space-y-0 sm:space-x-4
  lg:space-x-8
">
  <div className="w-full sm:w-1/2 lg:w-1/3">Content</div>
</div>
```

---

## 🗂️ File Organization Standards

### Directory Structure
```
src/
├── features/           # Feature-based modules
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── utils/
│   └── dashboard/
├── shared/            # Shared across features
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Shared hooks
│   ├── types/         # Global types
│   └── utils/         # Utility functions
├── app/               # App-level configuration
│   ├── store/         # State management
│   ├── router/        # Routing configuration
│   └── providers/     # Context providers
└── assets/            # Static assets
```

### File Naming Conventions
```
// ✅ DO: Use consistent naming patterns
Button.tsx              // PascalCase for components
useAuth.ts             // camelCase starting with 'use' for hooks
auth.types.ts          // camelCase with .types for type files
auth.utils.ts          // camelCase with .utils for utilities
auth.constants.ts      // camelCase with .constants
Button.test.tsx        // .test for test files
Button.stories.tsx     // .stories for Storybook
```

### Import Organization
```typescript
// ✅ DO: Organize imports in this order
// 1. React and external libraries
import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';

// 2. Internal imports (absolute paths)
import { Button } from '@/shared/components';
import { useAuth } from '@/features/auth';
import type { User } from '@/shared/types';

// 3. Relative imports
import './component.css';
```

---

## 🧪 Testing Standards

### Unit Testing
```typescript
// ✅ DO: Comprehensive test structure
describe('Button Component', () => {
  const defaultProps = {
    onClick: jest.fn(),
    children: 'Click me'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with correct text', () => {
    render(<Button {...defaultProps} />);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    render(<Button {...defaultProps} />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button {...defaultProps} disabled />);
    const button = screen.getByRole('button');
    
    expect(button).toBeDisabled();
  });
});
```

### Integration Testing
```typescript
// ✅ DO: Test user workflows
describe('User Authentication Flow', () => {
  it('allows user to sign in successfully', async () => {
    render(<AuthProvider><LoginPage /></AuthProvider>);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    });
  });
});
```

---

## 📊 Performance Standards

### Bundle Size Guidelines
- **Individual Component**: < 10KB gzipped
- **Feature Module**: < 50KB gzipped
- **Total Bundle**: < 250KB gzipped
- **Vendor Chunk**: < 120KB gzipped

### Performance Monitoring
```typescript
// ✅ DO: Use React DevTools Profiler
const ProfiledComponent = process.env.NODE_ENV === 'development' 
  ? React.memo(Component)
  : Component;

// ✅ DO: Implement performance budgets
if (process.env.NODE_ENV === 'development') {
  performance.mark('component-start');
  // Component rendering
  performance.mark('component-end');
  performance.measure('component-render', 'component-start', 'component-end');
}
```

### Code Splitting
```typescript
// ✅ DO: Implement route-based code splitting
const LazyDashboard = lazy(() => import('@/features/dashboard'));
const LazySettings = lazy(() => import('@/features/settings'));

// ✅ DO: Use React.Suspense with error boundaries
<ErrorBoundary>
  <Suspense fallback={<LoadingSpinner />}>
    <LazyDashboard />
  </Suspense>
</ErrorBoundary>
```

---

## 🔒 Security Standards

### Input Validation
```typescript
// ✅ DO: Validate all inputs with Zod
const userSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().min(0).max(150)
});

type User = z.infer<typeof userSchema>;

// ✅ DO: Sanitize user input
const sanitizedInput = DOMPurify.sanitize(userInput);
```

### Content Security Policy
```typescript
// ✅ DO: Configure CSP headers
const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", "data:", "https:"],
  connectSrc: ["'self'", process.env.VITE_API_URL]
};
```

---

## 📝 Documentation Standards

### Code Comments
```typescript
/**
 * Custom hook for managing user authentication state
 * 
 * @returns {Object} Authentication state and methods
 * @returns {User | null} user - Current authenticated user or null
 * @returns {boolean} isLoading - Whether authentication is being checked
 * @returns {Function} login - Function to log in a user
 * @returns {Function} logout - Function to log out current user
 * 
 * @example
 * ```tsx
 * function LoginPage() {
 *   const { user, login, isLoading } = useAuth();
 *   
 *   if (isLoading) return <Spinner />;
 *   if (user) return <Dashboard />;
 *   
 *   return <LoginForm onSubmit={login} />;
 * }
 * ```
 */
export function useAuth() {
  // Implementation
}
```

### README Requirements
Every feature module must include:
- Purpose and functionality
- Usage examples  
- API documentation
- Testing instructions
- Performance considerations

---

## 🔍 Code Review Checklist

### Before Submitting PR
- [ ] All TypeScript errors resolved
- [ ] ESLint passes with no warnings
- [ ] Tests written and passing
- [ ] Performance impact assessed
- [ ] Security considerations reviewed
- [ ] Documentation updated

### Reviewer Checklist
- [ ] Code follows established patterns
- [ ] Performance optimizations appropriate
- [ ] Error handling comprehensive
- [ ] Security vulnerabilities addressed
- [ ] Tests cover edge cases
- [ ] Documentation is clear and complete

---

## 🛠️ Tools & Automation

### Required Tools
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Jest**: Unit testing
- **React Testing Library**: Component testing
- **Husky**: Git hooks for pre-commit validation

### VSCode Extensions (Recommended)
- ESLint
- Prettier - Code formatter
- TypeScript Importer
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens

### CI/CD Integration
```yaml
# .github/workflows/quality-check.yml
name: Code Quality Check
on: [push, pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run build
```

---

*Last Updated: August 23, 2025*  
*Version: 1.0*  
*Next Review: September 6, 2025*
