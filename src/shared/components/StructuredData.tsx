import React from 'react';

interface StructuredDataProps {
  data: Record<string, unknown>;
  type?: string;
}

const StructuredData: React.FC<StructuredDataProps> = ({ 
  data, 
  type = 'WebSite' 
}) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  );
};

export default StructuredData;