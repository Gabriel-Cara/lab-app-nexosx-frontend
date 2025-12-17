import { Helmet } from "@dr.pogodin/react-helmet";

import { TablePackages } from "@/components/packages/table-packages";
import { AddModal } from "@/components/packages/add-modal";
import { useAuth } from "@/hooks/use-auth";

export function Packages() {
  const { session } = useAuth();

  return (
    <>
      <Helmet>
        <title>Encomendas</title>
      </Helmet>

      <main className="flex min-h-svh flex-col gap-8">
        <header>
          <h1 className="text-2xl text-foreground font-bold tracking-tight">
            Encomendas
          </h1>
          <p className="text-muted-foreground sr-only md:not-sr-only">
            Gerencie suas encomendas.
          </p>
        </header>

        {session?.user.role !== "resident" && <AddModal />}

        <TablePackages />
      </main>
    </>
  );
}
