import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, Heart, MapPin, User, Users } from "lucide-react";

import { getEvents } from "@/api/get-events";
import type { Event } from "@/api/get-events";
import { AddModal } from "@/components/events/add-modal";
import { EditModal } from "@/components/events/edit-modal";
import { DeleteModal } from "@/components/events/delete-modal";
import { BookingsModal } from "@/components/events/bookings-modal";
import {
  EventsAdminListSkeleton,
  EventsAdminSummarySkeleton,
} from "@/components/events/events-admin-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty";
import { PageHeader } from "@/components/layout/page-header";

const formatDate = (value: string) =>
  format(parseISO(value), "dd/MM/yyyy HH:mm", { locale: ptBR });

export function EventsAdmin() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
  });
  const events = useMemo(() => data ?? [], [data]);
  const summary = useMemo(() => {
    const total = events.length;
    const bookable = events.filter((event) => event.allowBookings).length;
    const informative = total - bookable;
    const totalBookings = events.reduce(
      (acc, event) => acc + (event.allowBookings ? event.bookingsCount : 0),
      0
    );

    return { total, bookable, informative, totalBookings };
  }, [events]);

  function handleOpenBookings(event: Event) {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  }

  function handleDialogChange(open: boolean) {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedEvent(null);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Eventos do condomínio"
        description="Planeje eventos, comunique mudanças e gerencie inscrições."
        actions={<AddModal />}
      />

      {isLoading ? (
        <EventsAdminSummarySkeleton />
      ) : !isError && events.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border bg-muted/40 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Eventos ativos
            </p>
            <p className="text-2xl font-semibold text-foreground">{summary.total}</p>
            <p className="text-xs text-muted-foreground">
              Total cadastrados
            </p>
          </div>
          <div className="rounded-2xl border bg-muted/40 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Agendáveis
            </p>
            <p className="text-2xl font-semibold text-foreground">
              {summary.bookable}
            </p>
            <p className="text-xs text-muted-foreground">
              Com inscrições abertas
            </p>
          </div>
          <div className="rounded-2xl border bg-muted/40 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Informativos
            </p>
            <p className="text-2xl font-semibold text-foreground">
              {summary.informative}
            </p>
            <p className="text-xs text-muted-foreground">
              Sem agendamento
            </p>
          </div>
          <div className="rounded-2xl border bg-muted/40 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Inscrições
            </p>
            <p className="text-2xl font-semibold text-foreground">
              {summary.totalBookings}
            </p>
            <p className="text-xs text-muted-foreground">
              Total de participantes
            </p>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <EventsAdminListSkeleton />
      ) : isError ? (
        <p className="text-sm text-destructive">
          Não foi possível carregar os eventos.
        </p>
      ) : events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Nenhum evento cadastrado"
          description="Crie um novo evento para começar a divulgar no condomínio."
          size="sm"
          className="flex-1 min-h-0"
        />
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const occupancy =
              event.capacity > 0
                ? Math.min(
                    100,
                    Math.round((event.bookingsCount / event.capacity) * 100)
                  )
                : 0;

            return (
              <div
                key={event.id}
                className="group overflow-hidden rounded-3xl border bg-background shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col lg:flex-row">
                  <div className="relative h-44 w-full lg:h-auto lg:w-56">
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-muted/70 to-muted text-muted-foreground">
                        <CalendarDays className="size-8" />
                      </div>
                    )}
                    <Badge
                      variant="outline"
                      className={[
                        "absolute left-3 top-3 backdrop-blur",
                        event.allowBookings
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-border/60 bg-muted/70 text-muted-foreground",
                      ].join(" ")}
                    >
                      {event.allowBookings ? "Agendável" : "Informativo"}
                    </Badge>
                  </div>

                  <div className="flex flex-1 flex-col gap-4 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-foreground">
                          {event.title}
                        </h3>
                        {event.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {event.description}
                          </p>
                        )}
                      </div>
                      <div className="rounded-2xl border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                        <p>{formatDate(event.startDate)}</p>
                        <p>até {formatDate(event.endDate)}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3" />
                        {event.location?.name ?? "Área comum"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="size-3" />
                        {formatDate(event.startDate)} · {formatDate(event.endDate)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <User className="size-3" />
                        {event.createdBy?.name ?? "Portaria"}
                      </span>
                    </div>

                    {event.allowBookings && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {event.bookingsCount} / {event.capacity} inscritos
                          </span>
                          <span>{occupancy}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-primary transition-all"
                            style={{ width: `${occupancy}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {event.allowBookings ? (
                          <span className="inline-flex items-center gap-1">
                            <Users className="size-3" />
                            {event.bookingsCount}/{event.capacity} inscritos
                          </span>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Sem agendamento
                          </Badge>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Heart className="size-3 text-destructive" />
                          {event.likesCount} curtidas
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenBookings(event)}
                        >
                          Detalhes
                        </Button>
                        <EditModal event={event} />
                        <DeleteModal eventId={event.id} title={event.title} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <BookingsModal
        event={selectedEvent}
        open={isDialogOpen}
        onOpenChange={handleDialogChange}
      />
    </div>
  );
}
