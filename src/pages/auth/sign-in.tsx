import { Helmet } from "@dr.pogodin/react-helmet";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

import { Mail, SquareAsterisk } from "lucide-react";
import { useLogin } from "@/api/login";
import { useAuth } from "@/hooks/use-auth";

const signInFormSchema = z.object({
  email: z.email(),
  password: z.string(),
});

type SignInForm = z.infer<typeof signInFormSchema>;

export function SignIn() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignInForm>();

  const { mutateAsync: authenticate, isPending: isLoggingIn } = useLogin();

  const auth = useAuth();

  async function handleLogin(data: SignInForm) {
    try {
      if (!data.email || !data.password) {
        return toast.error("Preencha todos os campos.");
      }

      const response = await authenticate({ email: data.email, password: data.password });

      auth.save(response);

      toast.success("Login efetuado com sucesso.");
    } catch {
      toast.error("Erro ao efetuar login. Tente novamente!");
    }
  }

  return (
    <>
      <Helmet>
        <title>Login</title>
      </Helmet>

      <div className="p-8">
        <Button variant="outline" asChild className="absolute right-8 top-8">
          <Link to="/sign-up">Registre-se</Link>
        </Button>

        <div className="flex w-[350px] flex-col justify-center gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Acessar painel
            </h1>
            <p className="text-sm text-muted-foreground">
              Insira e-mail e senha para acessar o painel
            </p>
          </div>
          <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Seu e-mail</Label>
              <InputGroup>
                <InputGroupInput
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  {...register("email")}
                />
                <InputGroupAddon>
                  <Mail />
                </InputGroupAddon>
              </InputGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Sua senha</Label>
              <InputGroup>
                <InputGroupInput
                  id="password"
                  type="password"
                  placeholder="********"
                  {...register("password")}
                />
                <InputGroupAddon>
                  <SquareAsterisk />
                </InputGroupAddon>
              </InputGroup>
            </div>
            <Button
              className="w-full"
              type="submit"
              disabled={isSubmitting || isLoggingIn}
            >
              Acessar painel
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
