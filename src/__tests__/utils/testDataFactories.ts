/**
 * Test Data Factories for Optimum Solutions Group
 * 
 * Provides typed test data factories following coding standards:
 * - TypeScript strict mode with explicit interfaces
 * - Consistent data structures across tests
 * - Mock data for components, API responses, and user interactions
 * 
 * @version 1.0
 * @author Optimum Solutions Group
 */

// Component Props Interfaces (based on coding standards)
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  className?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
  subject?: string;
  company?: string;
}

export interface ProjectEstimate {
  id: string;
  projectType: 'web-development' | 'mobile-app' | 'iot-solution' | 'consulting';
  budget: number;
  timeline: number; // in weeks
  features: string[];
  complexity: 'simple' | 'moderate' | 'complex';
}

export interface PerformanceMetrics {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  renderTime: number;
  bundleSize: number;
}

// Test Data Factories

/**
 * Creates mock user data with proper typing
 */
export const createMockUser = (overrides: Partial<UserProfile> = {}): UserProfile => ({
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  preferences: {
    theme: 'light',
    notifications: true,
  },
  ...overrides,
});

/**
 * Creates mock API response with proper typing
 */
export const createMockApiResponse = <T>(
  data: T, 
  overrides: Partial<ApiResponse<T>> = {}
): ApiResponse<T> => ({
  data,
  status: 200,
  message: 'Success',
  ...overrides,
});

/**
 * Creates mock contact form data
 */
export const createMockContactForm = (overrides: Partial<ContactFormData> = {}): ContactFormData => ({
  name: 'Jane Smith',
  email: 'jane.smith@company.com',
  message: 'I would like to discuss a potential project with your team.',
  subject: 'Project Inquiry',
  company: 'Tech Innovators Inc.',
  ...overrides,
});

/**
 * Creates mock project estimate data
 */
export const createMockProjectEstimate = (overrides: Partial<ProjectEstimate> = {}): ProjectEstimate => ({
  id: 'project-001',
  projectType: 'web-development',
  budget: 50000,
  timeline: 12,
  features: [
    'Responsive Design',
    'User Authentication',
    'Admin Dashboard',
    'API Integration',
  ],
  complexity: 'moderate',
  ...overrides,
});

/**
 * Creates mock performance metrics
 */
export const createMockPerformanceMetrics = (overrides: Partial<PerformanceMetrics> = {}): PerformanceMetrics => ({
  lcp: 1200, // Good: < 2.5s
  fid: 50,   // Good: < 100ms
  cls: 0.05, // Good: < 0.1
  renderTime: 12,  // Good: < 16ms for 60fps
  bundleSize: 180000, // 180KB - under 250KB budget
  ...overrides,
});

/**
 * Creates mock button props with all variants
 */
export const createMockButtonProps = (overrides: Partial<ButtonProps> = {}): ButtonProps => ({
  children: 'Click Me',
  onClick: jest.fn(),
  variant: 'primary',
  size: 'default',
  disabled: false,
  ...overrides,
});

/**
 * Mock data for IoT solutions
 */
export interface IoTDevice {
  id: string;
  name: string;
  type: 'sensor' | 'actuator' | 'gateway';
  status: 'online' | 'offline' | 'error';
  lastSeen: string;
  metrics: {
    temperature?: number;
    humidity?: number;
    batteryLevel?: number;
  };
}

export const createMockIoTDevice = (overrides: Partial<IoTDevice> = {}): IoTDevice => ({
  id: 'device-001',
  name: 'Temperature Sensor',
  type: 'sensor',
  status: 'online',
  lastSeen: new Date().toISOString(),
  metrics: {
    temperature: 22.5,
    humidity: 45.2,
    batteryLevel: 85,
  },
  ...overrides,
});

/**
 * Mock portfolio project data
 */
export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  category: 'web' | 'mobile' | 'iot' | 'consulting';
  imageUrl: string;
  demoUrl?: string;
  githubUrl?: string;
  featured: boolean;
}

