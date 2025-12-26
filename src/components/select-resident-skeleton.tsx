import { Skeleton } from "@/components/ui/skeleton";
import { CommandGroup, CommandItem } from "@/components/ui/command";

type SelectResidentSkeletonProps = {
  count?: number;
};

export function SelectResidentSkeleton({ count = 3 }: SelectResidentSkeletonProps) {
  return (
    <CommandGroup heading="Moradores">
      {Array.from({ length: count }).map((_, index) => (
        <CommandItem key={`resident-option-${index}`} disabled>
          <div className="flex w-full flex-col gap-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </CommandItem>
      ))}
    </CommandGroup>
  );
}
