import { AddModal } from "@/components/areas/add-modal";
import { AreasAvailable } from "@/components/areas/areas-available";
import { UpcomingReservations } from "@/components/areas/upcoming-reservations";
import { useAuth } from "@/hooks/use-auth";
import { Helmet } from "@dr.pogodin/react-helmet";

export function Areas() {
  const { session } = useAuth();

  return (
    <>
      <Helmet>
        <title>Áreas de lazer</title>
      </Helmet>
      <main className="flex min-h-svh flex-col gap-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl text-foreground font-bold tracking-tight">
              Áreas de Lazer
            </h1>
            <p className="text-muted-foreground sr-only md:not-sr-only">
              Agende as áreas comuns do condomínio.
            </p>
          </div>

          {session?.user.role !== "resident" && (
            <AddModal />
          )}
        </header>

        {session?.user.role === "resident" && (
          <section className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
            <aside className="h-fit">
              <h3>Áreas disponíveis</h3>

              <AreasAvailable />
            </aside>
            <aside className="h-fit">
              <h3>Próximos agendamentos</h3>

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