export const createMockPortfolioProject = (overrides: Partial<PortfolioProject> = {}): PortfolioProject => ({
  id: 'portfolio-001',
  title: 'Smart Home Management System',
  description: 'A comprehensive IoT solution for home automation and energy monitoring.',
  technologies: ['React', 'Node.js', 'PostgreSQL', 'IoT Sensors', 'AWS IoT Core'],
  category: 'iot',
  imageUrl: '/images/portfolio/smart-home.jpg',
  demoUrl: 'https://demo.smarthome.optimum.com',
  featured: true,
  ...overrides,
});

/**
 * Mock testimonial data
 */
export interface Testimonial {
  id: string;
  name: string;
  company: string;
  role: string;
  content: string;
  rating: number;
  imageUrl?: string;
}

export const createMockTestimonial = (overrides: Partial<Testimonial> = {}): Testimonial => ({
  id: 'testimonial-001',
  name: 'Sarah Johnson',
  company: 'Tech Innovations Ltd',
  role: 'CTO',
  content: 'Optimum Solutions Group delivered an exceptional IoT solution that exceeded our expectations.',
  rating: 5,
  imageUrl: '/images/testimonials/sarah-johnson.jpg',
  ...overrides,
});

/**
 * Mock service data
 */
export interface Service {
  id: string;
  title: string;
  description: string;
  features: string[];
  price: {
    starting: number;
    currency: string;
  };
  duration: string;
  category: 'development' | 'consulting' | 'support';
}

export const createMockService = (overrides: Partial<Service> = {}): Service => ({
  id: 'service-001',
  title: 'Custom Web Development',
  description: 'Full-stack web development solutions tailored to your business needs.',
  features: [
    'Responsive Design',
    'Modern Framework Integration',
    'Performance Optimization',
    'SEO Best Practices',
  ],
  price: {
    starting: 5000,
    currency: 'USD',
  },
  duration: '6-12 weeks',
  category: 'development',
  ...overrides,
});

// Array factories for creating multiple items

/**
 * Creates an array of mock users
 */
export const createMockUsers = (count: number, overrides: Partial<UserProfile> = {}): UserProfile[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockUser({
      id: `user-${index + 1}`,
      name: `User ${index + 1}`,
      email: `user${index + 1}@example.com`,
      ...overrides,
    })
  );
};

/**
 * Creates an array of mock portfolio projects
 */
export const createMockPortfolioProjects = (count: number): PortfolioProject[] => {
  const categories: PortfolioProject['category'][] = ['web', 'mobile', 'iot', 'consulting'];
  
  return Array.from({ length: count }, (_, index) => 
    createMockPortfolioProject({
      id: `project-${index + 1}`,
      title: `Project ${index + 1}`,
      category: categories[index % categories.length],
      featured: index < 3, // First 3 are featured
    })
  );
};

/**
 * Creates an array of mock testimonials
 */
export const createMockTestimonials = (count: number): Testimonial[] => {
  const companies = ['Tech Corp', 'Innovate Inc', 'Future Systems', 'Digital Solutions'];
  const roles = ['CEO', 'CTO', 'Product Manager', 'Engineering Lead'];
  
  return Array.from({ length: count }, (_, index) => 
    createMockTestimonial({
      id: `testimonial-${index + 1}`,
      name: `Client ${index + 1}`,
      company: companies[index % companies.length],
      role: roles[index % roles.length],
      rating: 4 + (index % 2), // Alternates between 4 and 5 stars
    })
  );
};

// Error state factories

/**
 * Creates mock error response
 */
export const createMockError = (message = 'Something went wrong', status = 500) => ({
  error: true,
  message,
  status,
  timestamp: new Date().toISOString(),
});

/**
 * Creates mock loading state
 */
export const createMockLoadingState = () => ({
  isLoading: true,
  data: null,
  error: null,
});

/**
 * Creates mock success state
 */
export const createMockSuccessState = <T>(data: T) => ({
  isLoading: false,
  data,
  error: null,
});
