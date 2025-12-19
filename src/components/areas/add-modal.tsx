import { useEffect, useMemo, useState } from "react";

import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { queryClient } from "@/lib/react-query";

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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from "../ui/input-group";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Plus } from "lucide-react";
import { postArea } from "@/api/post-area";
import { SlotColumn } from "./slot-column";
import type { AreaSlot } from "@/api/get-area-slots";
import {
  MAX_TIME,
  MIN_TIME,
  TIME_STEP_SECONDS,
} from "@/utils/time-range";

interface AddAreaFormData {
  name: string;
  description: string;
  capacity: number;
  available: boolean;
}

const SLOT_STEP_MINUTES = TIME_STEP_SECONDS / 60;

export function AddModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [startSlotId, setStartSlotId] = useState<string | null>(null);
  const [endSlotId, setEndSlotId] = useState<string | null>(null);

  const { handleSubmit, register, reset } = useForm<AddAreaFormData>();

  const slots = useMemo(
    () => buildSlots(MIN_TIME, MAX_TIME, SLOT_STEP_MINUTES),
    []
  );
  const selectedStartSlot =
    slots.find((slot) => slot.id === startSlotId) ?? null;
  const selectedEndSlot = slots.find((slot) => slot.id === endSlotId) ?? null;

  const { mutateAsync: createArea, isPending } = useMutation({
    mutationFn: postArea,
  });

  useEffect(() => {
    if (!isOpen) {
      reset();
      setStartSlotId(null);
      setEndSlotId(null);
    }
  }, [isOpen, reset]);

  useEffect(() => {
    if (!selectedStartSlot || !selectedEndSlot) return;

    if (
      timeToMinutes(selectedEndSlot.endsAt) <=
      timeToMinutes(selectedStartSlot.startsAt)
    ) {
      setEndSlotId(null);
    }
  }, [selectedStartSlot, selectedEndSlot]);

  async function handleAddArea({
    name,
    description,
    capacity,
  }: AddAreaFormData) {
    if (!selectedStartSlot || !selectedEndSlot) {
      toast.error("Selecione o horário de início e fim.");
      return;
    }

    if (
      timeToMinutes(selectedEndSlot.endsAt) <=
      timeToMinutes(selectedStartSlot.startsAt)
    ) {
      toast.error("O horário final deve ser depois do inicial.");
      return;
    }

    try {
      await createArea({
        name,
        description,
        capacity,
        available: true,
        schedule: {
          start: selectedStartSlot.startsAt,
          end: selectedEndSlot.endsAt,
          stepMinutes: SLOT_STEP_MINUTES,
        },
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["areas"] }),
      ]);

      toast.success(`${name} criada com sucesso!`);
      setIsOpen(false);
    } catch {
      throw toast.error("Não foi possível criar a área de lazer.");
    }
  }

  const selectionLabel = useMemo(() => {
    if (!selectedStartSlot || !selectedEndSlot) return null;

    return `${selectedStartSlot.startsAt} às ${selectedEndSlot.endsAt}`;
  }, [selectedStartSlot, selectedEndSlot]);

  const isSubmitDisabled = isPending || !selectedStartSlot || !selectedEndSlot;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus />
          Nova Área de Lazer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90%] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar área de lazer</DialogTitle>
          <DialogDescription>
            Insira os campos necessários para criar uma nova área de lazer.
          </DialogDescription>
        </DialogHeader>
        <form
          id="add-form"
          className="space-y-4"
          onSubmit={handleSubmit(handleAddArea)}
        >
          <div className="space-y-2">
            <Label htmlFor="name">Nome do local</Label>
            <Input
              id="name"
              placeholder="Ex: Salão de Festas"
              {...register("name")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <InputGroup>
              <InputGroupTextarea
                id="description"
                placeholder="Insira a descrição..."
                {...register("description")}
                maxLength={200}
              />
              <InputGroupAddon align="block-end">
                máximo de 200 caracteres
              </InputGroupAddon>
            </InputGroup>
          </div>

          <div className="space-y-2 max-w-14 relative">
            <Label htmlFor="capacity">Capacidade</Label>
            <InputGroup>
              <InputGroupInput
                id="capacity"
                type="number"
                min={0}
                {...register("capacity", { valueAsNumber: true })}
              />
            </InputGroup>
          </div>

          <div className="space-y-2">
            <Label>Horário de funcionamento</Label>
            <div className="flex flex-col md:flex-row border rounded-xl justify-around md:items-center">
              <SlotColumn
                title="Início"
                variant="start"
                slots={slots}
                selectedId={startSlotId}
                onSelect={(slot) => setStartSlotId(slot.id)}
                isLoading={false}
                isSlotDisabled={() => false}
                isSlotInRange={(slot) => {
                  if (!selectedStartSlot || !selectedEndSlot) return false;

                  return isSlotWithinRange(
                    slot,
                    selectedStartSlot,
                    selectedEndSlot
                  );
                }}
              />
              <SlotColumn
                title="Fim"
                variant="end"
                slots={slots}
                selectedId={endSlotId}
                onSelect={(slot) => setEndSlotId(slot.id)}
                isLoading={false}
                isSlotDisabled={(slot) => {
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
            <p className="text-sm text-muted-foreground">
              {selectionLabel
                ? `Funcionamento: ${selectionLabel}.`
                : "Selecione o início e o fim do intervalo."}
            </p>
          </div>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancelar</Button>
          </DialogClose>
          <Button form="add-form" type="submit" disabled={isSubmitDisabled}>
            {isPending ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function buildSlots(
  startTime: string,
  endTime: string,
  stepMinutes: number
): AreaSlot[] {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const slots: AreaSlot[] = [];
  let sortOrder = 0;

  for (let start = startMinutes; start < endMinutes; start += stepMinutes) {
    const slotEnd = Math.min(start + stepMinutes, endMinutes);
    const startsAt = minutesToTime(start);
    const endsAt = minutesToTime(slotEnd);

    slots.push({
      id: `${startsAt}-${endsAt}`,
      label: `${startsAt} - ${endsAt}`,
      startsAt,
      endsAt,
      sortOrder: sortOrder++,
      available: true,
    });
  }

  return slots;
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

function minutesToTime(totalMinutes: number) {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
}
