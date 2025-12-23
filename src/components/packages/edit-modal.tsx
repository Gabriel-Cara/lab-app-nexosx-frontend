import { useEffect, useState } from "react";
import { Edit, Package } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updatePackage } from "@/api/update-package";
import type { PackageType } from "@/api/get-packages";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/ui/input-group";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { SelectResident } from "../select-resident";

const editPackageFormSchema = z.object({
  residentId: z.string({ message: "O destinatário é obrigatório" }),
  carrier: z.string({ message: "O remetente é obrigatório" }),
  description: z.string({ message: "A descrição é obrigatória" }),
  type: z.enum(["box", "envelope", "food", "others"], {
    message: "O tipo é obrigatório",
  }),
});

type EditPackageFormData = z.infer<typeof editPackageFormSchema>;

type EditModalProps = {
  id: string;
  residentId: string;
  residentName: string;
  carrier: string | null;
  description: string;
  type: PackageType;
};

export function EditModal({
  id,
  residentId,
  residentName,
  carrier,
  description,
  type,
}: EditModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { register, control, handleSubmit, reset } = useForm<EditPackageFormData>({
    resolver: zodResolver(editPackageFormSchema),
    defaultValues: {
      residentId,
      carrier: carrier ?? "",
      description,
      type,
    },
  });

  const { mutateAsync: mutatePackage, isPending } = useMutation({
    mutationFn: updatePackage,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["packages"] });
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        residentId,
        carrier: carrier ?? "",
        description,
        type,
      });
    }
  }, [carrier, description, isOpen, residentId, reset, type]);

  async function handleEditPackage({
    residentId: selectedResidentId,
    carrier: selectedCarrier,
    description: selectedDescription,
    type: selectedType,
  }: EditPackageFormData) {
    if (
      !selectedResidentId ||
      !selectedCarrier ||
      !selectedDescription ||
      !selectedType
    ) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      await mutatePackage({
        id,
        residentId: selectedResidentId,
        carrier: selectedCarrier,
        description: selectedDescription,
        type: selectedType,
      });

      toast.success("Encomenda atualizada com sucesso!");
      setIsOpen(false);
    } catch {
      toast.error("Não foi possível atualizar a encomenda. Tente novamente.");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <Edit />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Encomenda</DialogTitle>
          <DialogDescription>
            Preencha os dados que deseja editar da encomenda.
          </DialogDescription>
        </DialogHeader>

        <form
          id="edit-package-form"
          className="grid gap-4"
          onSubmit={handleSubmit(handleEditPackage)}
        >
          <div className="grid gap-3">
            <Label
              className="after:content-['*'] after:text-rose-500 after:text-lg after:-ml-1"
              htmlFor="residentId"
            >
              Destinatário
            </Label>
            <Controller
              name="residentId"
              control={control}
              render={({ field }) => (
                <SelectResident
                  inputId="residentId"
                  value={field.value}
                  onChange={field.onChange}
                  selectedLabel={residentName}
                />
              )}
            />
          </div>
          <div className="grid col-span-2 sm:col-span-1 gap-1 text-lg">
            <Label
              className="after:content-['*'] after:text-rose-500 after:text-lg after:-ml-1"
              htmlFor="carrier"
            >
              Remetente
            </Label>
            <InputGroup>
              <InputGroupInput
                id="carrier"
                placeholder="Insira o remetente"
                {...register("carrier")}
              />
              <InputGroupAddon>
                <Package />
              </InputGroupAddon>
            </InputGroup>
          </div>
          <div className="grid col-span-2 sm:col-span-1 gap-1 text-lg">
            <Label
              className="after:content-['*'] after:text-rose-500 after:text-lg after:-ml-1"
              htmlFor="description"
            >
              Descrição
            </Label>
            <InputGroup>
              <InputGroupTextarea
                id="description"
                placeholder="Insira a descrição do item."
                maxLength={120}
                {...register("description")}
              />
              <InputGroupAddon align="block-end">
                máximo de 120 caracteres
              </InputGroupAddon>
            </InputGroup>
          </div>
          <div className="grid col-span-2 sm:col-span-1 gap-1 text-lg">
            <Label
              className="after:content-['*'] after:text-rose-500 after:text-lg after:-ml-1"
              htmlFor="type"
            >
              Tipo
            </Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="box">Caixa</SelectItem>
                      <SelectItem value="envelope">Envelope</SelectItem>
                      <SelectItem value="food">Comida</SelectItem>
                      <SelectItem value="others">Outros</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
            form="edit-package-form"
            type="submit"
            disabled={isPending}
          >
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
