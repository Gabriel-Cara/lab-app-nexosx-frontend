import { useQuery } from "@tanstack/react-query";
import { Package as PackageIcon } from "lucide-react";

import { TableRowPackages } from "./table-row-packages";
import { getPackages, type Package } from "@/api/get-packages";
import { TablePackagesSkeleton } from "@/components/packages/table-packages-skeleton";
import { EmptyState } from "@/components/ui/empty";

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
      <EmptyState
        icon={PackageIcon}
        title="Nenhuma encomenda registrada"
        description="Quando novas encomendas chegarem, elas aparecerão aqui."
        size="sm"
      />
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
