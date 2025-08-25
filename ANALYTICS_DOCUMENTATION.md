# OSG Analytics System Documentation

## Overview

The Optimum Solutions Group (OSG) Analytics System is a comprehensive, privacy-compliant analytics solution that provides deep insights into user behavior, performance metrics, and business intelligence. Built with modern web standards and React integration, it offers real-time tracking, customizable dashboards, and powerful analytics capabilities.

## 🚀 Features

### Core Analytics
- **Page Views & Navigation Tracking** - Automatic SPA route tracking
- **User Interaction Monitoring** - Clicks, scrolls, form submissions
- **Performance Integration** - Core Web Vitals and custom metrics
- **Session Management** - User sessions with engagement scoring
- **Error Tracking** - JavaScript errors and unhandled rejections
- **A/B Testing Support** - Experiment variants and conversion tracking

### Privacy & Compliance
- **GDPR Compliant** - Cookie consent and data minimization
- **Do Not Track Respect** - Automatic DNT header detection
- **Data Anonymization** - IP anonymization and user privacy
- **Configurable Sampling** - Control data collection volume

### Advanced Features
- **Real-time Dashboards** - Live analytics visualization
- **Custom Events** - Business-specific tracking
- **Goal Conversion Tracking** - Revenue and engagement goals
- **Performance Benchmarking** - Historical performance comparison
- **Device & Network Detection** - Context-aware analytics

## 📁 Project Structure

```
src/shared/
├── services/
│   └── analytics.ts           # Core analytics service
├── hooks/
│   └── useAnalytics.ts        # React analytics hook
├── components/
│   ├── AnalyticsDashboard.tsx # Analytics visualization
│   └── AnalyticsTracker.tsx   # Tracking wrapper components
```

## 🔧 Installation & Setup

### 1. Import the Analytics Service

The analytics service is automatically initialized when imported:

```typescript
// Already imported in App.tsx
import "@/shared/services/analytics";
```

### 2. Configure Analytics (Optional)

```typescript
import { analytics } from "@/shared/services/analytics";

// Configure analytics settings
analytics.setCookieConsent(true);  // Enable tracking
analytics.setTrackingEnabled(true); // Enable/disable tracking
```

### 3. Environment Variables (Optional)

```env
# .env
VITE_ANALYTICS_API_ENDPOINT=https://your-analytics-api.com/events
VITE_ANALYTICS_API_KEY=your-api-key
```

## 📊 Usage Examples

### Basic Page Tracking

```typescript
import { useAnalytics } from '@/shared/hooks/useAnalytics';

function MyComponent() {
  // Automatic page view tracking with custom properties
  useAnalytics({
    pageTitle: 'My Page',
    pageCategory: 'product',
    trackPageViews: true,
    trackPerformance: true,
    trackScrollDepth: true,
    customProperties: {
      section: 'pricing',
      userType: 'premium'
    }
  });

  return <div>My Component</div>;
}
```

### Manual Event Tracking

```typescript
import { useAnalytics } from '@/shared/hooks/useAnalytics';

function ProductPage() {
  const { trackEvent, trackGoal, identify } = useAnalytics();

  const handlePurchase = () => {
    // Track conversion goal
    trackGoal('purchase', 99.99, {
      productId: 'prod-123',
      category: 'software'
    });

    // Track custom event
    trackEvent('ecommerce', 'purchase', 'software-license', 99.99);
  };

  const handleUserLogin = (userId: string) => {
    // Identify user for personalized tracking
    identify(userId, {
      subscription: 'premium',
      signupDate: new Date().toISOString()
    });
  };

  return (
    <button onClick={handlePurchase}>
      Buy Now
    </button>
  );
}
```

### Using Tracking Components

```typescript
import { ClickTracker, GoalTracker, SectionTracker } from '@/shared/components/AnalyticsTracker';

function MarketingPage() {
  return (
    <div>
      {/* Track section visibility */}
      <SectionTracker sectionName="hero" trackVisibility={true}>
        <section>
          <h1>Welcome to Our Product</h1>
        </section>
      </SectionTracker>

      {/* Track button clicks */}
      <ClickTracker
        category="cta"
        action="click"
        label="header-signup"
        element="button"
      >
        <button>Sign Up Now</button>
      </ClickTracker>

      {/* Track conversion goals */}
      <GoalTracker
        goalId="newsletter-signup"
        conversionType="signup"
        goalValue={1}
      >
        <button>Subscribe to Newsletter</button>
      </GoalTracker>
    </div>
  );
}
```

### Form Tracking

```typescript
import { useFormAnalytics } from '@/shared/hooks/useAnalytics';

function ContactForm() {
  const { trackFormStart, trackFormSubmit, trackFieldError } = useFormAnalytics('contact-form');

  const handleSubmit = async (data: FormData) => {
    try {
      await submitForm(data);
      trackFormSubmit(true); // Success
    } catch (error) {
      trackFormSubmit(false, ['validation-error']); // Failure
    }
  };

  const handleFieldError = (fieldName: string, error: string) => {
    trackFieldError(fieldName, error);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### E-commerce Tracking

```typescript
import { useEcommerceAnalytics } from '@/shared/hooks/useAnalytics';

