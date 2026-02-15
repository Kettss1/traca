function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-cream-dark ${className || ''}`} />
}

export default function ShelfLoading() {
  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24" />
        ))}
      </div>

      {/* Book grid */}
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="aspect-[2/3] rounded-lg" />
            <Skeleton className="mt-2 h-5 w-full" />
            <Skeleton className="mt-1 h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  )
}
