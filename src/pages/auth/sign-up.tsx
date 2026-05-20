import { Helmet } from "@dr.pogodin/react-helmet";
import { Link, useNavigate } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useCreateCondominiumRequest } from "@/api/post-condominium-request";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
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
  adminName: z.string().min(2, "Informe o nome do gestor"),
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

      toast.success("Solicitação enviada. Aguarde a aprovação do administrador da plataforma.", {
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
              Informe os dados do condomínio e do gestor
            </p>
          </div>

          <form onSubmit={handleSubmit(handleSignUp)} className="space-y-4">
            <Field className="gap-2">
              <FieldLabel htmlFor="name">Nome do condomínio</FieldLabel>
              <FieldContent>
                <InputGroup>
                  <InputGroupInput
                    id="name"
                    type="text"
                    placeholder="Ex: Residencial Aurora"
                    aria-invalid={Boolean(errors.name)}
                    aria-required={true}
                    {...register("name")}
                  />
                  <InputGroupAddon>
                    <Building2 />
                  </InputGroupAddon>
                </InputGroup>
              </FieldContent>
              {errors.name && (
                <p className="text-xs text-rose-500">{errors.name.message}</p>
              )}
            </Field>

            <Field className="gap-2">
              <FieldLabel htmlFor="code">Código do condomínio</FieldLabel>
              <FieldContent>
                <InputGroup>
                  <InputGroupInput
                    id="code"
                    type="text"
                    placeholder="Ex: aurora"
                    aria-invalid={Boolean(errors.code)}
                    aria-required={true}
                    {...register("code")}
                  />
                  <InputGroupAddon>
                    <Hash />
                  </InputGroupAddon>
                </InputGroup>
              </FieldContent>
              {errors.code && (
                <p className="text-xs text-rose-500">{errors.code.message}</p>
              )}
            </Field>

            <Field className="gap-2">
              <FieldLabel htmlFor="adminName">Nome do gestor</FieldLabel>
              <FieldContent>
                <InputGroup>
                  <InputGroupInput
                    id="adminName"
                    type="text"
                    placeholder="Insira o nome completo"
                    aria-invalid={Boolean(errors.adminName)}
                    aria-required={true}
                    {...register("adminName")}
                  />
                  <InputGroupAddon>
                    <User />
                  </InputGroupAddon>
                </InputGroup>
              </FieldContent>
              {errors.adminName && (
                <p className="text-xs text-rose-500">
                  {errors.adminName.message}
                </p>
              )}
            </Field>

            <Field className="gap-2">
              <FieldLabel htmlFor="adminEmail">
                E-mail do gestor
              </FieldLabel>
              <FieldContent>
                <InputGroup>
                  <InputGroupInput
                    id="adminEmail"
                    type="email"
                    placeholder="email@dominio.com"
                    aria-invalid={Boolean(errors.adminEmail)}
                    aria-required={true}
                    {...register("adminEmail")}
                  />
                  <InputGroupAddon>
                    <Mail />
                  </InputGroupAddon>
                </InputGroup>
              </FieldContent>
              {errors.adminEmail && (
                <p className="text-xs text-rose-500">
                  {errors.adminEmail.message}
                </p>
              )}
            </Field>

            <Field className="gap-2">
              <FieldLabel htmlFor="adminPhone">
                Telefone do gestor
              </FieldLabel>
              <FieldContent>
                <InputGroup>
                  <InputGroupInput
                    id="adminPhone"
                    type="text"
                    placeholder="(00) 00000-0000"
                    aria-invalid={Boolean(errors.adminPhone)}
                    {...register("adminPhone", {
                      onChange: (event) =>
                        setValue("adminPhone", maskPhone(event.target.value)),
                    })}
                  />
                  <InputGroupAddon>
                    <Phone />
                  </InputGroupAddon>
                </InputGroup>
              </FieldContent>
              {errors.adminPhone && (
                <p className="text-xs text-rose-500">
                  {errors.adminPhone.message}
                </p>
              )}
            </Field>

            <Field className="gap-2">
              <FieldLabel htmlFor="adminPassword">
                Senha do gestor
              </FieldLabel>
              <FieldContent>
                <InputGroup>
                  <InputGroupInput
                    id="adminPassword"
                    type="password"
                    placeholder="Defina uma senha"
                    aria-invalid={Boolean(errors.adminPassword)}
                    aria-required={true}
                    {...register("adminPassword")}
                  />
                  <InputGroupAddon>
                    <SquareAsterisk />
                  </InputGroupAddon>
                </InputGroup>
              </FieldContent>
              {errors.adminPassword && (
                <p className="text-xs text-rose-500">
                  {errors.adminPassword.message}
                </p>
              )}
            </Field>

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
