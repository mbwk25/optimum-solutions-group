/**
 * Structured Data Components
 * Reusable React components for JSON-LD structured data injection
 */

import React, { useEffect, useRef } from 'react';
import { 
  Organization, 
  WebPage, 
  Article, 
  BreadcrumbList, 
  FAQPage, 
  LocalBusiness,
  Product,
  Service,
  Person,
  Review,
  WithContext,
  Thing
} from 'schema-dts';
import { generateOrganizationSchema, generateWebPageSchema, generateArticleSchema, SEO_CONFIG } from '../utils/seo';

// ====================================================
// Base Structured Data Component
// ====================================================

interface BaseStructuredDataProps {
  data: WithContext<Thing>;
  id?: string;
  replace?: boolean;
}

const BaseStructuredData: React.FC<BaseStructuredDataProps> = ({ 
  data, 
  id = 'structured-data', 
  replace = false 
}) => {
  const scriptRef = useRef<HTMLScriptElement>();

  useEffect(() => {
    // Clean up existing script if replacing
    if (replace && scriptRef.current) {
      document.head.removeChild(scriptRef.current);
    }

    // Create new script element
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    script.textContent = JSON.stringify(data, null, 2);
    
    // Add to document head
    document.head.appendChild(script);
    scriptRef.current = script;

    // Cleanup function
    return () => {
      if (scriptRef.current && document.head.contains(scriptRef.current)) {
        document.head.removeChild(scriptRef.current);
      }
    };
  }, [data, id, replace]);

  return null; // This component doesn't render anything visible
};

// ====================================================
// Organization Schema Component
// ====================================================

interface OrganizationSchemaProps {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  contactPoint?: {
    telephone?: string;
    email?: string;
    contactType?: string;
    availableLanguage?: string[];
  };
  sameAs?: string[];
  foundingDate?: string;
  numberOfEmployees?: string;
  industry?: string;
  services?: string[];
}

export const OrganizationSchema: React.FC<OrganizationSchemaProps> = ({
  name = SEO_CONFIG.organization.name,
  url = SEO_CONFIG.organization.url,
  logo = SEO_CONFIG.organization.logo,
  description,
  address,
  contactPoint,
  sameAs = SEO_CONFIG.organization.sameAs,
  foundingDate,
  numberOfEmployees,
  industry,
  services
}) => {
  const organizationData: WithContext<Organization> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    ...(description && { description }),
    ...(address && {
      address: {
        '@type': 'PostalAddress',
        ...address
      }
    }),
    ...(contactPoint && {
      contactPoint: {
        '@type': 'ContactPoint',
        ...contactPoint
      }
    }),
    sameAs,
    ...(foundingDate && { foundingDate }),
    ...(numberOfEmployees && { numberOfEmployees }),
    ...(industry && { industry }),
    ...(services && {
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Services',
        itemListElement: services.map(service => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: service
          }
        }))
      }
    })
  };

  return <BaseStructuredData data={organizationData} id="organization-schema" />;
};

// ====================================================
// Web Page Schema Component
// ====================================================

interface WebPageSchemaProps {
  name: string;
  description: string;
  url?: string;
  breadcrumb?: Array<{ name: string; url: string }>;
  author?: string;
  datePublished?: string;
  dateModified?: string;
  inLanguage?: string;
  keywords?: string[];
}

export const WebPageSchema: React.FC<WebPageSchemaProps> = ({
  name,
  description,
  url,
  breadcrumb,
  author,
  datePublished,
  dateModified,
  inLanguage = 'en-US',
  keywords
}) => {
  const currentUrl = url || `${SEO_CONFIG.siteUrl}${window.location.pathname}`;
  
  const webPageData: WithContext<WebPage> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url: currentUrl,
    inLanguage,
    isPartOf: {
      '@type': 'WebSite',
      name: SEO_CONFIG.siteName,
      url: SEO_CONFIG.siteUrl
    },
    ...(author && {
      author: {
        '@type': 'Organization',
        name: author
      }
    }),
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified }),
    ...(keywords && { keywords: keywords.join(', ') }),
    ...(breadcrumb && {
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumb.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url
        }))
      }
    })
  };

  return <BaseStructuredData data={webPageData} id="webpage-schema" />;
};

// ====================================================
// Article Schema Component
// ====================================================

