
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import '../app/globals.css';
import { getSettings } from '@/lib/settingsApi';

// One-line approach (actually a few lines but minimal)
(async () => {
  try {
    const faviconUrl = (await getSettings()).favicon_url?.value;
    if (faviconUrl) {
      const finalUrl = faviconUrl.startsWith('/') || faviconUrl.startsWith('http') ? faviconUrl : `/${faviconUrl}`;
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement || (() => {
        const l = document.createElement('link'); l.rel = 'icon'; document.head.appendChild(l); return l;
      })();
      link.href = finalUrl;
    }
  } catch (e) { console.warn('Favicon fetch failed:', e); }
})();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

