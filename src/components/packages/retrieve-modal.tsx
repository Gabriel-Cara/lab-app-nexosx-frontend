import { useState } from "react";

// Icons
import { CircleCheckBig } from "lucide-react";

// Components
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../ui/input-otp";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Types
import z from "zod";

// Form
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { retrievePackage as retrievePackageRequest } from "@/api/patch-package-retrieve";
import { queryClient } from "@/lib/react-query";
import { Controller, useForm } from "react-hook-form";
import { isAxiosError } from "axios";

// Toast
import { toast } from "sonner";

interface RetrieveModalProps {
  id: string;
}

const otpFormSchema = z.object({
  code: z
    .string()
    .transform((value) => value.replace(/[^A-Za-z0-9]/g, "").toUpperCase())
    .refine((value) => /^[A-Z0-9]{6}$/.test(value), {
      message:
        "Código de verificação deve ter 6 caracteres entre letras e números.",
    }),
});

type OTPFormSchema = z.infer<typeof otpFormSchema>;

export function RetrieveModal({ id }: RetrieveModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<OTPFormSchema>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: {
      code: "",
    },
  });

  const { control, handleSubmit, reset } = form;

  const { mutateAsync: mutateRetrievePackage, isPending } = useMutation({
    mutationFn: retrievePackageRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["packages"] });
    },
    onError: (error) => {
      const message = isAxiosError(error)
        ? error.response?.data?.message ??
          "Código inválido. Verifique e tente novamente."
        : "Não foi possível resgatar a encomenda. Tente novamente.";

      toast.error(message);
    },
  });

  async function handleRetrievePackage({ code }: OTPFormSchema) {
    await mutateRetrievePackage({
      id,
      code,
    });

    toast.success("Encomenda resgatada com sucesso!");

    setIsOpen(false);

    reset();
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsOpen(true)}
            aria-label="Resgatar encomenda"
          >
            <CircleCheckBig className="text-emerald-500" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Resgatar encomenda</TooltipContent>
      </Tooltip>
      <DialogContent>
        <DialogHeader className="sr-only">
          <DialogTitle>Resgatar encomenda</DialogTitle>
          <DialogDescription>
            Insira o código para resgatar a encomenda.
          </DialogDescription>
        </DialogHeader>
        <Card className="border-none shadow-none">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              Insira o código de verificação
            </CardTitle>
            <CardDescription>
              Digite o código fornecido ao morador via SMS.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleRetrievePackage)}>
              <Controller
                name="code"
                control={control}
                render={({ field, fieldState }) => (
                  <Field className="gap-2">
                    <FieldLabel htmlFor="code" className="sr-only">
                      Código de verificação
                    </FieldLabel>
                    <FieldContent className="justify-center">
                      <InputOTP
                        maxLength={6}
                        id="code"
                        aria-invalid={Boolean(fieldState.error)}
                        aria-required={true}
                        containerClassName="gap-2"
                        {...field}
                        inputMode="text"
                        onChange={(value) =>
                          field.onChange(
                            value
                              .replace(/[^A-Za-z0-9]/g, "")
                              .toUpperCase()
                          )
                        }
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FieldContent>
                    {fieldState.error && (
                      <p className="text-xs text-rose-500">
                        {fieldState.error.message}
                      </p>
                    )}
                  </Field>
                )}
              />
              <Button
                type="submit"
                className="mt-4 w-full"
                disabled={isPending}
              >
                {isPending ? "Verificando..." : "Verificar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