function ShoppingCart() {
  const { trackPurchase, trackAddToCart, trackViewItem } = useEcommerceAnalytics();

  const handlePurchase = (transactionId: string, total: number, items: CartItem[]) => {
    trackPurchase(transactionId, total, 'USD', items);
  };

  const handleAddToCart = (item: Product) => {
    trackAddToCart(item.id, item.name, item.price, 1);
  };

  return (
    <div>
      {/* Shopping cart implementation */}
    </div>
  );
}
```

## 📈 Analytics Dashboard

### Accessing the Dashboard

The analytics dashboard is available at `/analytics` and provides:

- **Real-time Metrics** - Current user activity and performance
- **Performance Monitoring** - Core Web Vitals and technical metrics
- **Event Analysis** - User interaction patterns and trends
- **Device Analytics** - Browser, device, and network insights

### Dashboard Features

```typescript
import AnalyticsDashboard from '@/shared/components/AnalyticsDashboard';

function AdminPanel() {
  return (
    <AnalyticsDashboard
      timeRange="24h"              // 1h, 24h, 7d, 30d, 90d
      autoRefresh={true}           // Auto-refresh data
      refreshInterval={30000}      // 30 seconds
      compact={false}              // Full dashboard view
      showExportOptions={true}     // Export capabilities
    />
  );
}
```

## ⚙️ Configuration Options

### Analytics Service Configuration

```typescript
import { AnalyticsService } from '@/shared/services/analytics';

const customAnalytics = new AnalyticsService({
  // Core settings
  enabled: true,
  debug: false,
  apiEndpoint: 'https://api.example.com/analytics',
  apiKey: 'your-api-key',

  // Privacy settings
  respectDNT: true,              // Respect Do Not Track
  anonymizeIP: true,             // Anonymize IP addresses
  cookieConsent: false,          // Require cookie consent

  // Performance settings
  sampleRate: 1.0,              // 100% sampling (0.0 - 1.0)
  batchSize: 10,                // Events per batch
  flushInterval: 5000,          // 5 seconds

  // Feature flags
  trackPageViews: true,
  trackUserInteractions: true,
  trackPerformance: true,
  trackErrors: true,
  trackCustomEvents: true
});
```

### Hook Configuration

```typescript
const { trackEvent } = useAnalytics({
  // Page-specific settings
  pageTitle: 'Custom Page Title',
  pageCategory: 'category',
  customProperties: {
    userType: 'premium',
    feature: 'enabled'
  },

  // Tracking preferences
  trackPageViews: true,
  trackPerformance: true,
  trackScrollDepth: true,
  trackClicks: true,
  trackErrors: true,

  // Performance integration
  enableWebVitals: true,

  // Goals and conversions
  goals: ['signup', 'purchase'],
  conversionEvents: ['form-submit', 'checkout']
});
```

## 🔒 Privacy & GDPR Compliance

### Cookie Consent Integration

```typescript
import { analytics } from '@/shared/services/analytics';

// Check current consent status
const isTrackingEnabled = analytics.isEnabled();

// Handle consent change
function handleCookieConsent(granted: boolean) {
  analytics.setCookieConsent(granted);
  
  if (granted) {
    // Analytics will start tracking
    console.log('Analytics enabled');
  } else {
    // Analytics will stop and clear data
    console.log('Analytics disabled');
  }
}
```

### Data Privacy Features

- **Automatic IP Anonymization** - Last octet removed
- **Do Not Track Respect** - Honors browser DNT settings
- **Data Minimization** - Only collects necessary data
- **User Control** - Easy opt-out mechanisms
- **Secure Storage** - Local storage with encryption option

## 📱 Performance Integration

### Core Web Vitals Tracking

The system automatically integrates with the existing Core Web Vitals monitoring:

```typescript
// Automatic integration in useAnalytics
const webVitals = useCoreWebVitals({
  enableAnalytics: true,
  onMetric: (metric) => {
    analytics.trackPerformance({
      [metric.name.toLowerCase()]: metric.value
    });
  }
});
```

### Custom Performance Metrics

```typescript
// Track custom timing events
const { trackTiming } = useAnalytics();

// Measure component load time
const startTime = performance.now();
// ... component loading logic
const endTime = performance.now();
trackTiming('component', 'load_time', endTime - startTime, 'ProductPage');
```

## 🧪 A/B Testing Support

### Setting Up Experiments

```typescript
const { setExperiment, getExperiment } = useAnalytics();

// Set user in experiment
setExperiment('header-cta', 'variant-b');

// Check experiment variant
const variant = getExperiment('header-cta'); // Returns 'variant-b' or null
```

### Tracking Experiment Results

```typescript
// Track conversion for experiment
const { trackGoal } = useAnalytics();

