import { useEffect, useCallback, useRef, useState } from 'react';
import { 
  FocusTrap, 
  focusManager,
  ariaUtils,
  keyboardPatterns,
  globalLiveRegionManager,
  highContrastMode,
  reducedMotion,
  accessibilityTesting
} from '../utils/accessibility';

// ========== FOCUS TRAP HOOK ==========

/**
 * Hook for managing focus trapping in modals and dialogs
 */
export const useFocusTrap = (isActive: boolean = false) => {
  const containerRef = useRef<HTMLElement>(null);
  const focusTrapRef = useRef<FocusTrap | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!focusTrapRef.current) {
      focusTrapRef.current = new FocusTrap(containerRef.current);
    }

    if (isActive) {
      focusTrapRef.current.activate();
    } else {
      focusTrapRef.current.deactivate();
    }

    return () => {
      if (focusTrapRef.current) {
        focusTrapRef.current.deactivate();
      }
    };
  }, [isActive]);

  return { containerRef };
};

// ========== FOCUS MANAGEMENT HOOK ==========

/**
 * Hook for advanced focus management
 */
export const useFocusManagement = () => {
  const saveFocus = useCallback(() => {
    return focusManager.saveFocus();
  }, []);

  const focusFirst = useCallback((container?: HTMLElement) => {
    const target = container || document.body;
    const focusableElements = target.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    if (firstElement) {
      firstElement.focus();
      return true;
    }
    return false;
  }, []);

  const focusNext = useCallback((currentElement?: HTMLElement) => {
    return focusManager.focusNext(currentElement);
  }, []);

  const focusPrevious = useCallback((currentElement?: HTMLElement) => {
    return focusManager.focusPrevious(currentElement);
  }, []);

  return {
    saveFocus,
    focusFirst,
    focusNext,
    focusPrevious
  };
};

// ========== ARIA ATTRIBUTES HOOK ==========

/**
 * Hook for managing ARIA attributes
 */
export const useAriaAttributes = () => {
  const [ariaIds] = useState(() => ({
    label: ariaUtils.generateId('label'),
    description: ariaUtils.generateId('description'),
    error: ariaUtils.generateId('error'),
    live: ariaUtils.generateId('live')
  }));

  const setExpanded = useCallback((element: HTMLElement, expanded: boolean) => {
    ariaUtils.setExpanded(element, expanded);
  }, []);

  const setSelected = useCallback((element: HTMLElement, selected: boolean) => {
    ariaUtils.setSelected(element, selected);
  }, []);

  const setPressed = useCallback((element: HTMLElement, pressed: boolean) => {
    ariaUtils.setPressed(element, pressed);
  }, []);

  const setLabelledBy = useCallback((element: HTMLElement, labelId?: string) => {
    ariaUtils.setLabelledBy(element, labelId || ariaIds.label);
  }, [ariaIds.label]);

  const setDescribedBy = useCallback((element: HTMLElement, descriptionId?: string) => {
    ariaUtils.setDescribedBy(element, descriptionId || ariaIds.description);
  }, [ariaIds.description]);

  return {
    ariaIds,
    setExpanded,
    setSelected,
    setPressed,
    setLabelledBy,
    setDescribedBy
  };
};

// ========== KEYBOARD NAVIGATION HOOK ==========

interface UseKeyboardNavigationOptions {
  items: HTMLElement[];
  currentIndex: number;
  onIndexChange: (newIndex: number) => void;
  wrap?: boolean;
  horizontal?: boolean;
  vertical?: boolean;
}

/**
 * Hook for keyboard navigation patterns
 */
export const useKeyboardNavigation = ({
  items,
  currentIndex,
  onIndexChange,
  wrap = true,
  horizontal = true,
  vertical = true
}: UseKeyboardNavigationOptions) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const newIndex = keyboardPatterns.handleArrowNavigation(
      event,
      items,
      currentIndex,
      { wrap, horizontal, vertical }
    );
    
    if (newIndex !== currentIndex) {
      onIndexChange(newIndex);
    }
  }, [items, currentIndex, onIndexChange, wrap, horizontal, vertical]);

  const handleEscape = useCallback((callback: () => void) => {
    return (event: KeyboardEvent) => {
      keyboardPatterns.handleEscape(event, callback);
    };
  }, []);

  const handleActivation = useCallback((callback: () => void) => {
    return (event: KeyboardEvent) => {
      keyboardPatterns.handleActivation(event, callback);
    };
  }, []);

  return {
    handleKeyDown,
    handleEscape,
    handleActivation
  };
};

