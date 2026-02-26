import { useEffect, useState } from "react";

// Icons
import { Package, Plus } from "lucide-react";

// Form
import { Controller, useForm, type FieldErrors } from "react-hook-form";

// Types
import { z } from "zod";

// Components
import { SelectResident } from "../select-resident";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from "../ui/input-group";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

// API
import { postPackage } from "@/api/post-package";
import { uploadImage } from "@/api/post-image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";
import { toast } from "sonner";
import { fileToDataUrl } from "@/utils/image-utils";

import { ImageDropzone } from "@/components/images/image-dropzone";
import { formatFieldErrors } from "@/utils/form-errors";

const createPackageFormSchema = z.object({
  residentId: z.string().min(1, "O destinatário é obrigatório"),
  carrier: z.string().min(1, "O remetente é obrigatório"),
  description: z.string().min(3, "A descrição é obrigatória"),
  type: z.enum(["box", "envelope", "food", "others"], {
    message: "O tipo é obrigatório",
  }),
});

type CreatePackageFormData = z.infer<typeof createPackageFormSchema>;

export function AddModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const { register, control, handleSubmit, reset, formState: { errors } } =
    useForm<CreatePackageFormData>({
    resolver: zodResolver(createPackageFormSchema),
    defaultValues: {
      residentId: "",
      carrier: "",
      description: "",
      type: "others",
    },
  });

  const { mutateAsync: createPackage, isPending } = useMutation({
    mutationFn: postPackage,
  });

  useEffect(() => {
    if (!isOpen) {
      setImageFiles([]);
    }
  }, [isOpen]);

  const fieldLabels = {
    residentId: "Destinatário",
    carrier: "Remetente",
    description: "Descrição",
    type: "Tipo",
  };

  function handleInvalidForm(formErrors: FieldErrors<CreatePackageFormData>) {
    toast.error(formatFieldErrors(formErrors, fieldLabels));
  }

  async function handleCreatePackage({
    residentId,
    carrier,
    description,
    type,
  }: CreatePackageFormData) {
    try {
      const created = await createPackage({
        residentId,
        carrier,
        description,
        type,
      });

      const imageFile = imageFiles[0];
      if (imageFile) {
        try {
          const dataUrl = await fileToDataUrl(imageFile);
          await uploadImage({
            entityType: "package",
            entityId: created.id,
            image: dataUrl,
          });
        } catch (error) {
          toast.error("Não foi possível salvar a imagem da encomenda.");
          console.error(error);
        }
      }

      toast.success("Encomenda criada com sucesso!");
      await queryClient.invalidateQueries({ queryKey: ["packages"] });
      reset();
      setImageFiles([]);
      setIsOpen(false);
    } catch {
      toast.error("Não foi possível registrar a encomenda. Tente novamente.");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Registrar encomenda
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Encomenda</DialogTitle>
          <DialogDescription>Preencha os dados da encomenda.</DialogDescription>
        </DialogHeader>

        <form
          id="create-package-form"
          className="grid gap-4"
          onSubmit={handleSubmit(handleCreatePackage, handleInvalidForm)}
        >
          {
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
          }
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
          <div className="grid col-span-2 gap-2">
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
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
            form="create-package-form"
            type="submit"
            disabled={isPending}
          >
            {isPending ? "Registrando..." : "Registrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
