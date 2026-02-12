import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorFallbackProps {
  error?: Error;
  title?: string;
  message?: string;
  onRetry?: () => void;
}

/**
 * Reusable error display component.
 * Shows a friendly error message with optional retry button.
 */
export default function ErrorFallback({
  error,
  title = "Something went wrong",
  message,
  onRetry,
}: ErrorFallbackProps) {
  const displayMessage =
    message ||
    error?.message ||
    "An unexpected error occurred. Please try again.";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-xl font-semibold text-slate-900 mb-2">{title}</h1>
        <p className="text-slate-500 mb-6">{displayMessage}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
