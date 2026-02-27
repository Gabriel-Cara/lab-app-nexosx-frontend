import { RotateCw } from "lucide-react";
import { isAxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { resendPackageCode } from "@/api/post-package-resend-code";

interface Props {
  packageId: string;
  disabled?: boolean;
}

export function ResendCodeButton({ packageId, disabled }: Props) {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: () => resendPackageCode(packageId),
    onSuccess: () => {
      toast.success("Código reenviado com sucesso.");
    },
    onError: (error) => {
      const message = isAxiosError(error)
        ? error.response?.data?.message ??
          "Não foi possível reenviar o código."
        : "Não foi possível reenviar o código.";

      toast.error(message);
    },
  });

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={() => mutateAsync()}
          disabled={isPending || disabled}
          aria-label="Reenviar código"
        >
          <RotateCw />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Reenviar código</TooltipContent>
    </Tooltip>
  );
}
