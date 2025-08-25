/**
 * Structured Data Custom Hook
 * Custom hook for dynamic schema management
 * Moved from StructuredData.tsx to fix React Fast Refresh warnings
 */

import { WithContext, Thing } from 'schema-dts';

export const useStructuredData = () => {
  const addSchema = (data: WithContext<Thing>, id?: string) => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    if (id) script.id = id;
    script.textContent = JSON.stringify(data, null, 2);
    document.head.appendChild(script);
    
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  };

  const removeSchema = (id: string) => {
    const script = document.getElementById(id);
    if (script && document.head.contains(script)) {
      document.head.removeChild(script);
    }
  };

  return { addSchema, removeSchema };
};
