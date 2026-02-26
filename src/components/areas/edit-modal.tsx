import { useEffect, useMemo, useState } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm, type FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { getArea } from "@/api/get-area";
import { patchArea } from "@/api/patch-area";
import { queryClient } from "@/lib/react-query";
import { cn } from "@/lib/utils";

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
import { Field, FieldContent, FieldLabel } from "../ui/field";
import { Label } from "../ui/label";
import { SlotColumn } from "./slot-column";
import { ImageManager } from "@/components/images/image-manager";
import type { AreaSlot } from "@/api/get-area-slots";
import {
  MAX_TIME,
  MIN_TIME,
  TIME_STEP_SECONDS,
} from "@/utils/time-range";
import { formatFieldErrors } from "@/utils/form-errors";

interface EditModalProps {
  areaId: string;
}

const editAreaFormSchema = z.object({
  name: z.string().min(2, "Informe o nome do local."),
  description: z.string().optional(),
  capacity: z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }
      if (typeof value === "number" && Number.isNaN(value)) {
        return undefined;
      }
      return value;
    },
    z.number().int().positive("Informe uma capacidade válida.").optional()
  ),
  available: z.boolean().optional(),
});

type EditAreaFormData = z.infer<typeof editAreaFormSchema>;

const SLOT_STEP_MINUTES = TIME_STEP_SECONDS / 60;

export function EditModal({ areaId }: EditModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [startSlotId, setStartSlotId] = useState<string | null>(null);
  const [endSlotId, setEndSlotId] = useState<string | null>(null);
  const [scheduleError, setScheduleError] = useState(false);

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<EditAreaFormData>({
    resolver: zodResolver(editAreaFormSchema),
    defaultValues: {
      name: "",
      description: "",
      capacity: undefined,
      available: false,
    },
  });

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
      setScheduleError(false);
      return;
    }

    if (areaData) {
      reset({
        name: areaData.name ?? "",
        description: areaData.description ?? "",
        capacity: areaData.capacity ?? undefined,
        available: areaData.available ?? false,
      });
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
  }, [areaData, isOpen, reset, slots]);

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

  const fieldLabels = {
    name: "Nome do local",
    description: "Descrição",
    capacity: "Capacidade",
  };

  function handleInvalidForm(formErrors: FieldErrors<EditAreaFormData>) {
    toast.error(formatFieldErrors(formErrors, fieldLabels));
  }

  async function handleEditArea({
    name,
    description,
    capacity,
    available,
  }: EditAreaFormData) {
    if (!areaData) {
      toast.error("Não foi possível carregar os dados da área.");
      return;
    }

    if (!selectedStartSlot || !selectedEndSlot) {
      setScheduleError(true);
      toast.error("Horário de funcionamento: selecione início e fim.");
      return;
    }

    if (
      timeToMinutes(selectedEndSlot.endsAt) <=
      timeToMinutes(selectedStartSlot.startsAt)
    ) {
      setScheduleError(true);
      toast.error("Horário de funcionamento: o fim deve ser depois do início.");
      return;
    }

    try {
      const normalizedCapacity =
        typeof capacity === "number" && !Number.isNaN(capacity)
          ? capacity
          : null;

      await updateArea({
        id: areaId,
        name: name.trim(),
        description: description?.trim() || null,
        capacity: normalizedCapacity,
        available: available ?? areaData.available,
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
      reset({
        name: name.trim(),
        description: description?.trim() || "",
        capacity: normalizedCapacity ?? undefined,
        available: available ?? areaData.available,
      });
      setScheduleError(false);
      setIsOpen(false);
    } catch {
      toast.error("Não foi possível atualizar a área.");
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
          onSubmit={handleSubmit(handleEditArea, handleInvalidForm)}
        >
          <Field className="gap-2">
            <FieldLabel htmlFor="name">Nome do local</FieldLabel>
            <FieldContent>
              <Input
                id="name"
                placeholder="Ex: Salão de Festas"
                aria-invalid={Boolean(errors.name)}
                aria-required={true}
                {...register("name")}
              />
            </FieldContent>
            {errors.name && (
              <p className="text-xs text-rose-500">{errors.name.message}</p>
            )}
          </Field>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <InputGroup>
              <InputGroupTextarea
                id="description"
                placeholder="Insira a descrição..."
                aria-invalid={Boolean(errors.description)}
                maxLength={200}
                {...register("description")}
              />
              <InputGroupAddon align="block-end">
                máximo de 200 caracteres
              </InputGroupAddon>
            </InputGroup>
            {errors.description && (
              <p className="text-xs text-rose-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <ImageManager
            entityType="area"
            entityId={areaId}
            imageUrl={areaData?.imageUrl}
            label="Imagem da área"
            onUpdated={() => {
              queryClient.invalidateQueries({ queryKey: ["areas"] });
              queryClient.invalidateQueries({ queryKey: ["area-details", areaId] });
            }}
          />

          <div className="space-y-2 max-w-14 relative">
            <Label htmlFor="capacity">Capacidade</Label>
            <InputGroup>
              <InputGroupInput
                id="capacity"
                type="number"
                min={0}
                aria-invalid={Boolean(errors.capacity)}
                {...register("capacity", {
                  setValueAs: (value) =>
                    value === "" ? undefined : Number(value),
                })}
              />
            </InputGroup>
            {errors.capacity && (
              <p className="text-xs text-rose-500">
                {errors.capacity.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Horário de funcionamento</Label>
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
