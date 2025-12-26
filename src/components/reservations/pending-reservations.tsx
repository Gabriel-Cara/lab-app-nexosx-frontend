import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

import { getReservations, type Reservation } from "@/api/get-reservations";
import {
  approveReservation,
  rejectReservation,
} from "@/api/patch-reservation-status";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { PendingReservationsSkeleton } from "@/components/reservations/pending-reservations-skeleton";

export function PendingReservations() {
  const queryClient = useQueryClient();
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["reservations", "pending"],
    queryFn: () => getReservations({ status: "pending" }),
    staleTime: 1000 * 60,
  });

  const { data: approvedReservations } = useQuery({
    queryKey: ["reservations", "approved-future"],
    queryFn: () =>
      getReservations({
        status: "approved",
        startDate: today.toISOString(),
      }),
    staleTime: 1000 * 60,
  });

  const [actingId, setActingId] = useState<string | null>(null);

  function invalidateReservations() {
    queryClient.invalidateQueries({ queryKey: ["reservations", "pending"] });
    queryClient.invalidateQueries({ queryKey: ["reservations", "all"] });
    queryClient.invalidateQueries({ queryKey: ["reservations-overview"] });
    queryClient.invalidateQueries({ queryKey: ["upcoming-reservations"] });
    queryClient.invalidateQueries({ queryKey: ["reservations", "approved-future"] });
  }

  const approveMutation = useMutation({
    mutationFn: approveReservation,
    onSuccess: () => {
      toast.success("Agendamento aprovado!");
      invalidateReservations();
    },
    onError: () => toast.error("Não foi possível aprovar o agendamento."),
    onSettled: () => setActingId(null),
  });

  const rejectMutation = useMutation({
    mutationFn: rejectReservation,
    onSuccess: () => {
      toast.success("Agendamento rejeitado.");
      invalidateReservations();
    },
    onError: () => toast.error("Não foi possível rejeitar o agendamento."),
    onSettled: () => setActingId(null),
  });

  const reservations = useMemo(() => data ?? [], [data]);

  if (isLoading) {
    return <PendingReservationsSkeleton />;
  }

  if (isError) {
    return (
      <div className="rounded-xl border p-4 text-sm text-destructive">
        Não foi possível carregar as solicitações.{" "}
        {error instanceof Error ? error.message : null}
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
        Nenhum agendamento pendente de aprovação.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reservations.map((reservation) => (
        <PendingCard
          key={reservation.id}
          reservation={reservation}
          pendingReservations={reservations}
          approvedReservations={approvedReservations ?? []}
          onApprove={() => {
            setActingId(reservation.id);
            approveMutation.mutate(reservation.id);
          }}
          onReject={() => {
            setActingId(reservation.id);
            rejectMutation.mutate(reservation.id);
          }}
          isProcessing={actingId === reservation.id}
        />
      ))}
    </div>
  );
}

type PendingCardProps = {
  reservation: Reservation;
  pendingReservations: Reservation[];
  approvedReservations: Reservation[];
  onApprove: () => void;
  onReject: () => void;
  isProcessing: boolean;
};

function PendingCard({
  reservation,
  pendingReservations,
  approvedReservations,
  onApprove,
  onReject,
  isProcessing,
}: PendingCardProps) {
  const dateLabel = format(new Date(reservation.date), "dd 'de' MMMM", {
    locale: ptBR,
  });
  const startTime = format(new Date(reservation.startTime), "HH:mm");
  const endTime = format(new Date(reservation.endTime), "HH:mm");
  const conflict = useMemo(
    () =>
      analyzeConflict(reservation, pendingReservations, approvedReservations),
    [reservation, pendingReservations, approvedReservations]
  );

  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-base font-semibold text-foreground">
            {reservation.area.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {dateLabel} · {startTime} às {endTime}
          </p>
        </div>
        <Badge variant={conflict.badgeVariant}>{conflict.label}</Badge>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">
          {reservation.resident.name}
        </span>
        {reservation.resident.apartment ? (
          <span>Ap {reservation.resident.apartment}</span>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button
          size="sm"
          onClick={onApprove}
          disabled={isProcessing || conflict.badgeVariant === "destructive"}
        >
          Aprovar
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onReject}
          disabled={isProcessing}
        >
          Rejeitar
        </Button>
      </div>
    </div>
  );
}

function analyzeConflict(
  current: Reservation,
  pendingReservations: Reservation[],
  approvedReservations: Reservation[]
) {
  const currentStart = new Date(current.startTime);
  const currentEnd = new Date(current.endTime);
  const currentDate = new Date(current.date).toDateString();

  const overlaps = (reservation: Reservation) => {
    if (reservation.areaId !== current.areaId) return false;
    const reservationDate = new Date(reservation.date).toDateString();
    if (reservationDate !== currentDate) return false;

    const start = new Date(reservation.startTime);
    const end = new Date(reservation.endTime);
    return currentStart < end && currentEnd > start;
  };

  const hasApprovedConflict = approvedReservations.some(overlaps);
  if (hasApprovedConflict) {
    return { label: "Conflito", badgeVariant: "destructive" as const };
  }

  const pendingConflict = pendingReservations.some(
    (reservation) => reservation.id !== current.id && overlaps(reservation)
  );

  if (pendingConflict) {
    return { label: "Ponto de atenção", badgeVariant: "warning" as const };
  }

  return { label: "Livre", badgeVariant: "success" as const };
}