if (getExperiment('checkout-flow') === 'simplified') {
  trackGoal('experiment-conversion', 1, {
    experiment: 'checkout-flow',
    variant: 'simplified'
  });
}
```

## 📊 Data Export & Integration

### Manual Data Export

```typescript
// Export current session data
const session = analytics.getSession();
console.log('Session data:', session);

// Force flush pending events
await analytics.forceFlush();
```

### API Integration

For production use, configure an analytics API endpoint:

```typescript
// Expected API endpoint format
POST /analytics/events
Content-Type: application/json

{
  "events": [
    {
      "type": "pageview",
      "category": "navigation",
      "action": "page_view",
      "timestamp": 1640995200000,
      "sessionId": "session-123",
      "url": "https://example.com/page",
      "properties": {}
    }
  ],
  "session": {
    "id": "session-123",
    "startTime": 1640995000000,
    "pageViews": 5,
    "interactions": 12
  },
  "metadata": {
    "timestamp": 1640995200000,
    "version": "1.0.0"
  }
}
```

## 🚨 Error Handling & Debugging

### Debug Mode

Enable debug logging in development:

```typescript
import { analytics } from '@/shared/services/analytics';

// Check if debug mode is active
console.log('Debug mode:', analytics.getConfig().debug);

// View current configuration
console.log('Config:', analytics.getConfig());
```

### Error Tracking

Automatic error tracking is enabled by default:

```typescript
// Manual error tracking
try {
  riskyOperation();
} catch (error) {
  analytics.trackError(error, {
    context: 'user-action',
    userId: currentUser.id
  });
}
```

## 🧪 Testing

### Unit Testing

```typescript
// Mock analytics for testing
jest.mock('@/shared/services/analytics', () => ({
  analytics: {
    trackEvent: jest.fn(),
    trackPageView: jest.fn(),
    isEnabled: jest.fn(() => true)
  }
}));
```

### Integration Testing

```typescript
// Test analytics integration
import { render, fireEvent } from '@testing-library/react';
import { analytics } from '@/shared/services/analytics';

test('tracks button click', () => {
  const { getByText } = render(<MyComponent />);
  const button = getByText('Click Me');
  
  fireEvent.click(button);
  
  expect(analytics.trackEvent).toHaveBeenCalledWith(
    'engagement',
    'click',
    'button-click'
  );
});
```

## 📝 Best Practices

### 1. Event Naming Convention

```typescript
// Use consistent naming
trackEvent('category', 'action', 'label', value);

// Examples:
trackEvent('navigation', 'link_click', 'header-about');
trackEvent('engagement', 'button_click', 'cta-signup');
trackEvent('form', 'field_focus', 'contact-email');
```

### 2. Performance Considerations

```typescript
// Use sampling for high-volume events
const analytics = new AnalyticsService({
  sampleRate: 0.1  // Track 10% of events
});

// Batch events for efficiency
const analytics = new AnalyticsService({
  batchSize: 20,
  flushInterval: 10000  // 10 seconds
});
```

### 3. User Privacy

```typescript
// Always check consent before tracking
if (analytics.isEnabled()) {
  trackEvent('user', 'action', 'label');
}

// Provide easy opt-out
function handleOptOut() {
  analytics.setTrackingEnabled(false);
}
```

### 4. Data Quality

```typescript
// Validate data before tracking
function trackPurchase(amount: number, currency: string) {
  if (amount > 0 && currency) {
    trackEvent('ecommerce', 'purchase', currency, amount);
  }
}

// Use meaningful labels
trackEvent('video', 'play', `${videoTitle}-${videoDuration}s`);
```

## 🔧 Troubleshooting

### Common Issues

1. **Events not tracking**: Check if analytics is enabled and consent granted
2. **Dashboard not loading**: Verify route configuration and component imports  
3. **Performance impact**: Reduce sample rate or increase batch size
4. **Privacy concerns**: Enable anonymization and respect DNT headers

### Debug Commands

```javascript
// Browser console debugging
window.OSG_Analytics = analytics;

// Check status
OSG_Analytics.isEnabled();

// View session
OSG_Analytics.getSession();

// View configuration  
OSG_Analytics.getConfig();

// Force flush events
OSG_Analytics.forceFlush();
```

## 🚀 Future Enhancements

### Planned Features
- **Real-time Alerts** - Performance threshold notifications
- **Advanced Segmentation** - User cohort analysis
- **Predictive Analytics** - ML-powered insights
- **Cross-device Tracking** - User journey across devices
- **Advanced Visualizations** - Custom chart types and reports

### Integration Roadmap
- **Google Analytics 4** - GA4 integration layer
- **Mixpanel Integration** - Event streaming to Mixpanel
- **Custom Dashboards** - User-configurable analytics views
- **API Extensions** - Enhanced data export capabilities

## 📞 Support

For questions or issues with the analytics system:

1. Check this documentation first
2. Review the source code comments
3. Test in the development environment with debug mode enabled
4. Check browser console for error messages

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Compatible With**: React 18+, TypeScript 5+, Vite 5+
