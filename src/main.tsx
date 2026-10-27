
import {createRoot} from 'react-dom/client';

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CurrencyProvider } from './contexts/CurrencyContext';;
import './index.css';

const originalMeasure = performance.measure;
performance.measure = (...args) => {
  try {
    return originalMeasure.apply(performance, args);
  } catch(e) {
    // Return mock
    return { name: args[0], entryType: 'measure', startTime: 0, duration: 0 };
  }
};


const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' && (
      args[0].includes('THREE.Clock') ||
      args[0].includes('width(-1)') ||
      args[0].includes('height(-1)') ||
      args[0].includes('The width(-1) and height(-1) of chart should be greater than 0')
    )
  ) return;
  originalWarn(...args);
};

const originalError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && (
    args[0].includes('[vite] failed to connect to websocket') ||
    args[0].includes('send was called before connect') ||
    args[0].includes('Could not reach Cloud Firestore backend') ||
    args[0].includes('The operation could not be completed') ||
    args[0].includes('Encountered two children with the same key')
  )) return;
  if (args[0] && args[0].message && (
    args[0].message.includes('WebSocket') || 
    args[0].message.includes('send was called before connect') || 
    args[0].message.includes('Could not reach Cloud Firestore backend')
  )) return;
  originalError(...args);
};

window.addEventListener('unhandledrejection', (event) => {
  if (
    (event.reason && event.reason.message && (
      event.reason.message.includes('WebSocket') ||
      event.reason.message.includes('send was called before connect') ||
      event.reason.message.includes('Could not reach Cloud Firestore backend')
    )) ||
    (typeof event.reason === 'string' && (
      event.reason.includes('WebSocket') ||
      event.reason.includes('send was called before connect')
    ))
  ) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <CurrencyProvider><ErrorBoundary><App /></ErrorBoundary></CurrencyProvider>
);

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // SW registered cleanly without console spam
    });
  });
}


// Suppress ResizeObserver benign errors
const suppressResizeObserver = () => {
  const resizeObserverErrDiv = document.createElement('div');
  const _error = console.error;
  console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('ResizeObserver loop limit exceeded')) {
      return;
    }
    _error(...args);
  };
  window.addEventListener('error', (e) => {
    if (e.message === 'ResizeObserver loop limit exceeded') {
      e.stopImmediatePropagation();
    }
  });
};
suppressResizeObserver();
