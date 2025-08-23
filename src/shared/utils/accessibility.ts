/**
 * Comprehensive Accessibility Utilities
 * 
 * This module provides utilities for:
 * - Focus management and navigation
 * - ARIA attribute management
 * - Keyboard event handling
 * - Screen reader announcements
 * - Color contrast checking
 * - Accessibility testing helpers
 */

// ========== FOCUS MANAGEMENT ==========

export interface FocusableElement extends HTMLElement {
  tabIndex: number;
}

/**
 * Get all focusable elements within a container
 */
export const getFocusableElements = (container: HTMLElement): FocusableElement[] => {
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    'audio[controls]',
    'video[controls]',
    'details',
    'summary',
    'iframe',
    '[contenteditable]:not([contenteditable="false"])'
  ].join(', ');

  const elements = Array.from(container.querySelectorAll(focusableSelectors)) as FocusableElement[];
  
  return elements.filter(element => {
    // Check if element is visible and not disabled
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           element.offsetParent !== null;
  });
};

/**
 * Focus trap utility for modals and popups
 */
export class FocusTrap {
  private container: HTMLElement;
  private focusableElements: FocusableElement[];
  private firstFocusable: FocusableElement | null = null;
  private lastFocusable: FocusableElement | null = null;
  private previousActiveElement: Element | null = null;
  private isActive: boolean = false;

  constructor(container: HTMLElement) {
    this.container = container;
    this.focusableElements = [];
    this.updateFocusableElements();
  }

  private updateFocusableElements(): void {
    this.focusableElements = getFocusableElements(this.container);
    this.firstFocusable = this.focusableElements[0] || null;
    this.lastFocusable = this.focusableElements[this.focusableElements.length - 1] || null;
  }

  activate(): void {
    if (this.isActive) return;

    this.previousActiveElement = document.activeElement;
    this.updateFocusableElements();
    this.container.addEventListener('keydown', this.handleKeydown);
    
    // Focus first focusable element
    if (this.firstFocusable) {
      this.firstFocusable.focus();
    }

    this.isActive = true;
  }

  deactivate(): void {
    if (!this.isActive) return;

    this.container.removeEventListener('keydown', this.handleKeydown);
    
    // Restore previous focus
    if (this.previousActiveElement && this.previousActiveElement instanceof HTMLElement) {
      this.previousActiveElement.focus();
    }

    this.isActive = false;
  }

  private handleKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab') return;

    this.updateFocusableElements();

    if (this.focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    if (event.shiftKey) {
      // Backward navigation
      if (document.activeElement === this.firstFocusable) {
        event.preventDefault();
        this.lastFocusable?.focus();
      }
    } else {
      // Forward navigation
      if (document.activeElement === this.lastFocusable) {
        event.preventDefault();
        this.firstFocusable?.focus();
      }
    }
  };
}

/**
 * Focus management utilities
 */
export const focusManager = {
  /**
   * Save current focus and return a restore function
   */
  saveFocus(): () => void {
    const activeElement = document.activeElement as HTMLElement;
    return () => {
      if (activeElement && activeElement.focus) {
        activeElement.focus();
      }
    };
  },

  /**
   * Move focus to the next focusable element
   */
  focusNext(current?: HTMLElement): boolean {
    const container = document.body;
    const focusableElements = getFocusableElements(container);
    const currentIndex = current ? focusableElements.indexOf(current as FocusableElement) : -1;
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < focusableElements.length) {
      focusableElements[nextIndex].focus();
      return true;
    }
    
    return false;
  },

  /**
   * Move focus to the previous focusable element
   */
  focusPrevious(current?: HTMLElement): boolean {
    const container = document.body;
    const focusableElements = getFocusableElements(container);
    const currentIndex = current ? focusableElements.indexOf(current as FocusableElement) : focusableElements.length;
    const prevIndex = currentIndex - 1;
    
    if (prevIndex >= 0) {
      focusableElements[prevIndex].focus();
      return true;
    }
    
    return false;
  }
};

// ========== SCREEN READER ANNOUNCEMENTS ==========

/**
 * Announce text to screen readers
 */
export const announceToScreenReader = (
  message: string, 
  priority: 'polite' | 'assertive' = 'polite'
): void => {
  const announcer = document.createElement('div');
  announcer.setAttribute('aria-live', priority);
  announcer.setAttribute('aria-atomic', 'true');
  announcer.setAttribute('class', 'sr-only');
  announcer.textContent = message;
  
  document.body.appendChild(announcer);
  
  // Clean up after announcement
  setTimeout(() => {
    document.body.removeChild(announcer);
  }, 1000);
};

