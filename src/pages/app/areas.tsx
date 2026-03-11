import { AddModal } from "@/components/areas/add-modal";
import { AreasAvailable } from "@/components/areas/areas-available";
import { UpcomingReservations } from "@/components/areas/upcoming-reservations";
import { useAuth } from "@/hooks/use-auth";
import { Helmet } from "@dr.pogodin/react-helmet";
import { PageHeader } from "@/components/layout/page-header";

export function Areas() {
  const { session } = useAuth();

  return (
    <>
      <Helmet>
        <title>Áreas de lazer</title>
      </Helmet>
      <main className="flex min-h-0 flex-1 flex-col gap-8">
        <PageHeader
          title="Áreas de Lazer"
          description="Agende as áreas comuns do condomínio."
          actions={session?.user.role !== "resident" ? <AddModal /> : undefined}
        />

        {session?.user.role === "resident" && (
          <section className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
            <aside className="h-fit">
              <h3 className="mb-2">Áreas disponíveis</h3>

              <AreasAvailable />
            </aside>
            <aside className="h-fit">
              <h3 className="mb-2">Próximos agendamentos</h3>

              <UpcomingReservations />
            </aside>
          </section>
        )}

        {session?.user.role !== "resident" && (
          <section>
            <h3>Áreas disponíveis</h3>

            <AreasAvailable />
          </section>
        )}
      </main>
    </>
  );
}
