
import { UpcomingReservations } from "@/components/areas/upcoming-reservations";
import { PendingReservations } from "@/components/reservations/pending-reservations";
import { ReservationsOverview } from "@/components/reservations/reservations-overview";
import { ReservationsTable } from "@/components/reservations/reservations-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Helmet } from "@dr.pogodin/react-helmet";

export function Reservations() {
  return (
    <>
      <Helmet>
        <title>Agendamentos</title>
      </Helmet>
      <main className="flex min-h-svh flex-col gap-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl text-foreground font-bold tracking-tight">
              Agendamentos
            </h1>
            <p className="text-muted-foreground sr-only md:not-sr-only">
              Administre os agendamentos das áreas comuns do condomínio.
            </p>
          </div>
        </header>

        <section className="grid gap-6">
          <ReservationsOverview />
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
            <Card className="h-full max-h-[500px] overflow-y-auto">
              <CardHeader>
                <CardTitle>Pendentes de aprovação</CardTitle>
                <CardDescription>
                  Revise os pedidos de agendamento enviados pelos moradores.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PendingReservations />
              </CardContent>
            </Card>
            <Card className="h-full max-h-[500px] overflow-y-auto">
              <CardHeader>
                <CardTitle>Próximos agendamentos</CardTitle>
                <CardDescription>
                  Reservas confirmadas para esta semana.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UpcomingReservations withContainer={false} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Todos os agendamentos</CardTitle>
              <CardDescription>
                Lista completa para consulta rápida.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReservationsTable />
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}
