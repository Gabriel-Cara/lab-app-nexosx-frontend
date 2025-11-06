import { Building, Car, House, Mail, Phone, Plus, User } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

const createResidentFormSchema = z.object({
  name: z.string({ message: "O nome é obrigatório" }),
  email: z.email({ message: "O email é obrigatório" }),
  phone: z.string({ message: "O telefone é obrigatório" }),
  role: z.enum(["admin","staff","resident"]),
  apartment: z.string({ message: "O apartamento é obrigatório" }),
  password: z.string(),
  building: z.string().optional(),
  vehicle: z.number().optional(),
  emergencyContact: z.string().optional(),
});

type CreateResidentForm = z.infer<typeof createResidentFormSchema>;

export function AddModal() {
  function generateRandomPassword() {
    const characters =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      password += characters.charAt(randomIndex);
    }
    return password;
  }

  const { register, handleSubmit } = useForm<CreateResidentForm>({
    resolver: zodResolver(createResidentFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "resident",
      apartment: "",
      password: generateRandomPassword(),
      building: "",
      vehicle: 0,
      emergencyContact: "",
    },
  });

  async function handleCreateResident(data: CreateResidentForm) {
    console.log(data);
  }

  return (
    <Dialog>
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

        <form onSubmit={handleSubmit(handleCreateResident)}>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid col-span-2 sm:col-span-1 gap-3">
              <Label
                className="after:content-['*'] after:text-rose-500 after:text-xl after:-ml-1"
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
            <div className="grid col-span-2 sm:col-span-1 gap-3">
              <Label
                className="after:content-['*'] after:text-rose-500 after:text-xl after:-ml-1"
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
            <div className="grid col-span-2 sm:col-span-1 gap-3">
              <Label
                className="after:content-['*'] after:text-rose-500 after:text-xl after:-ml-1"
                htmlFor="phone"
              >
                Telefone
              </Label>
              <InputGroup>
                <InputGroupInput
                  id="phone"
                  placeholder="Insira o telefone"
                  {...register("phone")}
                />
                <InputGroupAddon>
                  <Phone />
                </InputGroupAddon>
              </InputGroup>
            </div>
            <div className="grid col-span-2 sm:col-span-1 gap-3">
              <Label
                className="after:content-['*'] after:text-rose-500 after:text-xl after:-ml-1"
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
            <div className="grid col-span-2 sm:col-span-1 gap-3">
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
            <div className="grid col-span-2 sm:col-span-1 gap-3">
              <Label htmlFor="vehicle">Qtd. Veículos</Label>
              <InputGroup>
                <InputGroupInput
                  id="vehicle"
                  placeholder="Se tiver veículos incluir quantidade"
                  type="number"
                  {...register("vehicle", { valueAsNumber: true })}
                />
                <InputGroupAddon>
                  <Car />
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
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
