import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { addDays, format, startOfWeek } from "date-fns";
import { Loader2 } from "lucide-react";

import { getReservations, type Reservation } from "@/api/get-reservations";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface UpcomingReservationsProps {
  withContainer?: boolean;
}

export function UpcomingReservations({
  withContainer = true,
}: UpcomingReservationsProps) {
  const [expanded, setExpanded] = useState(false);
  const { session } = useAuth();

  const weekStart = useMemo(() => {
    const date = startOfWeek(new Date(), { weekStartsOn: 1 });
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const weekEnd = useMemo(() => {
    const end = addDays(weekStart, 6);
    end.setHours(23, 59, 59, 999);
    return end;
  }, [weekStart]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["upcoming-reservations", weekStart.toISOString()],
    queryFn: () =>
      getReservations({
        startDate: weekStart.toISOString(),
        endDate: weekEnd.toISOString(),
      }),
    staleTime: 1000 * 60 * 5,
  });

  const reservations = data ?? [];
  const visibleReservations = useMemo(() => {
    if (!session?.user) return reservations;
    if (session.user.role !== "resident") return reservations;

    return reservations.filter(
      (reservation) => reservation.residentId === session.user.id
    );
  }, [reservations, session]);
  const preview = visibleReservations.slice(0, 5);
  const remaining = visibleReservations.slice(5);

  const containerClass = withContainer
    ? "rounded-xl border p-4 space-y-4"
    : "space-y-4";
  const placeholderClass = withContainer
    ? "rounded-xl border p-4 text-sm"
    : "rounded-xl border border-dashed p-4 text-sm";

  if (isLoading) {
    return (
      <div
        className={cn(
          placeholderClass,
          "flex min-h-[120px] items-center justify-center gap-2 text-muted-foreground"
        )}
      >
        <Loader2 className="size-4 animate-spin" />
        Carregando agendamentos...
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn(placeholderClass, "text-destructive")}>
        Não foi possível carregar os agendamentos.{" "}
        {error instanceof Error ? error.message : null}
      </div>
    );
  }

  if (visibleReservations.length === 0) {
    return (
      <div className={cn(placeholderClass, "text-muted-foreground")}>
        Nenhum agendamento aprovado para esta semana.
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className="space-y-3">
        {preview.map((reservation) => (
          <ReservationCard key={reservation.id} reservation={reservation} />
        ))}
      </div>
      {remaining.length > 0 ? (
        <div className="rounded-lg border border-dashed p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Ver mais agendamentos
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setExpanded((state) => !state)}
            >
              {expanded
                ? "Recolher"
                : `Expandir (+${remaining.length})`}
            </Button>
          </div>
          <div
            className={cn(
              "grid gap-3 overflow-hidden transition-[max-height] duration-300 ease-in-out",
              expanded ? "max-h-[1200px] mt-3" : "max-h-0"
            )}
          >
            {remaining.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ReservationCard({ reservation }: { reservation: Reservation }) {
  const dateLabel = format(new Date(reservation.date), "dd/MM/yyyy");
  const startTime = format(new Date(reservation.startTime), "HH:mm");
  const endTime = format(new Date(reservation.endTime), "HH:mm");

  return (
    <div className="rounded-lg border p-3 space-y-1">
      <p className="font-medium text-foreground">{reservation.area.name}</p>
      <p className="text-sm text-muted-foreground">
        {dateLabel} — {startTime} às {endTime}
      </p>
      <p className="text-sm text-muted-foreground/80">
        Responsável: {reservation.resident.name}
        {reservation.resident.apartment
          ? ` · Ap ${reservation.resident.apartment}`
          : ""}
      </p>
    </div>
  );
}
