import { CalendarDays } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import { SectionHeader } from "./section-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
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
  ReservationsStatusSkeleton,
  ReservationsUpcomingSkeleton,
} from "@/components/dashboard/reservations-section-skeleton";

type ReservationStatus = Reservation["status"];

type ReservationChartPoint = {
  status: ReservationStatus;
  label: string;
  value: number;
};

type ReservationsSectionProps = {
  accessLabel: string;
  isLoading: boolean;
  isError: boolean;
  chartData: ReservationChartPoint[];
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

const reservationChartConfig = {
  pending: { label: "Pendentes", color: "hsl(31 97% 62%)" },
  approved: { label: "Aprovadas", color: "hsl(142 71% 45%)" },
  rejected: { label: "Recusadas", color: "hsl(347 82% 62%)" },
  cancelled: { label: "Canceladas", color: "hsl(215 20% 65%)" },
};

export function ReservationsSection({
  accessLabel,
  isLoading,
  isError,
  chartData,
  upcomingReservations,
  statusConfig,
  formatDate,
}: ReservationsSectionProps) {
  return (
    <section className="space-y-4">
      <SectionHeader
        title="Reservas"
        description="Agendamentos próximos e distribuição por status."
        icon={CalendarDays}
        accessLabel={accessLabel}
      />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Status geral</CardTitle>
            <CardDescription>
              Compare solicitações pendentes, aprovadas e canceladas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ReservationsStatusSkeleton />
            ) : isError ? (
              <p className="text-sm text-destructive">
                Não foi possível carregar os agendamentos.
              </p>
            ) : (
              <ChartContainer config={reservationChartConfig} className="aspect-[16/8] w-full">
                <BarChart data={chartData} barSize={36}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent labelFormatter={(value) => `Status: ${value}`} />
                    }
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {chartData.map((item) => (
                      <Cell key={item.status} fill={`var(--color-${item.status})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

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
              <p className="text-sm text-muted-foreground">
                Não há reservas futuras cadastradas.
              </p>
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
                        <TableCell>
                          {formatDate(reservation.date, reservation.startTime)}
                        </TableCell>
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
      </div>
    </section>
  );
}
