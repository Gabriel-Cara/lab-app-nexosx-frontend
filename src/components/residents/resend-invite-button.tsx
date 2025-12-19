import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { resendInvite } from "@/api/resend-invite";

interface Props {
  userId: string;
}

export function ResendInviteButton({ userId }: Props) {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: () => resendInvite(userId),
    onSuccess: () => {
      toast.success("Convite reenviado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao reenviar convite");
    },
  });

  return (
    <Button
      variant="ghost"
      onClick={() => mutateAsync()}
      disabled={isPending}
    >
      <Mail className="text-blue-500" />
    </Button>
  );
}
