import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

const ROW_COUNT = 5;

export function TableVisitorsSkeleton() {
  return (
    <>
      {Array.from({ length: ROW_COUNT }).map((_, index) => (
        <TableRow key={`visitor-row-${index}`}>
          <TableCell>
            <Skeleton className="h-4 w-40" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell className="text-center">
            <Skeleton className="mx-auto h-4 w-20" />
          </TableCell>
          <TableCell className="text-center">
            <Skeleton className="mx-auto h-8 w-20" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
