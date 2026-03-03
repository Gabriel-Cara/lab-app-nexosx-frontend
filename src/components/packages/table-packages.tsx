import { useQuery } from "@tanstack/react-query";

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

  if (isLoading) {
    return <TablePackagesSkeleton />;
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        Não foi possível carregar as encomendas. Tente novamente.
      </p>
    );
  }

  if (packages.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma encomenda registrada ainda.
      </p>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {packages.map((packageItem) => (
        <TableRowPackages key={packageItem.id} pkg={packageItem} />
      ))}
    </section>
  );
}
