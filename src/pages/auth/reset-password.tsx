import { Helmet } from "@dr.pogodin/react-helmet";
import { Link, useNavigate, useSearchParams } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { KeyRound, SquareAsterisk } from "lucide-react";
import { postResetPassword } from "@/api/post-reset-password";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  async function handleReset(data: ResetPasswordForm) {
    try {
      if (!token) {
        return toast.error("Link inválido. Solicite um novo.");
      }

      await postResetPassword({ token, password: data.password });
      toast.success("Senha redefinida com sucesso! Faça login.");
      navigate("/sign-in");
    } catch {
      toast.error("Não foi possível redefinir a senha. Verifique o link.");
    }
  }

  return (
    <>
      <Helmet>
        <title>Redefinir senha</title>
      </Helmet>

      <div className="p-8">
        <Button variant="outline" asChild className="absolute right-8 top-8">
          <Link to="/sign-in">Voltar</Link>
        </Button>

        <div className="flex w-full md:w-[380px] flex-col justify-center gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Redefinir senha
            </h1>
            <p className="text-sm text-muted-foreground">
              Crie uma nova senha para sua conta
            </p>
          </div>

          <form onSubmit={handleSubmit(handleReset)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova senha</Label>
              <InputGroup>
                <InputGroupInput
                  id="password"
                  type="password"
                  placeholder="********"
                  {...register("password")}
                  disabled={isSubmitting || !token}
                />
                <InputGroupAddon>
                  <SquareAsterisk />
                </InputGroupAddon>
              </InputGroup>
              {errors.password && (
                <p className="text-xs text-rose-500">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <InputGroup>
                <InputGroupInput
                  id="confirmPassword"
                  type="password"
                  placeholder="********"
                  {...register("confirmPassword")}
                  disabled={isSubmitting || !token}
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

            <Button className="w-full" type="submit" disabled={isSubmitting || !token}>
              {isSubmitting ? "Salvando..." : "Redefinir senha"}
            </Button>
          </form>

          {!token && (
            <p className="text-xs text-muted-foreground text-center">
              Link inválido. Solicite uma nova recuperação.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