// ========== SCREEN READER ANNOUNCEMENTS HOOK ==========

/**
 * Hook for managing screen reader announcements
 */
export const useScreenReaderAnnouncements = () => {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    globalLiveRegionManager.announce(message, priority);
  }, []);

  const announcePolite = useCallback((message: string) => {
    announce(message, 'polite');
  }, [announce]);

  const announceAssertive = useCallback((message: string) => {
    announce(message, 'assertive');
  }, [announce]);

  return {
    announce,
    announcePolite,
    announceAssertive
  };
};

// ========== USER PREFERENCES HOOK ==========

/**
 * Hook for detecting user accessibility preferences
 */
export const useUserPreferences = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(reducedMotion.isActive());
  const [prefersHighContrast, setPrefersHighContrast] = useState(highContrastMode.isActive());

  useEffect(() => {
    const removeReducedMotionListener = reducedMotion.addListener(setPrefersReducedMotion);
    const removeHighContrastListener = highContrastMode.addListener(setPrefersHighContrast);

    return () => {
      removeReducedMotionListener();
      removeHighContrastListener();
    };
  }, []);

  return {
    prefersReducedMotion,
    prefersHighContrast
  };
};

// ========== ACCESSIBILITY VALIDATION HOOK ==========

/**
 * Hook for runtime accessibility validation (development only)
 */
export const useAccessibilityValidation = (enabled: boolean = import.meta.env.MODE === 'development') => {
  const [issues, setIssues] = useState<Array<{ element: HTMLElement; issue: string }>>([]);
  const containerRef = useRef<HTMLElement>(null);

  const validateAccessibility = useCallback(() => {
    if (!enabled || !containerRef.current) return;

    const foundIssues = accessibilityTesting.findAccessibilityIssues(containerRef.current);
    setIssues(foundIssues);

    // Log issues to console in development
    if (foundIssues.length > 0) {
      console.group('🚨 Accessibility Issues Found');
      foundIssues.forEach(({ element, issue }) => {
        console.warn(`${issue}:`, element);
      });
      console.groupEnd();
    }
  }, [enabled]);

  // Validate on mount and when enabled changes
  useEffect(() => {
    validateAccessibility();
  }, [validateAccessibility]);

  // Validate periodically in development
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(validateAccessibility, 5000);
    return () => clearInterval(interval);
  }, [enabled, validateAccessibility]);

  return {
    containerRef,
    issues,
    validateAccessibility
  };
};

// ========== ROVING TABINDEX HOOK ==========

interface UseRovingTabIndexOptions {
  items: HTMLElement[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

/**
 * Hook for implementing roving tabindex pattern
 */
export const useRovingTabIndex = ({ 
  items, 
  currentIndex, 
  onIndexChange 
}: UseRovingTabIndexOptions) => {
  // Update tabindex values when items or current index changes
  useEffect(() => {
    items.forEach((item, index) => {
      if (index === currentIndex) {
        item.setAttribute('tabindex', '0');
      } else {
        item.setAttribute('tabindex', '-1');
      }
    });
  }, [items, currentIndex]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const newIndex = keyboardPatterns.handleArrowNavigation(
      event,
      items,
      currentIndex
    );
    
    if (newIndex !== currentIndex) {
      onIndexChange(newIndex);
    }
  }, [items, currentIndex, onIndexChange]);

  const handleItemFocus = useCallback((index: number) => {
    onIndexChange(index);
  }, [onIndexChange]);

  return {
    handleKeyDown,
    handleItemFocus
  };
};

// ========== SKIP LINKS HOOK ==========

/**
 * Hook for managing skip links
 */
export const useSkipLinks = () => {
  const skipLinksRef = useRef<HTMLElement>(null);

  const addSkipLink = useCallback((targetId: string, label: string) => {
    if (!skipLinksRef.current) return;

    const link = document.createElement('a');
    link.href = `#${targetId}`;
    link.className = 'skip-link';
    link.textContent = label;
    
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });

    skipLinksRef.current.appendChild(link);
  }, []);

  return {
    skipLinksRef,
    addSkipLink
  };
};

