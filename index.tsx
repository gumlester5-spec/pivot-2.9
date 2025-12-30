
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Using a setTimeout to delay the service worker registration.
    // In some sandboxed environments (like iframes), a race condition can occur
    // where the document is not in a "valid state" for registration
    // immediately when the 'load' event fires. Pushing the registration
    // to the next tick of the event loop resolves this issue.
    setTimeout(() => {
      const swUrl = `${location.origin}/sw.js`;
      navigator.serviceWorker.register(swUrl)
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }, 0);
  });
}
