import { Skeleton } from "@/components/ui/skeleton";

const CARD_COUNT = 3;

export function PendingReservationsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: CARD_COUNT }).map((_, index) => (
        <div key={`pending-reservation-${index}`} className="rounded-xl border p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-52" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
