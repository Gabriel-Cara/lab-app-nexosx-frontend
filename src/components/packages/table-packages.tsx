import { useQuery } from "@tanstack/react-query";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { TableRowPackages } from "./table-row-packages";
import { getPackages, type Package } from "@/api/get-packages";
import { TablePackagesSkeleton } from "@/components/packages/table-packages-skeleton";

export function TablePackages() {
  const {
    data: packages = [],
    isLoading,
    isError,
  } = useQuery<Package[]>({
    queryKey: ["packages"],
    queryFn: getPackages,
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Destinatário</TableHead>
          <TableHead>Apartamento</TableHead>
          <TableHead>Remetente</TableHead>
          <TableHead className="text-center">Tipo</TableHead>
          <TableHead className="text-center">Status</TableHead>
          <TableHead className="text-center">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TablePackagesSkeleton />
        ) : isError ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-destructive">
              Não foi possível carregar as encomendas. Tente novamente.
            </TableCell>
          </TableRow>
        ) : packages.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              Nenhuma encomenda registrada ainda.
            </TableCell>
          </TableRow>
        ) : (
          packages.map((packageItem) => (
            <TableRowPackages key={packageItem.id} pkg={packageItem} />
          ))
        )}
      </TableBody>
    </Table>
  );
}
