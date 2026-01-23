import { useEffect, useState } from "react";
import {
  Building,
  Car,
  Edit,
  House,
  Mail,
  Phone,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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

import { putResident } from "@/api/put-resident";
import { maskPhone, sanitizePhone } from "@/utils/phone-mask";
import { ImageManager } from "@/components/images/image-manager";

const vehicleSchema = z
  .object({
    model: z.string().min(1, "Informe o modelo"),
    plate: z.string().min(1, "Informe a placa"),
    year: z.number().int().optional(),
  })
  .superRefine((value, ctx) => {
    if (typeof value.year !== "number" || Number.isNaN(value.year)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe o ano",
        path: ["year"],
      });
    }
  });

const editResidentFormSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  apartment: z.string().optional(),
  password: z.string().optional(),
  building: z.string().optional(),
  vehicles: z.array(vehicleSchema).optional(),
  emergencyContact: z.string().optional(),
});

type EditResidentForm = z.infer<typeof editResidentFormSchema>;

type EditModalProps = EditResidentForm & {
  id: string;
  role: "admin" | "staff" | "resident";
  imageUrl?: string | null;
};

export function EditModal(props: EditModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<EditResidentForm>({
    resolver: zodResolver(editResidentFormSchema),
    defaultValues: {
      name: props.name,
      email: props.email,
      phone: maskPhone(props.phone),
      apartment: props.apartment,
      password: "",
      building: props.building ?? "",
      vehicles: props.vehicles ?? [],
      emergencyContact: props.emergencyContact ?? "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "vehicles",
  });

  const { mutateAsync: mutateResident, isPending } = useMutation({
    mutationFn: putResident,
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
        vehicles: props.vehicles ?? [],
        emergencyContact: props.emergencyContact ?? "",
      });
    }
  }, [isOpen, props, reset]);

  async function handleEditResident(data: EditResidentForm) {
    try {
      const phone = sanitizePhone(data.phone);

      if (data.phone && !phone) {
        throw toast.error("Telefone inválido. Use DDD + número.");
      }

      await mutateResident({
        id: props.id,
        name: data.name || undefined,
        email: data.email || undefined,
        phone: phone || undefined,
        role: props.role,
        apartment: data.apartment || undefined,
        password: data.password || undefined,
        building: data.building || undefined,
        vehicles:
          data.vehicles?.map((vehicle) => ({
            model: vehicle.model.trim(),
            plate: vehicle.plate.trim(),
            year: vehicle.year!,
          })) ?? [],
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
            <div className="col-span-2">
              <ImageManager
                entityType="user"
                entityId={props.id}
                imageUrl={props.imageUrl}
                label="Foto do morador"
                shape="round"
                onUpdated={() =>
                  queryClient.invalidateQueries({ queryKey: ["residents"] })
                }
              />
            </div>
            <div className="grid col-span-2 gap-3">
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
              <div className="flex items-center justify-between">
                <Label>Veículos</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ model: "", plate: "", year: undefined })}
                >
                  <Plus />
                  adicionar carro
                </Button>
              </div>

              {fields.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum carro adicionado.
                </p>
              ) : (
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Carro {index + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => remove(index)}
                          aria-label="Remover carro"
                        >
                          <Trash2 />
                        </Button>
                      </div>
                      <div className="grid gap-3">
                        <div className="grid gap-1.5">
                          <Label htmlFor={`vehicle-model-${field.id}`}>Modelo</Label>
                          <InputGroup>
                            <InputGroupInput
                              id={`vehicle-model-${field.id}`}
                              placeholder="Ex: Civic"
                              {...register(`vehicles.${index}.model`)}
                            />
                            <InputGroupAddon>
                              <Car />
                            </InputGroupAddon>
                          </InputGroup>
                          {errors.vehicles?.[index]?.model && (
                            <p className="text-xs text-rose-500">
                              {errors.vehicles[index]?.model?.message}
                            </p>
                          )}
                        </div>
                        <div className="grid gap-1.5">
                          <Label htmlFor={`vehicle-plate-${field.id}`}>Placa</Label>
                          <InputGroup>
                            <InputGroupInput
                              id={`vehicle-plate-${field.id}`}
                              placeholder="ABC-1234"
                              {...register(`vehicles.${index}.plate`)}
                            />
                            <InputGroupAddon>
                              <Car />
                            </InputGroupAddon>
                          </InputGroup>
                          {errors.vehicles?.[index]?.plate && (
                            <p className="text-xs text-rose-500">
                              {errors.vehicles[index]?.plate?.message}
                            </p>
                          )}
                        </div>
                        <div className="grid gap-1.5">
                          <Label htmlFor={`vehicle-year-${field.id}`}>Ano do veículo</Label>
                          <InputGroup>
                            <InputGroupInput
                              id={`vehicle-year-${field.id}`}
                              type="number"
                              placeholder="2020"
                              {...register(`vehicles.${index}.year`, {
                                setValueAs: (value) =>
                                  value === "" ? undefined : Number(value),
                              })}
                            />
                            <InputGroupAddon>
                              <Car />
                            </InputGroupAddon>
                          </InputGroup>
                          {errors.vehicles?.[index]?.year && (
                            <p className="text-xs text-rose-500">
                              {errors.vehicles[index]?.year?.message}
                            </p>
                          )}
                        </div>
                      </div>
                      {index < fields.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              )}
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
