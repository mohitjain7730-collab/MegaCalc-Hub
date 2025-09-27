
'use client';

import React, { type ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { getSdks, FirebaseServices, initializeFirebaseOnClient } from '@/firebase'; // Import getSdks and initializer
import { Analytics } from "firebase/analytics";

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  
  // Memoize the initialization of Firebase and its core services
  const { firebaseApp, auth, firestore, analyticsPromise } = useMemo(() => {
    const app = initializeFirebaseOnClient();
    return getSdks(app);
  }, []);

  // Effect to resolve the analytics promise and update state
  useEffect(() => {
    analyticsPromise.then(analyticsInstance => {
      if (analyticsInstance) {
        setAnalytics(analyticsInstance);
      }
    });
  }, [analyticsPromise]);

  // Memoize the final context value, including the resolved analytics instance
  const services = useMemo(() => ({
    firebaseApp,
    auth,
    firestore,
    analytics,
  }), [firebaseApp, auth, firestore, analytics]);

  return (
    <FirebaseProvider
      firebaseApp={services.firebaseApp}
      auth={services.auth}
      firestore={services.firestore}
      analytics={services.analytics}
    >
      {children}
    </FirebaseProvider>
  );
}
