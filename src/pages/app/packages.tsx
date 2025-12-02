import { Helmet } from "@dr.pogodin/react-helmet";

import { TablePackages } from "@/components/packages/table-packages";
import { AddModal } from "@/components/packages/add-modal";

export function Packages() {
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

        <AddModal />

        <TablePackages />
      </main>
    </>
  );
}
