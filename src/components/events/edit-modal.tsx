import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type EditEventFormData = {
  title: string;
  description: string;
  commonAreaId: string;
  capacity: number;
  startDate: string;
  endDate: string;
  allowBookings: boolean;
};

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

  const { register, handleSubmit, control, reset, setValue } =
    useForm<EditEventFormData>({
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

  async function handleEditEvent(data: EditEventFormData) {
    if (!data.title) {
      toast.error("Informe o título do evento.");
      return;
    }

    if (!data.commonAreaId) {
      toast.error("Selecione uma área de lazer.");
      return;
    }

    if (!data.capacity || data.capacity <= 0) {
      toast.error("Informe uma capacidade válida.");
      return;
    }

    if (!data.startDate || !data.endDate) {
      toast.error("Informe as datas de início e fim.");
      return;
    }

    if (new Date(data.endDate) < new Date(data.startDate)) {
      toast.error("A data final deve ser posterior à inicial.");
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
          onSubmit={handleSubmit(handleEditEvent)}
        >
          <div className="grid gap-2">
            <Label htmlFor={`title-${event.id}`}>Título</Label>
            <Input
              id={`title-${event.id}`}
              placeholder="Ex: Natal do condomínio"
              {...register("title")}
            />
          </div>

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

          <div className="grid gap-2">
            <Label>Área de lazer</Label>
            <Controller
              name="commonAreaId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
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
          </div>

          <div className="grid gap-2 max-w-36">
            <Label htmlFor={`capacity-${event.id}`}>Capacidade</Label>
            <InputGroup>
              <InputGroupInput
                id={`capacity-${event.id}`}
                type="number"
                min={0}
                {...register("capacity", { valueAsNumber: true })}
              />
            </InputGroup>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor={`start-${event.id}`}>Início</Label>
              <Input
                id={`start-${event.id}`}
                type="datetime-local"
                {...register("startDate")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`end-${event.id}`}>Fim</Label>
              <Input
                id={`end-${event.id}`}
                type="datetime-local"
                {...register("endDate")}
              />
            </div>
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
