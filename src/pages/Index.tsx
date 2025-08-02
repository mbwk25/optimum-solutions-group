import React from 'react';
import {
  Navigation,
  HeroSection,
  AboutSection,
  ServicesSection,
  IoTSection,
  ProjectEstimator,
  TestimonialsSection,
  PortfolioSection,
  FAQSection,
  ContactSection,
  Footer,
  BackToTop,
  CustomCursor,
  LoadingScreen
} from '@/components';
import { usePageLoad } from '@/components/LoadingScreen';
import SEOHead from '@/components/optimized/SEOHead';
import { generateStructuredData } from '@/utils/seo';

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
