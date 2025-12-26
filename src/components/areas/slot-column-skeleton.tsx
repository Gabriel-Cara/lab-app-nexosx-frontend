import { Skeleton } from "@/components/ui/skeleton";

type SlotColumnSkeletonProps = {
  count?: number;
};

export function SlotColumnSkeleton({ count = 6 }: SlotColumnSkeletonProps) {
  return (
    <div className="flex gap-2 md:flex-col">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={`slot-skeleton-${index}`} className="h-9 w-24" />
      ))}
    </div>
  );
}
