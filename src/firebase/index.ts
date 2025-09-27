
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore'
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

export interface FirebaseServices {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  analyticsPromise: Promise<Analytics | null>;
}

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebaseOnClient() {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

export function getSdks(firebaseApp: FirebaseApp): FirebaseServices {
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);
  const analyticsPromise = isSupported().then(yes => yes ? getAnalytics(firebaseApp) : null);

  return {
    firebaseApp,
    auth,
    firestore,
    analyticsPromise,
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
