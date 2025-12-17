import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

import { getReservations, type Reservation } from "@/api/get-reservations";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";

const statusLabels: Record<Reservation["status"], string> = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
  cancelled: "Cancelado",
};

const statusVariant: Record<Reservation["status"], "secondary" | "success" | "destructive" | "warning"> =
  {
    pending: "warning",
    approved: "success",
    rejected: "destructive",
    cancelled: "secondary",
  };

export function ReservationsTable() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["reservations", "all"],
    queryFn: () => getReservations(),
    staleTime: 1000 * 60,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center gap-2 rounded-lg border border-dashed text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Carregando agendamentos...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar os agendamentos.{" "}
        {error instanceof Error ? error.message : null}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Nenhum agendamento encontrado.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table className="min-w-[640px]">
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold">Área</TableHead>
            <TableHead className="font-bold">Morador</TableHead>
            <TableHead className="font-bold">Data</TableHead>
            <TableHead className="font-bold">Horário</TableHead>
            <TableHead className="font-bold">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((reservation) => {
            const dateLabel = format(new Date(reservation.date), "dd/MM/yyyy");
            const startTime = format(
              new Date(reservation.startTime),
              "HH:mm"
            );
            const endTime = format(new Date(reservation.endTime), "HH:mm");

            return (
              <TableRow key={reservation.id}>
                <TableCell className="font-medium">
                  {reservation.area.name}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{reservation.resident.name}</span>
                    {reservation.resident.apartment ? (
                      <span className="text-xs text-muted-foreground">
                        Ap {reservation.resident.apartment}
                      </span>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>{dateLabel}</TableCell>
                <TableCell>
                  {startTime} às {endTime}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[reservation.status]}>
                    {statusLabels[reservation.status]}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
