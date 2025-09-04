// Simplified SEO utilities
export interface SEOMetaTag {
  name?: string;
  property?: string;
  content: string;
}

export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
}

export const SEO_CONFIG = {
  defaultTitle: 'Optimum Solutions Group',
  defaultDescription: 'Professional services and solutions',
  siteName: 'Optimum Solutions Group',
  siteUrl: 'https://example.com',
  twitterHandle: '@optimumsolutions',
};

export const generateStructuredData = (data: any) => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": data.siteName || "Website",
    "url": data.url || window.location.href,
    ...data
  };
};

export const updateMetaTags = (seoData: SEOData) => {
  if (seoData.title) {
    document.title = seoData.title;
  }
  
  if (seoData.description) {
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', seoData.description);
  }
};