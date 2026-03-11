import { useQuery } from "@tanstack/react-query";
import { Package as PackageIcon } from "lucide-react";

import { TableRowPackages } from "./table-row-packages";
import { getPackages, type Package } from "@/api/get-packages";
import { TablePackagesSkeleton } from "@/components/packages/table-packages-skeleton";
import { EmptyState } from "@/components/ui/empty";

type TablePackagesProps = {
  pendingOnly?: boolean;
};

export function TablePackages({ pendingOnly = false }: TablePackagesProps) {
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

  const filteredPackages = pendingOnly
    ? packages.filter((item) => item.status === "pending" || item.status === "delayed")
    : packages;

  if (filteredPackages.length === 0) {
    return (
      <EmptyState
        icon={PackageIcon}
        title={pendingOnly ? "Nenhuma encomenda pendente" : "Nenhuma encomenda registrada"}
        description={
          pendingOnly
            ? "Assim que houver pendências de retirada, elas aparecerão aqui."
            : "Quando novas encomendas chegarem, elas aparecerão aqui."
        }
        size="sm"
      />
    );
  }

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {filteredPackages.map((packageItem) => (
        <TableRowPackages key={packageItem.id} pkg={packageItem} />
      ))}
    </section>
  );
}
