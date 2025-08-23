import React, { lazy, Suspense } from 'react';
import Navigation from '@/features/navigation/Navigation';
import HeroSection from '@/features/hero/HeroSection';
import CustomCursor from '@/shared/components/CustomCursor';
import { LoadingScreen } from '@/shared/components/LoadingScreen';
import { usePageLoad } from '@/shared/components/LoadingScreen';
import SEOHead from '@/shared/components/optimized/SEOHead';
import { generateStructuredData } from '@/shared/utils/seo';
import { PageTitleAnnouncer } from '@/shared/components/AccessibilityProvider';

// Critical sections (above the fold) - loaded immediately
// Navigation and HeroSection are already imported above

// Import enhanced lazy loading utilities
import { lazyWithMetrics, lazyWithPreload } from '@/shared/utils/dynamicImports';

// Below-the-fold sections - enhanced lazy loaded with metrics
const AboutSection = lazyWithPreload(
  () => import('@/features/about/AboutSection'),
  () => window.innerHeight > 600 // Preload on larger screens
);

const ServicesSection = lazyWithMetrics(
  () => import('@/features/services/ServicesSection'),
  'ServicesSection'
);

const IoTSection = lazyWithMetrics(
  () => import('@/features/iot-solutions/IoTSection'),
  'IoTSection'
);

const ProjectEstimator = lazyWithMetrics(
  () => import('@/shared/components/ProjectEstimator'),
  'ProjectEstimator'
);

const TestimonialsSection = lazyWithMetrics(
  () => import('@/features/testimonials/TestimonialsSection'),
  'TestimonialsSection'
);

const PortfolioSection = lazyWithMetrics(
  () => import('@/features/portfolio/PortfolioSection'),
  'PortfolioSection'
);

const FAQSection = lazyWithMetrics(
  () => import('@/shared/components/FAQSection'),
  'FAQSection'
);

const ContactSection = lazyWithMetrics(
  () => import('@/features/contact/ContactSection'),
  'ContactSection'
);

const Footer = lazyWithMetrics(
  () => import('@/shared/components/Footer'),
  'Footer'
);

const BackToTop = lazyWithMetrics(
  () => import('@/shared/components/BackToTop'),
  'BackToTop'
);

// Loading fallback for sections with accessibility
const SectionFallback = () => (
  <div 
    className="flex justify-center items-center h-32"
    role="status"
    aria-label="Loading section content"
  >
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" aria-hidden="true"></div>
    <span className="sr-only">Loading section content...</span>
  </div>
);

const Index = () => {
  const isLoading = usePageLoad();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <SEOHead
        title="Optimum Solutions Group - Digital Transformation & IoT Solutions"
        description="Transform your business with custom software, IoT systems, and digital solutions. We help ambitious businesses drive real, measurable results through innovative technology."
        keywords={['digital transformation', 'IoT solutions', 'custom software', 'business automation', 'web development', 'mobile apps']}
        structuredData={generateStructuredData()}
      />
      <PageTitleAnnouncer title="Optimum Solutions Group - Digital Transformation & IoT Solutions" />
      <CustomCursor />
      <div className="min-h-screen">
        <Navigation />
        <HeroSection />
        
        {/* Main content area with proper landmark structure */}
        <main id="main" role="main">
          <Suspense fallback={<SectionFallback />}>
            <AboutSection />
          </Suspense>
          
          <Suspense fallback={<SectionFallback />}>
            <ServicesSection />
          </Suspense>
          
          <Suspense fallback={<SectionFallback />}>
            <IoTSection />
          </Suspense>
          
          <Suspense fallback={<SectionFallback />}>
            <ProjectEstimator />
          </Suspense>
          
          <Suspense fallback={<SectionFallback />}>
            <PortfolioSection />
          </Suspense>
          
          <Suspense fallback={<SectionFallback />}>
            <TestimonialsSection />
          </Suspense>
          
          <Suspense fallback={<SectionFallback />}>
            <FAQSection />
          </Suspense>
          
          <Suspense fallback={<SectionFallback />}>
            <ContactSection />
          </Suspense>
        </main>
        
        {/* Site footer */}
        <Suspense fallback={<SectionFallback />}>
          <Footer />
        </Suspense>
        
        {/* Utility components */}
        <Suspense fallback={<SectionFallback />}>
          <BackToTop />
        </Suspense>
      </div>
    </>
  );
};

export default Index;