// ========== ARIA UTILITIES ==========

/**
 * ARIA attribute management utilities
 */
export const ariaUtils = {
  /**
   * Generate unique IDs for ARIA relationships
   */
  generateId(prefix: string = 'aria'): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Set up ARIA labelledby relationship
   */
  setLabelledBy(element: HTMLElement, labelId: string): void {
    element.setAttribute('aria-labelledby', labelId);
  },

  /**
   * Set up ARIA describedby relationship
   */
  setDescribedBy(element: HTMLElement, descriptionId: string): void {
    const existing = element.getAttribute('aria-describedby');
    const ids = existing ? `${existing} ${descriptionId}` : descriptionId;
    element.setAttribute('aria-describedby', ids);
  },

  /**
   * Set ARIA expanded state for collapsible elements
   */
  setExpanded(element: HTMLElement, expanded: boolean): void {
    element.setAttribute('aria-expanded', expanded.toString());
  },

  /**
   * Set ARIA selected state for selectable elements
   */
  setSelected(element: HTMLElement, selected: boolean): void {
    element.setAttribute('aria-selected', selected.toString());
  },

  /**
   * Set ARIA pressed state for toggle buttons
   */
  setPressed(element: HTMLElement, pressed: boolean): void {
    element.setAttribute('aria-pressed', pressed.toString());
  }
};

// ========== KEYBOARD NAVIGATION ==========

/**
 * Keyboard navigation patterns
 */
export const keyboardPatterns = {
  /**
   * Handle arrow key navigation for lists and grids
   */
  handleArrowNavigation: (
    event: KeyboardEvent,
    items: NodeListOf<HTMLElement> | HTMLElement[],
    currentIndex: number,
    options: {
      wrap?: boolean;
      horizontal?: boolean;
      vertical?: boolean;
    } = {}
  ): number => {
    const { wrap = true, horizontal = true, vertical = true } = options;
    const itemsArray = Array.from(items);
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
        if (vertical) {
          event.preventDefault();
          newIndex = currentIndex + 1;
          if (newIndex >= itemsArray.length) {
            newIndex = wrap ? 0 : currentIndex;
          }
        }
        break;

      case 'ArrowUp':
        if (vertical) {
          event.preventDefault();
          newIndex = currentIndex - 1;
          if (newIndex < 0) {
            newIndex = wrap ? itemsArray.length - 1 : currentIndex;
          }
        }
        break;

      case 'ArrowRight':
        if (horizontal) {
          event.preventDefault();
          newIndex = currentIndex + 1;
          if (newIndex >= itemsArray.length) {
            newIndex = wrap ? 0 : currentIndex;
          }
        }
        break;

      case 'ArrowLeft':
        if (horizontal) {
          event.preventDefault();
          newIndex = currentIndex - 1;
          if (newIndex < 0) {
            newIndex = wrap ? itemsArray.length - 1 : currentIndex;
          }
        }
        break;

      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;

      case 'End':
        event.preventDefault();
        newIndex = itemsArray.length - 1;
        break;
    }

    if (newIndex !== currentIndex && itemsArray[newIndex]) {
      itemsArray[newIndex].focus();
    }

    return newIndex;
  },

  /**
   * Handle escape key to close modals/dropdowns
   */
  handleEscape: (event: KeyboardEvent, callback: () => void): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      callback();
    }
  },

  /**
   * Handle enter and space for button activation
   */
  handleActivation: (event: KeyboardEvent, callback: () => void): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  }
};

// ========== ACCESSIBILITY TESTING ==========

/**
 * Basic accessibility testing utilities
 */
