/**
 * Analytics Tracker Components
 * 
 * Convenient wrapper components for adding analytics tracking
 * to common UI elements without manual event tracking
 */

import React, { ReactNode } from 'react';
import { useAnalytics } from '@/shared/hooks/useAnalytics';

// =========================== TYPES ===========================

interface BaseTrackerProps {
  children: ReactNode;
  category?: string;
  action?: string;
  label?: string;
  value?: number;
  properties?: Record<string, unknown>;
}

interface ClickTrackerProps extends BaseTrackerProps {
  element?: string;
  disabled?: boolean;
}

interface LinkTrackerProps extends BaseTrackerProps {
  href?: string;
  external?: boolean;
}

interface FormTrackerProps extends BaseTrackerProps {
  formName: string;
  onSubmit?: (e: React.FormEvent) => void;
}

interface SectionTrackerProps extends BaseTrackerProps {
  sectionName: string;
  trackVisibility?: boolean;
  visibilityThreshold?: number;
}

// =========================== CLICK TRACKER ===========================

/**
 * Wraps any clickable element to track click events
 */
export const ClickTracker: React.FC<ClickTrackerProps> = ({
  children,
  category = 'engagement',
  action = 'click',
  label,
  value,
  properties,
  element = 'button',
  disabled = false,
}) => {
  const { trackClick } = useAnalytics();

  const handleClick = (event: React.MouseEvent) => {
    if (!disabled) {
      trackClick(element, undefined, {
        category,
        action,
        label,
        value,
        ...properties,
        clickedText: event.currentTarget.textContent,
        timestamp: Date.now(),
      });
    }
  };

  return (
    <div onClick={handleClick} className="contents">
      {children}
    </div>
  );
};

// =========================== LINK TRACKER ===========================

/**
 * Wraps links to track navigation events
 */
export const LinkTracker: React.FC<LinkTrackerProps> = ({
  children,
  category = 'navigation',
  action = 'link_click',
  label,
  value,
  properties,
  href,
  external = false,
}) => {
  const { trackEvent } = useAnalytics();

  const handleClick = () => {
    trackEvent(category, action, label || href, value);
    
    // Track additional properties for external links
    if (external || (href && !href.startsWith(window.location.origin))) {
      trackEvent('navigation', 'external_link', href, undefined);
    }
  };

  return (
    <div onClick={handleClick} className="contents">
      {children}
    </div>
  );
};

// =========================== FORM TRACKER ===========================

/**
 * Wraps forms to track form interactions
 */
export const FormTracker: React.FC<FormTrackerProps> = ({
  children,
  formName,
  category = 'form',
  action = 'submit',
  label,
  value,
  properties,
  onSubmit,
}) => {
  const { trackEvent } = useAnalytics();
  const [startTime] = React.useState(Date.now());

  React.useEffect(() => {
    // Track form start
    trackEvent(category, 'form_start', formName);
  }, [category, formName, trackEvent]);

  const handleSubmit = (event: React.FormEvent) => {
    const duration = Date.now() - startTime;
    
    trackEvent(category, action, label || formName, value || duration);
    trackEvent(category, 'form_completion_time', formName, duration);
    
    if (onSubmit) {
      onSubmit(event);
    }
  };

  return (
    <div onSubmit={handleSubmit} className="contents">
      {children}
    </div>
  );
};

// =========================== SECTION TRACKER ===========================

/**
 * Wraps page sections to track visibility and engagement
 */
export const SectionTracker: React.FC<SectionTrackerProps> = ({
  children,
  sectionName,
  category = 'engagement',
  action = 'section_view',
  label,
  value,
  properties,
  trackVisibility = true,
  visibilityThreshold = 0.5,
}) => {
  const { trackEvent } = useAnalytics();
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const [hasBeenViewed, setHasBeenViewed] = React.useState(false);

  React.useEffect(() => {
    if (!trackVisibility || !sectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasBeenViewed) {
          setHasBeenViewed(true);
          trackEvent(category, action, label || sectionName, value);
          trackEvent('engagement', 'section_visible', sectionName);
        }
      },
      {
        threshold: visibilityThreshold,
        rootMargin: '-50px 0px',
      }
    );

    const currentRef = sectionRef.current;
    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [trackVisibility, visibilityThreshold, hasBeenViewed, trackEvent, category, action, label, sectionName, value]);

  return (
    <div ref={sectionRef} className="contents">
      {children}
    </div>
  );
};

// =========================== GOAL TRACKER ===========================

/**
 * Tracks conversion goals and important user actions
 */
interface GoalTrackerProps extends BaseTrackerProps {
  goalId: string;
  goalValue?: number;
  conversionType?: 'purchase' | 'signup' | 'download' | 'contact' | 'custom';
}

