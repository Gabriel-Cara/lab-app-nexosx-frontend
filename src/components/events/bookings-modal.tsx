import { useQuery } from "@tanstack/react-query";

import { getEventBookings } from "@/api/get-event-bookings";
import type { Event } from "@/api/get-events";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EventBookingsSkeleton } from "@/components/events/events-bookings-skeleton";

type BookingsModalProps = {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function BookingsModal({
  event,
  open,
  onOpenChange,
}: BookingsModalProps) {
  const {
    data: bookings = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["event-bookings", event?.id],
    queryFn: () => getEventBookings(event!.id),
    enabled: open && !!event,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inscritos</DialogTitle>
          <DialogDescription>{event?.title ?? "Evento"}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <EventBookingsSkeleton />
        ) : isError ? (
          <p className="text-sm text-destructive">
            Não foi possível carregar os inscritos.
          </p>
        ) : bookings.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum morador inscrito ainda.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="text-right">Apartamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((resident, index) => (
                <TableRow
                  key={`${resident.name}-${resident.apartment ?? "na"}-${index}`}
                >
                  <TableCell className="font-medium">
                    {resident.name}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {resident.apartment ? `Apto ${resident.apartment}` : "Sem apto"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
