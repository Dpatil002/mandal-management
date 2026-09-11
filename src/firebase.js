import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration from Environment or fallback demo config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKeyForMandalManagementPWA2026",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mandal-management-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mandal-management-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mandal-management-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:demo123456abcdef"
};

// Check if user has configured custom Firebase keys
export const isConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY && 
  import.meta.env.VITE_FIREBASE_PROJECT_ID &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID !== "mandal-management-demo"
);

let app;
let db;
let storage;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  storage = getStorage(app);

  // Enable offline persistence for Firestore if available in browser
  if (typeof window !== 'undefined') {
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Firestore offline persistence: multiple tabs open');
      } else if (err.code === 'unimplemented') {
        console.warn('Firestore offline persistence not supported in this browser');
      }
    });
  }
} catch (error) {
  console.warn('Firebase initialization note (running with resilient local storage fallback):', error.message);
}

export { app, db, storage };
