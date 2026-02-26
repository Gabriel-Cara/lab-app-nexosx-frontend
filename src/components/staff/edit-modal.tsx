import { useEffect, useState } from "react";
import { Clock, Edit, Mail, Phone, SquareAsterisk, User } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldErrors } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
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

import { putResident } from "@/api/put-resident";
import { maskPhone, sanitizePhone } from "@/utils/phone-mask";
import { formatFieldErrors } from "@/utils/form-errors";

const editStaffFormSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Informe um e-mail válido").optional(),
  phone: z.string().optional(),
  shift: z.string().optional(),
  password: z.string().optional(),
});

type EditStaffForm = z.infer<typeof editStaffFormSchema>;

type EditStaffModalProps = EditStaffForm & {
  id: string;
};

export function EditStaffModal(props: EditStaffModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors },
  } = useForm<EditStaffForm>({
    resolver: zodResolver(editStaffFormSchema),
    defaultValues: {
      name: props.name,
      email: props.email,
      phone: maskPhone(props.phone),
      shift: props.shift ?? "",
      password: "",
    },
  });

  const { mutateAsync: mutateStaff, isPending } = useMutation({
    mutationFn: putResident,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: props.name,
        email: props.email,
        phone: maskPhone(props.phone),
        shift: props.shift ?? "",
        password: "",
      });
    }
  }, [isOpen, props, reset]);

  const fieldLabels = {
    name: "Nome",
    email: "E-mail",
    phone: "Telefone",
  };

  function handleInvalidForm(formErrors: FieldErrors<EditStaffForm>) {
    toast.error(formatFieldErrors(formErrors, fieldLabels));
  }

  async function handleEditStaff(data: EditStaffForm) {
    try {
      const phone = sanitizePhone(data.phone);

      if (data.phone && !phone) {
        setError("phone", {
          type: "manual",
          message: "Telefone inválido. Use DDD + número.",
        });
        toast.error("Campo inválido: Telefone.");
        return;
      }

      await mutateStaff({
        id: props.id,
        name: data.name || undefined,
        email: data.email || undefined,
        phone: phone || undefined,
        shift: data.shift?.trim() || undefined,
        password: data.password || undefined,
        role: "staff",
      });

      reset();
      toast.success("Funcionário atualizado com sucesso!");
      setIsOpen(false);
    } catch {
      toast.error("Não foi possível atualizar o funcionário. Tente novamente.");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <Edit />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar funcionário</DialogTitle>
          <DialogDescription>
            Atualize os dados do funcionário.
          </DialogDescription>
        </DialogHeader>

        <form
          id="edit-staff"
          className="grid grid-cols-2 gap-4"
          onSubmit={handleSubmit(handleEditStaff, handleInvalidForm)}
        >
          <div className="grid col-span-2 sm:col-span-1 gap-3">
            <Label htmlFor="name">Nome</Label>
            <InputGroup>
              <InputGroupInput
                id="name"
                placeholder="Insira o nome completo"
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />
              <InputGroupAddon>
                <User />
              </InputGroupAddon>
            </InputGroup>
            {errors.name && (
              <p className="text-xs text-rose-500">{errors.name.message}</p>
            )}
          </div>
          <div className="grid col-span-2 sm:col-span-1 gap-3">
            <Label htmlFor="email">E-mail</Label>
            <InputGroup>
              <InputGroupInput
                id="email"
                type="email"
                placeholder="Insira o e-mail"
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />
              <InputGroupAddon>
                <Mail />
              </InputGroupAddon>
            </InputGroup>
            {errors.email && (
              <p className="text-xs text-rose-500">{errors.email.message}</p>
            )}
          </div>
          <div className="grid col-span-2 sm:col-span-1 gap-3">
            <Label htmlFor="phone">Telefone</Label>
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
            {errors.phone && (
              <p className="text-xs text-rose-500">{errors.phone.message}</p>
            )}
          </div>
          <div className="grid col-span-2 sm:col-span-1 gap-3">
            <Label htmlFor="shift">Turno</Label>
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
          </div>
          <div className="grid col-span-2 sm:col-span-1 gap-3">
            <Label htmlFor="password">Senha</Label>
            <InputGroup>
              <InputGroupInput
                id="password"
                type="password"
                placeholder="Defina uma nova senha"
                {...register("password")}
              />
              <InputGroupAddon>
                <SquareAsterisk />
              </InputGroupAddon>
            </InputGroup>
          </div>
        </form>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button form="edit-staff" type="submit" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