export const GoalTracker: React.FC<GoalTrackerProps> = ({
  children,
  goalId,
  goalValue,
  conversionType = 'custom',
  category = 'conversion',
  action = 'goal_completed',
  label,
  value,
  properties,
}) => {
  const { trackGoal, trackEvent } = useAnalytics();

  const handleGoalTrigger = () => {
    trackGoal(goalId, goalValue || value, {
      conversionType,
      goalId,
      ...properties,
    });

    // Also track as a regular event
    trackEvent(category, action, label || goalId, goalValue || value);
  };

  return (
    <div onClick={handleGoalTrigger} className="contents">
      {children}
    </div>
  );
};

// =========================== SCROLL TRACKER ===========================

/**
 * Tracks scroll depth for specific content areas
 */
interface ScrollTrackerProps extends BaseTrackerProps {
  contentId: string;
  milestones?: number[];
}

export const ScrollTracker: React.FC<ScrollTrackerProps> = ({
  children,
  contentId,
  milestones = [25, 50, 75, 100],
  category = 'engagement',
  action = 'scroll_depth',
  properties,
}) => {
  const { trackEvent } = useAnalytics();
  const contentRef = React.useRef<HTMLDivElement>(null);
  const trackedMilestones = React.useRef<Set<number>>(new Set());

  React.useEffect(() => {
    if (!contentRef.current) return;

    const handleScroll = () => {
      if (!contentRef.current) return;

      const element = contentRef.current;
      const rect = element.getBoundingClientRect();
      const elementHeight = element.offsetHeight;
      const viewportHeight = window.innerHeight;

      // Calculate how much of the element is visible
      const visibleTop = Math.max(0, -rect.top);
      const visibleBottom = Math.min(elementHeight, viewportHeight - rect.top);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);
      const visibilityPercentage = (visibleHeight / elementHeight) * 100;

      // Track milestones
      milestones.forEach(milestone => {
        if (visibilityPercentage >= milestone && !trackedMilestones.current.has(milestone)) {
          trackedMilestones.current.add(milestone);
          trackEvent(category, action, `${contentId}_${milestone}%`, milestone);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [contentId, milestones, trackEvent, category, action]);

  return (
    <div ref={contentRef} className="contents">
      {children}
    </div>
  );
};

// =========================== TIMING TRACKER ===========================

/**
 * Tracks timing events for user interactions
 */
interface TimingTrackerProps extends BaseTrackerProps {
  timingCategory: string;
  timingVariable: string;
  autoStart?: boolean;
}

export const TimingTracker: React.FC<TimingTrackerProps> = ({
  children,
  timingCategory,
  timingVariable,
  category = 'timing',
  action = 'user_timing',
  label,
  properties,
  autoStart = true,
}) => {
  const { trackTiming } = useAnalytics();
  const startTimeRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (autoStart) {
      startTimeRef.current = performance.now();
    }
  }, [autoStart]);

  const startTiming = () => {
    startTimeRef.current = performance.now();
  };

  const endTiming = (customLabel?: string) => {
    if (startTimeRef.current) {
      const duration = performance.now() - startTimeRef.current;
      trackTiming(timingCategory, timingVariable, duration, customLabel || label);
      startTimeRef.current = null;
    }
  };

  return (
    <div 
      onMouseEnter={autoStart ? undefined : startTiming}
      onMouseLeave={autoStart ? endTiming : undefined}
      onClick={autoStart ? endTiming : undefined}
      className="contents"
    >
      {children}
    </div>
  );
};

// =========================== COMPOSITE TRACKER ===========================

/**
 * Combines multiple tracking behaviors
 */
interface CompositeTrackerProps extends BaseTrackerProps {
  trackClick?: boolean;
  trackVisibility?: boolean;
  trackTiming?: boolean;
  trackGoal?: boolean;
  goalId?: string;
  sectionName?: string;
  element?: string;
}

export const CompositeTracker: React.FC<CompositeTrackerProps> = ({
  children,
  trackClick = true,
  trackVisibility = false,
  trackTiming = false,
  trackGoal = false,
  goalId,
  sectionName,
  element = 'element',
  ...baseProps
}) => {
  let wrappedChildren = children;

  if (trackGoal && goalId) {
    wrappedChildren = (
      <GoalTracker goalId={goalId} {...baseProps}>
        {wrappedChildren}
      </GoalTracker>
    );
  }

  if (trackClick) {
    wrappedChildren = (
      <ClickTracker element={element} {...baseProps}>
        {wrappedChildren}
      </ClickTracker>
    );
  }

  if (trackVisibility && sectionName) {
    wrappedChildren = (
      <SectionTracker sectionName={sectionName} {...baseProps}>
        {wrappedChildren}
      </SectionTracker>
    );
  }

  if (trackTiming) {
    wrappedChildren = (
      <TimingTracker timingCategory="interaction" timingVariable={element} {...baseProps}>
        {wrappedChildren}
      </TimingTracker>
    );
  }

  return <>{wrappedChildren}</>;
};

export default ClickTracker;
