import { useState } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { getArea } from "@/api/get-area";
import { patchArea } from "@/api/patch-area";
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

interface EditModalProps {
  areaId: string;
}

interface EditAreaFormData {
  name: string;
  description: string;
  capacity: number;
  available: boolean;
}

export function EditModal({ areaId }: EditModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { handleSubmit, register } = useForm<EditAreaFormData>();

  const { data: areaData } = useQuery({
    queryKey: ["area-details", areaId],
    queryFn: () => getArea({ id: areaId }),
  });

  const { mutateAsync: updateArea, isPending } = useMutation({
    mutationFn: patchArea,
  });

  async function handleEditArea({
    name,
    description,
    capacity,
    available,
  }: EditAreaFormData) {
    if (!areaData) {
      throw toast.error("Não foi possível carregar os dados da área.");
    }

    try {
      await updateArea({
        id: areaId,
        name,
        description,
        capacity,
        available,
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["areas"] }),
        queryClient.invalidateQueries({ queryKey: ["area-details", areaId] }),
      ]);

      toast.success("Área atualizada com sucesso!");
      setIsOpen(false);
    } catch {
      throw toast.error("Não foi possível atualizar a área.");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Editar</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar {areaData?.name}</DialogTitle>
          <DialogDescription>
            Altere os campos necessários para editar os dados da área de lazer:{" "}
            <strong>{areaData?.name}</strong>.
          </DialogDescription>
        </DialogHeader>
        <form
          id="edit-form"
          className="space-y-4"
          onSubmit={handleSubmit(handleEditArea)}
        >
          <div className="space-y-2">
            <Label htmlFor="name">Nome do local</Label>
            <Input
              id="name"
              placeholder="Ex: Salão de Festas"
              defaultValue={areaData?.name}
              {...register("name")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <InputGroup>
              <InputGroupTextarea
                id="description"
                placeholder="Insira a descrição..."
                defaultValue={areaData?.description || ""}
                maxLength={200}
                {...register("description")}
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
                defaultValue={areaData?.capacity || 0}
                {...register("capacity", { valueAsNumber: true })}
              />
            </InputGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="flex flex-col items-start">
              Disponibilidade
              <div className="relative inline-block h-5 w-10 cursor-pointer rounded-full bg-zinc-900 transition [-webkit-tap-highlight-color:transparent] has-checked:bg-[#1976D2]">
                <input
                  type="checkbox"
                  id="status"
                  {...register("available")}
                  className="peer sr-only"
                  defaultChecked={areaData?.available}
                />
                <span className="absolute inset-y-0 start-0 m-1 size-3 rounded-full ring-2 ring-inset ring-white transition-all peer-checked:start-6 bg-zinc-900 peer-checked:w-1 peer-checked:bg-white peer-checked:ring-transparent"></span>
              </div>
            </Label>
          </div>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancelar</Button>
          </DialogClose>
          <Button form="edit-form" type="submit" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