interface ArticleSchemaProps {
  headline: string;
  description: string;
  url?: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author?: {
    name: string;
    url?: string;
  };
  publisher?: {
    name: string;
    logo: string;
  };
  articleSection?: string;
  keywords?: string[];
  wordCount?: number;
  readingTime?: string;
}

export const ArticleSchema: React.FC<ArticleSchemaProps> = ({
  headline,
  description,
  url,
  image,
  datePublished,
  dateModified,
  author,
  publisher,
  articleSection,
  keywords,
  wordCount,
  readingTime
}) => {
  const currentUrl = url || `${SEO_CONFIG.siteUrl}${window.location.pathname}`;
  const articleImage = image?.startsWith('http') ? image : `${SEO_CONFIG.siteUrl}${image}`;
  
  const articleData: WithContext<Article> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    url: currentUrl,
    ...(articleImage && { 
      image: {
        '@type': 'ImageObject',
        url: articleImage
      }
    }),
    datePublished,
    dateModified: dateModified || datePublished,
    author: author ? {
      '@type': author.url ? 'Person' : 'Organization',
      name: author.name,
      ...(author.url && { url: author.url })
    } : {
      '@type': 'Organization',
      name: SEO_CONFIG.organization.name
    },
    publisher: publisher || {
      '@type': 'Organization',
      name: SEO_CONFIG.organization.name,
      logo: {
        '@type': 'ImageObject',
        url: SEO_CONFIG.organization.logo
      }
    },
    ...(articleSection && { articleSection }),
    ...(keywords && { keywords: keywords.join(', ') }),
    ...(wordCount && { wordCount }),
    ...(readingTime && {
      additionalProperty: {
        '@type': 'PropertyValue',
        name: 'readingTime',
        value: readingTime
      }
    })
  };

  return <BaseStructuredData data={articleData} id="article-schema" />;
};

// ====================================================
// Breadcrumb Schema Component
// ====================================================

interface BreadcrumbSchemaProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export const BreadcrumbSchema: React.FC<BreadcrumbSchemaProps> = ({ items }) => {
  const breadcrumbData: WithContext<BreadcrumbList> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SEO_CONFIG.siteUrl}${item.url}`
    }))
  };

  return <BaseStructuredData data={breadcrumbData} id="breadcrumb-schema" />;
};

// ====================================================
// FAQ Schema Component
// ====================================================

interface FAQSchemaProps {
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export const FAQSchema: React.FC<FAQSchemaProps> = ({ faqs }) => {
  const faqData: WithContext<FAQPage> = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  return <BaseStructuredData data={faqData} id="faq-schema" />;
};

// ====================================================
// Local Business Schema Component
// ====================================================

interface LocalBusinessSchemaProps {
  name: string;
  description?: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  telephone?: string;
  email?: string;
  url?: string;
  openingHours?: string[];
  priceRange?: string;
  image?: string[];
  geo?: {
    latitude: number;
    longitude: number;
  };
  review?: Array<{
    author: string;
    datePublished: string;
    reviewBody: string;
    reviewRating: number;
  }>;
}

export const LocalBusinessSchema: React.FC<LocalBusinessSchemaProps> = ({
  name,
  description,
  address,
  telephone,
  email,
  url,
  openingHours,
  priceRange,
  image,
  geo,
  review
}) => {
  const businessData: WithContext<LocalBusiness> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name,
    ...(description && { description }),
    address: {
      '@type': 'PostalAddress',
      ...address
    },
    ...(telephone && { telephone }),
    ...(email && { email }),
    ...(url && { url }),
    ...(openingHours && { openingHours }),
    ...(priceRange && { priceRange }),
    ...(image && { image }),
    ...(geo && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: geo.latitude,
        longitude: geo.longitude
      }
    }),
    ...(review && {
      review: review.map(rev => ({
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: rev.author
        },
        datePublished: rev.datePublished,
        reviewBody: rev.reviewBody,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: rev.reviewRating,
          bestRating: 5
        }
      }))
    })
  };

  return <BaseStructuredData data={businessData} id="local-business-schema" />;
};

// ====================================================
// Product Schema Component
// ====================================================

interface ProductSchemaProps {
  name: string;
  description: string;
  image?: string[];
  brand?: string;
  model?: string;
  sku?: string;
  price?: string;
  priceCurrency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  condition?: 'NewCondition' | 'UsedCondition' | 'RefurbishedCondition';
  review?: Array<{
    author: string;
    datePublished: string;
    reviewBody: string;
    reviewRating: number;
  }>;
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}

export const ProductSchema: React.FC<ProductSchemaProps> = ({
  name,
  description,
  image,
  brand,
  model,
  sku,
  price,
  priceCurrency = 'USD',
  availability = 'InStock',
  condition = 'NewCondition',
  review,
  aggregateRating
}) => {
  const productData: WithContext<Product> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    ...(image && { image }),
    ...(brand && { brand }),
    ...(model && { model }),
    ...(sku && { sku }),
    ...(price && {
      offers: {
        '@type': 'Offer',
        price,
        priceCurrency,
        availability: `https://schema.org/${availability}`,
        itemCondition: `https://schema.org/${condition}`
      }
    }),
    ...(review && {
      review: review.map(rev => ({
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: rev.author
        },
        datePublished: rev.datePublished,
        reviewBody: rev.reviewBody,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: rev.reviewRating,
          bestRating: 5
        }
      }))
    }),
    ...(aggregateRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: aggregateRating.ratingValue,
        reviewCount: aggregateRating.reviewCount
      }
    })
  };

  return <BaseStructuredData data={productData} id="product-schema" />;
};

