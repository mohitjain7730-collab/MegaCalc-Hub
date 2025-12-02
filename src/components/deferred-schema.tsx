'use client';

import { useEffect } from 'react';

interface DeferredSchemaProps {
  schema: object;
  id?: string;
}

export function DeferredSchema({ schema, id = 'deferred-schema' }: DeferredSchemaProps) {
  useEffect(() => {
    // Inject schema after page load to avoid blocking
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = id;
      script.text = JSON.stringify(schema);
      
      // Remove existing if present
      const existing = document.getElementById(id);
      if (existing) {
        existing.remove();
      }
      
      document.head.appendChild(script);
      
      return () => {
        const toRemove = document.getElementById(id);
        if (toRemove) {
          toRemove.remove();
        }
      };
    }
  }, [schema, id]);

  return null;
}

