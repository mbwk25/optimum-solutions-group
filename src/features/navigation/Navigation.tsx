import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import { Button } from '@/shared/ui/button';
import { Menu, X } from 'lucide-react';
import logo from '@/assets/optimum-logo.png';
import { useAccessibility, useRovingTabIndex } from '@/shared/hooks/useAccessibility';
import { useAccessibilityContext } from '@/shared/components/AccessibilityProvider';

const Navigation = memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentNavIndex, setCurrentNavIndex] = useState(0);
  const navRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  
  // Accessibility context
  const { announce, addSkipLink, removeSkipLink, prefersReducedMotion } = useAccessibilityContext();
  
  // Accessibility features
  const {
    containerRef,
    announcePolite,
    ariaIds,
    saveFocus,
    focusFirst
  } = useAccessibility({
    focusTrap: isMenuOpen,
    announcements: true
  });

  // Memoized scroll handler to prevent re-creation
  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 50);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Memoized navigation items to prevent re-creation on every render
  const navItems = useMemo(() => [
    { label: 'About', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'IoT Solutions', href: '#iot' },
    { label: 'Portfolio', href: '#portfolio' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#contact' },
  ], []);

  // Memoized scroll function with accessibility announcements
  const scrollToSection = useCallback((href: string, sectionName?: string) => {
    const element = document.querySelector(href);
    if (element) {
      const behavior = prefersReducedMotion ? 'auto' : 'smooth';
      element.scrollIntoView({ behavior });
      
      // Make target focusable and focus it for screen readers
      const targetElement = element as HTMLElement;
      if (targetElement.tabIndex < 0) {
        targetElement.tabIndex = -1;
      }
      targetElement.focus();
      
      // Announce navigation
      if (sectionName) {
        announcePolite(`Navigated to ${sectionName} section`);
      }
    }
    setIsMenuOpen(false);
  }, [prefersReducedMotion, announcePolite]);

  // Memoized toggle function with accessibility features
  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => {
      const newState = !prev;
      
      // Announce menu state change
      announcePolite(newState ? 'Mobile menu opened' : 'Mobile menu closed');
      
      // Focus management
      if (newState) {
        // When opening, save current focus and focus first menu item
        setTimeout(() => {
          if (mobileMenuRef.current) {
            focusFirst(mobileMenuRef.current);
          }
        }, 100);
      }
      
      return newState;
    });
  }, [announcePolite, focusFirst]);

  // Register skip links
  useEffect(() => {
    addSkipLink('nav-main', 'Skip to main content', '#main');
    addSkipLink('nav-menu', 'Skip to navigation menu', '#nav-menu');
    
    return () => {
      removeSkipLink('nav-main');
      removeSkipLink('nav-menu');
    };
  }, [addSkipLink, removeSkipLink]);
  
  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
        announcePolite('Mobile menu closed');
      }
    };
    
    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen, announcePolite]);

  return (
    <nav 
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/95 backdrop-blur-md shadow-md' : 'bg-transparent'
      }`}
      aria-label="Main navigation"
      role="navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 group cursor-pointer"
            onClick={() => scrollToSection('#hero', 'Home')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                scrollToSection('#hero', 'Home');
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Optimum Solutions Group"
          >
            <div className="relative overflow-hidden">
              <img 
                src={logo} 
                alt="Optimum Solutions Group logo"
                className="h-10 w-10 relative z-10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 drop-shadow-lg"
                role="img"
              />
              {/* Multi-layered glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-primary opacity-0 group-hover:opacity-70 transition-all duration-500 rounded-xl blur-lg scale-150 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-secondary via-primary to-secondary opacity-0 group-hover:opacity-40 transition-all duration-700 rounded-xl blur-md scale-125"></div>
              <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-20 transition-all duration-300 rounded-lg blur-sm"></div>
              {/* Orbiting particles */}
              <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:animate-ping" style={{ transform: 'translate(-50%, -50%) rotate(0deg) translateX(20px)' }}></div>
              <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-secondary rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700" style={{ transform: 'translate(-50%, -50%) rotate(120deg) translateX(25px)', animationDelay: '0.2s' }}></div>
              <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-all duration-600" style={{ transform: 'translate(-50%, -50%) rotate(240deg) translateX(22px)', animationDelay: '0.4s' }}></div>
            </div>
            <div className="font-bold text-xl tracking-tight">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Optimum
              </span>
              <span className="text-foreground ml-1 font-light">
                Solutions
              </span>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-0.5">
                GROUP
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div 
            className="hidden md:flex items-center space-x-8"
            role="menubar"
            aria-label="Main navigation menu"
            id="nav-menu"
          >
            {navItems.map((item, index) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.href, item.label)}
                className="text-foreground hover:text-primary transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm px-2 py-1"
                role="menuitem"
                tabIndex={0}
                aria-label={`Navigate to ${item.label} section`}
              >
                {item.label}
              </button>
            ))}
            <Button 
              onClick={() => scrollToSection('#contact', 'Contact')}
              className="btn-hero"
              aria-label="Get free consultation - navigate to contact section"
            >
              Get Free Consultation
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            <span className="sr-only">
              {isMenuOpen ? 'Close menu' : 'Open menu'}
            </span>
            {isMenuOpen ? 
              <X size={24} aria-hidden="true" /> : 
              <Menu size={24} aria-hidden="true" />
            }
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div 
            ref={containerRef as React.RefObject<HTMLDivElement>}
            className="md:hidden pb-4 focus-trap"
            id="mobile-menu"
            role="menu"
            aria-label="Mobile navigation menu"
          >
            <div className="flex flex-col space-y-4" ref={mobileMenuRef}>
              {navItems.map((item, index) => (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.href, item.label)}
                  className="text-left text-foreground hover:text-primary transition-colors duration-200 font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  role="menuitem"
                  tabIndex={0}
                  aria-label={`Navigate to ${item.label} section`}
                >
                  {item.label}
                </button>
              ))}
              <Button 
                onClick={() => scrollToSection('#contact', 'Contact')}
                className="btn-hero w-full mt-4"
                aria-label="Get free consultation - navigate to contact section"
              >
                Get Free Consultation
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
});

// Display name for debugging
Navigation.displayName = 'Navigation';

export default Navigation;
