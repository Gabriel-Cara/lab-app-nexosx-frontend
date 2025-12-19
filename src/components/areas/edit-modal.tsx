import { useEffect, useMemo, useState } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { getArea } from "@/api/get-area";
import { patchArea } from "@/api/patch-area";
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
import { SlotColumn } from "./slot-column";
import type { AreaSlot } from "@/api/get-area-slots";
import {
  MAX_TIME,
  MIN_TIME,
  TIME_STEP_SECONDS,
} from "@/utils/time-range";

interface EditModalProps {
  areaId: string;
}

interface EditAreaFormData {
  name: string;
  description: string;
  capacity: number;
  available: boolean;
}

const SLOT_STEP_MINUTES = TIME_STEP_SECONDS / 60;

export function EditModal({ areaId }: EditModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [startSlotId, setStartSlotId] = useState<string | null>(null);
  const [endSlotId, setEndSlotId] = useState<string | null>(null);

  const { handleSubmit, register } = useForm<EditAreaFormData>();

  const { data: areaData } = useQuery({
    queryKey: ["area-details", areaId],
    queryFn: () => getArea({ id: areaId }),
  });

  const { mutateAsync: updateArea, isPending } = useMutation({
    mutationFn: patchArea,
  });

  const slots = useMemo(
    () => buildSlots(MIN_TIME, MAX_TIME, SLOT_STEP_MINUTES),
    []
  );
  const selectedStartSlot =
    slots.find((slot) => slot.id === startSlotId) ?? null;
  const selectedEndSlot = slots.find((slot) => slot.id === endSlotId) ?? null;

  useEffect(() => {
    if (!isOpen) {
      setStartSlotId(null);
      setEndSlotId(null);
      return;
    }

    if (!areaData?.timeSlots?.length) return;

    const sortedSlots = [...areaData.timeSlots].sort((a, b) => {
      if (a.sortOrder !== null && b.sortOrder !== null) {
        return a.sortOrder - b.sortOrder;
      }

      return a.startsAt.localeCompare(b.startsAt);
    });
    const startTime = sortedSlots[0]?.startsAt;
    const endTime = sortedSlots[sortedSlots.length - 1]?.endsAt;

    if (!startTime || !endTime) return;

    const startSlot = slots.find((slot) => slot.startsAt === startTime) ?? null;
    const endSlot = slots.find((slot) => slot.endsAt === endTime) ?? null;

    setStartSlotId(startSlot?.id ?? null);
    setEndSlotId(endSlot?.id ?? null);
  }, [areaData, isOpen, slots]);

  useEffect(() => {
    if (!selectedStartSlot || !selectedEndSlot) return;

    if (
      timeToMinutes(selectedEndSlot.endsAt) <=
      timeToMinutes(selectedStartSlot.startsAt)
    ) {
      setEndSlotId(null);
    }
  }, [selectedStartSlot, selectedEndSlot]);

  async function handleEditArea({
    name,
    description,
    capacity,
    available,
  }: EditAreaFormData) {
    if (!areaData) {
      throw toast.error("Não foi possível carregar os dados da área.");
    }

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
      await updateArea({
        id: areaId,
        name,
        description,
        capacity,
        available,
        schedule: {
          start: selectedStartSlot.startsAt,
          end: selectedEndSlot.endsAt,
          stepMinutes: SLOT_STEP_MINUTES,
        },
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["areas"] }),
        queryClient.invalidateQueries({ queryKey: ["area-details", areaId] }),
      ]);

      toast.success("Área atualizada com sucesso!");
      setIsOpen(false);
    } catch {
      throw toast.error("Não foi possível atualizar a área.");
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
        <Button variant="outline">Editar</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90%] overflow-y-auto no-scrollbar">
        <DialogHeader>
          <DialogTitle>Editar {areaData?.name}</DialogTitle>
          <DialogDescription>
            Altere os campos necessários para editar os dados da área de lazer:{" "}
            <strong>{areaData?.name}</strong>.
          </DialogDescription>
        </DialogHeader>
        <form
          id="edit-form"
          className="space-y-4"
          onSubmit={handleSubmit(handleEditArea)}
        >
          <div className="space-y-2">
            <Label htmlFor="name">Nome do local</Label>
            <Input
              id="name"
              placeholder="Ex: Salão de Festas"
              defaultValue={areaData?.name}
              {...register("name")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <InputGroup>
              <InputGroupTextarea
                id="description"
                placeholder="Insira a descrição..."
                defaultValue={areaData?.description || ""}
                maxLength={200}
                {...register("description")}
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
                defaultValue={areaData?.capacity || 0}
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

          <div className="space-y-2">
            <Label htmlFor="status" className="flex flex-col items-start">
              Disponibilidade
              <div className="relative inline-block h-5 w-10 cursor-pointer rounded-full bg-zinc-900 transition [-webkit-tap-highlight-color:transparent] has-checked:bg-[#1976D2]">
                <input
                  type="checkbox"
                  id="status"
                  {...register("available")}
                  className="peer sr-only"
                  defaultChecked={areaData?.available}
                />
                <span className="absolute inset-y-0 start-0 m-1 size-3 rounded-full ring-2 ring-inset ring-white transition-all peer-checked:start-6 bg-zinc-900 peer-checked:w-1 peer-checked:bg-white peer-checked:ring-transparent"></span>
              </div>
            </Label>
          </div>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancelar</Button>
          </DialogClose>
          <Button form="edit-form" type="submit" disabled={isSubmitDisabled}>
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
