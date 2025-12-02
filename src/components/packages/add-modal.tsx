import { useState } from "react";

// Icons
import { Package, Plus } from "lucide-react";

// Form
import { Controller, useForm } from "react-hook-form";

// Types
import { z } from "zod";

// Components
import { SelectResident } from "../select-resident";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

// API
import { postPackage } from "@/api/post-package";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";
import { toast } from "sonner";

const createPackageFormSchema = z.object({
  residentId: z.string({ message: "O destinatário é obrigatório" }),
  carrier: z.string({ message: "O remetente é obrigatório" }),
  description: z.string({ message: "A descrição é obrigatória" }),
  type: z.enum(["box", "envelope", "food", "others"], {
    message: "O tipo é obrigatório",
  }),
});

type CreatePackageFormData = z.infer<typeof createPackageFormSchema>;

export function AddModal() {
  const [isOpen, setIsOpen] = useState(false);

  const { register, control, handleSubmit, reset } = useForm<CreatePackageFormData>({
    resolver: zodResolver(createPackageFormSchema),
    defaultValues: {
      residentId: "",
      carrier: "",
      description: "",
      type: "others",
    },
  });

  const { mutateAsync: createPackage, isPending } = useMutation({
    mutationFn: postPackage,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["packages"] });
      setIsOpen(false);
    },
  });

  async function handleCreatePackage({
    residentId,
    carrier,
    description,
    type,
  }: CreatePackageFormData) {
    if(!residentId || !carrier || !description || !type) {
      throw toast.error("Preencha todos os campos");
    }

    await createPackage({ residentId, carrier, description, type })

    toast.success("Encomenda criada com sucesso!");
    reset();
    
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Registrar encomenda
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Encomenda</DialogTitle>
          <DialogDescription>Preencha os dados da encomenda.</DialogDescription>
        </DialogHeader>

        <form
          id="create-package-form"
          className="grid gap-4"
          onSubmit={handleSubmit(handleCreatePackage)}
        >
          {
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
                  />
                )}
              />
            </div>
          }
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
            form="create-package-form"
            type="submit"
            disabled={isPending}
          >
            {isPending ? "Registrando..." : "Registrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
