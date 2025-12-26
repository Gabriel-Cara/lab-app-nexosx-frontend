import { Skeleton } from "@/components/ui/skeleton";

const BLOCK_COUNT = 3;

export function RouteFallback() {
  return (
    <div className="flex min-h-svh flex-col gap-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: BLOCK_COUNT }).map((_, index) => (
          <div key={`route-block-${index}`} className="rounded-2xl border p-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="mt-4 h-4 w-3/4" />
            <Skeleton className="mt-2 h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
