import { useEffect, useState } from "react";
import { Building, Car, Edit, House, Mail, Phone, User } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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

import { updateResident } from "@/api/update-resident";
import { maskPhone, sanitizePhone } from "@/utils/phone-mask";

const editResidentFormSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  apartment: z.string().optional(),
  password: z.string().optional(),
  building: z.string().optional(),
  vehicle: z.string().optional(),
  emergencyContact: z.string().optional(),
});

type EditResidentForm = z.infer<typeof editResidentFormSchema>;

type EditModalProps = EditResidentForm & {
  id: string;
  role: "admin" | "staff" | "resident";
};

export function EditModal(props: EditModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue } = useForm<EditResidentForm>({
    resolver: zodResolver(editResidentFormSchema),
    defaultValues: {
      name: props.name,
      email: props.email,
      phone: maskPhone(props.phone),
      apartment: props.apartment,
      password: "",
      building: props.building ?? "",
      vehicle: props.vehicle ?? "",
      emergencyContact: props.emergencyContact ?? "",
    },
  });

  const { mutateAsync: mutateResident, isPending } = useMutation({
    mutationFn: updateResident,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["residents"] });
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: props.name,
        email: props.email,
        phone: maskPhone(props.phone),
        apartment: props.apartment,
        password: "",
        building: props.building ?? "",
        vehicle: props.vehicle ?? "",
        emergencyContact: props.emergencyContact ?? "",
      });
    }
  }, [isOpen, props, reset]);

  async function handleEditResident(data: EditResidentForm) {
    try {
      const phone = sanitizePhone(data.phone);

      await mutateResident({
        id: props.id,
        name: data.name || undefined,
        email: data.email || undefined,
        phone: phone || undefined,
        role: props.role,
        apartment: data.apartment || undefined,
        password: data.password || undefined,
        building: data.building || undefined,
        vehicle: data.vehicle || undefined,
        emergencyContact: data.emergencyContact || undefined,
      });

      toast.success("Morador atualizado com sucesso!");
      setIsOpen(false);
    } catch {
      toast.error("Não foi possível atualizar o morador. Tente novamente.");
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
          <DialogTitle>Editar Morador</DialogTitle>
          <DialogDescription>
            Preencha os dados que deseja editar do morador.
          </DialogDescription>
        </DialogHeader>

        <form
          id="edit-resident"
          className="overflow-y-scroll md:overflow-y-hidden max-h-[calc(100vh-300px)]"
          onSubmit={handleSubmit(handleEditResident)}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="grid col-span-2 sm:col-span-1 gap-3">
              <Label htmlFor="name">Nome</Label>
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
            <div className="grid col-span-2 sm:col-span-1 gap-3">
              <Label htmlFor="email">E-mail</Label>
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
            <div className="grid col-span-2 sm:col-span-1 gap-3">
              <Label htmlFor="password">Senha</Label>
              <InputGroup>
                <InputGroupInput
                  id="password"
                  type="password"
                  placeholder="Insira a nova senha"
                  {...register("password")}
                />
                <InputGroupAddon>
                  <Mail />
                </InputGroupAddon>
              </InputGroup>
            </div>
            <div className="grid col-span-2 sm:col-span-1 gap-3">
              <Label htmlFor="vehicle">Qtd. Veículos</Label>
              <InputGroup>
                <InputGroupInput
                  id="vehicle"
                  placeholder="Se tiver veículos incluir quantidade"
                  type="number"
                  {...register("vehicle")}
                />
                <InputGroupAddon>
                  <Car />
                </InputGroupAddon>
              </InputGroup>
            </div>
            <div className="grid col-span-2 sm:col-span-1 gap-3">
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
            <div className="grid col-span-2 sm:col-span-1 gap-3">
              <Label htmlFor="emergencyContact">Nº de emergência</Label>
              <InputGroup>
                <InputGroupInput
                  id="emergencyContact"
                  placeholder="Contato de emergência"
                  {...register("emergencyContact")}
                />
                <InputGroupAddon>
                  <Phone />
                </InputGroupAddon>
              </InputGroup>
            </div>
            <div className="grid col-span-2 grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid col-span-2 lg:col-span-1 gap-3">
                <Label htmlFor="apartment">Apartamento</Label>
                <InputGroup>
                  <InputGroupInput
                    id="apartment"
                    placeholder="Insira o apartamento"
                    {...register("apartment")}
                  />
                  <InputGroupAddon>
                    <House />
                  </InputGroupAddon>
                </InputGroup>
              </div>
              <div className="grid col-span-2 lg:col-span-1 gap-3">
                <Label htmlFor="building">Torre</Label>
                <InputGroup>
                  <InputGroupInput
                    id="building"
                    placeholder="Insira a torre"
                    {...register("building")}
                  />
                  <InputGroupAddon>
                    <Building />
                  </InputGroupAddon>
                </InputGroup>
              </div>
            </div>
          </div>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button form="edit-resident" type="submit" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
