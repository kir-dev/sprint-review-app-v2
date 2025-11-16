import { Skeleton } from "@/components/ui/skeleton"

export function UsersPageSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Felhasználók betöltése..."
      className="flex flex-col gap-6 p-8 max-w-7xl mx-auto"
    >
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-1/3 bg-muted" />
      </div>

      {/* Search/Filter Skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 flex-grow bg-muted" />
        <Skeleton className="h-10 w-32 bg-muted" />
      </div>

      {/* List Skeleton */}
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center space-x-4 p-4 border-border rounded-lg bg-card"
          >
            <Skeleton className="h-12 w-12 rounded-full bg-muted" />
            <div className="space-y-2 flex-grow">
              <Skeleton className="h-4 w-1/4 bg-muted" />
              <Skeleton className="h-4 w-1/2 bg-muted" />
            </div>
            <Skeleton className="h-10 w-32 bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