// ====================================================
// Service Schema Component
// ====================================================

interface ServiceSchemaProps {
  name: string;
  description: string;
  provider?: {
    name: string;
    url?: string;
  };
  serviceType: string;
  areaServed?: string | string[];
  serviceUrl?: string;
  image?: string;
  priceRange?: string;
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
  review?: Array<{
    author: string;
    datePublished: string;
    reviewBody: string;
    reviewRating: number;
  }>;
}

export const ServiceSchema: React.FC<ServiceSchemaProps> = ({
  name,
  description,
  provider,
  serviceType,
  areaServed,
  serviceUrl,
  image,
  priceRange,
  aggregateRating,
  review
}) => {
  const serviceData: WithContext<Service> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    serviceType,
    provider: provider ? {
      '@type': 'Organization',
      name: provider.name,
      ...(provider.url && { url: provider.url })
    } : {
      '@type': 'Organization',
      name: SEO_CONFIG.organization.name,
      url: SEO_CONFIG.organization.url
    },
    ...(areaServed && { areaServed }),
    ...(serviceUrl && { url: serviceUrl }),
    ...(image && { image }),
    ...(priceRange && { priceRange }),
    ...(aggregateRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: aggregateRating.ratingValue,
        reviewCount: aggregateRating.reviewCount
      }
    }),
    ...(review && {
      review: review.map(rev => ({
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: rev.author
        },
        datePublished: rev.datePublished,
        reviewBody: rev.reviewBody,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: rev.reviewRating,
          bestRating: 5
        }
      }))
    })
  };

  return <BaseStructuredData data={serviceData} id="service-schema" />;
};

// ====================================================
// Multiple Schemas Container
// ====================================================

interface MultipleSchemaProps {
  schemas: WithContext<Thing>[];
  id?: string;
}

export const MultipleSchema: React.FC<MultipleSchemaProps> = ({ 
  schemas, 
  id = 'multiple-schema' 
}) => {
  const multipleData = schemas.length === 1 ? schemas[0] : schemas;
  
  return <BaseStructuredData data={multipleData as WithContext<Thing>} id={id} />;
};

// ====================================================
// Higher-Order Component for Automatic Schema
// ====================================================

interface WithSchemaProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageDescription?: string;
  breadcrumbs?: Array<{ name: string; url: string }>;
  includeOrganization?: boolean;
}

export const WithSchema: React.FC<WithSchemaProps> = ({
  children,
  pageTitle,
  pageDescription,
  breadcrumbs,
  includeOrganization = true
}) => {
  return (
    <>
      {includeOrganization && <OrganizationSchema />}
      {pageTitle && pageDescription && (
        <WebPageSchema
          name={pageTitle}
          description={pageDescription}
          breadcrumb={breadcrumbs}
        />
      )}
      {breadcrumbs && breadcrumbs.length > 1 && (
        <BreadcrumbSchema items={breadcrumbs} />
      )}
      {children}
    </>
  );
};

// Note: The useStructuredData hook has been moved to src/shared/hooks/useStructuredData.ts
// to fix React Fast Refresh warnings.

export default BaseStructuredData;
