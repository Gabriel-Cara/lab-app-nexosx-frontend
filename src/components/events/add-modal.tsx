import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm, useWatch, type FieldErrors } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { getAreas } from "@/api/get-areas";
import { postEvent } from "@/api/post-event";
import { uploadImage } from "@/api/post-image";
import { queryClient } from "@/lib/react-query";
import { fileToDataUrl } from "@/utils/image-utils";
import { formatFieldErrors } from "@/utils/form-errors";

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
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const addEventFormSchema = z.object({
  title: z.string().min(3, "Informe o título do evento."),
  description: z.string().optional(),
  commonAreaId: z.string().min(1, "Selecione uma área de lazer."),
  capacity: z.number().int().positive("Informe uma capacidade válida."),
  startDate: z.string().min(1, "Informe a data de início."),
  endDate: z.string().min(1, "Informe a data de fim."),
  allowBookings: z.boolean(),
});

type AddEventFormData = z.infer<typeof addEventFormSchema>;

export function AddModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
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
    useForm<AddEventFormData>({
      resolver: zodResolver(addEventFormSchema),
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

  const fieldLabels = {
    title: "Título",
    commonAreaId: "Área de lazer",
    capacity: "Capacidade",
    startDate: "Início",
    endDate: "Fim",
  };

  function handleInvalidForm(formErrors: FieldErrors<AddEventFormData>) {
    toast.error(formatFieldErrors(formErrors, fieldLabels));
  }

  async function handleAddEvent(data: AddEventFormData) {
    if (new Date(data.endDate) < new Date(data.startDate)) {
      setError("endDate", {
        type: "manual",
        message: "A data final deve ser posterior à inicial.",
      });
      toast.error("Campo inválido: Fim.");
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
      reset();
      setImageFiles([]);
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
          onSubmit={handleSubmit(handleAddEvent, handleInvalidForm)}
        >
          <Field className="gap-2">
            <FieldLabel htmlFor="title">Título</FieldLabel>
            <FieldContent>
              <Input
                id="title"
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
            <FieldLabel htmlFor="capacity">Capacidade</FieldLabel>
            <FieldContent>
              <InputGroup>
                <InputGroupInput
                  id="capacity"
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
              <FieldLabel htmlFor="startDate">Início</FieldLabel>
              <FieldContent>
                <Input
                  id="startDate"
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
              <FieldLabel htmlFor="endDate">Fim</FieldLabel>
              <FieldContent>
                <Input
                  id="endDate"
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
