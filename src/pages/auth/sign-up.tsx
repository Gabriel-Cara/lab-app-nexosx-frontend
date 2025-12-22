import { Helmet } from "@dr.pogodin/react-helmet";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

import { Mail, Phone, SquareAsterisk, User } from "lucide-react";
import { maskPhone, sanitizePhone } from "@/utils/phone-mask";

const signUpFormSchema = z.object({
  name: z.string(),
  phone: z.string(),
  email: z.email(),
  password: z.string(),
});

type SignUpForm = z.infer<typeof signUpFormSchema>;

export function SignUp() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<SignUpForm>();

  async function handleSignUp(data: SignUpForm) {
    try {
      const phone = sanitizePhone(data.phone);

      if (!data.name || !data.email || !data.password) {
        return toast.error("Preencha todos os campos.");
      }

      if (!phone) {
        return toast.error("Telefone inválido. Use DDD + número.");
      }

      console.log(data);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("Usuário cadastrado com sucesso.", {
        action: {
          label: "Login",
          onClick: () => navigate("/sign-in"),
        },
      });
    } catch {
      toast.error("Erro ao cadastrar usuário.");
    }
  }

  return (
    <>
      <Helmet>
        <title>Cadastro</title>
      </Helmet>

      <div className="p-8">
        <Button variant="outline" asChild className="absolute right-8 top-8">
          <Link to="/sign-in">Fazer login</Link>
        </Button>

        <div className="flex w-full md:w-[350px] flex-col justify-center gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Criar conta
            </h1>
            <p className="text-sm text-muted-foreground">
              Informe os dados abaixo para continuar!
            </p>
          </div>

          <form onSubmit={handleSubmit(handleSignUp)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Seu nome</Label>
              <InputGroup>
                <InputGroupInput
                  id="name"
                  type="text"
                  placeholder="Insira seu nome"
                  {...register("name", { required: true })}
                />
                <InputGroupAddon>
                  <User />
                </InputGroupAddon>
              </InputGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Seu e-mail</Label>
              <InputGroup>
                <InputGroupInput
                id="email"
                type="email"
                placeholder="Insira seu e-mail"
                {...register("email", { required: true })}
              />
              <InputGroupAddon>
                <Mail />
              </InputGroupAddon>
              </InputGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Seu celular</Label>
              <InputGroup>
                <InputGroupInput
                id="phone"
                type="text"
                placeholder="Insira seu número de celular"
                {...register("phone", {
                  required: true,
                  onChange: (event) =>
                    setValue("phone", maskPhone(event.target.value)),
                })}
              />
              <InputGroupAddon>
                <Phone />
              </InputGroupAddon>
              </InputGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Sua senha</Label>
              <InputGroup>
              <InputGroupInput
                id="password"
                type="password"
                placeholder="Insira sua senha"
                {...register("password", { required: true })}
              />
              <InputGroupAddon>
                <SquareAsterisk />
              </InputGroupAddon>
              </InputGroup>
            </div>

            <Button className="w-full" type="submit" disabled={isSubmitting}>
              Finalizar cadastro
            </Button>

            <p className="px-6 text-center text-sm leading-relaxed text-muted-foreground">
              Ao continuar, você concorda com nossos{" "}
              <a className="underline underline-offset-4 text-primary" href="#">
                termos de serviço
              </a>{" "}
              e{" "}
              <a className="underline underline-offset-4 text-primary" href="#">
                políticas de privacidade
              </a>
              .
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
