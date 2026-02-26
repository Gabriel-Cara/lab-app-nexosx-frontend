import { useState } from "react";
import {
  Building,
  Calendar,
  Car,
  House,
  Mail,
  Phone,
  Plus,
  TextCursorInput,
  Trash2,
  User,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, type FieldErrors } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
import { formatFieldErrors } from "@/utils/form-errors";

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

const createResidentFormSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  email: z.string().min(1, "O email é obrigatório").email("Informe um e-mail válido"),
  phone: z.string().min(1, "O telefone é obrigatório"),
  apartment: z.string().min(1, "O apartamento é obrigatório"),
  building: z.string().optional(),
  vehicles: z.array(vehicleSchema).optional(),
  emergencyContact: z.string().optional(),
});

type CreateResidentForm = z.infer<typeof createResidentFormSchema>;

export function AddModal() {
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
  } = useForm<CreateResidentForm>({
    resolver: zodResolver(createResidentFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      apartment: "",
      building: "",
      vehicles: [],
      emergencyContact: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "vehicles",
  });

  const { mutateAsync: mutateResident, isPending } = useMutation({
    mutationFn: postResident,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["residents"] });
    },
  });

  const fieldLabels = {
    name: "Nome",
    email: "E-mail",
    phone: "Telefone",
    apartment: "Apartamento",
    vehicles: "Veículos",
  };

  function handleInvalidForm(formErrors: FieldErrors<CreateResidentForm>) {
    toast.error(formatFieldErrors(formErrors, fieldLabels));
  }

  async function handleCreateResident(data: CreateResidentForm) {
    try {
      const phone = sanitizePhone(data.phone);

      if (!phone) {
        setError("phone", {
          type: "manual",
          message: "Telefone inválido. Use DDD + número.",
        });
        toast.error("Campo inválido: Telefone.");
        return;
      }

      await mutateResident({
        ...data,
        role: "resident",
        phone,
        vehicles:
          data.vehicles?.map((vehicle) => ({
            model: vehicle.model.trim(),
            plate: vehicle.plate.trim(),
            year: vehicle.year!,
          })) ?? [],
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
        vehicles: [],
        emergencyContact: "",
      });
      setIsOpen(false);
    } catch {
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
          onSubmit={handleSubmit(handleCreateResident, handleInvalidForm)}
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
                  aria-required={true}
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
            <FieldLabel htmlFor="apartment">Apartamento</FieldLabel>
            <FieldContent>
              <InputGroup>
                <InputGroupInput
                  id="apartment"
                  placeholder="Insira o apartamento"
                  aria-invalid={Boolean(errors.apartment)}
                  aria-required={true}
                  {...register("apartment")}
                />
                <InputGroupAddon>
                  <House />
                </InputGroupAddon>
              </InputGroup>
            </FieldContent>
            {errors.apartment && (
              <p className="text-xs text-rose-500">
                {errors.apartment.message}
              </p>
            )}
          </Field>
          <Field className="col-span-2 gap-3 text-lg sm:col-span-1">
            <FieldLabel htmlFor="emergencyContact">Nº de emergência</FieldLabel>
            <FieldContent>
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
            </FieldContent>
          </Field>
          <Field className="col-span-2 gap-3 text-lg sm:col-span-1">
            <FieldLabel htmlFor="building">Torre</FieldLabel>
            <FieldContent>
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
            </FieldContent>
          </Field>
          <div className="grid col-span-2 gap-3 text-lg">
            <div className="flex items-center justify-between">
              <Label>Veículos</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ model: "", plate: "", year: undefined })
                }
              >
                <Plus />
                Adicionar veículo
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
                        {index + 1}º Veículo
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => remove(index)}
                        aria-label="Remover carro"
                        className="text-rose-400 hover:text-rose-500"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
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
                              placeholder="ABC-1234"
                              aria-invalid={Boolean(
                                errors.vehicles?.[index]?.plate
                              )}
                              aria-required={true}
                              {...register(`vehicles.${index}.plate`)}
                            />
                            <InputGroupAddon>
                              <TextCursorInput />
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
                        <FieldLabel htmlFor={`vehicle-year-${field.id}`}>
                          Ano do veículo
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
                              <Calendar />
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
