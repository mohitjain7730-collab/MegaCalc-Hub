'use client';

import { useEffect } from 'react';

interface ArticleSchemaInjectorProps {
  schema?: any;
}

export function ArticleSchemaInjector({ schema }: ArticleSchemaInjectorProps) {
  useEffect(() => {
    if (!schema) return;

    try {
      // Validate and stringify schema safely
      const schemaString = JSON.stringify(schema);
      
      // Create the script tag
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = schemaString;
      script.id = 'article-schema';

      // Remove existing schema if present
      const existingScript = document.getElementById('article-schema');
      if (existingScript) {
        existingScript.remove();
      }

      // Append to head
      document.head.appendChild(script);

      // Cleanup function
      return () => {
        const scriptToRemove = document.getElementById('article-schema');
        if (scriptToRemove) {
          scriptToRemove.remove();
        }
      };
    } catch (error) {
      // Silently fail if schema serialization fails
      console.error('Failed to inject article schema:', error);
    }
  }, [schema]);

  return null;
}


