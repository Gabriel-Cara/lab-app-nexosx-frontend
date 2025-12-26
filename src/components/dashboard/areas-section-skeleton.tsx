import { Skeleton } from "@/components/ui/skeleton";

const LIST_COUNT = 4;

export function AreasAvailabilitySkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-[16/8] w-full rounded-xl" />
      <Skeleton className="h-3 w-40" />
    </div>
  );
}

export function AreasQuickMapSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: LIST_COUNT }).map((_, index) => (
        <div
          key={`area-map-${index}`}
          className="flex items-center justify-between rounded-lg border px-3 py-2"
        >
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}
