/**
 * Conditional logging utility for development vs production environments.
 * In production, errors are silently handled to prevent information leakage.
 * In development, errors are logged for debugging purposes.
 */

export function logError(message: string, error?: unknown, context?: Record<string, unknown>) {
  if (import.meta.env.DEV) {
    console.error(message, error, context);
  }
  // In production, we could send to an error tracking service
  // For now, we silently handle to prevent information leakage
}

export function logWarning(message: string, context?: Record<string, unknown>) {
  if (import.meta.env.DEV) {
    console.warn(message, context);
  }
}

export function logInfo(message: string, context?: Record<string, unknown>) {
  if (import.meta.env.DEV) {
    console.log(message, context);
  }
}
