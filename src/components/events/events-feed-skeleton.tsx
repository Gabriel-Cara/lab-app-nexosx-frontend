import { Skeleton } from "@/components/ui/skeleton";

const CARD_COUNT = 3;

export function EventsFeedSkeleton() {
  return (
    <div className="space-y-5 px-4 sm:px-6 md:px-10 lg:px-14">
      <div className="hidden items-center justify-end gap-2 md:flex">
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>

      <div className="flex flex-col items-center gap-8 md:flex-row md:items-stretch md:gap-6 md:overflow-hidden">
        {Array.from({ length: CARD_COUNT }).map((_, index) => (
          <div
            key={`event-feed-${index}`}
            className="w-full max-w-md overflow-hidden rounded-3xl border bg-background shadow-sm md:w-[360px] md:flex-none"
          >
            <Skeleton className="aspect-[4/5] w-full" />
            <div className="space-y-4 p-5">
              <Skeleton className="h-5 w-2/3" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-28" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