// ========== COMPREHENSIVE ACCESSIBILITY HOOK ==========

interface UseAccessibilityOptions {
  focusTrap?: boolean;
  announcements?: boolean;
  validation?: boolean;
  keyboardNavigation?: {
    items?: HTMLElement[];
    currentIndex?: number;
    onIndexChange?: (index: number) => void;
  };
}

/**
 * Comprehensive accessibility hook that combines multiple accessibility features
 */
export const useAccessibility = (options: UseAccessibilityOptions = {}) => {
  const {
    focusTrap = false,
    announcements = true,
    validation = import.meta.env.MODE === 'development',
    keyboardNavigation
  } = options;

  // Focus trap
  const { containerRef: focusTrapContainer } = useFocusTrap(focusTrap);

  // Screen reader announcements
  const { announce, announcePolite, announceAssertive } = useScreenReaderAnnouncements();

  // User preferences
  const { prefersReducedMotion, prefersHighContrast } = useUserPreferences();

  // Accessibility validation
  const { containerRef: validationContainer, issues, validateAccessibility } = useAccessibilityValidation(validation);

  // ARIA attributes
  const { ariaIds, setExpanded, setSelected, setPressed, setLabelledBy, setDescribedBy } = useAriaAttributes();

  // Focus management
  const { saveFocus, focusFirst, focusNext, focusPrevious } = useFocusManagement();

  // Keyboard navigation (if enabled)
  const shouldUseKeyboardNav = keyboardNavigation?.items && keyboardNavigation?.onIndexChange;
  const keyboardHandler = useKeyboardNavigation({
    items: keyboardNavigation?.items || [],
    currentIndex: keyboardNavigation?.currentIndex || 0,
    onIndexChange: keyboardNavigation?.onIndexChange || (() => {})
  });
  
  // Only return keyboard handler if navigation is properly configured
  const finalKeyboardHandler = shouldUseKeyboardNav ? keyboardHandler : null;

  // Combine container refs
  const containerRef = useCallback((node: HTMLElement | null) => {
    if (node) {
      // Use direct assignment via type assertion for readonly refs
      (focusTrapContainer as any).current = node;
      (validationContainer as any).current = node;
    }
  }, [focusTrapContainer, validationContainer]);

  return {
    // Container ref
    containerRef,
    
    // Announcements
    announce: announcements ? announce : () => {},
    announcePolite: announcements ? announcePolite : () => {},
    announceAssertive: announcements ? announceAssertive : () => {},
    
    // User preferences
    prefersReducedMotion,
    prefersHighContrast,
    
    // Validation (development only)
    issues: validation ? issues : [],
    validateAccessibility: validation ? validateAccessibility : () => {},
    
    // ARIA utilities
    ariaIds,
    setExpanded,
    setSelected,
    setPressed,
    setLabelledBy,
    setDescribedBy,
    
    // Focus management
    saveFocus,
    focusFirst,
    focusNext,
    focusPrevious,
    
    // Keyboard navigation
    keyboardHandler: finalKeyboardHandler
  };
};

// ========== LANDMARK HOOK ==========

/**
 * Hook for managing landmark regions
 */
export const useLandmarks = () => {
  const addLandmark = useCallback((element: HTMLElement, role: string, label?: string) => {
    element.setAttribute('role', role);
    if (label) {
      const labelId = ariaUtils.generateId(`${role}-label`);
      const labelElement = document.createElement('h2');
      labelElement.id = labelId;
      labelElement.textContent = label;
      labelElement.className = 'sr-only';
      
      element.insertBefore(labelElement, element.firstChild);
      ariaUtils.setLabelledBy(element, labelId);
    }
  }, []);

  return { addLandmark };
};
