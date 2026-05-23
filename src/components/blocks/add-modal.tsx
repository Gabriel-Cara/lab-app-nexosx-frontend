// React
import { useEffect, useState } from "react";

// Icons
import { Building, Loader2, Plus } from "lucide-react";

// Components
import { Field, FieldContent, FieldLabel } from "../ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

// Form
import { Controller, useForm } from "react-hook-form";

// Types
import { zodResolver } from "@hookform/resolvers/zod/dist/zod.js";
import z from "zod";

// Libs
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";

// Context
import { useAuth } from "@/hooks/use-auth";

// API
import { getCondominiums } from "@/api/get-condominiums";
import { postBlock } from "@/api/post-block";

// Toast
import { toast } from "sonner";

const createBlockFormSchema = z.object({
  condominiumId: z.string().optional(),
  block: z.string().min(1, "O nome do bloco é obrigatório"),
});

type CreateBlockFormData = z.infer<typeof createBlockFormSchema>;

export function AddModal() {
  const [open, setOpen] = useState(false);
  const { session } = useAuth();
  const isAdmin = session?.user.role === "admin";
  const [selectedCondominiumId, setSelectedCondominiumId] = useState("");

  const { data: condominiums = [] } = useQuery({
    queryKey: ["condominiums"],
    queryFn: getCondominiums,
    enabled: isAdmin,
  });

  const { mutateAsync: createBlock, isPending } = useMutation({
    mutationFn: postBlock,
    onSuccess: async () => {
      reset();
      await queryClient.invalidateQueries({ queryKey: ["blocks"] });
      toast.success("Bloco criado com sucesso!");
      setOpen(false);
    },
    onError: () => {
      toast.error("Erro ao criar bloco!");
    },
  });

  useEffect(() => {
    if (isAdmin && !selectedCondominiumId && condominiums.length > 0) {
      setSelectedCondominiumId(condominiums[0].id);
      console.log("Selected condominium ID set to:", condominiums[0].id);
    }
  }, [condominiums, isAdmin, selectedCondominiumId]);

  const condominiumId = isAdmin ? selectedCondominiumId : undefined;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateBlockFormData>({
    resolver: zodResolver(createBlockFormSchema),
    defaultValues: {
      condominiumId: condominiumId,
      block: "",
    },
  });

  function handleCreateBlock({ block, condominiumId }: CreateBlockFormData) {
    createBlock({ name: block, condominiumId });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Novo bloco
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar bloco</DialogTitle>
          <DialogDescription>
            Informe o nome do bloco que deseja adicionar.
          </DialogDescription>
        </DialogHeader>

        <form
          id="create-block-form"
          onSubmit={handleSubmit(handleCreateBlock)}
          className="space-y-6"
        >
          {isAdmin && (
            <Field>
              <FieldLabel htmlFor="condominiumId">Condomínio</FieldLabel>
              <FieldContent>
                <Controller
                  name="condominiumId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um condomínio" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {condominiums.map((condominium) => (
                            <SelectItem
                              key={condominium.id}
                              value={condominium.id}
                            >
                              {condominium.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FieldContent>
              {errors.condominiumId && (
                <p className="text-xs text-rose-500">
                  {errors.condominiumId.message}
                </p>
              )}
            </Field>
          )}

          <Field>
            <FieldLabel htmlFor="block">Bloco</FieldLabel>
            <FieldContent>
              <InputGroup>
                <InputGroupAddon>
                  <Building />
                </InputGroupAddon>
                <InputGroupInput
                  id="block"
                  placeholder="Nome do bloco"
                  {...register("block", { required: true })}
                />
              </InputGroup>
            </FieldContent>
            {errors.block && (
              <p className="text-xs text-rose-500">{errors.block.message}</p>
            )}
          </Field>
        </form>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button type="submit" form="create-block-form" disabled={isPending}>
            {isPending ? (
              <span>
                <Loader2 className="mr-2 animate-spin" />
                Criando...
              </span>
            ) : (
              "Salvar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
