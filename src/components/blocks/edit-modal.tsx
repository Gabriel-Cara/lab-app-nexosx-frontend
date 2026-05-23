// Components
import { Field, FieldContent, FieldLabel } from "../ui/field";
import { Button } from "../ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "../ui/dialog";

// Icons
import { Building, Loader2, Pencil } from "lucide-react";

// Libs
import { zodResolver } from "@hookform/resolvers/zod/dist/zod.js";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";
import { useForm } from "react-hook-form";
import z from "zod";

// API
import { patchBlock } from "@/api/patch-block";
import type { Block } from "@/api/get-blocks";

// Toast
import { toast } from "sonner";
import { useState } from "react";

interface EditModalProps {
  block: Block;
}

const editBlockFormSchema = z.object({
  block: z.string().min(1, "O nome do bloco é obrigatório."),
});

type EditBlockFormSchema = z.infer<typeof editBlockFormSchema>;

export function EditModal({ block }: EditModalProps) {
  const [open, setOpen] = useState(false);
  const [editedName, setEditedName] = useState("");
  const {
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<EditBlockFormSchema>({
    resolver: zodResolver(editBlockFormSchema),
    defaultValues: {
      block: block.name,
    },
  });

  const { mutateAsync: updateBlock, isPending } = useMutation({
    mutationFn: patchBlock,
    onSuccess: async () => {
      reset();
      await queryClient.invalidateQueries({ queryKey: ["blocks"] });
      toast.success("Bloco editado com sucesso!");
      setOpen(false);
    },
    onError: () => {
      toast.error("Erro ao editar bloco!");
    },
  });

  function handleUpdateBlock() {
    updateBlock({
      id: block.id,
      name: editedName,
      condominiumId: block.condominiumId,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Pencil />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar bloco</DialogTitle>
          <DialogDescription>
            Edite as informações do bloco aqui. Lembre-se de salvar suas
            alterações antes de sair.
          </DialogDescription>
        </DialogHeader>

        <form id="edit-block-form" onSubmit={handleSubmit(handleUpdateBlock)}>
          <Field>
            <FieldLabel htmlFor="block">Nome do bloco</FieldLabel>
            <FieldContent>
              <InputGroup>
                <InputGroupAddon>
                  <Building />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder="Digite o nome do bloco"
                  value={editedName}
                  defaultValue={block.name}
                  onChange={(e) => setEditedName(e.target.value)}
                />
              </InputGroup>
            </FieldContent>
            {errors.block && toast.message(errors.block.message)}
          </Field>
        </form>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button type="submit" form="edit-block-form">
            {isPending ? (
              <span>
                <Loader2 className="mr-2 animate-spin" /> Editando...
              </span>
            ) : (
              "Editar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
