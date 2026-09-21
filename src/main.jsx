import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { MandalDataProvider } from './context/MandalDataContext';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA Service Worker for offline capabilities & automatic updates
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('[PWA] New festival update available. Updating cached assets...');
    updateSW(true);
  },
  onOfflineReady() {
    console.log('[PWA] App is ready for offline festival use. All schedules & assets cached.');
  },
  onRegisteredSW(swScriptUrl, registration) {
    if (registration) {
      // Check for updates on tab focus/visibility
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          registration.update().catch(() => {});
        }
      });
      // Check for updates every 30 seconds
      setInterval(() => {
        registration.update().catch(() => {});
      }, 30 * 1000);
    }
  },
  immediate: true
});

// Reload page automatically when new service worker takes control
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <MandalDataProvider>
        <App />
      </MandalDataProvider>
    </AuthProvider>
  </React.StrictMode>
);
