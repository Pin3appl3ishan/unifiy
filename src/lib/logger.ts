// =============================================================================
// U&I — Error Logging Utility
// =============================================================================

import { isAppError } from "./errors";
import { getErrorMessage } from "../types";

/** Context metadata attached to logged errors */
interface ErrorContext {
  /** Which component/store/function the error originated from */
  source?: string;
  /** The user action that triggered the error */
  action?: string;
  /** Any additional metadata */
  metadata?: Record<string, unknown>;
}

const isDev = import.meta.env.DEV;

/**
 * Logs an error with structured context.
 * In development: writes to console with full details.
 * In production: condensed output; swap for Sentry/DataDog here.
 */
export function logError(error: unknown, context?: ErrorContext): void {
  const message = getErrorMessage(error);
  const code = isAppError(error) ? error.code : "UNKNOWN";
  const name = error instanceof Error ? error.name : "UnknownError";

  const logPayload = {
    name,
    message,
    code,
    source: context?.source,
    action: context?.action,
    metadata: context?.metadata,
    timestamp: new Date().toISOString(),
  };

  if (isDev) {
    console.error(
      `[${context?.source ?? "App"}] ${context?.action ?? "Error"}:`,
      error,
    );
    console.debug("Error details:", logPayload);
  } else {
    // Production: replace with Sentry.captureException(error, { extra: logPayload })
    console.error(`[${logPayload.code}] ${message}`);
  }
}
