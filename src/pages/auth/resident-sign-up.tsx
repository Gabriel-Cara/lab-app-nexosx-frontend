import { Helmet } from "@dr.pogodin/react-helmet";
import { Link, useNavigate, useSearchParams } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";

import {
  Building,
  Car,
  House,
  KeyRound,
  Mail,
  Phone,
  Plus,
  Trash2,
  SquareAsterisk,
  User,
} from "lucide-react";
import { maskPhone, sanitizePhone } from "@/utils/phone-mask";
import { getResidentInvite } from "@/api/get-resident-invite";
import { postResidentSignup } from "@/api/post-resident-signup";

const optionalPasswordSchema = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim().length === 0 ? undefined : value,
  z.string().min(8, "A senha deve ter pelo menos 8 caracteres").optional()
);

const optionalConfirmPasswordSchema = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim().length === 0 ? undefined : value,
  z.string().optional()
);

const optionalTextSchema = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim().length === 0 ? undefined : value,
  z.string().optional()
);

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

const residentSignUpSchema = z
  .object({
    name: z.string().min(2, "Informe seu nome completo"),
    email: z.email("Informe um e-mail válido"),
    phone: z.string().optional(),
    apartment: z.string().min(1, "Informe seu apartamento"),
    building: optionalTextSchema,
    vehicles: z.array(vehicleSchema).optional(),
    emergencyContact: optionalTextSchema,
    password: optionalPasswordSchema,
    confirmPassword: optionalConfirmPasswordSchema,
  })
  .refine(
    (data) => {
      if (!data.password && !data.confirmPassword) {
        return true;
      }
      return data.password === data.confirmPassword;
    },
    {
      message: "As senhas não conferem",
      path: ["confirmPassword"],
    }
  );

type ResidentSignUpFormInput = z.input<typeof residentSignUpSchema>;
type ResidentSignUpFormOutput = z.output<typeof residentSignUpSchema>;

