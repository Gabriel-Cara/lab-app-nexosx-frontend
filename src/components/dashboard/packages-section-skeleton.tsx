import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const QUEUE_ROWS = 4;

export function PackagesTrendSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="aspect-[16/8] w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={`package-stat-${index}`} className="rounded-lg border p-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-3 h-6 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PackagesTypeSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <Skeleton className="h-3 w-40" />
    </div>
  );
}

export function PackagesQueueSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Destinatário</TableHead>
          <TableHead>Apart.</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead className="text-center">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: QUEUE_ROWS }).map((_, index) => (
          <TableRow key={`package-queue-${index}`}>
            <TableCell>
              <Skeleton className="h-4 w-32" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-14" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-20" />
            </TableCell>
            <TableCell className="text-center">
              <Skeleton className="mx-auto h-4 w-16" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
