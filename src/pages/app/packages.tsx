import { Helmet } from "@dr.pogodin/react-helmet";

import { TablePackages } from "@/components/packages/table-packages";
import { AddModal } from "@/components/packages/add-modal";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/layout/page-header";
import { useSearchParams } from "react-router";

export function Packages() {
  const { session } = useAuth();
  const [searchParams] = useSearchParams();
  const pendingOnly = searchParams.get("status") === "pending";

  return (
    <>
      <Helmet>
        <title>Encomendas</title>
      </Helmet>

      <main className="flex min-h-0 flex-1 flex-col gap-8">
        <PageHeader
          title="Encomendas"
          description={
            pendingOnly
              ? "Visualizando somente encomendas pendentes."
              : "Gerencie suas encomendas."
          }
          actions={session?.user.role !== "resident" ? <AddModal /> : undefined}
        />

        <TablePackages pendingOnly={pendingOnly} />
      </main>
    </>
  );
}
