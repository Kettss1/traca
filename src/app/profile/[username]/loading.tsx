function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-cream-dark ${className || ''}`} />
}

export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        {/* Avatar */}
        <Skeleton className="h-32 w-32 flex-shrink-0 rounded-full" />

        {/* Info */}
        <div className="flex-1 text-center sm:text-left">
          <Skeleton className="mx-auto h-9 w-48 sm:mx-0" />
          <Skeleton className="mx-auto mt-2 h-5 w-24 sm:mx-0" />
          <Skeleton className="mx-auto mt-4 h-16 w-full max-w-md sm:mx-0" />

          {/* Actions */}
          <div className="mt-4 flex justify-center sm:justify-start">
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Join date */}
          <Skeleton className="mx-auto mt-4 h-5 w-40 sm:mx-0" />
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-3 gap-4 sm:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg bg-white p-4 shadow-sm">
            <Skeleton className="mx-auto h-6 w-6" />
            <Skeleton className="mx-auto mt-2 h-8 w-12" />
            <Skeleton className="mx-auto mt-1 h-4 w-16" />
          </div>
        ))}
      </div>

      {/* Recent books */}
      <div>
        <Skeleton className="mb-4 h-7 w-40" />
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-[2/3] rounded-lg" />
              <Skeleton className="mt-2 h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
