import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

// This function is safe to run on the server
export function initializeFirebaseOnServer(): FirebaseApp {
  if (!getApps().length) {
    try {
      // For App Hosting, this will be automatically configured
      return initializeApp();
    } catch (e) {
      if (process.env.NODE_ENV === "production") {
        console.warn('Automatic server-side initialization failed. Falling back to firebaseConfig.');
      }
      // For local development or other environments
      return initializeApp(firebaseConfig);
    }
  }
  return getApp();
}
