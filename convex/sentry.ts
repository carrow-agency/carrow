type LogLevel = "info" | "warning" | "error";

export function initSentry() {
  return null;
}

export function captureError(error: Error, context?: Record<string, unknown>) {
  console.error("[convex-error]", error.message, context ?? {});
}

export function captureMessage(message: string, level: LogLevel = "error") {
  if (level === "error") {
    console.error("[convex-message]", message);
    return;
  }
  if (level === "warning") {
    console.warn("[convex-message]", message);
    return;
  }
  console.info("[convex-message]", message);
}

initSentry();
