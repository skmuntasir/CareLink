import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export function Spinner({ className = 'h-5 w-5' }) {
  return <Loader2 className={cn('animate-spin text-brand-text', className)} aria-hidden="true" />;
}

export function PageLoader({ label = 'Loading…', className = '' }) {
  return (
    <div className={cn('flex min-h-[40vh] flex-col items-center justify-center gap-3 text-muted', className)} role="status">
      <Spinner className="h-8 w-8" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={cn('skeleton', className)} aria-hidden="true" />;
}

// A few ready-made skeleton blocks
export function CardListSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-5">
          <Skeleton className="h-12 w-12 !rounded-xl" />
          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-24 !rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function GridSkeleton({ items = 6 }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-line bg-surface p-5">
          <div className="flex items-center gap-3">
            <Skeleton className="h-14 w-14 !rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <Skeleton className="mt-5 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-4/5" />
          <Skeleton className="mt-6 h-10 w-full !rounded-xl" />
        </div>
      ))}
    </div>
  );
}
