'use client';

import { useEffect } from 'react';

/**
 * Global chunk load error handler
 * Handles runtime chunk load failures and automatically retries or falls back gracefully
 */
export function ChunkErrorHandler() {
  useEffect(() => {
    // Handle chunk load errors globally
    const handleChunkError = (event: ErrorEvent) => {
      const error = event.error;
      
      // Check if it's a chunk load error
      if (
        error?.message?.includes('Loading chunk') ||
        error?.message?.includes('Failed to fetch dynamically imported module') ||
        error?.message?.includes('ChunkLoadError') ||
        error?.name === 'ChunkLoadError'
      ) {
        console.warn('Chunk load error detected, attempting recovery:', error);
        
        // Prevent default error handling
        event.preventDefault();
        
        // Try to reload the page after a short delay
        // This handles cases where chunks were updated and need to be re-fetched
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        
        return true;
      }
      
      return false;
    };

    // Handle unhandled promise rejections (common for dynamic imports)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      
      if (
        reason?.message?.includes('Loading chunk') ||
        reason?.message?.includes('Failed to fetch dynamically imported module') ||
        reason?.message?.includes('ChunkLoadError') ||
        reason?.name === 'ChunkLoadError'
      ) {
        console.warn('Chunk load error in promise rejection, attempting recovery:', reason);
        
        // Prevent default error handling
        event.preventDefault();
        
        // Try to reload the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        
        return true;
      }
      
      return false;
    };

    // Add event listeners
    window.addEventListener('error', handleChunkError, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleChunkError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}

