import { useEffect, useState } from "react";
import { Edit, Package } from "lucide-react";
import { Controller, useForm, type FieldErrors } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { patchPackage } from "@/api/patch-package";
import type { PackageType } from "@/api/get-packages";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { SelectResident } from "../select-resident";
import { ImageManager } from "@/components/images/image-manager";
import { formatFieldErrors } from "@/utils/form-errors";

const editPackageFormSchema = z.object({
  residentId: z.string().min(1, "O destinatário é obrigatório"),
  carrier: z.string().min(1, "O remetente é obrigatório"),
  description: z.string().min(3, "A descrição é obrigatória"),
  type: z.enum(["box", "envelope", "food", "others"], {
    message: "O tipo é obrigatório",
  }),
});

type EditPackageFormData = z.infer<typeof editPackageFormSchema>;

type EditModalProps = {
  id: string;
  residentId: string;
  residentName: string;
  carrier: string | null;
  description: string;
  type: PackageType;
  imageUrl?: string | null;
};

export function EditModal({
  id,
  residentId,
  residentName,
  carrier,
  description,
  type,
  imageUrl,
}: EditModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditPackageFormData>({
    resolver: zodResolver(editPackageFormSchema),
    defaultValues: {
      residentId,
      carrier: carrier ?? "",
      description,
      type,
    },
  });

  const { mutateAsync: mutatePackage, isPending } = useMutation({
    mutationFn: patchPackage,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["packages"] });
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        residentId,
        carrier: carrier ?? "",
        description,
        type,
      });
    }
  }, [carrier, description, isOpen, residentId, reset, type]);

  const fieldLabels = {
    residentId: "Destinatário",
    carrier: "Remetente",
    description: "Descrição",
    type: "Tipo",
  };

  function handleInvalidForm(formErrors: FieldErrors<EditPackageFormData>) {
    toast.error(formatFieldErrors(formErrors, fieldLabels));
  }

  async function handleEditPackage({
    residentId: selectedResidentId,
    carrier: selectedCarrier,
    description: selectedDescription,
    type: selectedType,
  }: EditPackageFormData) {
    try {
      await mutatePackage({
        id,
        residentId: selectedResidentId,
        carrier: selectedCarrier,
        description: selectedDescription,
        type: selectedType,
      });

      reset({
        residentId: selectedResidentId,
        carrier: selectedCarrier,
        description: selectedDescription,
        type: selectedType,
      });
      toast.success("Encomenda atualizada com sucesso!");
      setIsOpen(false);
    } catch {
      toast.error("Não foi possível atualizar a encomenda. Tente novamente.");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsOpen(true)}
            aria-label="Editar encomenda"
          >
            <Edit />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Editar encomenda</TooltipContent>
      </Tooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Encomenda</DialogTitle>
          <DialogDescription>
            Preencha os dados que deseja editar da encomenda.
          </DialogDescription>
        </DialogHeader>

        <form
          id="edit-package-form"
          className="grid gap-4"
          onSubmit={handleSubmit(handleEditPackage, handleInvalidForm)}
        >
          <Field className="gap-3">
            <FieldLabel htmlFor="residentId">Destinatário</FieldLabel>
            <FieldContent>
              <Controller
                name="residentId"
                control={control}
                render={({ field }) => (
                  <SelectResident
                    inputId="residentId"
                    value={field.value}
                    onChange={field.onChange}
                    selectedLabel={residentName}
                    invalid={Boolean(errors.residentId)}
                    required
                  />
                )}
              />
            </FieldContent>
            {errors.residentId && (
              <p className="text-xs text-rose-500">
                {errors.residentId.message}
              </p>
            )}
          </Field>
          <Field className="col-span-2 gap-1 text-lg sm:col-span-1">
            <FieldLabel htmlFor="carrier">Remetente</FieldLabel>
            <FieldContent>
              <InputGroup>
                <InputGroupInput
                  id="carrier"
                  placeholder="Insira o remetente"
                  aria-invalid={Boolean(errors.carrier)}
                  aria-required={true}
                  {...register("carrier")}
                />
                <InputGroupAddon>
                  <Package />
                </InputGroupAddon>
              </InputGroup>
            </FieldContent>
            {errors.carrier && (
              <p className="text-xs text-rose-500">{errors.carrier.message}</p>
            )}
          </Field>
          <Field className="col-span-2 gap-1 text-lg sm:col-span-1">
            <FieldLabel htmlFor="description">Descrição</FieldLabel>
            <FieldContent>
              <InputGroup>
                <InputGroupTextarea
                  id="description"
                  placeholder="Insira a descrição do item."
                  maxLength={120}
                  aria-invalid={Boolean(errors.description)}
                  aria-required={true}
                  {...register("description")}
                />
                <InputGroupAddon align="block-end">
                  máximo de 120 caracteres
                </InputGroupAddon>
              </InputGroup>
            </FieldContent>
            {errors.description && (
              <p className="text-xs text-rose-500">
                {errors.description.message}
              </p>
            )}
          </Field>
          <Field className="col-span-2 gap-1 text-lg sm:col-span-1">
            <FieldLabel htmlFor="type">Tipo</FieldLabel>
            <FieldContent>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      aria-invalid={Boolean(errors.type)}
                      aria-required={true}
                    >
                      <SelectValue placeholder="Selecione um tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="box">Caixa</SelectItem>
                        <SelectItem value="envelope">Envelope</SelectItem>
                        <SelectItem value="food">Comida</SelectItem>
                        <SelectItem value="others">Outros</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </FieldContent>
            {errors.type && (
              <p className="text-xs text-rose-500">{errors.type.message}</p>
            )}
          </Field>
          <ImageManager
            entityType="package"
            entityId={id}
            imageUrl={imageUrl}
            label="Imagem da encomenda"
            onUpdated={() =>
              queryClient.invalidateQueries({ queryKey: ["packages"] })
            }
          />
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
            form="edit-package-form"
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
