import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConvexReactClient } from 'convex/react';
import { ConvexAuthProvider } from '@convex-dev/auth/react';
import App from './App.tsx';
import './index.css';

// Convex URL must come from environment variable in production
const convexUrl = import.meta.env.VITE_CONVEX_URL;

if (!convexUrl) {
  console.error('[Carrow] ERROR: VITE_CONVEX_URL is not set!');
}

const convex = new ConvexReactClient(convexUrl);

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <ConvexAuthProvider client={convex}>
      <App />
    </ConvexAuthProvider>
  </StrictMode>
);
