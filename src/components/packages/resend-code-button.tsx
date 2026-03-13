import { RotateCw } from "lucide-react";
import { isAxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { resendPackageCode } from "@/api/post-package-resend-code";
import { getNotificationFeedback } from "@/utils/notification-feedback";

interface Props {
  packageId: string;
  disabled?: boolean;
}

export function ResendCodeButton({ packageId, disabled }: Props) {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: () => resendPackageCode(packageId),
    onSuccess: (result) => {
      toast.success("Código reenviado com sucesso.");

      const feedback = getNotificationFeedback(result.notification);
      if (feedback?.successMessage) {
        toast.success(feedback.successMessage);
      }
      if (feedback?.errorMessage) {
        toast.error(feedback.errorMessage);
      }
    },
    onError: (error) => {
      const message = isAxiosError(error)
        ? error.response?.data?.message ?? "Não foi possível reenviar o código."
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
