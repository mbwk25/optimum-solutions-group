import React, { useState, useEffect, useCallback, memo } from 'react';
import { Button } from '@/shared/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import heroBackground from '@/assets/hero-background-optimized.jpg';
import ParticleSystem from '@/shared/components/ParticleSystem';
import OptimizedImage from '@/shared/components/optimized/OptimizedImage';

const HeroSection: React.FC = memo(() => {
  // Memoized scroll functions to prevent re-creation on every render
  const scrollToContact = useCallback(() => {
    const element: HTMLElement | null = document.querySelector('#contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const scrollToServices = useCallback(() => {
    const element: HTMLElement | null = document.querySelector('#services');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/80 via-background/60 to-background/80" />
        <div className="absolute inset-0 -z-20 overflow-hidden">
          <OptimizedImage
            src={heroBackground}
            alt="Digital workspace"
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
        <ParticleSystem />
      </div>

      {/* Content - Minimalist centered layout inspired by Amp */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center max-w-5xl mx-auto">
            {/* Main headline with elegant serif typography */}
            <h1 className="mb-8 fade-in-up">
              <span className="block font-playfair italic text-6xl md:text-8xl lg:text-9xl font-light text-foreground leading-tight mb-2">
                Everything
              </span>
              <span className="block font-playfair italic text-6xl md:text-8xl lg:text-9xl font-light text-foreground leading-tight mb-4">
                is changing.
              </span>
              <span className="block font-inter text-xl md:text-2xl lg:text-3xl font-normal text-foreground/90 mt-8 leading-relaxed">
                Your business needs to evolve.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl mb-12 text-foreground/80 leading-relaxed fade-in-up stagger-1 max-w-3xl mx-auto font-light">
              Optimum Solutions Group helps ambitious businesses transform their operations with custom software, IoT systems, and digital solutions that drive real, measurable results.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center fade-in-up stagger-2">
              <Button 
                onClick={scrollToContact}
                size="lg"
                className="btn-hero text-lg px-12 py-6 h-auto font-medium tracking-wide"
              >
                Start Your Transformation
              </Button>
              
              <Button 
                onClick={scrollToServices}
                variant="outline" 
                size="lg"
                className="text-lg px-12 py-6 h-auto border-foreground/20 text-foreground hover:bg-foreground/10 hover:border-foreground/40 backdrop-blur-sm font-medium tracking-wide"
              >
                Explore Solutions
              </Button>
            </div>

            {/* Subtle stats section */}
            <div className="flex items-center justify-center gap-12 text-foreground/60 fade-in-up stagger-3 mt-16 text-sm font-light">
              <div className="text-center">
                <div className="text-2xl font-playfair text-secondary mb-1">100+</div>
                <div>Connected Devices</div>
              </div>
              <div className="w-px h-8 bg-foreground/20"></div>
              <div className="text-center">
                <div className="text-2xl font-playfair text-secondary mb-1">50+</div>
                <div>Successful Projects</div>
              </div>
              <div className="w-px h-8 bg-foreground/20"></div>
              <div className="text-center">
                <div className="text-2xl font-playfair text-secondary mb-1">3x</div>
                <div>Efficiency Improvement</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-foreground/60 animate-bounce">
        <div className="w-6 h-10 border-2 border-foreground/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-foreground/60 rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  );
});

// Display name for debugging
HeroSection.displayName = 'HeroSection';

export default HeroSection;
