function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-cream-dark ${className || ''}`} />
}

export default function BookLoading() {
  return (
    <div>
      {/* Back link */}
      <Skeleton className="mb-6 h-5 w-32" />

      {/* Book header */}
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Cover */}
        <Skeleton className="h-72 w-48 flex-shrink-0 self-center rounded-lg md:self-start" />

        {/* Info */}
        <div className="flex-1">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="mt-2 h-6 w-48" />
          <Skeleton className="mt-3 h-5 w-40" />

          <div className="mt-4 flex gap-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-28" />
          </div>

          {/* Categories */}
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-16 rounded-full" />
          </div>

          {/* User actions */}
          <div className="mt-6 space-y-4 rounded-lg bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-14" />
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* Synopsis */}
      <div className="mt-8">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="mt-3 h-32 w-full" />
      </div>

      {/* Annotations */}
      <div className="mt-8">
        <Skeleton className="h-7 w-48" />
        <div className="mt-4 space-y-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
