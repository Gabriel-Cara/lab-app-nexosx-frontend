import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { getAreas } from "@/api/get-areas";
import { postEvent } from "@/api/post-event";
import { uploadImage } from "@/api/post-image";
import { queryClient } from "@/lib/react-query";
import { fileToDataUrl } from "@/utils/image-utils";

import { ImageDropzone } from "@/components/images/image-dropzone";
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

type AddEventFormData = {
  title: string;
  description: string;
  commonAreaId: string;
  capacity: number;
  startDate: string;
  endDate: string;
  allowBookings: boolean;
};

export function AddModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const lastAreaId = useRef<string | null>(null);

  const { data: areas = [] } = useQuery({
    queryKey: ["areas"],
    queryFn: getAreas,
  });

  const { register, handleSubmit, control, reset, setValue } =
    useForm<AddEventFormData>({
      defaultValues: {
        title: "",
        description: "",
        commonAreaId: "",
        capacity: 0,
        startDate: "",
        endDate: "",
        allowBookings: true,
      },
    });

  const selectedAreaId = useWatch({ control, name: "commonAreaId" });
  const selectedArea = useMemo(
    () => areas.find((area) => area.id === selectedAreaId),
    [areas, selectedAreaId]
  );

  useEffect(() => {
    if (!selectedArea || selectedArea.id === lastAreaId.current) {
      return;
    }

    if (selectedArea.capacity !== null && selectedArea.capacity !== undefined) {
      setValue("capacity", selectedArea.capacity);
    }

    lastAreaId.current = selectedArea.id;
  }, [selectedArea, setValue]);

  const { mutateAsync: createEvent, isPending } = useMutation({
    mutationFn: postEvent,
  });

  useEffect(() => {
    if (!isOpen) {
      reset();
      setImageFiles([]);
      lastAreaId.current = null;
    }
  }, [isOpen, reset]);

  async function handleAddEvent(data: AddEventFormData) {
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
      const created = await createEvent({
        title: data.title,
        description: data.description || undefined,
        commonAreaId: data.commonAreaId,
        capacity: data.capacity,
        startDate: data.startDate,
        endDate: data.endDate,
        allowBookings: data.allowBookings,
      });

      const imageFile = imageFiles[0];
      if (imageFile) {
        try {
          const dataUrl = await fileToDataUrl(imageFile);
          await uploadImage({
            entityType: "event",
            entityId: created.id,
            image: dataUrl,
          });
        } catch (error) {
          toast.error("Não foi possível salvar a imagem do evento.");
          console.error(error);
        }
      }

      await queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Evento criado com sucesso!");
      setIsOpen(false);
    } catch {
      toast.error("Não foi possível criar o evento.");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Novo evento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar evento</DialogTitle>
          <DialogDescription>
            Cadastre um novo evento e configure seus detalhes.
          </DialogDescription>
        </DialogHeader>

        <form
          id="create-event-form"
          className="grid gap-4"
          onSubmit={handleSubmit(handleAddEvent)}
        >
          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              placeholder="Ex: Natal do condomínio"
              {...register("title")}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descrição</Label>
            <InputGroup>
              <InputGroupTextarea
                id="description"
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

          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="startDate">Início</Label>
              <Input
                id="startDate"
                type="datetime-local"
                {...register("startDate")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endDate">Fim</Label>
              <Input
                id="endDate"
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

          <div className="grid gap-2">
            <Label>Imagem (opcional)</Label>
            <ImageDropzone
              value={imageFiles}
              onChange={setImageFiles}
              maxFiles={1}
              maxSizeMB={4}
            />
          </div>
        </form>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancelar</Button>
          </DialogClose>
          <Button
            form="create-event-form"
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
