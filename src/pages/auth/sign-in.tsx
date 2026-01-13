import { Helmet } from "@dr.pogodin/react-helmet";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

import { CheckCircle2, Mail, SquareAsterisk } from "lucide-react";
import { useLogin } from "@/api/post-login";
import type { LoginCandidate } from "@/api/post-login";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const signInFormSchema = z.object({
  email: z.email(),
  password: z.string(),
});

type SignInForm = z.infer<typeof signInFormSchema>;

export function SignIn() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<LoginCandidate[] | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    null
  );

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInFormSchema),
  });

  const { mutateAsync: authenticate, isPending: isLoggingIn } = useLogin();

  const auth = useAuth();

  const selectedCandidate = useMemo(() => {
    if (!candidates || !selectedCandidateId) {
      return null;
    }
    return candidates.find((candidate) => candidate.user.id === selectedCandidateId) ?? null;
  }, [candidates, selectedCandidateId]);

  async function handleLogin(data: SignInForm) {
    try {
      if (!data.email || !data.password) {
        return toast.error("Preencha todos os campos.");
      }

      const response = await authenticate({
        email: data.email,
        password: data.password,
      });

      if ("candidates" in response) {
        if (response.candidates.length === 0) {
          return toast.error("Nenhum condomínio disponível para este usuário.");
        }

        setCandidates(response.candidates);
        setSelectedCandidateId(response.candidates[0].user.id);
        return;
      }

      auth.save(response);

      toast.success("Login efetuado com sucesso.");

      navigate("/");
    } catch {
      toast.error("Erro ao efetuar login. Tente novamente!");
    }
  }

  function handleSelectCondominium() {
    if (!selectedCandidate) {
      return toast.error("Selecione um condomínio para continuar.");
    }

    auth.save({
      token: selectedCandidate.token,
      user: selectedCandidate.user,
    });

    toast.success("Login efetuado com sucesso.");
    navigate("/");
  }

  return (
    <>
      <Helmet>
        <title>Login</title>
      </Helmet>

      <div className="p-8">
        <Button variant="outline" asChild className="absolute right-8 top-8">
          <Link to="/sign-up">Solicitar condomínio</Link>
        </Button>

        <div className="flex w-full md:w-[350px] flex-col justify-center gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Acessar painel
            </h1>
            <p className="text-sm text-muted-foreground">
              {candidates
                ? "Selecione o condomínio para continuar"
                : "Insira e-mail e senha para acessar o painel"}
            </p>
          </div>
          {candidates ? (
            <div className="space-y-4">
              <div className="grid gap-3">
                {candidates.map((candidate) => {
                  const condominiumName =
                    candidate.condominium?.name ?? "Condomínio";

                  return (
                    <label
                      key={candidate.user.id}
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors",
                        "hover:border-primary/60",
                        selectedCandidateId === candidate.user.id
                          ? "border-primary ring-1 ring-primary/40"
                          : "border-border"
                      )}
                    >
                      <input
                        className="sr-only"
                        type="radio"
                        name="condominium"
                        value={candidate.user.id}
                        checked={selectedCandidateId === candidate.user.id}
                        onChange={() => setSelectedCandidateId(candidate.user.id)}
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {condominiumName}
                        </p>
                        {candidate.condominium?.code && (
                          <p className="text-xs text-muted-foreground">
                            Codigo: {candidate.condominium.code}
                          </p>
                        )}
                      </div>
                      <CheckCircle2
                        className={cn(
                          "h-5 w-5 text-primary transition-opacity",
                          selectedCandidateId === candidate.user.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </label>
                  );
                })}
              </div>
              <Button className="w-full" onClick={handleSelectCondominium}>
                Entrar
              </Button>
              <Button
                className="w-full"
                variant="ghost"
                type="button"
                onClick={() => setCandidates(null)}
              >
                Voltar
              </Button>
            </div>
          ) : (
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
              <div className="text-right">
                <Link
                  to="/esqueci-senha"
                  className="text-xs text-primary hover:underline"
                >
                  Esqueci minha senha
                </Link>
              </div>
            </div>
              <Button
                className="w-full"
                type="submit"
                disabled={isSubmitting || isLoggingIn}
              >
                Acessar painel
              </Button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
