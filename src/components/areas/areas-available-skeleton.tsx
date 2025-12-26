import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const CARD_COUNT = 3;

export function AreasAvailableSkeleton() {
  return (
    <div className="flex w-auto min-h-60 flex-wrap gap-4 rounded-xl border p-4 mt-2">
      {Array.from({ length: CARD_COUNT }).map((_, index) => (
        <Card
          key={`area-card-${index}`}
          className="w-full flex-1 md:min-w-1/3 md:max-w-1/2 xl:min-w-1/5 xl:max-w-1/4"
        >
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-3 w-4/5" />
          </CardHeader>
          <CardContent className="flex flex-wrap justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
