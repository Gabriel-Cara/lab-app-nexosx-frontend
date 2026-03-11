import { CalendarDays } from "lucide-react";

import { SectionHeader } from "./section-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Reservation } from "@/api/get-reservations";
import {
  ReservationsUpcomingSkeleton,
} from "@/components/dashboard/reservations-section-skeleton";
import { EmptyState } from "@/components/ui/empty";

type ReservationStatus = Reservation["status"];

type ReservationsSectionProps = {
  accessLabel: string;
  isLoading: boolean;
  isError: boolean;
  upcomingReservations: Reservation[];
  statusConfig: Record<
    ReservationStatus,
    {
      label: string;
      className: string;
    }
  >;
  formatDate: (date: string, time?: string | null) => string;
};

export function ReservationsSection({
  accessLabel,
  isLoading,
  isError,
  upcomingReservations,
  statusConfig,
  formatDate,
}: ReservationsSectionProps) {
  return (
    <section className="space-y-4">
      <SectionHeader
        title="Reservas"
        description="Agendamentos próximos e acompanhamento das solicitações."
        icon={CalendarDays}
        accessLabel={accessLabel}
      />
      <Card>
        <CardHeader>
          <CardTitle>Próximos agendamentos</CardTitle>
          <CardDescription>Eventos confirmados ou aguardando decisão.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ReservationsUpcomingSkeleton />
          ) : isError ? (
            <p className="text-sm text-destructive">
              Não foi possível carregar os agendamentos.
            </p>
          ) : upcomingReservations.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="Sem reservas futuras"
              description="As próximas reservas confirmadas aparecerão aqui."
              size="sm"
              className="min-h-44"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Área</TableHead>
                  <TableHead>Morador</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingReservations.map((reservation) => {
                  const config = statusConfig[reservation.status];
                  return (
                    <TableRow key={reservation.id}>
                      <TableCell className="font-medium">{reservation.area.name}</TableCell>
                      <TableCell>{reservation.resident.name}</TableCell>
                      <TableCell>{formatDate(reservation.date, reservation.startTime)}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
                        >
                          {config.label}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
