function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-cream-dark/50 ${className || ''}`} />
}

export default function StatsLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-36" />
        <Skeleton className="mt-2 h-4 w-56" />
      </div>

      {/* Stats cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card p-4">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <Skeleton className="mt-3 h-7 w-14" />
            <Skeleton className="mt-1.5 h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Reading goal */}
      <div className="card p-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div>
            <Skeleton className="h-5 w-36" />
            <Skeleton className="mt-1 h-4 w-24" />
          </div>
        </div>
        <Skeleton className="mt-4 h-2.5 w-full rounded-full" />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="card p-5">
            <Skeleton className="mb-4 h-4 w-40" />
            <Skeleton className="h-56 w-full rounded-xl" />
          </div>
        ))}
      </div>

      {/* Monthly chart */}
      <div className="card p-5">
        <Skeleton className="mb-4 h-4 w-44" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  )
}
