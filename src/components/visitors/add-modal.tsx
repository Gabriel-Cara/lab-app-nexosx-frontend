import { useEffect, useState } from "react";

// Icons
import { Mail, Phone, Plus, User } from "lucide-react";

// Form
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type FieldErrors } from "react-hook-form";

// Types
import { z } from "zod";

// Components
import { SelectResident } from "../select-resident";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Textarea } from "../ui/textarea";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
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

// Toast
import { toast } from "sonner";

// Tanstack
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { postVisitor } from "@/api/post-visitor";
import { uploadImage } from "@/api/post-image";
import { useAuth } from "@/hooks/use-auth";
import { maskPhone, sanitizePhone } from "@/utils/phone-mask";
import { maskRg } from "@/utils/rg-mask";
import { fileToDataUrl } from "@/utils/image-utils";
import { formatFieldErrors } from "@/utils/form-errors";

import { ImageDropzone } from "@/components/images/image-dropzone";



const createVisitorFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  document: z.string().min(4, "Documento é obrigatório"),
  phone: z.string().optional(),
  visitReason: z.string().optional(),
  hostId: z.string().min(1, "Morador é obrigatório"),
});

type CreateVisitorForm = z.infer<typeof createVisitorFormSchema>;

export function AddModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const isResident = session?.user.role === "resident";
  const residentHostId = session?.user.id ?? "";

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    setError,
    formState: { errors },
  } =
    useForm<CreateVisitorForm>({
      resolver: zodResolver(createVisitorFormSchema),
      defaultValues: {
        name: "",
        document: "",
        phone: "",
        visitReason: "",
        hostId: isResident ? residentHostId : "",
      },
    });

  useEffect(() => {
    if (isResident && residentHostId) {
      setValue("hostId", residentHostId);
    }
  }, [isResident, residentHostId, setValue]);

  useEffect(() => {
    if (!isOpen) {
      setImageFiles([]);
    }
  }, [isOpen]);

  const { mutateAsync: createVisitor, isPending } = useMutation({
    mutationFn: postVisitor,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["visitors"] });
    },
  });

  const fieldLabels = {
    hostId: "Morador",
    name: "Nome",
    document: "Documento",
    phone: "Telefone",
  };

  function handleInvalidForm(formErrors: FieldErrors<CreateVisitorForm>) {
    toast.error(formatFieldErrors(formErrors, fieldLabels));
  }

  async function handleCreateVisitor(data: CreateVisitorForm) {
    try {
      const hostId = isResident ? residentHostId : data.hostId;
      const phone = sanitizePhone(data.phone);

      if (data.phone && !phone) {
        setError("phone", {
          type: "manual",
          message: "Telefone inválido. Use DDD + número.",
        });
        toast.error("Campo inválido: Telefone.");
        return;
      }

      const created = await createVisitor({
        ...data,
        phone: phone || undefined,
        hostId,
      });

      const imageFile = imageFiles[0];
      if (imageFile) {
        try {
          const dataUrl = await fileToDataUrl(imageFile);
          await uploadImage({
            entityType: "visit",
            entityId: created.id,
            image: dataUrl,
          });
        } catch (error) {
          toast.error("Não foi possível salvar a imagem da visita.");
          console.error(error);
        }
      }

      await queryClient.invalidateQueries({ queryKey: ["visitors"] });

      reset({
        name: "",
        document: "",
        phone: "",
        visitReason: "",
        hostId: isResident ? residentHostId : "",
      });

      setImageFiles([]);
      setIsOpen(false);

      toast.success("Visitante criado com sucesso!");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível criar o visitante. Tente novamente.";
      toast.error(message);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Novo visitante
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar Visitante</DialogTitle>
          <DialogDescription>
            Preencha os dados do novo visitante.
          </DialogDescription>
        </DialogHeader>

        <form
          id="register-visitor-form"
          onSubmit={handleSubmit(handleCreateVisitor, handleInvalidForm)}
        >
          <div className="grid gap-4">
            {!isResident ? (
              <Field className="gap-3">
                <FieldLabel htmlFor="resident">Morador</FieldLabel>
                <FieldContent>
                  <Controller
                    name="hostId"
                    control={control}
                    render={({ field }) => (
                      <SelectResident
                        inputId="resident"
                        value={field.value}
                        onChange={field.onChange}
                        invalid={Boolean(errors.hostId)}
                        required
                      />
                    )}
                  />
                </FieldContent>
                {errors.hostId && (
                  <p className="text-xs text-rose-500">
                    {errors.hostId.message}
                  </p>
                )}
              </Field>
            ) : (
              <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground bg-muted text-center">
                Este visitante será vinculado automaticamente ao morador{<br />}
                <span className="font-semibold text-foreground">
                  {session?.user.name}
                </span>
                .
              </div>
            )}
            <Field className="gap-3">
              <FieldLabel htmlFor="name">Nome</FieldLabel>
              <FieldContent>
                <InputGroup>
                  <InputGroupInput
                    id="name"
                    placeholder="Insira o nome completo"
                    aria-invalid={Boolean(errors.name)}
                    aria-required={true}
                    {...register("name")}
                  />
                  <InputGroupAddon>
                    <User />
                  </InputGroupAddon>
                </InputGroup>
              </FieldContent>
              {errors.name && (
                <p className="text-xs text-rose-500">{errors.name.message}</p>
              )}
            </Field>
            <Field className="gap-3">
              <FieldLabel htmlFor="document">Documento</FieldLabel>
              <FieldContent>
                <InputGroup>
                  <InputGroupInput
                    id="document"
                    placeholder="Insira o documento"
                    inputMode="numeric"
                    aria-invalid={Boolean(errors.document)}
                    aria-required={true}
                    {...register("document", {
                      onChange: (event) =>
                        setValue("document", maskRg(event.target.value)),
                    })}
                  />
                  <InputGroupAddon>
                    <Mail />
                  </InputGroupAddon>
                </InputGroup>
              </FieldContent>
              {errors.document && (
                <p className="text-xs text-rose-500">
                  {errors.document.message}
                </p>
              )}
            </Field>
            <Field className="gap-3">
              <FieldLabel htmlFor="phone">Telefone</FieldLabel>
              <FieldContent>
                <InputGroup>
                  <InputGroupInput
                    id="phone"
                    placeholder="Insira o telefone"
                    aria-invalid={Boolean(errors.phone)}
                    {...register("phone", {
                      onChange: (event) =>
                        setValue("phone", maskPhone(event.target.value)),
                    })}
                  />
                  <InputGroupAddon>
                    <Phone />
                  </InputGroupAddon>
                </InputGroup>
              </FieldContent>
              {errors.phone && (
                <p className="text-xs text-rose-500">{errors.phone.message}</p>
              )}
            </Field>
            <div className="grid gap-3">
              <Label htmlFor="visitReason">Motivo da visita</Label>
              <Textarea
                id="visitReason"
                placeholder="Motivo da visita"
                {...register("visitReason")}
              />
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
          </div>
        </form>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
            form="register-visitor-form"
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
