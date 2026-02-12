const sizeClasses = {
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-3",
  lg: "w-8 h-8 border-4",
} as const;

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

/** Unified loading spinner with configurable size and optional label. */
export function Spinner({ size = "md", className = "", label }: SpinnerProps) {
  return (
    <div className={`inline-flex flex-col items-center gap-3 ${className}`}>
      <div
        className={`${sizeClasses[size]} border-primary-500 border-t-transparent rounded-full animate-spin`}
      />
      {label && <p className="text-sm text-slate-500">{label}</p>}
    </div>
  );
}

interface PageSpinnerProps {
  label?: string;
}

/** Full-page centered spinner. Replaces the repeated min-h-screen loading pattern. */
export function PageSpinner({ label = "Loading..." }: PageSpinnerProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary-500 mb-4">U&I</h1>
        <Spinner size="lg" label={label} />
      </div>
    </div>
  );
}
