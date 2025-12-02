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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from "../ui/form";
import { Button } from "@/components/ui/button";

// Types
import z from "zod";

// Form
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { patchPackage } from "@/api/patch-package";
import { queryClient } from "@/lib/react-query";
import { useForm } from "react-hook-form";
import { isAxiosError } from "axios";

// Toast
import { toast } from "sonner";

interface RetrieveModalProps {
  id: string;
}

const otpFormSchema = z.object({
  code: z
    .string()
    .min(6, { message: "Código de verificação precisa ter 6 caracteres." }),
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

  const { mutateAsync: retrievePackage, isPending } = useMutation({
    mutationFn: patchPackage,
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
    await retrievePackage({ id, code });

    toast.success("Encomenda resgatada com sucesso!");

    setIsOpen(false);

    reset();
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <CircleCheckBig />
          Resgatar encomenda
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="sr-only">
          <DialogTitle>Resgatar encomenda</DialogTitle>
          <DialogDescription>Insira o código para resgatar a encomenda.</DialogDescription>
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
            <Form {...form}>
              <form onSubmit={handleSubmit(handleRetrievePackage)}>
                <FormField
                  control={control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="code" className="sr-only">
                        Código de verificação
                      </FormLabel>
                      <FormControl>
                        <InputOTP
                          maxLength={6}
                          id="code"
                          required
                          containerClassName="gap-2"
                          {...field}
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
                      </FormControl>
                      <FormMessage />
                    </FormItem>
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
            </Form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
