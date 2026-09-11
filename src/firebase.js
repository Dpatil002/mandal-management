import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configure Firebase using Vite's environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if valid Firebase configuration keys are provided
export const isConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== "mandal-management-demo"
);

// Fallback config for demo / local offline mode if env variables are empty
const activeConfig = isConfigured
  ? firebaseConfig
  : {
      apiKey: "AIzaSyDemoKeyForMandalManagementPWA2026",
      authDomain: "mandal-management-demo.firebaseapp.com",
      projectId: "mandal-management-demo",
      storageBucket: "mandal-management-demo.appspot.com",
      messagingSenderId: "123456789012",
      appId: "1:123456789012:web:demo123456abcdef"
    };

// Initialize Firebase
const app = initializeApp(activeConfig);

// Initialize Cloud Firestore and Storage
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable offline IndexedDB persistence for Firestore
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === "failed-precondition") {
      console.warn("Firestore offline persistence: multiple tabs open");
    } else if (err.code === "unimplemented") {
      console.warn("Firestore offline persistence not supported in this browser");
    }
  });
}

export { app };
export default app;
