import { Helmet } from "@dr.pogodin/react-helmet";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

import { KeyRound, SquareAsterisk } from "lucide-react";
import { setupPassword } from "@/api/post-setup-password";

const firstAccessSchema = z
  .object({
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
    confirmPassword: z.string().min(8),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

type FirstAccessForm = z.infer<typeof firstAccessSchema>;

export function FirstAccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<FirstAccessForm>({
    resolver: zodResolver(firstAccessSchema),
  });

  async function onSubmit(data: FirstAccessForm) {
    try {
      if (!token) {
        return toast.error("Link inválido. Solicite um novo convite.");
      }

      await setupPassword({ token, password: data.password });

      toast.success("Senha definida com sucesso! Faça login.");
      navigate("/sign-in");
    } catch {
      toast.error("Não foi possível definir a senha. Verifique se o link expirou.");
    }
  }

  return (
    <>
      <Helmet>
        <title>Primeiro acesso</title>
      </Helmet>

      <div className="p-8">
        <Button variant="outline" asChild className="absolute right-8 top-8">
          <Link to="/sign-in">Voltar</Link>
        </Button>

        <div className="flex w-full md:w-[380px] flex-col justify-center gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Primeiro acesso</h1>
            <p className="text-sm text-muted-foreground">
              Defina sua senha para acessar o painel
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova senha</Label>
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

            <Button className="w-full" type="submit" disabled={isSubmitting}>
              Definir senha
            </Button>
          </form>

          {!token && (
            <p className="text-xs text-muted-foreground text-center">
              Link inválido. Peça para a administração reenviar o convite.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
