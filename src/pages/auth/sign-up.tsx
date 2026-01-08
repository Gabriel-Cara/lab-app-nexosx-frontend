import { Helmet } from "@dr.pogodin/react-helmet";
import { Link, useNavigate } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useCreateCondominiumRequest } from "@/api/post-condominium-request";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

import { Building2, Hash, Mail, Phone, SquareAsterisk, User } from "lucide-react";
import { maskPhone, sanitizePhone } from "@/utils/phone-mask";

const signUpFormSchema = z.object({
  name: z.string().min(2, "Informe o nome do condomínio"),
  code: z.string().min(2, "Informe o código do condomínio"),
  adminName: z.string().min(2, "Informe o nome do administrador"),
  adminEmail: z.email("Informe um e-mail válido"),
  adminPhone: z.string().optional(),
  adminPassword: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
});

type SignUpForm = z.infer<typeof signUpFormSchema>;

export function SignUp() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpFormSchema),
  });

  const { mutateAsync: createRequest, isPending: isCreating } =
    useCreateCondominiumRequest();

  async function handleSignUp(data: SignUpForm) {
    try {
      const phone = data.adminPhone ? sanitizePhone(data.adminPhone) : undefined;

      if (data.adminPhone && !phone) {
        return toast.error("Telefone inválido. Use DDD + número.");
      }

      await createRequest({
        name: data.name.trim(),
        code: data.code.trim(),
        adminName: data.adminName.trim(),
        adminEmail: data.adminEmail.trim(),
        adminPhone: phone,
        adminPassword: data.adminPassword,
      });

      toast.success("Solicitação enviada. Aguarde a aprovação do master.", {
        action: {
          label: "Login",
          onClick: () => navigate("/sign-in"),
        },
      });
    } catch {
      toast.error("Erro ao enviar a solicitação.");
    }
  }

  return (
    <>
      <Helmet>
        <title>Cadastro de condomínio</title>
      </Helmet>

      <div className="p-8">
        <Button variant="outline" asChild className="absolute right-8 top-8">
          <Link to="/sign-in">Fazer login</Link>
        </Button>

        <div className="flex w-full md:w-[380px] flex-col justify-center gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Solicitar cadastro
            </h1>
            <p className="text-sm text-muted-foreground">
              Informe os dados do condomínio e do administrador
            </p>
          </div>

          <form onSubmit={handleSubmit(handleSignUp)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do condomínio</Label>
              <InputGroup>
                <InputGroupInput
                  id="name"
                  type="text"
                  placeholder="Ex: Residencial Aurora"
                  {...register("name")}
                />
                <InputGroupAddon>
                  <Building2 />
                </InputGroupAddon>
              </InputGroup>
              {errors.name && (
                <p className="text-xs text-rose-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Código do condomínio</Label>
              <InputGroup>
                <InputGroupInput
                  id="code"
                  type="text"
                  placeholder="Ex: aurora"
                  {...register("code")}
                />
                <InputGroupAddon>
                  <Hash />
                </InputGroupAddon>
              </InputGroup>
              {errors.code && (
                <p className="text-xs text-rose-500">{errors.code.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminName">Nome do administrador</Label>
              <InputGroup>
                <InputGroupInput
                  id="adminName"
                  type="text"
                  placeholder="Insira o nome completo"
                  {...register("adminName")}
                />
                <InputGroupAddon>
                  <User />
                </InputGroupAddon>
              </InputGroup>
              {errors.adminName && (
                <p className="text-xs text-rose-500">
                  {errors.adminName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminEmail">E-mail do administrador</Label>
              <InputGroup>
                <InputGroupInput
                  id="adminEmail"
                  type="email"
                  placeholder="email@dominio.com"
                  {...register("adminEmail")}
                />
                <InputGroupAddon>
                  <Mail />
                </InputGroupAddon>
              </InputGroup>
              {errors.adminEmail && (
                <p className="text-xs text-rose-500">
                  {errors.adminEmail.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminPhone">Telefone do administrador</Label>
              <InputGroup>
                <InputGroupInput
                  id="adminPhone"
                  type="text"
                  placeholder="(00) 00000-0000"
                  {...register("adminPhone", {
                    onChange: (event) =>
                      setValue("adminPhone", maskPhone(event.target.value)),
                  })}
                />
                <InputGroupAddon>
                  <Phone />
                </InputGroupAddon>
              </InputGroup>
              {errors.adminPhone && (
                <p className="text-xs text-rose-500">
                  {errors.adminPhone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminPassword">Senha do administrador</Label>
              <InputGroup>
                <InputGroupInput
                  id="adminPassword"
                  type="password"
                  placeholder="Defina uma senha"
                  {...register("adminPassword")}
                />
                <InputGroupAddon>
                  <SquareAsterisk />
                </InputGroupAddon>
              </InputGroup>
              {errors.adminPassword && (
                <p className="text-xs text-rose-500">
                  {errors.adminPassword.message}
                </p>
              )}
            </div>

            <Button
              className="w-full"
              type="submit"
              disabled={isSubmitting || isCreating}
            >
              Enviar solicitação
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
