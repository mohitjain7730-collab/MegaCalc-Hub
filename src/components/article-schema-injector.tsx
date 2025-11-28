'use client';

import { useEffect } from 'react';

interface ArticleSchemaInjectorProps {
  schema?: any;
}

export function ArticleSchemaInjector({ schema }: ArticleSchemaInjectorProps) {
  useEffect(() => {
    if (!schema) return;

    // Create the script tag
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
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
  }, [schema]);

  return null;
}


