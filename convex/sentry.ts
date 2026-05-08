import * as Sentry from "@sentry/node";

export function initSentry() {
  Sentry.init({
    dsn: "https://6f93c220f2264854e4ad82800431b98f@o4511353759006720.ingest.de.sentry.io/4511353767133264",
    environment: process.env.CONVEX_ENV || "development",
    tracesSampleRate: 0.1,
  });
}

export function captureError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

export function captureMessage(message: string, level: "info" | "warning" | "error" = "error") {
  Sentry.captureMessage(message, level);
}

// Auto-init on module load
initSentry();