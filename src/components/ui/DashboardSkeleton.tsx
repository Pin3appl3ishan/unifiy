import Skeleton from "./Skeleton";

/** Skeleton card matching the real scene card layout. */
function SceneCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Preview area */}
      <Skeleton className="h-40 w-full rounded-none" />

      {/* Info area */}
      <div className="p-4">
        <Skeleton.Text className="w-3/4 h-5 mb-3" />
        <Skeleton.Text className="w-1/3 h-4 mb-4" />
        <div className="flex items-center justify-between">
          <Skeleton.Text className="w-1/4 h-4" />
          <Skeleton.Text className="w-12 h-4" />
        </div>
      </div>
    </div>
  );
}

/** Full Dashboard skeleton matching the real Dashboard layout to prevent layout shift. */
export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header skeleton */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-primary-500">U&I</span>
              <span className="text-slate-300">/</span>
              <Skeleton.Text className="w-32 h-5" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton.Text className="w-40 h-4 hidden sm:block" />
              <Skeleton.Text className="w-20 h-8 rounded-lg" />
            </div>
          </div>
        </div>
      </header>

      {/* Main content skeleton */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Skeleton.Text className="w-48 h-7 mb-2" />
            <Skeleton.Text className="w-64 h-5" />
          </div>
          <Skeleton className="w-32 h-10 rounded-lg" />
        </div>

        {/* Scene grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SceneCardSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
