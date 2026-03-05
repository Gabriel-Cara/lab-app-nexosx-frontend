import { useEffect, useState } from "react";
import { Helmet } from "@dr.pogodin/react-helmet";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { getProfile } from "@/api/get-profile";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { maskPhone, sanitizePhone } from "@/utils/phone-mask";
import { ImageManager } from "@/components/images/image-manager";
import { ProfileSkeleton } from "@/pages/app/profile-skeleton";
import { Car, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";

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

const profileFormSchema = z.object({
  name: z.string().min(3, "Informe o nome completo"),
  email: z.string().email("Informe um e-mail válido"),
  phone: z.string().optional(),
  document: z.string().optional(),
  apartment: z.string().optional(),
  building: z.string().optional(),
  vehicles: z.array(vehicleSchema).optional(),
  emergencyContact: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export function Profile() {
  const { session } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const userId = session?.user.id;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => getProfile(userId!),
    enabled: !!userId,
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: undefined,
      document: undefined,
      apartment: undefined,
      building: undefined,
      vehicles: [],
      emergencyContact: undefined,
    },
  });
  const { errors } = form.formState;

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "vehicles",
  });

  useEffect(() => {
    if (data) {
      form.reset({
        name: data.name ?? "",
        email: data.email ?? "",
        phone: maskPhone(data.phone),
        document: data.document ?? undefined,
        apartment: data.apartment ?? undefined,
        building: data.building ?? undefined,
        vehicles: data.vehicles ?? [],
        emergencyContact: data.emergencyContact ?? undefined,
      });
    }
  }, [data, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      const sanitizedPhone = sanitizePhone(values.phone);

      if (values.phone && !sanitizedPhone) {
        toast.error("Telefone inválido. Use DDD + número.");
        return;
      }

      console.log({ ...values, phone: sanitizedPhone || undefined });
      toast.success("Dados atualizados com sucesso (mock)!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Não foi possível salvar agora.");
      console.error(error);
    }
  });

  const canShowExtendedSections = data?.role !== "staff";

  function handleCancelEdit() {
    if (data) {
      form.reset({
        name: data.name ?? "",
        email: data.email ?? "",
        phone: maskPhone(data.phone),
        document: data.document ?? undefined,
        apartment: data.apartment ?? undefined,
        building: data.building ?? undefined,
        vehicles: data.vehicles ?? [],
        emergencyContact: data.emergencyContact ?? undefined,
      });
    }

    setIsEditing(false);
  }

  return (
    <>
      <Helmet>
        <title>Perfil</title>
      </Helmet>

      <main className="flex min-h-0 flex-1 flex-col gap-8">
        <PageHeader
          title="Meu perfil"
          description="Visualize e mantenha seus dados pessoais atualizados."
          actions={
            isEditing ? (
              <>
                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                  Cancelar
                </Button>
                <Button type="submit" form="profile-form">
                  Salvar alterações
                </Button>
              </>
            ) : (
              <Button type="button" onClick={() => setIsEditing(true)}>
                Editar
              </Button>
            )
          }
        />

        {!userId ? (
          <p className="text-sm text-muted-foreground">
            Aguarde o carregamento do usuário para editar o perfil.
          </p>
        ) : isLoading ? (
          <ProfileSkeleton showExtended={session?.user.role !== "staff"} />
        ) : isError || !data ? (
          <p className="text-sm text-destructive">
            Não foi possível carregar seus dados. Tente novamente.
          </p>
        ) : (
          <form id="profile-form" className="grid gap-6" onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Dados pessoais</CardTitle>
                <CardDescription>
                  Informações utilizadas para contato e identificação.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {userId && (
                  <div className="md:col-span-2">
                    <ImageManager
                      entityType="user"
                      entityId={userId}
                      imageUrl={data?.imageUrl}
                      label="Foto do perfil"
                      shape="round"
                      disabled={!isEditing}
                      onUpdated={() =>
                        queryClient.invalidateQueries({
                          queryKey: ["profile", userId],
                        })
                      }
                    />
                  </div>
                )}
                <Field className="gap-1.5">
                  <FieldLabel htmlFor="name">Nome completo</FieldLabel>
                  <FieldContent>
                    <InputGroup>
                      <InputGroupInput
                        id="name"
                        disabled={!isEditing}
                        aria-invalid={Boolean(errors.name)}
                        aria-required={true}
                        {...form.register("name")}
                      />
                    </InputGroup>
                  </FieldContent>
                </Field>
                <Field className="gap-1.5">
                  <FieldLabel htmlFor="email">E-mail</FieldLabel>
                  <FieldContent>
                    <InputGroup>
                      <InputGroupInput
                        id="email"
                        type="email"
                        disabled
                        aria-invalid={Boolean(errors.email)}
                        aria-required={true}
                        {...form.register("email")}
                      />
                      <InputGroupAddon>Conta</InputGroupAddon>
                    </InputGroup>
                  </FieldContent>
                </Field>
                <div className="grid gap-1.5">
                  <Label htmlFor="phone">Telefone</Label>
                  <InputGroup>
                    <InputGroupInput
                      id="phone"
                      disabled={!isEditing}
                      placeholder="(00) 00000-0000"
                      {...form.register("phone", {
                        onChange: (event) =>
                          form.setValue(
                            "phone",
                            maskPhone(event.target.value)
                          ),
                      })}
                    />
                  </InputGroup>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="document">Documento</Label>
                  <InputGroup>
                    <InputGroupInput
                      id="document"
                      disabled={!isEditing}
                      placeholder="CPF / RG"
                      {...form.register("document")}
                    />
                  </InputGroup>
                </div>
              </CardContent>
            </Card>

            {canShowExtendedSections && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Endereço e acesso</CardTitle>
                    <CardDescription>
                      Dados referentes à sua unidade ou veículo.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor="apartment">Apartamento</Label>
                      <InputGroup>
                        <InputGroupInput
                          id="apartment"
                          disabled={!isEditing}
                          placeholder="Ex: 702"
                          {...form.register("apartment")}
                        />
                      </InputGroup>
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="building">Bloco/Prédio</Label>
                      <InputGroup>
                        <InputGroupInput
                          id="building"
                          disabled={!isEditing}
                          placeholder="Ex: Torre B"
                          {...form.register("building")}
                        />
                      </InputGroup>
                    </div>
                    <div className="md:col-span-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Veículos</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => append({ model: "", plate: "", year: undefined })}
                          disabled={!isEditing}
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
                                  disabled={!isEditing}
                                >
                                  <Trash2 />
                                </Button>
                              </div>
                              <div className="grid gap-4 md:grid-cols-3">
                                <Field className="gap-1.5">
                                  <FieldLabel htmlFor={`vehicle-model-${field.id}`}>
                                    Modelo
                                  </FieldLabel>
                                  <FieldContent>
                                    <InputGroup>
                                      <InputGroupInput
                                        id={`vehicle-model-${field.id}`}
                                        disabled={!isEditing}
                                        placeholder="Ex: Civic"
                                        aria-required={true}
                                        {...form.register(`vehicles.${index}.model`)}
                                      />
                                      <InputGroupAddon>
                                        <Car />
                                      </InputGroupAddon>
                                    </InputGroup>
                                  </FieldContent>
                                </Field>
                                <Field className="gap-1.5">
                                  <FieldLabel htmlFor={`vehicle-plate-${field.id}`}>
                                    Placa
                                  </FieldLabel>
                                  <FieldContent>
                                    <InputGroup>
                                      <InputGroupInput
                                        id={`vehicle-plate-${field.id}`}
                                        disabled={!isEditing}
                                        placeholder="ABC-1234"
                                        aria-required={true}
                                        {...form.register(`vehicles.${index}.plate`)}
                                      />
                                      <InputGroupAddon>
                                        <Car />
                                      </InputGroupAddon>
                                    </InputGroup>
                                  </FieldContent>
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
                                        disabled={!isEditing}
                                        placeholder="2020"
                                        aria-required={true}
                                        {...form.register(`vehicles.${index}.year`, {
                                          setValueAs: (value) =>
                                            value === "" ? undefined : Number(value),
                                        })}
                                      />
                                      <InputGroupAddon>
                                        <Car />
                                      </InputGroupAddon>
                                    </InputGroup>
                                  </FieldContent>
                                </Field>
                              </div>
                              {index < fields.length - 1 && <Separator />}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Contato de emergência</CardTitle>
                    <CardDescription>
                      Informe alguém que poderemos contatar em caso de necessidade.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-1.5">
                      <Label htmlFor="emergencyContact">Nome e telefone</Label>
                      <InputGroup>
                        <InputGroupTextarea
                          id="emergencyContact"
                          rows={3}
                          disabled={!isEditing}
                          placeholder="Ex: Ana Souza - (11) 9 9999-9999"
                          {...form.register("emergencyContact")}
                        />
                      </InputGroup>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </form>
        )}
      </main>
    </>
  );
}
