import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx'
import { CurrencyProvider } from './contexts/CurrencyContext';;
import './index.css';

const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('THREE.Clock')) return;
  originalWarn(...args);
};

const originalError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('[vite] failed to connect to websocket')) return;
  if (args[0] && args[0].message && args[0].message.includes('WebSocket')) return;
  originalError(...args);
};

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && event.reason.message.includes('WebSocket')) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CurrencyProvider><App /></CurrencyProvider>
  </StrictMode>,
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then(
      (registration) => { console.log("SW registered: ", registration.scope); },
      (err) => { console.log("SW registration failed: ", err); }
    );
  });
}
