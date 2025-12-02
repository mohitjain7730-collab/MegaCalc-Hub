
'use client';

import React, { type ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { getSdks, FirebaseServices, initializeFirebaseOnClient } from '@/firebase';
import { Analytics } from "firebase/analytics";

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [firebaseServices, setFirebaseServices] = useState<{
    firebaseApp: any;
    auth: any;
    firestore: any;
    analytics: Analytics | null;
  } | null>(null);
  
  // Defer Firebase initialization until after page load to reduce TBT
  useEffect(() => {
    // Use requestIdleCallback for non-critical Firebase initialization
    const initFirebase = () => {
      const { firebaseApp, auth, firestore, analyticsPromise } = getSdks(initializeFirebaseOnClient());
      
      setFirebaseServices({
        firebaseApp,
        auth,
        firestore,
        analytics: null,
      });
      setIsInitialized(true);

      // Load analytics asynchronously after initialization with further delay
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          analyticsPromise.then(analyticsInstance => {
            if (analyticsInstance) {
              setAnalytics(analyticsInstance);
              setFirebaseServices(prev => prev ? { ...prev, analytics: analyticsInstance } : null);
            }
          });
        }, { timeout: 5000 });
      } else {
        setTimeout(() => {
          analyticsPromise.then(analyticsInstance => {
            if (analyticsInstance) {
              setAnalytics(analyticsInstance);
              setFirebaseServices(prev => prev ? { ...prev, analytics: analyticsInstance } : null);
            }
          });
        }, 2000);
      }
    };

    // Defer initialization to reduce blocking time - wait for page to be interactive
    if (typeof window !== 'undefined') {
      // Wait for page to be fully loaded and interactive
      if (document.readyState === 'complete') {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(initFirebase, { timeout: 3000 });
        } else {
          setTimeout(initFirebase, 500);
        }
      } else {
        window.addEventListener('load', () => {
          if ('requestIdleCallback' in window) {
            requestIdleCallback(initFirebase, { timeout: 3000 });
          } else {
            setTimeout(initFirebase, 500);
          }
        }, { once: true });
      }
    }
  }, []);

  // Return children immediately, Firebase will initialize in background
  if (!isInitialized || !firebaseServices) {
    return <>{children}</>;
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
      analytics={firebaseServices.analytics}
    >
      {children}
    </FirebaseProvider>
  );
}
