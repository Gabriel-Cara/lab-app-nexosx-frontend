import { type FormEvent, useEffect, useMemo, useState } from "react";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getAreaWeekSlots } from "@/api/get-area-week-slots";
import { postReservation } from "@/api/post-reservation";

import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { SlotColumn } from "./slot-column";

interface ScheduleModalProps {
  areaId: string;
  status: "available" | "scheduled" | "pending" | "confirmed" | "denied";
}

export function ScheduleModal({ areaId, status }: ScheduleModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startSlotId, setStartSlotId] = useState<string | null>(null);
  const [endSlotId, setEndSlotId] = useState<string | null>(null);
  const [purpose, setPurpose] = useState("");
  const [blockedDatesMap, setBlockedDatesMap] = useState<Record<number, boolean>>({});

  const queryClient = useQueryClient();

  const dateKey = date ? date.toISOString().slice(0, 10) : undefined;
  const weekStart = useMemo(() => {
    if (!date) return undefined;
    const start = startOfWeek(date, { weekStartsOn: 1 });
    start.setHours(0, 0, 0, 0);
    return start;
  }, [date]);
  const weekEnd = useMemo(
    () => (weekStart ? addDays(weekStart, 6) : undefined),
    [weekStart]
  );
  const weekKey = weekStart ? weekStart.toISOString().slice(0, 10) : undefined;

  const { data: weekData, isLoading } = useQuery({
    queryKey: ["area-slots-week", areaId, weekKey],
    queryFn: () =>
      getAreaWeekSlots({
        areaId,
        startDate: weekStart!.toISOString(),
        endDate: weekEnd!.toISOString(),
      }),
    enabled: Boolean(isOpen && weekStart && weekEnd),
    staleTime: 1000 * 60 * 5,
  });

  const { mutateAsync: createReservation, isPending } = useMutation({
    mutationFn: postReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["area-slots-week", areaId] });
    },
  });

  const currentDay = useMemo(() => {
    if (!weekData || !date) return null;
    return (
      weekData.days.find((day) =>
        isSameDay(new Date(day.date), date)
      ) ?? null
    );
  }, [weekData, date]);
  const slots = currentDay?.slots ?? [];
  const bookedDates = useMemo(() => {
    return Object.entries(blockedDatesMap)
      .filter(([, blocked]) => blocked)
      .map(([timestamp]) => {
        const date = new Date(Number(timestamp));
        date.setHours(0, 0, 0, 0);
        return date;
      });
  }, [blockedDatesMap]);

  useEffect(() => {
    if (!weekData) return;

    const fullyBookedKeys = new Set(
      weekData.fullyBookedDates.map((iso) => normalizeDateKey(iso))
    );

    setBlockedDatesMap((prev) => {
      const next = { ...prev };

      weekData.days.forEach((day) => {
        const key = normalizeDateKey(day.date);
        next[key] = fullyBookedKeys.has(key);
      });

      return next;
    });
  }, [weekData]);

  const selectedStartSlot =
    slots.find((slot) => slot.id === startSlotId) ?? null;
  const selectedEndSlot = slots.find((slot) => slot.id === endSlotId) ?? null;

  useEffect(() => {
    if (!isOpen) {
      setStartSlotId(null);
      setEndSlotId(null);
      setPurpose("");
    }
  }, [isOpen]);

  useEffect(() => {
    setStartSlotId(null);
    setEndSlotId(null);
  }, [dateKey]);

  useEffect(() => {
    if (!weekStart || !weekEnd || !isOpen) return;

    const prefetchWeek = (targetStart: Date) => {
      const targetEnd = addDays(new Date(targetStart), 6);
      const key = targetStart.toISOString().slice(0, 10);

      queryClient.prefetchQuery({
        queryKey: ["area-slots-week", areaId, key],
        queryFn: () =>
          getAreaWeekSlots({
            areaId,
            startDate: targetStart.toISOString(),
            endDate: targetEnd.toISOString(),
          }),
      });
    };

    prefetchWeek(addDays(weekStart, 7));
    prefetchWeek(addDays(weekStart, -7));
  }, [weekStart, weekEnd, isOpen, areaId, queryClient]);

  useEffect(() => {
    if (!selectedStartSlot || !selectedEndSlot) return;

    if (
      timeToMinutes(selectedEndSlot.endsAt) <=
      timeToMinutes(selectedStartSlot.startsAt)
    ) {
      setEndSlotId(null);
    }
  }, [selectedStartSlot, selectedEndSlot]);

  const formattedSelection = useMemo(() => {
    if (!date || !selectedStartSlot || !selectedEndSlot) {
      return null;
    }

    return `${format(date, "PPPP", { locale: ptBR })} das ${
      selectedStartSlot.startsAt
    } às ${selectedEndSlot.endsAt}`;
  }, [date, selectedStartSlot, selectedEndSlot]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!date || !startSlotId || !endSlotId) {
      toast.error("Selecione data, início e fim para agendar.");
      return;
    }

    try {
      await createReservation({
        areaId,
        date: date.toISOString(),
        startSlotId,
        endSlotId,
        purpose: purpose || undefined,
      });

      toast.success("Agendamento enviado para aprovação!");
      setIsOpen(false);
    } catch (error: unknown) {
      let message: string | null = null;

      if (
        isApiError(error) &&
        typeof error.response?.data?.message === "string"
      ) {
        message = error.response.data.message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      toast.error(message || "Não foi possível criar o agendamento.");
    }
  }

  const isSubmitDisabled =
    !date || !startSlotId || !endSlotId || isPending || isLoading;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button disabled={isPending || status === "denied"} className="cursor-pointer">Agendar</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90%] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agendar Área de Lazer</DialogTitle>
          <DialogDescription>
            Escolha a data e defina os horários de início e fim para reservar a
            área.
          </DialogDescription>
        </DialogHeader>
        <form id="schedule-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col md:flex-row border rounded-xl justify-around md:items-center">
            <SlotColumn
              title="Início"
              variant="start"
              slots={slots}
              selectedId={startSlotId}
              onSelect={(slot) => setStartSlotId(slot.id)}
              isLoading={isLoading}
              isSlotDisabled={(slot) => !slot.available}
              isSlotInRange={(slot) => {
                if (!selectedStartSlot || !selectedEndSlot) return false;

                return isSlotWithinRange(
                  slot,
                  selectedStartSlot,
                  selectedEndSlot
                );
              }}
            />
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={ptBR}
              className="border-y md:border-x md:border-y-0 max-w-full md:max-w-full w-auto"
              disabled={bookedDates}
              modifiers={{
                booked: bookedDates,
              }}
              modifiersClassNames={{
                booked: "[&>button]:line-through opacity-100",
              }}
            />
            <SlotColumn
              title="Fim"
              variant="end"
              slots={slots}
              selectedId={endSlotId}
              onSelect={(slot) => setEndSlotId(slot.id)}
              isLoading={isLoading}
              isSlotDisabled={(slot) => {
                if (!slot.available) return true;
                if (!selectedStartSlot) return true;

                return (
                  timeToMinutes(slot.endsAt) <=
                  timeToMinutes(selectedStartSlot.startsAt)
                );
              }}
              isSlotInRange={(slot) => {
                if (!selectedStartSlot || !selectedEndSlot) return false;

                return isSlotWithinRange(
                  slot,
                  selectedStartSlot,
                  selectedEndSlot
                );
              }}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="purpose">Observações (opcional)</Label>
            <Textarea
              id="purpose"
              placeholder="Inclua detalhes que ajudem na aprovação"
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
            />
          </div>
        </form>
        <div className="rounded-xl border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          {formattedSelection ? (
            <>O agendamento será em {formattedSelection}.</>
          ) : (
            <>Selecione uma data e os horários para visualizar o resumo.</>
          )}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button type="button" variant="ghost">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="schedule-form"
            disabled={isSubmitDisabled}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Agendando...
              </>
            ) : (
              "Agendar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function isSlotWithinRange(
  slot: AreaSlot,
  startSlot: AreaSlot,
  endSlot: AreaSlot
) {
  const rangeStart = timeToMinutes(startSlot.startsAt);
  const rangeEnd = timeToMinutes(endSlot.endsAt);
  const slotStart = timeToMinutes(slot.startsAt);
  const slotEnd = timeToMinutes(slot.endsAt);

  return slotStart >= rangeStart && slotEnd <= rangeEnd;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

function isApiError(error: unknown): error is ApiError {
  return typeof error === "object" && error !== null && "response" in error;
}

function normalizeDateKey(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}
