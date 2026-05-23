// Components
import * as skeleton from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ROW_COUNT = 5;

export function BlocksTableSkeleton() {
  return (
    <div className="w-full overflow-x-auto">
      <Table className="min-w-[640px]">
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold">Bloco</TableHead>
            <TableHead className="font-bold">Residências</TableHead>
            <TableHead className="font-bold">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: ROW_COUNT }).map((_, index) => (
            <TableRow key={`block-row-${index}`}>
              <TableCell>
                <skeleton.Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <skeleton.Skeleton className="h-4 w-40" />
              </TableCell>
              <TableCell>
                <skeleton.Skeleton className="h-4 w-24" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
