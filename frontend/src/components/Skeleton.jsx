export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />
}

export function HotelCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)]">
      <Skeleton className="h-[180px] rounded-none" />
      <div className="p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="mt-2 h-3 w-1/2" />
        <Skeleton className="mt-4 h-5 w-24" />
      </div>
    </div>
  )
}

export function HotelGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <HotelCardSkeleton key={i} />
      ))}
    </div>
  )
}