/** Shimmering placeholder block. */
export const Skeleton = ({ className = '' }) => (
  <div className={`relative overflow-hidden rounded-lg bg-surface-container ${className}`} aria-hidden="true">
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
  </div>
);

/** Generic page skeleton: header, stat tiles and a list. */
export const PageSkeleton = ({ stats = 4, rows = 4 }) => (
  <div role="status" aria-label="Loading" className="w-full">
    <div className="flex items-center justify-between mb-xl gap-md">
      <div className="space-y-sm">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Skeleton className="h-10 w-36 rounded-xl hidden sm:block" />
    </div>
    {stats > 0 && (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md mb-xl">
        {Array.from({ length: stats }).map((_, i) => (
          <div key={i} className="bg-white border border-surface-container-high rounded-xl p-lg space-y-md">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    )}
    <div className="bg-white border border-surface-container-high rounded-xl divide-y divide-surface-container-high">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-lg space-y-sm">
          <div className="flex gap-sm"><Skeleton className="h-5 w-20" /><Skeleton className="h-5 w-24 rounded-full" /></div>
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  </div>
);
