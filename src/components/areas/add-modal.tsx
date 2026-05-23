import { type ReactElement, useEffect, useMemo, useState } from "react";

import { useMutation } from "@tanstack/react-query";
import { useForm, type FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { Plus } from "lucide-react";
import { postArea } from "@/api/post-area";
import { uploadImage } from "@/api/post-image";
import { SlotColumn } from "./slot-column";
import type { AreaSlot } from "@/api/get-area-slots";
import {
  MAX_TIME,
  MIN_TIME,
  TIME_STEP_SECONDS,
} from "@/utils/time-range";
import { fileToDataUrl } from "@/utils/image-utils";
import { formatFieldErrors } from "@/utils/form-errors";

import { ImageDropzone } from "@/components/images/image-dropzone";

const addAreaFormSchema = z.object({
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
  ).optional(),
});

type AddAreaFormInput = z.input<typeof addAreaFormSchema>;
type AddAreaFormData = z.output<typeof addAreaFormSchema>;

const SLOT_STEP_MINUTES = TIME_STEP_SECONDS / 60;

type AddModalProps = {
  trigger?: ReactElement;
};

export function AddModal({ trigger }: AddModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [startSlotId, setStartSlotId] = useState<string | null>(null);
  const [endSlotId, setEndSlotId] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [scheduleError, setScheduleError] = useState(false);

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<AddAreaFormInput, unknown, AddAreaFormData>({
    resolver: zodResolver(addAreaFormSchema),
    defaultValues: {
      name: "",
      description: "",
      capacity: undefined,
    },
  });

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
      setImageFiles([]);
      setScheduleError(false);
    }
  }, [isOpen, reset]);

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

  function handleInvalidForm(formErrors: FieldErrors<AddAreaFormInput>) {
    toast.error(formatFieldErrors(formErrors, fieldLabels));
  }

  async function handleAddArea({
    name,
    description,
    capacity,
  }: AddAreaFormData) {
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
      const created = await createArea({
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

      const imageFile = imageFiles[0];
      if (imageFile) {
        try {
          const dataUrl = await fileToDataUrl(imageFile);
          await uploadImage({
            entityType: "area",
            entityId: created.id,
            image: dataUrl,
          });
        } catch (error) {
          toast.error("Não foi possível salvar a imagem da área.");
          console.error(error);
        }
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["areas"] }),
      ]);

      toast.success(`${name} criada com sucesso!`);
      reset();
      setStartSlotId(null);
      setEndSlotId(null);
      setImageFiles([]);
      setScheduleError(false);
      setIsOpen(false);
    } catch {
      toast.error("Não foi possível criar a área de lazer.");
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
        {trigger ?? (
          <Button>
            <Plus />
            Nova Área de Lazer
          </Button>
        )}
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
          onSubmit={handleSubmit(handleAddArea, handleInvalidForm)}
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
                {...register("description")}
                maxLength={200}
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

          <div className="space-y-2">
            <Label>Imagem (opcional)</Label>
            <ImageDropzone
              value={imageFiles}
              onChange={setImageFiles}
              maxFiles={1}
              maxSizeMB={4}
            />
          </div>

          <div className="space-y-2 max-w-14 relative">
            <Label htmlFor="capacity">Capacidade</Label>
            <InputGroup>
              <InputGroupInput
                id="capacity"
                type="number"
                min={0}
                aria-invalid={Boolean(errors.capacity)}
                {...register("capacity", { valueAsNumber: true })}
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
