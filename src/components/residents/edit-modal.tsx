import { Building, Car, Edit, House, Mail, Phone, User } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const editResidentFormSchema = z.object({
  name: z.string().optional(),
  email: z.email().optional(),
  phone: z.string().optional(),
  role: z.enum(["admin", "staff", "resident"]).optional(),
  apartment: z.string().optional(),
  password: z.string().optional(),
  building: z.string().optional(),
  vehicle: z.number().optional(),
  emergencyContact: z.string().optional(),
});

type EditResidentForm = z.infer<typeof editResidentFormSchema>;

export function EditModal(props: EditResidentForm) {
  const { control, register, handleSubmit } = useForm<EditResidentForm>({
    resolver: zodResolver(editResidentFormSchema),
    defaultValues: {
      name: props.name,
      email: props.email,
      phone: props.phone,
      role: props.role,
      apartment: props.apartment,
      password: props.password,
      building: props.building,
      vehicle: props.vehicle,
      emergencyContact: props.emergencyContact,
    },
  });

  async function handleEditResident(data: EditResidentForm) {
    console.log(data);
  }

  return (
    <Dialog>
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

        <form id="edit-resident" className="overflow-y-scroll md:overflow-y-hidden max-h-[calc(100vh-300px)]" onSubmit={handleSubmit(handleEditResident)}>
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
                  {...register("vehicle", { valueAsNumber: true })}
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
                  {...register("phone")}
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
            <div className="grid col-span-2 grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid col-span-3 sm:col-span-1 gap-3">
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
              <div className="grid col-span-3 sm:col-span-1 gap-3">
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
              <div className="grid col-span-3 sm:col-span-1 gap-3">
                <Label htmlFor="role">Tipo</Label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Select
                      value={value ?? undefined}
                      onValueChange={(v) =>
                        onChange(v as EditResidentForm["role"])
                      }
                    >
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="staff">Funcionário</SelectItem>
                        <SelectItem value="resident">Morador</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>
        </form>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button form="edit-resident" type="submit">Salvar</Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
