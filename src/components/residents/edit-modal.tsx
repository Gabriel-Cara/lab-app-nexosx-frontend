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
import { useFieldArray, useForm, type FieldErrors } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
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
import { formatFieldErrors } from "@/utils/form-errors";
import {
  formatParkingSpot,
  formatVehiclePlate,
  sanitizeParkingSpot,
  sanitizeVehiclePlate,
} from "@/utils/vehicle-plate";

const vehicleSchema = z
  .object({
    model: z.string().min(1, "Informe o modelo"),
    plate: z.string().min(1, "Informe a placa"),
    parkingSpot: z.string().min(1, "Informe a vaga"),
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
  email: z.string().email("Informe um e-mail válido").optional(),
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
  role: "manager" | "doorman" | "resident";
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
    setError,
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
      vehicles:
        props.vehicles?.map((vehicle) => ({
          ...vehicle,
          plate: formatVehiclePlate(vehicle.plate),
          parkingSpot: formatParkingSpot(vehicle.parkingSpot),
        })) ?? [],
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
        vehicles:
          props.vehicles?.map((vehicle) => ({
            ...vehicle,
            plate: formatVehiclePlate(vehicle.plate),
            parkingSpot: formatParkingSpot(vehicle.parkingSpot),
          })) ?? [],
        emergencyContact: props.emergencyContact ?? "",
      });
    }
  }, [isOpen, props, reset]);

  const fieldLabels = {
    name: "Nome",
    email: "E-mail",
    phone: "Telefone",
    apartment: "Apartamento",
    vehicles: "Veículos",
  };

  function handleInvalidForm(formErrors: FieldErrors<EditResidentForm>) {
    toast.error(formatFieldErrors(formErrors, fieldLabels));
  }

  async function handleEditResident(data: EditResidentForm) {
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
            plate: sanitizeVehiclePlate(vehicle.plate),
            parkingSpot: sanitizeParkingSpot(vehicle.parkingSpot),
            year: vehicle.year!,
          })) ?? [],
        emergencyContact: data.emergencyContact || undefined,
      });

      reset();
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
          onSubmit={handleSubmit(handleEditResident, handleInvalidForm)}
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
                    aria-invalid={Boolean(errors.apartment)}
                    {...register("apartment")}
                  />
                  <InputGroupAddon>
                    <House />
                  </InputGroupAddon>
                </InputGroup>
                {errors.apartment && (
                  <p className="text-xs text-rose-500">
                    {errors.apartment.message}
                  </p>
                )}
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
              <div className="col-span-2 space-y-1">
                <h3 className="text-sm font-medium">Informações adicionais</h3>
                <p className="text-sm text-muted-foreground">
                  Torre, contato de emergência, placa e vaga do veículo ficam vinculados ao morador.
                </p>
              </div>
              <div className="grid col-span-2 gap-3">
                <div className="flex items-center justify-between">
                  <Label>Veículos</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        model: "",
                        plate: "",
                        parkingSpot: "",
                        year: undefined,
                      })
                    }
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
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                          <Field className="gap-1.5">
                            <FieldLabel htmlFor={`vehicle-model-${field.id}`}>
                              Modelo
                            </FieldLabel>
                            <FieldContent>
                              <InputGroup>
                                <InputGroupInput
                                  id={`vehicle-model-${field.id}`}
                                  placeholder="Ex: Civic"
                                  aria-invalid={Boolean(
                                    errors.vehicles?.[index]?.model
                                  )}
                                  aria-required={true}
                                  {...register(`vehicles.${index}.model`)}
                                />
                                <InputGroupAddon>
                                  <Car />
                                </InputGroupAddon>
                              </InputGroup>
                            </FieldContent>
                            {errors.vehicles?.[index]?.model && (
                              <p className="text-xs text-rose-500">
                                {errors.vehicles[index]?.model?.message}
                              </p>
                            )}
                          </Field>
                          <Field className="gap-1.5">
                            <FieldLabel htmlFor={`vehicle-plate-${field.id}`}>
                              Placa
                            </FieldLabel>
                            <FieldContent>
                              <InputGroup>
                                <InputGroupInput
                                  id={`vehicle-plate-${field.id}`}
                                  placeholder="ABC-1234 ou ABC1D23"
                                  aria-invalid={Boolean(
                                    errors.vehicles?.[index]?.plate
                                  )}
                                  aria-required={true}
                                  {...register(`vehicles.${index}.plate`, {
                                    onChange: (event) =>
                                      setValue(
                                        `vehicles.${index}.plate`,
                                        formatVehiclePlate(event.target.value)
                                      ),
                                  })}
                                />
                                <InputGroupAddon>
                                  <Car />
                                </InputGroupAddon>
                              </InputGroup>
                            </FieldContent>
                            {errors.vehicles?.[index]?.plate && (
                              <p className="text-xs text-rose-500">
                                {errors.vehicles[index]?.plate?.message}
                              </p>
                            )}
                          </Field>
                          <Field className="gap-1.5">
                            <FieldLabel htmlFor={`vehicle-parking-spot-${field.id}`}>
                              Vaga
                            </FieldLabel>
                            <FieldContent>
                              <InputGroup>
                                <InputGroupInput
                                  id={`vehicle-parking-spot-${field.id}`}
                                  placeholder="Ex: G2-14"
                                  aria-invalid={Boolean(
                                    errors.vehicles?.[index]?.parkingSpot
                                  )}
                                  aria-required={true}
                                  {...register(`vehicles.${index}.parkingSpot`, {
                                    onChange: (event) =>
                                      setValue(
                                        `vehicles.${index}.parkingSpot`,
                                        formatParkingSpot(event.target.value)
                                      ),
                                  })}
                                />
                                <InputGroupAddon>
                                  <Building />
                                </InputGroupAddon>
                              </InputGroup>
                            </FieldContent>
                            {errors.vehicles?.[index]?.parkingSpot && (
                              <p className="text-xs text-rose-500">
                                {errors.vehicles[index]?.parkingSpot?.message}
                              </p>
                            )}
                          </Field>
                          <Field className="gap-1.5">
                            <FieldLabel htmlFor={`vehicle-year-${field.id}`}>
                              Ano
                            </FieldLabel>
                            <FieldContent>
                              <InputGroup>
                                <InputGroupInput
                                  id={`vehicle-year-${field.id}`}
                                  type="number"
                                  placeholder="2020"
                                  aria-invalid={Boolean(
                                    errors.vehicles?.[index]?.year
                                  )}
                                  aria-required={true}
                                  {...register(`vehicles.${index}.year`, {
                                    setValueAs: (value) =>
                                      value === "" ? undefined : Number(value),
                                  })}
                                />
                                <InputGroupAddon>
                                  <Car />
                                </InputGroupAddon>
                              </InputGroup>
                            </FieldContent>
                            {errors.vehicles?.[index]?.year && (
                              <p className="text-xs text-rose-500">
                                {errors.vehicles[index]?.year?.message}
                              </p>
                            )}
                          </Field>
                        </div>
                        {index < fields.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                )}
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
