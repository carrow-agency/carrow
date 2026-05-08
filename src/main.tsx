import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConvexProvider } from 'convex/react';
import { ConvexReactClient } from 'convex/react';
import * as Sentry from "@sentry/react";
import App from './App.tsx';
import './index.css';

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

Sentry.init({
  dsn: "https://6f93c220f2264854e4ad82800431b98f@o4511353759006720.ingest.de.sentry.io/4511353767133264",
  integrations: [
    Sentry.reactRouterV6BrowserTracingIntegration(),
  ],
  tracesSampleRate: 0.1,
  beforeSend(event) {
    console.error("[Sentry Error]", event.exception?.values?.[0]?.value || event.message);
    return event;
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </StrictMode>,
);