import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConvexProvider } from 'convex/react';
import { ConvexReactClient } from 'convex/react';
import * as Sentry from "@sentry/react";
import App from './App.tsx';
import './index.css';

// Get Convex URL from env or fallback
const convexUrl = import.meta.env.VITE_CONVEX_URL;

console.log('[Carrow] Starting with Convex URL:', convexUrl);

try {
  if (!convexUrl) {
    console.warn('[Carrow] VITE_CONVEX_URL not set, using fallback');
  }
  
  const convex = new ConvexReactClient(convexUrl || 'https://mellow-dragon-917.convex.cloud');
  
  // Initialize Sentry
  Sentry.init({
    dsn: "https://6f93c220f2264854e4ad82800431b98f@o4511353759006720.ingest.de.sentry.io/4511353767133264",
  });

  const root = createRoot(document.getElementById('root')!);
  
  root.render(
    <StrictMode>
      <ConvexProvider client={convex}>
        <App />
      </ConvexProvider>
    </StrictMode>
  );
  
  console.log('[Carrow] App rendered successfully');
} catch (error) {
  console.error('[Carrow] Initialization error:', error);
  
  // Show error UI
  document.getElementById('root')!.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0A0A0A;color:#fff;flex-direction:column;gap:1rem;font-family:system-ui;padding:2rem;text-align:center;">
      <h1 style="font-size:1.5rem;">Unable to load page</h1>
      <p style="color:#888;font-size:0.875rem;">${error instanceof Error ? error.message : 'Unknown error'}</p>
      <button onclick="window.location.reload()" style="background:#fff;color:#000;padding:0.75rem 1.5rem;border:none;border-radius:8px;cursor:pointer;font-weight:600;">Refresh Page</button>
    </div>
  `;
}