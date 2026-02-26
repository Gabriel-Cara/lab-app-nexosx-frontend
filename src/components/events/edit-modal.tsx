import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm, useWatch, type FieldErrors } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import type { Event } from "@/api/get-events";
import { getAreas } from "@/api/get-areas";
import { patchEvent } from "@/api/patch-event";
import { queryClient } from "@/lib/react-query";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImageManager } from "@/components/images/image-manager";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatFieldErrors } from "@/utils/form-errors";

const editEventFormSchema = z.object({
  title: z.string().min(3, "Informe o título do evento."),
  description: z.string().optional(),
  commonAreaId: z.string().min(1, "Selecione uma área de lazer."),
  capacity: z.number().int().positive("Informe uma capacidade válida."),
  startDate: z.string().min(1, "Informe a data de início."),
  endDate: z.string().min(1, "Informe a data de fim."),
  allowBookings: z.boolean(),
});

type EditEventFormData = z.infer<typeof editEventFormSchema>;

type EditModalProps = {
  event: Event;
};

const toDateTimeLocal = (value: string) =>
  format(parseISO(value), "yyyy-MM-dd'T'HH:mm");

export function EditModal({ event }: EditModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const lastAreaId = useRef<string | null>(null);

  const { data: areas = [] } = useQuery({
    queryKey: ["areas"],
    queryFn: getAreas,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    setError,
    formState: { errors },
  } =
    useForm<EditEventFormData>({
      resolver: zodResolver(editEventFormSchema),
      defaultValues: {
        title: event.title,
        description: event.description ?? "",
        commonAreaId: event.commonAreaId,
        capacity: event.capacity,
        startDate: toDateTimeLocal(event.startDate),
        endDate: toDateTimeLocal(event.endDate),
        allowBookings: event.allowBookings,
      },
    });

  const selectedAreaId = useWatch({ control, name: "commonAreaId" });
  const selectedArea = useMemo(
    () => areas.find((area) => area.id === selectedAreaId),
    [areas, selectedAreaId]
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    reset({
      title: event.title,
      description: event.description ?? "",
      commonAreaId: event.commonAreaId,
      capacity: event.capacity,
      startDate: toDateTimeLocal(event.startDate),
      endDate: toDateTimeLocal(event.endDate),
      allowBookings: event.allowBookings,
    });
  }, [event, isOpen, reset]);

  useEffect(() => {
    if (!selectedArea || selectedArea.id === lastAreaId.current) {
      return;
    }

    if (selectedArea.capacity !== null && selectedArea.capacity !== undefined) {
      setValue("capacity", selectedArea.capacity);
    }

    lastAreaId.current = selectedArea.id;
  }, [selectedArea, setValue]);

  const { mutateAsync: updateEvent, isPending } = useMutation({
    mutationFn: patchEvent,
  });

  const fieldLabels = {
    title: "Título",
    commonAreaId: "Área de lazer",
    capacity: "Capacidade",
    startDate: "Início",
    endDate: "Fim",
  };

  function handleInvalidForm(formErrors: FieldErrors<EditEventFormData>) {
    toast.error(formatFieldErrors(formErrors, fieldLabels));
  }

  async function handleEditEvent(data: EditEventFormData) {
    if (new Date(data.endDate) < new Date(data.startDate)) {
      setError("endDate", {
        type: "manual",
        message: "A data final deve ser posterior à inicial.",
      });
      toast.error("Campo inválido: Fim.");
      return;
    }

    try {
      await updateEvent({
        id: event.id,
        title: data.title,
        description: data.description || undefined,
        commonAreaId: data.commonAreaId,
        capacity: data.capacity,
        startDate: data.startDate,
        endDate: data.endDate,
        allowBookings: data.allowBookings,
      });

      await queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Evento atualizado com sucesso!");
      reset(data);
      setIsOpen(false);
    } catch {
      toast.error("Não foi possível atualizar o evento.");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Editar</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar evento</DialogTitle>
          <DialogDescription>
            Atualize as informações do evento {event.title}.
          </DialogDescription>
        </DialogHeader>

        <form
          id={`edit-event-${event.id}`}
          className="grid gap-4"
          onSubmit={handleSubmit(handleEditEvent, handleInvalidForm)}
        >
          <Field className="gap-2">
            <FieldLabel htmlFor={`title-${event.id}`}>Título</FieldLabel>
            <FieldContent>
              <Input
                id={`title-${event.id}`}
                placeholder="Ex: Natal do condomínio"
                aria-invalid={Boolean(errors.title)}
                aria-required={true}
                {...register("title")}
              />
            </FieldContent>
            {errors.title && (
              <p className="text-xs text-rose-500">{errors.title.message}</p>
            )}
          </Field>

          <div className="grid gap-2">
            <Label htmlFor={`description-${event.id}`}>Descrição</Label>
            <InputGroup>
              <InputGroupTextarea
                id={`description-${event.id}`}
                placeholder="Descreva o evento"
                maxLength={240}
                {...register("description")}
              />
              <InputGroupAddon align="block-end">
                máximo de 240 caracteres
              </InputGroupAddon>
            </InputGroup>
          </div>

          <Field className="gap-2">
            <FieldLabel>Área de lazer</FieldLabel>
            <FieldContent>
              <Controller
                name="commonAreaId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      aria-invalid={Boolean(errors.commonAreaId)}
                      aria-required={true}
                    >
                      <SelectValue placeholder="Selecione uma área" />
                    </SelectTrigger>
                    <SelectContent>
                      {areas.map((area) => (
                        <SelectItem key={area.id} value={area.id}>
                          {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FieldContent>
            {errors.commonAreaId && (
              <p className="text-xs text-rose-500">
                {errors.commonAreaId.message}
              </p>
            )}
          </Field>

          <Field className="gap-2 max-w-36">
            <FieldLabel htmlFor={`capacity-${event.id}`}>Capacidade</FieldLabel>
            <FieldContent>
              <InputGroup>
                <InputGroupInput
                  id={`capacity-${event.id}`}
                  type="number"
                  min={0}
                  aria-invalid={Boolean(errors.capacity)}
                  aria-required={true}
                  {...register("capacity", { valueAsNumber: true })}
                />
              </InputGroup>
            </FieldContent>
            {errors.capacity && (
              <p className="text-xs text-rose-500">
                {errors.capacity.message}
              </p>
            )}
          </Field>

          <div className="grid gap-2 md:grid-cols-2">
            <Field className="gap-2">
              <FieldLabel htmlFor={`start-${event.id}`}>Início</FieldLabel>
              <FieldContent>
                <Input
                  id={`start-${event.id}`}
                  type="datetime-local"
                  aria-invalid={Boolean(errors.startDate)}
                  aria-required={true}
                  {...register("startDate")}
                />
              </FieldContent>
              {errors.startDate && (
                <p className="text-xs text-rose-500">
                  {errors.startDate.message}
                </p>
              )}
            </Field>
            <Field className="gap-2">
              <FieldLabel htmlFor={`end-${event.id}`}>Fim</FieldLabel>
              <FieldContent>
                <Input
                  id={`end-${event.id}`}
                  type="datetime-local"
                  aria-invalid={Boolean(errors.endDate)}
                  aria-required={true}
                  {...register("endDate")}
                />
              </FieldContent>
              {errors.endDate && (
                <p className="text-xs text-rose-500">
                  {errors.endDate.message}
                </p>
              )}
            </Field>
          </div>

          <div className="flex items-center gap-2">
            <Controller
              name="allowBookings"
              control={control}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(value) => field.onChange(Boolean(value))}
                />
              )}
            />
            <Label>Permitir agendamentos</Label>
          </div>

          <ImageManager
            entityType="event"
            entityId={event.id}
            imageUrl={event.imageUrl}
            label="Imagem do evento"
            onUpdated={() =>
              queryClient.invalidateQueries({ queryKey: ["events"] })
            }
          />
        </form>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancelar</Button>
          </DialogClose>
          <Button
            form={`edit-event-${event.id}`}
            type="submit"
            disabled={isPending}
          >
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
