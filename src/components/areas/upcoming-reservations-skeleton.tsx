import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type UpcomingReservationsSkeletonProps = {
  withContainer?: boolean;
  rows?: number;
};

export function UpcomingReservationsSkeleton({
  withContainer = true,
  rows = 4,
}: UpcomingReservationsSkeletonProps) {
  const containerClass = withContainer
    ? "rounded-xl border p-4 space-y-3"
    : "space-y-3";

  return (
    <div className={cn(containerClass)}>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={`upcoming-reservation-${index}`}
          className="rounded-lg border p-3 space-y-2"
        >
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
}
