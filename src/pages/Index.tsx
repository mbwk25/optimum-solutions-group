import React, { lazy, Suspense } from 'react';
import Navigation from '@/features/navigation/Navigation';
import HeroSection from '@/features/hero/HeroSection';
import CustomCursor from '@/shared/components/CustomCursor';
import { LoadingScreen } from '@/shared/components/LoadingScreen';
import { usePageLoad } from '@/shared/components/LoadingScreen';
import SEOHead from '@/shared/components/optimized/SEOHead';
import { generateStructuredData } from '@/shared/utils/seo';

// Critical sections (above the fold) - loaded immediately
// Navigation and HeroSection are already imported above

// Below-the-fold sections - lazy loaded for better performance
const AboutSection = lazy(() => import('@/features/about/AboutSection'));
const ServicesSection = lazy(() => import('@/features/services/ServicesSection'));
const IoTSection = lazy(() => import('@/features/iot-solutions/IoTSection'));
const ProjectEstimator = lazy(() => import('@/shared/components/ProjectEstimator'));
const TestimonialsSection = lazy(() => import('@/features/testimonials/TestimonialsSection'));
const PortfolioSection = lazy(() => import('@/features/portfolio/PortfolioSection'));
const FAQSection = lazy(() => import('@/shared/components/FAQSection'));
const ContactSection = lazy(() => import('@/features/contact/ContactSection'));
const Footer = lazy(() => import('@/shared/components/Footer'));
const BackToTop = lazy(() => import('@/shared/components/BackToTop'));

// Loading fallback for sections
const SectionFallback = () => (
  <div className="flex justify-center items-center h-32">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
      <CustomCursor />
      <div className="min-h-screen">
        <Navigation />
        <HeroSection />
        
        {/* Below-the-fold sections with lazy loading */}
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
        
        <Suspense fallback={<SectionFallback />}>
          <Footer />
        </Suspense>
        
        <Suspense fallback={<SectionFallback />}>
          <BackToTop />
        </Suspense>
      </div>
    </>
  );
};

export default Index;
