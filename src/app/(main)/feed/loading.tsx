function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-cream-dark/50 ${className || ''}`} />
}

export default function FeedLoading() {
  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <Skeleton className="h-8 w-24" />
      </div>

      {/* Tabs */}
      <Skeleton className="mb-6 h-12 w-full rounded-xl" />

      {/* Posts */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-cream-dark/80 bg-cream-dark/20 p-5">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="mt-2 h-3 w-20" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>

            <div className="mt-4 flex gap-3 rounded-xl border border-cream-dark/60 p-3">
              <Skeleton className="h-[72px] w-12 shrink-0 rounded-md" />
              <div className="flex-1">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="mt-2 h-3 w-24" />
              </div>
            </div>

            <div className="mt-4 flex gap-2 border-t border-cream-dark/60 pt-3">
              <Skeleton className="h-8 w-14 rounded-lg" />
              <Skeleton className="h-8 w-14 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
