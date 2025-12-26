import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ROW_COUNT = 4;

export function VisitorsStatusSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="mx-auto aspect-square w-full max-w-[320px] rounded-full" />
      <div className="grid gap-2">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-3 w-36" />
      </div>
    </div>
  );
}

export function VisitorsRecentSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Visitante</TableHead>
          <TableHead>Morador</TableHead>
          <TableHead>Data</TableHead>
          <TableHead className="text-center">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: ROW_COUNT }).map((_, index) => (
          <TableRow key={`visitor-recent-${index}`}>
            <TableCell>
              <Skeleton className="h-4 w-28" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-32" />
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
