import { useState } from "react";
import { Clock, Mail, Phone, Plus, User } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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

const createStaffFormSchema = z.object({
  name: z.string({ message: "O nome é obrigatório" }),
  email: z.email({ message: "O email é obrigatório" }),
  phone: z.string().optional(),
  shift: z.string().optional(),
});

type CreateStaffForm = z.infer<typeof createStaffFormSchema>;

export function AddStaffModal() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue } = useForm<CreateStaffForm>({
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

  async function handleCreateStaff(data: CreateStaffForm) {
    try {
      const phone = data.phone ? sanitizePhone(data.phone) : undefined;

      if (data.phone && !phone) {
        throw toast.error("Telefone inválido. Use DDD + número.");
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
          onSubmit={handleSubmit(handleCreateStaff)}
        >
          <div className="grid col-span-2 sm:col-span-1 gap-1 text-lg">
            <Label
              className="after:content-['*'] after:text-rose-500 after:text-lg after:-ml-1"
              htmlFor="name"
            >
              Nome
            </Label>
            <InputGroup>
              <InputGroupInput
                id="name"
                placeholder="Insira o nome completo"
                {...register("name")}
              />
              <InputGroupAddon>
                <User />
              </InputGroupAddon>
            </InputGroup>
          </div>
          <div className="grid col-span-2 sm:col-span-1 gap-1 text-lg">
            <Label
              className="after:content-['*'] after:text-rose-500 after:text-lg after:-ml-1"
              htmlFor="email"
            >
              E-mail
            </Label>
            <InputGroup>
              <InputGroupInput
                id="email"
                type="email"
                placeholder="Insira o e-mail"
                {...register("email")}
              />
              <InputGroupAddon>
                <Mail />
              </InputGroupAddon>
            </InputGroup>
          </div>
          <div className="grid col-span-2 sm:col-span-1 gap-1 text-lg">
            <Label htmlFor="phone">Telefone</Label>
            <InputGroup>
              <InputGroupInput
                id="phone"
                placeholder="Insira o telefone"
                {...register("phone", {
                  onChange: (event) =>
                    setValue("phone", maskPhone(event.target.value)),
                })}
              />
              <InputGroupAddon>
                <Phone />
              </InputGroupAddon>
            </InputGroup>
          </div>
          <div className="grid col-span-2 sm:col-span-1 gap-1 text-lg">
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
