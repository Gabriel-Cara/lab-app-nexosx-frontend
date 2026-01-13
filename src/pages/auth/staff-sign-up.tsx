import { Helmet } from "@dr.pogodin/react-helmet";
import { Link, useNavigate, useSearchParams } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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

import { Clock, KeyRound, Mail, Phone, SquareAsterisk, User } from "lucide-react";
import { maskPhone, sanitizePhone } from "@/utils/phone-mask";
import { getStaffInvite } from "@/api/get-staff-invite";
import { postStaffSignup } from "@/api/post-staff-signup";

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

const staffSignUpSchema = z
  .object({
    name: z.string().min(2, "Informe seu nome completo"),
    email: z.email("Informe um e-mail válido"),
    phone: z.string().optional(),
    shift: optionalTextSchema,
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

type StaffSignUpFormInput = z.input<typeof staffSignUpSchema>;
type StaffSignUpFormOutput = z.output<typeof staffSignUpSchema>;

export function StaffSignUp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);

  const { data: invite, isLoading, isError } = useQuery({
    queryKey: ["staff-invite", token],
    queryFn: () => getStaffInvite(token),
    enabled: Boolean(token),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<StaffSignUpFormInput, unknown, StaffSignUpFormOutput>({
    resolver: zodResolver(staffSignUpSchema),
  });

  async function handleSignUp(data: StaffSignUpFormOutput) {
    try {
      if (!token) {
        return toast.error("Link inválido. Solicite um novo convite.");
      }

      const phone = data.phone ? sanitizePhone(data.phone) : undefined;

      if (data.phone && !phone) {
        return toast.error("Telefone inválido. Use DDD + número.");
      }

      await postStaffSignup({
        token,
        name: data.name.trim(),
        email: data.email.trim(),
        phone,
        shift: data.shift?.trim() || undefined,
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
        <title>Cadastro de equipe</title>
      </Helmet>

      <div className="p-8">
        <Button variant="outline" asChild className="absolute right-8 top-8">
          <Link to="/sign-in">Voltar</Link>
        </Button>

        <div className="flex w-full md:w-[380px] flex-col justify-center gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Cadastro de equipe
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
              <Label htmlFor="shift">Turno</Label>
              <InputGroup>
                <InputGroupInput
                  id="shift"
                  type="text"
                  placeholder="Ex: Manhã, Tarde, Noite"
                  {...register("shift")}
                  disabled={isFormDisabled}
                />
                <InputGroupAddon>
                  <Clock />
                </InputGroupAddon>
              </InputGroup>
              {errors.shift && (
                <p className="text-xs text-rose-500">{errors.shift.message}</p>
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
