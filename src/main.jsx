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
  immediate: true
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <MandalDataProvider>
        <App />
      </MandalDataProvider>
    </AuthProvider>
  </React.StrictMode>
);
