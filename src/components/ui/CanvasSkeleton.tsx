import Skeleton from "./Skeleton";
import { Spinner } from "./Spinner";

/** Canvas/Whiteboard loading skeleton with mock toolbar. */
export default function CanvasSkeleton() {
  return (
    <div className="h-screen w-screen bg-slate-50 flex flex-col">
      {/* Mock toolbar */}
      <div className="flex items-center justify-center gap-2 py-3 px-4 bg-white border-b border-slate-200">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="w-9 h-9 rounded-lg" />
        ))}
      </div>

      {/* Canvas area with centered spinner */}
      <div className="flex-1 flex items-center justify-center">
        <Spinner size="lg" label="Loading your scene..." />
      </div>
    </div>
  );
}
