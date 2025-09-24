import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  structuredData?: object;
  canonicalUrl?: string;
}

/**
 * SEO-optimized head component with structured data and meta tags
 */
export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'Optimum Solutions Group - Business Transformation Through Technology',
  description = 'Transform your business with custom software, IoT systems, and digital solutions. Expert development team delivering measurable results for ambitious companies.',
  keywords = ['business transformation', 'custom software', 'IoT solutions', 'digital transformation', 'software development', 'technology consulting'],
  image = '/og-image.jpg',
  url = typeof window !== 'undefined' ? window.location.href : '',
  type = 'website',
  structuredData,
  canonicalUrl,
}) => {
  const fullTitle = title.includes('Optimum Solutions Group') ? title : `${title} | Optimum Solutions Group`;
  
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Optimum Solutions Group",
    "description": description,
    "url": url,
    "logo": `${url}/logo.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "business",
      "email": "info@optimumsolutionsgroup.com"
    },
    "sameAs": [
      "https://linkedin.com/company/optimum-solutions-group",
      "https://github.com/optimum-solutions-group"
    ],
    "offers": {
      "@type": "Offer",
      "description": "Custom software development, IoT solutions, and digital transformation services"
    }
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="author" content="Optimum Solutions Group" />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Optimum Solutions Group" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#0066cc" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="OSG" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData || defaultStructuredData)}
      </script>
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </Helmet>
  );
};

export default SEOHead;