import { useEffect, useMemo, useState } from "react";
import { Copy, Link2, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { createStaffInvite } from "@/api/post-staff-invite";

type InviteLinkModalProps = {
  condominiumId?: string;
  buttonLabel?: string;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost";
  buttonSize?: "default" | "sm";
};

export function StaffInviteLinkModal({
  condominiumId,
  buttonLabel = "Gerar link",
  buttonVariant = "outline",
  buttonSize = "default",
}: InviteLinkModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [condominiumLabel, setCondominiumLabel] = useState<string | null>(null);
  const [hasAttempted, setHasAttempted] = useState(false);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: () => createStaffInvite(condominiumId),
  });

  const expiresLabel = useMemo(() => {
    if (!expiresAt) return null;
    const parsed = new Date(expiresAt);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toLocaleDateString("pt-BR");
  }, [expiresAt]);

  async function handleGenerate() {
    try {
      setHasAttempted(false);
      const data = await mutateAsync();
      setInviteUrl(data.inviteUrl);
      setExpiresAt(data.expiresAt);
      setCondominiumLabel(`${data.condominium.name} (${data.condominium.code})`);
    } catch {
      toast.error("Não foi possível gerar o link de cadastro.");
    } finally {
      setHasAttempted(true);
    }
  }

  async function handleCopy() {
    if (!inviteUrl) return;

    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success("Link copiado!");
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  }

  useEffect(() => {
    if (isOpen) {
      setInviteUrl(null);
      setExpiresAt(null);
      setCondominiumLabel(null);
      setHasAttempted(false);
      void handleGenerate();
    }
  }, [isOpen, handleGenerate]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize}>
          <Link2 />
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link de cadastro</DialogTitle>
          <DialogDescription>
            Compartilhe o link para que a equipe crie o próprio acesso.
          </DialogDescription>
        </DialogHeader>

        {isPending ? (
          <p className="text-sm text-muted-foreground">Gerando link...</p>
        ) : inviteUrl ? (
          <div className="space-y-3">
            {condominiumLabel && (
              <p className="text-sm text-muted-foreground">
                Condomínio: <span className="text-foreground">{condominiumLabel}</span>
              </p>
            )}
            <InputGroup>
              <InputGroupInput readOnly value={inviteUrl} />
              <InputGroupAddon align="inline-end">
                <InputGroupButton onClick={handleCopy} title="Copiar">
                  <Copy />
                  Copiar
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            {expiresLabel && (
              <p className="text-xs text-muted-foreground">
                Link válido até {expiresLabel}.
              </p>
            )}
          </div>
        ) : hasAttempted ? (
          <p className="text-sm text-muted-foreground">
            Não foi possível gerar o link. Tente novamente.
          </p>
        ) : null}

        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={handleGenerate}
            disabled={isPending}
          >
            <RefreshCcw />
            Gerar novo
          </Button>
          <Button type="button" onClick={() => setIsOpen(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
