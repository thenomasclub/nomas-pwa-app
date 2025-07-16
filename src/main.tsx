import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from '@/components/ErrorBoundary'

// Register service worker
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    // Register SW only in production builds to enable PWA caching
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => console.log('ServiceWorker registered:', reg))
        .catch((err) => console.log('ServiceWorker registration failed:', err));
    });
  } else {
    // In dev, unregister any existing service workers to avoid stale cache
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => reg.unregister());
    });
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