export const accessibilityTesting = {
  /**
   * Check color contrast ratio (simplified)
   */
  checkColorContrast: (foreground: string, background: string): number => {
    // Simple RGB extraction (assumes hex colors)
    const getRGB = (color: string) => {
      const hex = color.replace('#', '');
      return {
        r: parseInt(hex.substr(0, 2), 16),
        g: parseInt(hex.substr(2, 2), 16),
        b: parseInt(hex.substr(4, 2), 16)
      };
    };

    const getRelativeLuminance = (rgb: { r: number; g: number; b: number }) => {
      const rsRGB = rgb.r / 255;
      const gsRGB = rgb.g / 255;
      const bsRGB = rgb.b / 255;

      const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
      const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
      const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const fgRGB = getRGB(foreground);
    const bgRGB = getRGB(background);
    
    const fgLuminance = getRelativeLuminance(fgRGB);
    const bgLuminance = getRelativeLuminance(bgRGB);

    const lighter = Math.max(fgLuminance, bgLuminance);
    const darker = Math.min(fgLuminance, bgLuminance);

    return (lighter + 0.05) / (darker + 0.05);
  },

  /**
   * Check if element has accessible name
   */
  hasAccessibleName: (element: HTMLElement): boolean => {
    return !!(
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.textContent?.trim() ||
      (element as HTMLInputElement).placeholder ||
      (element.tagName === 'IMG' && (element as HTMLImageElement).alt)
    );
  },

  /**
   * Find accessibility issues in a container
   */
  findAccessibilityIssues: (container: HTMLElement): Array<{ element: HTMLElement; issue: string }> => {
    const issues: Array<{ element: HTMLElement; issue: string }> = [];
    
    // Check for images without alt text
    const images = container.querySelectorAll('img');
    images.forEach(img => {
      if (!img.alt && img.alt !== '') {
        issues.push({ element: img, issue: 'Image missing alt text' });
      }
    });

    // Check for buttons without accessible names
    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      if (!accessibilityTesting.hasAccessibleName(button)) {
        issues.push({ element: button, issue: 'Button missing accessible name' });
      }
    });

    // Check for inputs without labels
    const inputs = container.querySelectorAll('input:not([type="hidden"])');
    inputs.forEach(input => {
      const hasLabel = !!(
        input.getAttribute('aria-label') ||
        input.getAttribute('aria-labelledby') ||
        container.querySelector(`label[for="${input.id}"]`)
      );
      
      if (!hasLabel) {
        issues.push({ element: input, issue: 'Input missing label' });
      }
    });

    return issues;
  }
};

// ========== LIVE REGION UTILITIES ==========

/**
 * Live region management for dynamic content updates
 */
export class LiveRegionManager {
  private politeRegion: HTMLElement;
  private assertiveRegion: HTMLElement;

  constructor() {
    this.politeRegion = this.createLiveRegion('polite');
    this.assertiveRegion = this.createLiveRegion('assertive');
  }

  private createLiveRegion(politeness: 'polite' | 'assertive'): HTMLElement {
    const region = document.createElement('div');
    region.setAttribute('aria-live', politeness);
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    document.body.appendChild(region);
    return region;
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const region = priority === 'assertive' ? this.assertiveRegion : this.politeRegion;
    
    // Clear previous message
    region.textContent = '';
    
    // Add new message with slight delay for better screen reader support
    setTimeout(() => {
      region.textContent = message;
    }, 100);

    // Clear message after announcement
    setTimeout(() => {
      region.textContent = '';
    }, 2000);
  }

  destroy(): void {
    this.politeRegion.remove();
    this.assertiveRegion.remove();
  }
}

// ========== HIGH CONTRAST MODE DETECTION ==========

/**
 * Detect and handle high contrast mode
 */
export const highContrastMode = {
  /**
   * Check if high contrast mode is active
   */
  isActive(): boolean {
    // Check for Windows high contrast mode
    if (window.matchMedia) {
      return window.matchMedia('(-ms-high-contrast: active)').matches ||
             window.matchMedia('(prefers-contrast: high)').matches;
    }
    return false;
  },

  /**
   * Add high contrast mode listener
   */
  addListener(callback: (isHighContrast: boolean) => void): () => void {
    if (!window.matchMedia) return () => {};

    const mediaQuery = window.matchMedia('(-ms-high-contrast: active), (prefers-contrast: high)');
    const handler = (e: MediaQueryListEvent) => callback(e.matches);
    
    mediaQuery.addListener(handler);
    callback(mediaQuery.matches); // Call immediately with current state

    return () => mediaQuery.removeListener(handler);
  }
};

// ========== REDUCED MOTION DETECTION ==========

/**
 * Detect and handle reduced motion preference
 */
export const reducedMotion = {
  /**
   * Check if user prefers reduced motion
   */
  isActive(): boolean {
    if (window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  },

  /**
   * Add reduced motion preference listener
   */
  addListener(callback: (prefersReduced: boolean) => void): () => void {
    if (!window.matchMedia) return () => {};

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => callback(e.matches);
    
    mediaQuery.addListener(handler);
    callback(mediaQuery.matches); // Call immediately with current state

    return () => mediaQuery.removeListener(handler);
  }
};

// Create global instances
export const globalLiveRegionManager = new LiveRegionManager();
