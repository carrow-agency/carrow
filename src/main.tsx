import { createRoot } from 'react-dom/client';
import { ConvexProvider } from 'convex/react';
import { ConvexReactClient } from 'convex/react';
import * as Sentry from "@sentry/react";
import App from './App.tsx';
import './index.css';

// Get Convex URL - fallback for production
const convexUrl = import.meta.env.VITE_CONVEX_URL || 'https://mellow-dragon-917.convex.cloud';

try {
  const convex = new ConvexReactClient(convexUrl);
  
  // Initialize Sentry with error tracking
  Sentry.init({
    dsn: "https://6f93c220f2264854e4ad82800431b98f@o4511353759006720.ingest.de.sentry.io/4511353767133264",
    integrations: [
      Sentry.reactRouterV6BrowserTracingIntegration(),
    ],
    tracesSampleRate: 0.1,
  });

  // Render App
  const root = createRoot(document.getElementById('root')!);
  root.render(
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  );
} catch (error) {
  console.error('Failed to initialize app:', error);
  document.getElementById('root')!.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0A0A0A;color:#fff;flex-direction:column;gap:1rem;font-family:system-ui;">
      <h1>Unable to load</h1>
      <p style="color:#888">Please refresh the page</p>
      <button onclick="window.location.reload()" style="background:#fff;color:#000;padding:0.75rem 1.5rem;border:none;border-radius:8px;cursor:pointer;">Refresh</button>
    </div>
  `;
}