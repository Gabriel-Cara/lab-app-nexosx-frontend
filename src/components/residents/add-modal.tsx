import { useState } from "react";
import { Building, Car, House, Mail, Phone, Plus, User } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
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

import { postResident } from "@/api/post-resident";
import { maskPhone, sanitizePhone } from "@/utils/phone-mask";

const createResidentFormSchema = z.object({
  name: z.string({ message: "O nome é obrigatório" }),
  email: z.email({ message: "O email é obrigatório" }),
  phone: z.string({ message: "O telefone é obrigatório" }),
  apartment: z.string({ message: "O apartamento é obrigatório" }),
  building: z.string().optional(),
  vehicle: z.string().optional(),
  emergencyContact: z.string().optional(),
});

type CreateResidentForm = z.infer<typeof createResidentFormSchema>;

export function AddModal() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue } =
    useForm<CreateResidentForm>({
      resolver: zodResolver(createResidentFormSchema),
      defaultValues: {
        name: "",
        email: "",
        phone: "",
        apartment: "",
        building: "",
        vehicle: "",
        emergencyContact: "",
      },
    });

  const { mutateAsync: mutateResident, isPending } = useMutation({
    mutationFn: postResident,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["residents"] });
    },
  });

  async function handleCreateResident(data: CreateResidentForm) {
    try {
      const phone = sanitizePhone(data.phone);

      await mutateResident({
        ...data,
        role: "resident",
        phone,
        vehicle: data.vehicle || "",
        building: data.building || "",
        emergencyContact: data.emergencyContact || "",
      });

      toast.success("Morador criado com sucesso!");
      reset({
        name: "",
        email: "",
        phone: "",
        apartment: "",
        building: "",
        vehicle: "",
        emergencyContact: "",
      });
      setIsOpen(false);
    } catch (error) {
      toast.error("Não foi possível criar o morador. Tente novamente.");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Novo morador
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar Morador</DialogTitle>
          <DialogDescription>
            Preencha os dados do novo morador.
          </DialogDescription>
        </DialogHeader>

        <form
          id="create-resident-form"
          className="grid grid-cols-2 gap-4"
          onSubmit={handleSubmit(handleCreateResident)}
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
            <Label
              className="after:content-['*'] after:text-rose-500 after:text-lg after:-ml-1"
              htmlFor="phone"
            >
              Telefone
            </Label>
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
            <Label
              className="after:content-['*'] after:text-rose-500 after:-ml-1 after:text-lg"
              htmlFor="apartment"
            >
              Apartamento
            </Label>
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
          <div className="grid col-span-2 sm:col-span-1 gap-3 text-lg">
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
          <div className="grid col-span-2 sm:col-span-1 gap-3 text-lg">
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
          <div className="grid col-span-2 gap-3 text-lg">
            <Label htmlFor="vehicle">Qtd. Veículos</Label>
            <InputGroup>
              <InputGroupInput
                id="vehicle"
                placeholder="Se tiver veículos incluir quantidade"
                {...register("vehicle")}
              />
              <InputGroupAddon>
                <Car />
              </InputGroupAddon>
            </InputGroup>
          </div>

        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
            form="create-resident-form"
            type="submit"
            disabled={isPending}
          >
            {isPending ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
