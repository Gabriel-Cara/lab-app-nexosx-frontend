import { Helmet } from "@dr.pogodin/react-helmet";

import { TablePackages } from "@/components/packages/table-packages";
import { AddModal } from "@/components/packages/add-modal";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/layout/page-header";

export function Packages() {
  const { session } = useAuth();

  return (
    <>
      <Helmet>
        <title>Encomendas</title>
      </Helmet>

      <main className="flex min-h-0 flex-1 flex-col gap-8">
        <PageHeader
          title="Encomendas"
          description="Gerencie suas encomendas."
          actions={session?.user.role !== "resident" ? <AddModal /> : undefined}
        />

        <TablePackages />
      </main>
    </>
  );
}
