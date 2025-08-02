export const generateStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Optimum Solutions Group",
  "url": "https://optimumsolutions.dev",
  "logo": "https://optimumsolutions.dev/logo.png",
  "description": "Digital transformation and IoT solutions for ambitious businesses",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "US"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": "hello@optimumsolutions.dev"
  },
  "sameAs": [
    "https://linkedin.com/company/optimum-solutions-group",
    "https://github.com/optimum-solutions"
  ],
  "offers": {
    "@type": "Service",
    "serviceType": [
      "Custom Web Development",
      "Mobile App Development", 
      "IoT Solutions",
      "Digital Transformation",
      "Business Automation"
    ]
  },
  "foundingDate": "2024",
  "numberOfEmployees": "10-50",
  "industry": "Technology Services"
});

export const generateBreadcrumbs = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

export const generateFAQStructuredData = (faqs: Array<{ question: string; answer: string }>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage", 
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});