import { Helmet } from "@dr.pogodin/react-helmet";
import { Link } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Mail } from "lucide-react";
import { postForgotPassword } from "@/api/post-forgot-password";

const forgotPasswordSchema = z.object({
  email: z.email("Informe um e-mail válido"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function handleForgot(data: ForgotPasswordForm) {
    try {
      await postForgotPassword({ email: data.email.trim() });
      setSubmitted(true);
      toast.success("Se o e-mail existir, enviaremos as instruções.");
    } catch {
      toast.error("Não foi possível enviar as instruções. Tente novamente.");
    }
  }

  return (
    <>
      <Helmet>
        <title>Recuperar senha</title>
      </Helmet>

      <div className="p-8">
        <Button variant="outline" asChild className="absolute right-8 top-8">
          <Link to="/sign-in">Voltar</Link>
        </Button>

        <div className="flex w-full md:w-[360px] flex-col justify-center gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Recuperar senha
            </h1>
            <p className="text-sm text-muted-foreground">
              Enviaremos um link para redefinir sua senha.
            </p>
          </div>

          <form onSubmit={handleSubmit(handleForgot)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Seu e-mail</Label>
              <InputGroup>
                <InputGroupInput
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  {...register("email")}
                  disabled={isSubmitting || submitted}
                />
                <InputGroupAddon>
                  <Mail />
                </InputGroupAddon>
              </InputGroup>
              {errors.email && (
                <p className="text-xs text-rose-500">{errors.email.message}</p>
              )}
            </div>

            <Button
              className="w-full"
              type="submit"
              disabled={isSubmitting || submitted}
            >
              {isSubmitting ? "Enviando..." : "Enviar link"}
            </Button>
          </form>

          {submitted && (
            <p className="text-xs text-muted-foreground text-center">
              Se o e-mail estiver cadastrado, você receberá o link em instantes.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
