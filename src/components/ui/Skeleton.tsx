import type { ReactNode } from "react";

interface SkeletonProps {
  className?: string;
  children?: ReactNode;
}

/** Reusable skeleton primitive with pulse animation. */
function Skeleton({ className = "", children }: SkeletonProps) {
  return (
    <div className={`bg-slate-200 animate-pulse rounded-md ${className}`}>
      {children}
    </div>
  );
}

/** Single-line text placeholder. */
function SkeletonText({ className = "" }: { className?: string }) {
  return <div className={`bg-slate-200 animate-pulse rounded h-4 ${className}`} />;
}

/** Circular placeholder (e.g. avatar, icon). */
function SkeletonCircle({ className = "" }: { className?: string }) {
  return <div className={`bg-slate-200 animate-pulse rounded-full w-10 h-10 ${className}`} />;
}

Skeleton.Text = SkeletonText;
Skeleton.Circle = SkeletonCircle;

export default Skeleton;
