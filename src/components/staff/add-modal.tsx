import { useState } from "react";
import { Clock, Mail, Phone, Plus, User } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldErrors } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
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

import { postStaff } from "@/api/post-staff";
import { maskPhone, sanitizePhone } from "@/utils/phone-mask";
import { formatFieldErrors } from "@/utils/form-errors";

const createStaffFormSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  email: z.string().min(1, "O email é obrigatório").email("Informe um e-mail válido"),
  phone: z.string().optional(),
  shift: z.string().optional(),
});

type CreateStaffForm = z.infer<typeof createStaffFormSchema>;

export function AddStaffModal() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors },
  } = useForm<CreateStaffForm>({
    resolver: zodResolver(createStaffFormSchema),
      defaultValues: {
        name: "",
        email: "",
        phone: "",
        shift: "",
      },
    });

  const { mutateAsync: mutateStaff, isPending } = useMutation({
    mutationFn: postStaff,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });

  const fieldLabels = {
    name: "Nome",
    email: "E-mail",
    phone: "Telefone",
  };

  function handleInvalidForm(formErrors: FieldErrors<CreateStaffForm>) {
    toast.error(formatFieldErrors(formErrors, fieldLabels));
  }

  async function handleCreateStaff(data: CreateStaffForm) {
    try {
      const phone = data.phone ? sanitizePhone(data.phone) : undefined;

      if (data.phone && !phone) {
        setError("phone", {
          type: "manual",
          message: "Telefone inválido. Use DDD + número.",
        });
        toast.error("Campo inválido: Telefone.");
        return;
      }

      await mutateStaff({
        name: data.name,
        email: data.email,
        phone,
        shift: data.shift?.trim() || undefined,
      });

      toast.success("Funcionário convidado com sucesso!");
      reset({
        name: "",
        email: "",
        phone: "",
        shift: "",
      });
      setIsOpen(false);
    } catch {
      toast.error("Não foi possível criar o funcionário. Tente novamente.");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Novo funcionário
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar funcionário</DialogTitle>
          <DialogDescription>
            Preencha os dados do novo funcionário. Um convite será enviado por e-mail.
          </DialogDescription>
        </DialogHeader>

        <form
          id="create-staff-form"
          className="grid grid-cols-2 gap-4"
          onSubmit={handleSubmit(handleCreateStaff, handleInvalidForm)}
        >
          <Field className="col-span-2 gap-1 text-lg sm:col-span-1">
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
          <Field className="col-span-2 gap-1 text-lg sm:col-span-1">
            <FieldLabel htmlFor="email">E-mail</FieldLabel>
            <FieldContent>
              <InputGroup>
                <InputGroupInput
                  id="email"
                  type="email"
                  placeholder="Insira o e-mail"
                  aria-invalid={Boolean(errors.email)}
                  aria-required={true}
                  {...register("email")}
                />
                <InputGroupAddon>
                  <Mail />
                </InputGroupAddon>
              </InputGroup>
            </FieldContent>
            {errors.email && (
              <p className="text-xs text-rose-500">{errors.email.message}</p>
            )}
          </Field>
          <Field className="col-span-2 gap-1 text-lg sm:col-span-1">
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
          <Field className="col-span-2 gap-1 text-lg sm:col-span-1">
            <FieldLabel htmlFor="shift">Turno</FieldLabel>
            <FieldContent>
              <InputGroup>
                <InputGroupInput
                  id="shift"
                  placeholder="Ex: Manhã, Tarde, Noite"
                  {...register("shift")}
                />
                <InputGroupAddon>
                  <Clock />
                </InputGroupAddon>
              </InputGroup>
            </FieldContent>
          </Field>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button form="create-staff-form" type="submit" disabled={isPending}>
            {isPending ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
