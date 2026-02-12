/**
 U&I — Custom Error Classes
 * Base application error with an optional error code.
 * All custom error classes extend this.
 */
export class AppError extends Error {
  readonly code: string;

  constructor(message: string, code: string = "APP_ERROR") {
    super(message);
    this.name = "AppError";
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Authentication-related errors (login, signup, session expiry). */
export class AuthError extends AppError {
  constructor(message: string, code: string = "AUTH_ERROR") {
    super(message, code);
    this.name = "AuthError";
  }
}

/** Network or connectivity errors (fetch failures, timeouts). */
export class NetworkError extends AppError {
  constructor(
    message: string = "Network error. Please check your connection.",
    code: string = "NETWORK_ERROR",
  ) {
    super(message, code);
    this.name = "NetworkError";
  }
}

/** Client-side validation errors (form input, data constraints). */
export class ValidationError extends AppError {
  readonly field?: string;

  constructor(
    message: string,
    field?: string,
    code: string = "VALIDATION_ERROR",
  ) {
    super(message, code);
    this.name = "ValidationError";
    this.field = field;
  }
}

/** LocalStorage or persistence errors. */
export class StorageError extends AppError {
  constructor(
    message: string = "Failed to save data locally.",
    code: string = "STORAGE_ERROR",
  ) {
    super(message, code);
    this.name = "StorageError";
  }
}

/** Type guard: checks if an unknown value is an AppError. */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
