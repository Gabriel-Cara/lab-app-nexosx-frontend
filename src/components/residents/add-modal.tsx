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
import { useFieldArray, useForm } from "react-hook-form";
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
  name: z.string({ message: "O nome é obrigatório" }),
  email: z.email({ message: "O email é obrigatório" }),
  phone: z.string({ message: "O telefone é obrigatório" }),
  apartment: z.string({ message: "O apartamento é obrigatório" }),
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

  async function handleCreateResident(data: CreateResidentForm) {
    try {
      const phone = sanitizePhone(data.phone);

      if (!phone) {
        throw toast.error("Telefone inválido. Use DDD + número.");
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
                      <div className="grid gap-1.5">
                        <Label htmlFor={`vehicle-model-${field.id}`}>
                          Modelo
                        </Label>
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
                        <Label htmlFor={`vehicle-plate-${field.id}`}>
                          Placa
                        </Label>
                        <InputGroup>
                          <InputGroupInput
                            id={`vehicle-plate-${field.id}`}
                            placeholder="ABC-1234"
                            {...register(`vehicles.${index}.plate`)}
                          />
                          <InputGroupAddon>
                            <TextCursorInput />
                          </InputGroupAddon>
                        </InputGroup>
                        {errors.vehicles?.[index]?.plate && (
                          <p className="text-xs text-rose-500">
                            {errors.vehicles[index]?.plate?.message}
                          </p>
                        )}
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor={`vehicle-year-${field.id}`}>
                          Ano do veículo
                        </Label>
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
                            <Calendar />
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
