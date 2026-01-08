import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight, Heart, MapPin } from "lucide-react";
import { toast } from "sonner";

import { getEvents, type Event } from "@/api/get-events";
import { postEventBooking } from "@/api/post-event-booking";
import { postEventLike } from "@/api/post-event-like";
import { deleteEventLike } from "@/api/delete-event-like";
import { queryClient } from "@/lib/react-query";

import { Button } from "@/components/ui/button";
import { BookingsModal } from "@/components/events/bookings-modal";
import { EventsFeedSkeleton } from "@/components/events/events-feed-skeleton";

const formatDate = (value: string) =>
  format(parseISO(value), "dd/MM/yyyy HH:mm", { locale: ptBR });

export function EventsFeed() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
  });

  const events = useMemo(() => data ?? [], [data]);


  const { mutateAsync: toggleLike, isPending: isLiking } = useMutation({
    mutationFn: async (event: Event) => {
      if (event.likedByUser) {
        return deleteEventLike(event.id);
      }
      return postEventLike(event.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const { mutateAsync: bookEvent, isPending: isBooking } = useMutation({
    mutationFn: postEventBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  async function handleLike(event: Event) {
    try {
      await toggleLike(event);
    } catch {
      toast.error("Não foi possível atualizar a curtida.");
    }
  }

  async function handleBooking(event: Event) {
    try {
      await bookEvent({ eventId: event.id });
      toast.success("Inscrição confirmada!");
    } catch {
      toast.error("Não foi possível confirmar a inscrição.");
    }
  }

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

  function handleScroll(direction: "left" | "right") {
    const target = scrollRef.current;
    if (!target) return;
    const amount = Math.max(320, target.clientWidth * 0.6);
    target.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  if (isLoading) {
    return <EventsFeedSkeleton />;
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        Não foi possível carregar os eventos.
      </p>
    );
  }

  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum evento publicado ainda.
      </p>
    );
  }

  return (
    <div className="space-y-5 px-4 sm:px-6 md:px-10 lg:px-14">
      <div className="hidden items-center justify-end gap-2 md:flex">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => handleScroll("left")}
          aria-label="Eventos anteriores"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => handleScroll("right")}
          aria-label="Próximos eventos"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div
        ref={scrollRef}
        className="flex flex-col items-center gap-8 md:flex-row md:items-stretch md:gap-6 md:overflow-x-auto md:pb-4 md:pt-1 md:scroll-px-10 lg:scroll-px-14 md:snap-x md:snap-mandatory"
      >
        {events.map((event) => {
        const hasBookings = event.allowBookings;
        const isFull = event.bookingsCount >= event.capacity;
        const canBook = hasBookings && !event.bookedByUser && !isFull;
        const occupancy =
          event.capacity > 0
            ? Math.min(100, Math.round((event.bookingsCount / event.capacity) * 100))
            : 0;

        return (
          <article
            key={event.id}
            className="group w-full max-w-md overflow-hidden rounded-3xl border bg-background shadow-sm transition hover:-translate-y-1 hover:shadow-lg md:w-[360px] md:flex-none md:max-w-none md:snap-start"
            onClick={() => handleOpenBookings(event)}
            onKeyDown={(keyboardEvent) => {
              if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
                keyboardEvent.preventDefault();
                handleOpenBookings(event);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div className="relative">
              <div className="aspect-[4/5] bg-muted">
                {event.imageUrl ? (
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-muted/70 to-muted text-muted-foreground">
                    <CalendarDays className="size-10" />
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/70 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 space-y-2">
                <h3 className="text-2xl font-semibold text-foreground">
                  {event.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-foreground/80">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3" />
                    {event.location?.name ?? "Área comum"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="size-3" />
                    {formatDate(event.startDate)} · {formatDate(event.endDate)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-5">
              {event.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {event.description}
                </p>
              )}

              {event.allowBookings && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{event.bookingsCount} inscritos</span>
                    <span>{event.capacity} vagas</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${occupancy}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={(mouseEvent) => {
                      mouseEvent.stopPropagation();
                      handleLike(event);
                    }}
                    disabled={isLiking}
                  >
                    <Heart
                      className={
                        event.likedByUser
                          ? "text-destructive fill-destructive"
                          : "text-muted-foreground"
                      }
                    />
                    {event.likesCount}
                  </Button>
                </div>

                {event.allowBookings && (
                  <Button
                    type="button"
                    variant={event.bookedByUser ? "outline" : "default"}
                    onClick={(mouseEvent) => {
                      mouseEvent.stopPropagation();
                      handleBooking(event);
                    }}
                    disabled={!canBook || isBooking}
                  >
                    {event.bookedByUser
                      ? "Inscrito"
                      : isFull
                      ? "Evento lotado"
                      : "Quero participar"}
                  </Button>
                )}
              </div>
            </div>
          </article>
        );
        })}
      </div>

      <BookingsModal
        event={selectedEvent}
        open={isDialogOpen}
        onOpenChange={handleDialogChange}
      />
    </div>
  );
}
