import { type FormEvent, type ReactElement, useEffect, useMemo, useState } from "react";
import {
  addMonths,
  format,
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
  startOfMonth,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
import type { AreaSlot } from "@/api/get-area-slots";

interface ScheduleModalProps {
  areaId: string;
  status: "available" | "scheduled" | "pending" | "confirmed" | "denied";
  trigger?: ReactElement;
}

export function ScheduleModal({ areaId, status, trigger }: ScheduleModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [calendarMonth, setCalendarMonth] = useState<Date>(startOfMonth(new Date()));
  const [startSlotId, setStartSlotId] = useState<string | null>(null);
  const [endSlotId, setEndSlotId] = useState<string | null>(null);
  const [purpose, setPurpose] = useState("");
  const [scheduleError, setScheduleError] = useState(false);

  const queryClient = useQueryClient();

  const today = useMemo(() => startOfDay(new Date()), []);
  const reservationWindowEnd = useMemo(() => addMonths(today, 1), [today]);
  const reservationWindowStartMonth = useMemo(() => startOfMonth(today), [today]);
  const reservationWindowEndMonth = useMemo(
    () => startOfMonth(reservationWindowEnd),
    [reservationWindowEnd]
  );
  const reservationWindowKey = `${today.toISOString().slice(0, 10)}:${reservationWindowEnd
    .toISOString()
    .slice(0, 10)}`;
  const dateKey = date ? date.toISOString().slice(0, 10) : undefined;
  const { data: windowData, isLoading } = useQuery({
    queryKey: ["area-slots-window", areaId, reservationWindowKey],
    queryFn: () =>
      getAreaWeekSlots({
        areaId,
        startDate: today.toISOString(),
        endDate: reservationWindowEnd.toISOString(),
      }),
    enabled: isOpen,
    staleTime: 1000 * 60 * 5,
  });

  const { mutateAsync: createReservation, isPending } = useMutation({
    mutationFn: postReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["area-slots-window", areaId] });
    },
  });

  const currentDay = useMemo(() => {
    if (!windowData || !date) return null;
    return (
      windowData.days.find((day) =>
        isSameDay(new Date(day.date), date)
      ) ?? null
    );
  }, [windowData, date]);
  const slots = currentDay?.slots ?? [];
  const bookedDates = useMemo(() => {
    return (windowData?.fullyBookedDates ?? []).map((value) =>
      normalizeDateKey(value)
    );
  }, [windowData]);
  const firstAvailableDate = useMemo(() => {
    if (!windowData) return today;

    const blockedKeys = new Set(bookedDates.map((value) => value.getTime()));

    for (const day of windowData.days) {
      const candidate = normalizeDateKey(day.date);
      if (isBefore(candidate, today)) {
        continue;
      }

      if (!blockedKeys.has(candidate.getTime())) {
        return candidate;
      }
    }

    return today;
  }, [bookedDates, today, windowData]);
  const disabledDates = useMemo(
    () => [
      { before: today },
      { after: reservationWindowEnd },
      ...bookedDates,
    ],
    [bookedDates, reservationWindowEnd, today]
  );

  const selectedStartSlot =
    slots.find((slot) => slot.id === startSlotId) ?? null;
  const selectedEndSlot = slots.find((slot) => slot.id === endSlotId) ?? null;

  useEffect(() => {
    if (!isOpen) {
      setStartSlotId(null);
      setEndSlotId(null);
      setPurpose("");
      setScheduleError(false);
      setDate(today);
      setCalendarMonth(reservationWindowStartMonth);
    }
  }, [isOpen, reservationWindowStartMonth, today]);

  useEffect(() => {
    setStartSlotId(null);
    setEndSlotId(null);
  }, [dateKey]);

  useEffect(() => {
    if (!isOpen || !windowData) return;

    if (
      !date ||
      isBefore(startOfDay(date), today) ||
      isAfter(startOfDay(date), reservationWindowEnd) ||
      bookedDates.some((bookedDate) => isSameDay(bookedDate, date))
    ) {
      setDate(firstAvailableDate);
    }
  }, [bookedDates, date, firstAvailableDate, isOpen, reservationWindowEnd, today, windowData]);

  useEffect(() => {
    if (!selectedStartSlot || !selectedEndSlot) return;

    if (
      timeToMinutes(selectedEndSlot.endsAt) <=
      timeToMinutes(selectedStartSlot.startsAt)
    ) {
      setEndSlotId(null);
      setScheduleError(true);
      return;
    }
    setScheduleError(false);
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
      setScheduleError(true);
      toast.error("Campos inválidos: Data, Início e Fim.");
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
      setDate(today);
      setCalendarMonth(reservationWindowStartMonth);
      setStartSlotId(null);
      setEndSlotId(null);
      setPurpose("");
      setScheduleError(false);
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
        {trigger ?? (
          <Button disabled={isPending || status === "denied"} className="cursor-pointer">
            Agendar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90%] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agendar Área de Lazer</DialogTitle>
          <DialogDescription>
            Escolha uma data disponível entre hoje e{" "}
            {format(reservationWindowEnd, "dd/MM/yyyy")} e defina os horários
            de início e fim para reservar a área.
          </DialogDescription>
        </DialogHeader>
        <form id="schedule-form" onSubmit={handleSubmit} className="space-y-6">
          <div
            className={cn(
              "flex flex-col md:flex-row border rounded-xl justify-around md:items-center",
              scheduleError && "border-rose-500"
            )}
          >
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
              month={calendarMonth}
              onMonthChange={setCalendarMonth}
              startMonth={reservationWindowStartMonth}
              endMonth={reservationWindowEndMonth}
              defaultMonth={reservationWindowStartMonth}
              locale={ptBR}
              showOutsideDays
              className="border-y md:border-x md:border-y-0 max-w-full md:max-w-full w-auto h-auto"
              disabled={disabledDates}
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
  return date;
}
