import { useEffect, useState } from "react";
import { Mail, Phone, Plus, User } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "../ui/textarea";
import { SelectResident } from "./select-resident";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postVisitor } from "@/api/post-visitor";
import { useAuth } from "@/hooks/use-auth";

const createVisitorFormSchema = z.object({
  name: z.string(),
  document: z.string(),
  phone: z.string().optional(),
  visitReason: z.string().optional(),
  hostId: z.string(),
});

type CreateVisitorForm = z.infer<typeof createVisitorFormSchema>;

export function AddModal() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const isResident = session?.user.role === "resident";
  const residentHostId = session?.user.id ?? "";

  const { register, handleSubmit, control, reset, setValue } =
    useForm<CreateVisitorForm>({
      resolver: zodResolver(createVisitorFormSchema),
      defaultValues: {
        name: "",
        document: "",
        phone: "",
        visitReason: "",
        hostId: isResident ? residentHostId : "",
      },
    });

  useEffect(() => {
    if (isResident && residentHostId) {
      setValue("hostId", residentHostId);
    }
  }, [isResident, residentHostId, setValue]);

  const { mutateAsync: createVisitor, isPending } = useMutation({
    mutationFn: postVisitor,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["visitors"] });
    },
  });

  async function handleCreateVisitor(data: CreateVisitorForm) {
    try {
      const hostId = isResident ? residentHostId : data.hostId;

      if (!hostId) {
        toast.error("Morador é obrigatório");
        throw new Error("Morador é obrigatório");
      }

      if (!data.name) {
        toast.error("Nome é obrigatório");
        throw new Error("Nome é obrigatório");
      }

      if (!data.document) {
        toast.error("Documento é obrigatório");
        throw new Error("Documento é obrigatório");
      }

      await createVisitor({ ...data, hostId });
      reset({
        name: "",
        document: "",
        phone: "",
        visitReason: "",
        hostId: isResident ? residentHostId : "",
      });
      setIsOpen(false);
      toast.success("Visitante criado com sucesso!");
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Novo visitante
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar Visitante</DialogTitle>
          <DialogDescription>
            Preencha os dados do novo visitante.
          </DialogDescription>
        </DialogHeader>

        <form id="register-visitor-form" onSubmit={handleSubmit(handleCreateVisitor)}>
          <div className="grid gap-4">
            {!isResident ? (
              <div className="grid gap-3">
                <Label htmlFor="resident">Morador</Label>
                <Controller
                  name="hostId"
                  control={control}
                  render={({ field }) => (
                    <SelectResident
                      inputId="resident"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            ) : (
              <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground bg-muted text-center">
                Este visitante será vinculado automaticamente ao morador{<br />}
                <span className="font-semibold text-foreground">
                  {session?.user.name}
                </span>
                .
              </div>
            )}
            <div className="grid gap-3">
              <Label
                className="after:content-['*'] after:text-rose-500 after:text-xl after:-ml-1"
                htmlFor="name"
              >
                Nome
              </Label>
              <InputGroup>
                <InputGroupInput
                  id="name"
                  placeholder="Insira o nome completo"
                  {...register("name")}
                />
                <InputGroupAddon>
                  <User />
                </InputGroupAddon>
              </InputGroup>
            </div>
            <div className="grid gap-3">
              <Label
                className="after:content-['*'] after:text-rose-500 after:text-xl after:-ml-1"
                htmlFor="document"
              >
                Documento
              </Label>
              <InputGroup>
                <InputGroupInput
                  id="document"
                  placeholder="Insira o documento"
                  {...register("document")}
                />
                <InputGroupAddon>
                  <Mail />
                </InputGroupAddon>
              </InputGroup>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="phone">Telefone</Label>
              <InputGroup>
                <InputGroupInput
                  id="phone"
                  placeholder="Insira o telefone"
                  {...register("phone")}
                />
                <InputGroupAddon>
                  <Phone />
                </InputGroupAddon>
              </InputGroup>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="visitReason">Motivo da visita</Label>
              <Textarea
                id="visitReason"
                placeholder="Motivo da visita"
                {...register("visitReason")}
              />
            </div>
          </div>
        </form>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button form="register-visitor-form" type="submit" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
