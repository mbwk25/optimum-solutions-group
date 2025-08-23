import React, { useState, useEffect, useCallback, memo } from 'react';
import { Button } from '@/shared/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import heroBackground from '@/assets/hero-background-optimized.jpg';
import ParticleSystem from '@/shared/components/ParticleSystem';
import OptimizedImage from '@/shared/components/optimized/OptimizedImage';
import { useAccessibilityContext } from '@/shared/components/AccessibilityProvider';

const HeroSection: React.FC = memo(() => {
  const { prefersReducedMotion, announcePolite } = useAccessibilityContext();
  // Memoized scroll functions with accessibility improvements
  const scrollToContact = useCallback(() => {
    const element: HTMLElement | null = document.querySelector('#contact');
    if (element) {
      const behavior = prefersReducedMotion ? 'auto' : 'smooth';
      element.scrollIntoView({ behavior });
      
      // Make target focusable and focus it
      if (element.tabIndex < 0) {
        element.tabIndex = -1;
      }
      element.focus();
      announcePolite('Navigated to contact section');
    }
  }, [prefersReducedMotion, announcePolite]);

  const scrollToServices = useCallback(() => {
    const element: HTMLElement | null = document.querySelector('#services');
    if (element) {
      const behavior = prefersReducedMotion ? 'auto' : 'smooth';
      element.scrollIntoView({ behavior });
      
      // Make target focusable and focus it
      if (element.tabIndex < 0) {
        element.tabIndex = -1;
      }
      element.focus();
      announcePolite('Navigated to services section');
    }
  }, [prefersReducedMotion, announcePolite]);

  return (
    <section 
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
      aria-labelledby="hero-heading"
      role="banner"
    >
      {/* Background */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/80 via-background/60 to-background/80" />
        <div className="absolute inset-0 -z-20 overflow-hidden">
          <OptimizedImage
            src={heroBackground}
            alt="Modern digital workspace with technology elements representing business transformation"
            className="w-full h-full object-cover opacity-20 transition-opacity duration-700 ease-in-out"
            priority
            loading="eager"
            quality={75}
            width={1920}
            height={1080}
            style={{
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundColor: '#1a1a1a',
            }}
          />
        </div>
        {!prefersReducedMotion && <ParticleSystem />}
      </div>

      {/* Content - Minimalist centered layout inspired by Amp */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center max-w-5xl mx-auto">
            {/* Main headline with elegant serif typography */}
            <h1 id="hero-heading" className="mb-8 fade-in-up">
              <span className="block font-playfair italic text-6xl md:text-8xl lg:text-9xl font-light text-foreground leading-tight mb-2">
                Everything
              </span>
              <span className="block font-playfair italic text-6xl md:text-8xl lg:text-9xl font-light text-foreground leading-tight mb-4">
                is changing.
              </span>
              <span className="block font-inter text-xl md:text-2xl lg:text-3xl font-normal text-foreground/90 mt-8 leading-relaxed">
                Your business needs to evolve.
              </span>
              <span className="sr-only">
                Welcome to Optimum Solutions Group - We help businesses transform with technology.
              </span>
            </h1>
            
            <p 
              className="text-lg md:text-xl mb-12 text-foreground/80 leading-relaxed fade-in-up stagger-1 max-w-3xl mx-auto font-light"
              role="text"
              aria-describedby="hero-heading"
            >
              Optimum Solutions Group helps ambitious businesses transform their operations with custom software, IoT systems, and digital solutions that drive real, measurable results.
            </p>

            <div 
              className="flex flex-col sm:flex-row gap-6 justify-center items-center fade-in-up stagger-2"
              role="group"
              aria-label="Call to action buttons"
            >
              <Button 
                onClick={scrollToContact}
                size="lg"
                className="btn-hero text-lg px-12 py-6 h-auto font-medium tracking-wide"
                aria-label="Start your business transformation - contact us"
              >
                Start Your Transformation
              </Button>
              
              <Button 
                onClick={scrollToServices}
                variant="outline" 
                size="lg"
                className="text-lg px-12 py-6 h-auto border-foreground/20 text-foreground hover:bg-foreground/10 hover:border-foreground/40 backdrop-blur-sm font-medium tracking-wide"
                aria-label="Learn about our solutions and services"
              >
                Explore Solutions
              </Button>
            </div>

            {/* Subtle stats section */}
            <div 
              className="flex items-center justify-center gap-12 text-foreground/60 fade-in-up stagger-3 mt-16 text-sm font-light"
              role="group"
              aria-label="Company achievements and statistics"
            >
              <div className="text-center">
                <div 
                  className="text-2xl font-playfair text-secondary mb-1"
                  aria-label="Over 100 connected devices managed"
                >
                  100+
                </div>
                <div>Connected Devices</div>
              </div>
              <div className="w-px h-8 bg-foreground/20" aria-hidden="true"></div>
              <div className="text-center">
                <div 
                  className="text-2xl font-playfair text-secondary mb-1"
                  aria-label="Over 50 successful projects completed"
                >
                  50+
                </div>
                <div>Successful Projects</div>
              </div>
              <div className="w-px h-8 bg-foreground/20" aria-hidden="true"></div>
              <div className="text-center">
                <div 
                  className="text-2xl font-playfair text-secondary mb-1"
                  aria-label="3 times efficiency improvement on average"
                >
                  3x
                </div>
                <div>Efficiency Improvement</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-foreground/60 animate-bounce"
        aria-label="Scroll down to continue"
        role="img"
      >
        <div className="w-6 h-10 border-2 border-foreground/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-foreground/60 rounded-full mt-2"></div>
        </div>
        <span className="sr-only">Scroll down for more content</span>
      </div>
    </section>
  );
});

// Display name for debugging
HeroSection.displayName = 'HeroSection';

export default HeroSection;
