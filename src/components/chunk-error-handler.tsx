'use client';

import { useEffect } from 'react';

const CHUNK_RELOAD_KEY = 'chunk-reload-attempt';
const CHUNK_RELOAD_MAX_ATTEMPTS = 2;
const CHUNK_RELOAD_DELAY = 1500;
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Global chunk load error handler
 * Handles runtime chunk load failures and automatically retries or falls back gracefully
 * Prevents infinite reload loops with sessionStorage tracking
 */
export function ChunkErrorHandler() {
  useEffect(() => {
    // Check if we've already attempted reloads
    const getReloadAttempts = (): number => {
      try {
        const attempts = sessionStorage.getItem(CHUNK_RELOAD_KEY);
        return attempts ? parseInt(attempts, 10) : 0;
      } catch {
        return 0;
      }
    };

    const incrementReloadAttempts = (): number => {
      try {
        const attempts = getReloadAttempts() + 1;
        sessionStorage.setItem(CHUNK_RELOAD_KEY, attempts.toString());
        return attempts;
      } catch {
        return 1;
      }
    };

    const clearReloadAttempts = () => {
      try {
        sessionStorage.removeItem(CHUNK_RELOAD_KEY);
      } catch {
        // Ignore storage errors
      }
    };

    // Clear reload attempts on successful page load (after 2 seconds)
    const clearTimer = setTimeout(() => {
      clearReloadAttempts();
    }, 2000);

    // Handle chunk load errors globally
    const handleChunkError = (event: ErrorEvent) => {
      const error = event.error;
      
      // In development, completely disable auto-reload to prevent interference with form submissions
      if (isDevelopment) {
        // Just log errors in development, don't interfere
        if (error) {
          console.warn('Error in development (not reloading):', error);
        }
        return false;
      }
      
      // Check if it's a chunk load error (including timeout errors)
      const isChunkError = 
        error?.message?.includes('Loading chunk') ||
        error?.message?.includes('Failed to fetch dynamically imported module') ||
        error?.message?.includes('ChunkLoadError') ||
        error?.message?.includes('timeout') ||
        error?.name === 'ChunkLoadError' ||
        (error?.message && /chunk.*failed/i.test(error.message)) ||
        (error?.message && /loading.*chunk/i.test(error.message));
      
      if (isChunkError) {
        console.warn('Chunk load error detected, attempting recovery:', error);
        
        // Prevent default error handling
        event.preventDefault();
        event.stopPropagation();
        
        const attempts = getReloadAttempts();
        
        if (attempts < CHUNK_RELOAD_MAX_ATTEMPTS) {
          const newAttempts = incrementReloadAttempts();
          console.log(`Chunk reload attempt ${newAttempts}/${CHUNK_RELOAD_MAX_ATTEMPTS}`);
          
          // Reload with cache bypass to get fresh chunks
          setTimeout(() => {
            window.location.reload();
          }, CHUNK_RELOAD_DELAY);
        } else {
          console.error('Max chunk reload attempts reached. Clearing cache and reloading...');
          // Clear all session storage and reload with cache bypass
          try {
            sessionStorage.clear();
            // Force reload with cache bypass
            window.location.href = window.location.href.split('#')[0] + '?t=' + Date.now();
          } catch {
            window.location.reload();
          }
        }
        
        return true;
      }
      
      return false;
    };

    // Handle unhandled promise rejections (common for dynamic imports)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      
      // In development, completely disable auto-reload to prevent interference with form submissions
      if (isDevelopment) {
        // Just log errors in development, don't interfere
        if (reason) {
          console.warn('Promise rejection in development (not reloading):', reason);
        }
        return false;
      }
      
      const isChunkError = 
        reason?.message?.includes('Loading chunk') ||
        reason?.message?.includes('Failed to fetch dynamically imported module') ||
        reason?.message?.includes('ChunkLoadError') ||
        reason?.message?.includes('timeout') ||
        reason?.name === 'ChunkLoadError' ||
        (reason?.message && /chunk.*failed/i.test(reason.message)) ||
        (reason?.message && /loading.*chunk/i.test(reason.message));
      
      if (isChunkError) {
        console.warn('Chunk load error in promise rejection, attempting recovery:', reason);
        
        // Prevent default error handling
        event.preventDefault();
        
        const attempts = getReloadAttempts();
        
        if (attempts < CHUNK_RELOAD_MAX_ATTEMPTS) {
          const newAttempts = incrementReloadAttempts();
          console.log(`Chunk reload attempt ${newAttempts}/${CHUNK_RELOAD_MAX_ATTEMPTS}`);
          
          setTimeout(() => {
            window.location.reload();
          }, CHUNK_RELOAD_DELAY);
        } else {
          console.error('Max chunk reload attempts reached. Clearing cache and reloading...');
          try {
            sessionStorage.clear();
            window.location.href = window.location.href.split('#')[0] + '?t=' + Date.now();
          } catch {
            window.location.reload();
          }
        }
        
        return true;
      }
      
      return false;
    };

    // Add event listeners with capture phase for early interception
    window.addEventListener('error', handleChunkError, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      clearTimeout(clearTimer);
      window.removeEventListener('error', handleChunkError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}

