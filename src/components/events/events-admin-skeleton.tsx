import { Skeleton } from "@/components/ui/skeleton";

const SUMMARY_COUNT = 4;
const EVENT_COUNT = 3;

export function EventsAdminSummarySkeleton() {
  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: SUMMARY_COUNT }).map((_, index) => (
        <div
          key={`event-summary-${index}`}
          className="rounded-2xl border bg-white/80 p-4"
        >
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-7 w-12" />
          <Skeleton className="mt-2 h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export function EventsAdminListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: EVENT_COUNT }).map((_, index) => (
        <div
          key={`event-card-${index}`}
          className="group overflow-hidden rounded-3xl border bg-background shadow-sm"
        >
          <div className="flex flex-col lg:flex-row">
            <Skeleton className="h-44 w-full lg:h-auto lg:w-56" />
            <div className="flex flex-1 flex-col gap-4 p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-44" />
                  <Skeleton className="h-3 w-64" />
                </div>
                <div className="rounded-2xl border bg-muted/40 px-3 py-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="mt-2 h-3 w-20" />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-10" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
