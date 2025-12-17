import { useState } from "react";

import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { queryClient } from "@/lib/react-query";

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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from "../ui/input-group";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Plus } from "lucide-react";
import { postArea } from "@/api/post-area";

interface AddAreaFormData {
  name: string;
  description: string;
  capacity: number;
  available: boolean;
}

export function AddModal() {
  const [isOpen, setIsOpen] = useState(false);

  const { handleSubmit, register } = useForm<AddAreaFormData>();

  const { mutateAsync: createArea, isPending } = useMutation({
    mutationFn: postArea,
  });

  async function handleAddArea({
    name,
    description,
    capacity,
  }: AddAreaFormData) {
    try {
      await createArea({
        name,
        description,
        capacity,
        available: true,
      })

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["areas"] }),
      ]);

      toast.success(`${name} criada com sucesso!`);
      setIsOpen(false);
    } catch {
      throw toast.error("Não foi possível criar a área de lazer.");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus />
          Nova Área de Lazer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar área de lazer</DialogTitle>
          <DialogDescription>
            Insira os campos necessários para criar uma nova área de lazer.
          </DialogDescription>
        </DialogHeader>
        <form
          id="add-form"
          className="space-y-4"
          onSubmit={handleSubmit(handleAddArea)}
        >
          <div className="space-y-2">
            <Label htmlFor="name">Nome do local</Label>
            <Input
              id="name"
              placeholder="Ex: Salão de Festas"
              {...register("name")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <InputGroup>
              <InputGroupTextarea
                id="description"
                placeholder="Insira a descrição..."
                {...register("description")}
                maxLength={200}
              />
              <InputGroupAddon align="block-end">
                máximo de 200 caracteres
              </InputGroupAddon>
            </InputGroup>
          </div>

          <div className="space-y-2 max-w-14 relative">
            <Label htmlFor="capacity">Capacidade</Label>
            <InputGroup>
              <InputGroupInput
                id="capacity"
                type="number"
                min={0}
                {...register("capacity", { valueAsNumber: true })}
              />
            </InputGroup>
          </div>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancelar</Button>
          </DialogClose>
          <Button form="add-form" type="submit" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
