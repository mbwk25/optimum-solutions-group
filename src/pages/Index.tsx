import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import AboutSection from '@/components/AboutSection';
import ServicesSection from '@/components/ServicesSection';
import IoTSection from '@/components/IoTSection';
import ProjectEstimator from '@/components/ProjectEstimator';
import TestimonialsSection from '@/components/TestimonialsSection';
import PortfolioSection from '@/components/PortfolioSection';
import FAQSection from '@/components/FAQSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import CustomCursor from '@/components/CustomCursor';
import { LoadingScreen, usePageLoad } from '@/components/LoadingScreen';

const Index = () => {
  const isLoading = usePageLoad();
  
  // Monitor performance metrics
  usePerformanceMonitor();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <CustomCursor />
      <div className="min-h-screen">
        <Navigation />
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <IoTSection />
        <ProjectEstimator />
        <PortfolioSection />
        <TestimonialsSection />
        <FAQSection />
        <ContactSection />
        <Footer />
        <BackToTop />
      </div>
    </>
  );
};

export default Index;
