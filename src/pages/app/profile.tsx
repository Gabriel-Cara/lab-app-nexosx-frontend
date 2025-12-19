import { useEffect, useState } from "react";
import { Helmet } from "@dr.pogodin/react-helmet";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { maskPhone, sanitizePhone } from "@/utils/phone-mask";

const profileFormSchema = z.object({
  name: z.string().min(3, "Informe o nome completo"),
  email: z.string().email("Informe um e-mail válido"),
  phone: z.string().optional(),
  document: z.string().optional(),
  apartment: z.string().optional(),
  building: z.string().optional(),
  vehicle: z.string().optional(),
  emergencyContact: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export function Profile() {
  const { session } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

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
      vehicle: undefined,
      emergencyContact: undefined,
    },
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
        vehicle: data.vehicle ?? undefined,
        emergencyContact: data.emergencyContact ?? undefined,
      });
    }
  }, [data, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      const sanitizedPhone = sanitizePhone(values.phone);
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
        vehicle: data.vehicle ?? undefined,
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

      <main className="flex min-h-svh flex-col gap-8">
        <header className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Meu perfil</h1>
            <p className="text-muted-foreground">
              Visualize e mantenha seus dados pessoais atualizados.
            </p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
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
            )}
          </div>
        </header>

        {!userId ? (
          <p className="text-sm text-muted-foreground">
            Aguarde o carregamento do usuário para editar o perfil.
          </p>
        ) : isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando informações...</p>
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
                <div className="grid gap-1.5">
                  <Label htmlFor="name">Nome completo</Label>
                  <InputGroup>
                    <InputGroupInput
                      id="name"
                      disabled={!isEditing}
                      {...form.register("name")}
                    />
                  </InputGroup>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="email">E-mail</Label>
                  <InputGroup>
                    <InputGroupInput
                      id="email"
                      type="email"
                      disabled
                      {...form.register("email")}
                    />
                    <InputGroupAddon>Conta</InputGroupAddon>
                  </InputGroup>
                </div>
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
                    <div className="grid gap-1.5">
                      <Label htmlFor="vehicle">Veículo</Label>
                      <InputGroup>
                        <InputGroupInput
                          id="vehicle"
                          disabled={!isEditing}
                          placeholder="Modelo / Placa"
                          {...form.register("vehicle")}
                        />
                      </InputGroup>
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