export function ResidentSignUp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);

  const { data: invite, isLoading, isError } = useQuery({
    queryKey: ["resident-invite", token],
    queryFn: () => getResidentInvite(token),
    enabled: Boolean(token),
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { isSubmitting, errors },
  } = useForm<ResidentSignUpFormInput, unknown, ResidentSignUpFormOutput>({
    resolver: zodResolver(residentSignUpSchema),
    defaultValues: {
      vehicles: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "vehicles",
  });

  async function handleSignUp(data: ResidentSignUpFormOutput) {
    try {
      if (!token) {
        return toast.error("Link inválido. Solicite um novo convite.");
      }

      const phone = data.phone ? sanitizePhone(data.phone) : undefined;

      if (data.phone && !phone) {
        return toast.error("Telefone inválido. Use DDD + número.");
      }

      await postResidentSignup({
        token,
        name: data.name.trim(),
        email: data.email.trim(),
        phone,
        apartment: data.apartment.trim(),
        building: data.building?.trim() || undefined,
        vehicles:
          data.vehicles?.map((vehicle) => ({
            model: vehicle.model.trim(),
            plate: vehicle.plate.trim(),
            year: vehicle.year!,
          })) ?? [],
        emergencyContact: data.emergencyContact?.trim() || undefined,
        password: data.password?.trim() || undefined,
      });

      if (data.password) {
        toast.success("Cadastro concluído! Faça login para acessar.");
      } else {
        toast.success("Cadastro enviado! Defina sua senha pelo e-mail.");
      }

      navigate("/sign-in");
    } catch {
      toast.error("Não foi possível concluir o cadastro. Verifique o link.");
    }
  }

  const isFormDisabled = isSubmitting || isLoading || isError || !token;

  return (
    <>
      <Helmet>
        <title>Cadastro de morador</title>
      </Helmet>

      <div className="p-8">
        <Button variant="outline" asChild className="absolute right-8 top-8">
          <Link to="/sign-in">Voltar</Link>
        </Button>

        <div className="flex w-full md:w-[420px] flex-col justify-center gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Cadastro de morador
            </h1>
            <p className="text-sm text-muted-foreground">
              Complete seus dados para acessar o painel
            </p>
            {invite?.condominium && (
              <p className="text-xs text-muted-foreground">
                Condomínio:{" "}
                <span className="text-foreground">
                  {invite.condominium.name} ({invite.condominium.code})
                </span>
              </p>
            )}
            {isLoading && (
              <p className="text-xs text-muted-foreground">
                Validando convite...
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit(handleSignUp)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <InputGroup>
                <InputGroupInput
                  id="name"
                  type="text"
                  placeholder="Insira seu nome"
                  {...register("name")}
                  disabled={isFormDisabled}
                />
                <InputGroupAddon>
                  <User />
                </InputGroupAddon>
              </InputGroup>
              {errors.name && (
                <p className="text-xs text-rose-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <InputGroup>
                <InputGroupInput
                  id="email"
                  type="email"
                  placeholder="email@dominio.com"
                  {...register("email")}
                  disabled={isFormDisabled}
                />
                <InputGroupAddon>
                  <Mail />
                </InputGroupAddon>
              </InputGroup>
              {errors.email && (
                <p className="text-xs text-rose-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <InputGroup>
                <InputGroupInput
                  id="phone"
                  type="text"
                  placeholder="(00) 00000-0000"
                  {...register("phone", {
                    onChange: (event) =>
                      setValue("phone", maskPhone(event.target.value)),
                  })}
                  disabled={isFormDisabled}
                />
                <InputGroupAddon>
                  <Phone />
                </InputGroupAddon>
              </InputGroup>
              {errors.phone && (
                <p className="text-xs text-rose-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="apartment">Apartamento</Label>
              <InputGroup>
                <InputGroupInput
                  id="apartment"
                  type="text"
                  placeholder="Ex: 101"
                  {...register("apartment")}
                  disabled={isFormDisabled}
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

            <div className="space-y-2">
              <Label htmlFor="building">Torre</Label>
              <InputGroup>
                <InputGroupInput
                  id="building"
                  type="text"
                  placeholder="Insira a torre"
                  {...register("building")}
                  disabled={isFormDisabled}
                />
                <InputGroupAddon>
                  <Building />
                </InputGroupAddon>
              </InputGroup>
              {errors.building && (
                <p className="text-xs text-rose-500">
                  {errors.building.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Veículos</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ model: "", plate: "", year: undefined })}
                  disabled={isFormDisabled}
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
                          disabled={isFormDisabled}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`vehicle-model-${field.id}`}>Modelo</Label>
                        <InputGroup>
                          <InputGroupInput
                            id={`vehicle-model-${field.id}`}
                            type="text"
                            placeholder="Ex: Civic"
                            {...register(`vehicles.${index}.model`)}
                            disabled={isFormDisabled}
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
                      <div className="space-y-2">
                        <Label htmlFor={`vehicle-plate-${field.id}`}>Placa</Label>
                        <InputGroup>
                          <InputGroupInput
                            id={`vehicle-plate-${field.id}`}
                            type="text"
                            placeholder="ABC-1234"
                            {...register(`vehicles.${index}.plate`)}
                            disabled={isFormDisabled}
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
                      <div className="space-y-2">
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
                            disabled={isFormDisabled}
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
                      {index < fields.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Contato de emergência</Label>
              <InputGroup>
                <InputGroupInput
                  id="emergencyContact"
                  type="text"
                  placeholder="Nome e telefone"
                  {...register("emergencyContact")}
                  disabled={isFormDisabled}
                />
                <InputGroupAddon>
                  <Phone />
                </InputGroupAddon>
              </InputGroup>
              {errors.emergencyContact && (
                <p className="text-xs text-rose-500">
                  {errors.emergencyContact.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha (opcional)</Label>
              <InputGroup>
                <InputGroupInput
                  id="password"
                  type="password"
                  placeholder="Defina uma senha"
                  {...register("password")}
                  disabled={isFormDisabled}
                />
                <InputGroupAddon>
                  <SquareAsterisk />
                </InputGroupAddon>
              </InputGroup>
              <p className="text-xs text-muted-foreground">
                Se preferir, deixe em branco para definir a senha por e-mail.
              </p>
              {errors.password && (
                <p className="text-xs text-rose-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <InputGroup>
                <InputGroupInput
                  id="confirmPassword"
                  type="password"
                  placeholder="Repita a senha"
                  {...register("confirmPassword")}
                  disabled={isFormDisabled}
                />
                <InputGroupAddon>
                  <KeyRound />
                </InputGroupAddon>
              </InputGroup>
              {errors.confirmPassword && (
                <p className="text-xs text-rose-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button className="w-full" type="submit" disabled={isFormDisabled}>
              {isSubmitting ? "Enviando..." : "Concluir cadastro"}
            </Button>
          </form>

          {isError && (
            <p className="text-xs text-muted-foreground text-center">
              Link inválido ou expirado. Peça um novo convite ao condomínio.
            </p>
          )}
          {!token && (
            <p className="text-xs text-muted-foreground text-center">
              Link inválido. Solicite um convite válido à administração.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
