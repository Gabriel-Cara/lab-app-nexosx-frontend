import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircleAlert, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deletePackage } from "@/api/delete-package";

type DeleteModalProps = {
  id: string;
  residentName: string;
  description: string;
};

export function DeleteModal({
  id,
  residentName,
  description,
}: DeleteModalProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutateAsync: mutateDelete, isPending } = useMutation({
    mutationFn: deletePackage,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["packages"] });
    },
  });

  async function handleDelete() {
    try {
      await mutateDelete(id);
      toast.success("Encomenda removida com sucesso.");
      setOpen(false);
    } catch {
      toast.error("Não foi possível remover a encomenda. Tente novamente.");
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost">
          <Trash2 className="text-rose-500" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <CircleAlert
              size={52}
              strokeWidth={2}
              className="mx-auto animate-pulse text-rose-500"
            />
          </AlertDialogTitle>
        </AlertDialogHeader>
        <div>
          <h1 className="text-center text-xl font-bold">Você tem certeza?</h1>
          <p className="text-center font-light tracking-tight">
            Essa ação não pode ser desfeita. Isso irá deletar a encomenda de{" "}
            <span className="font-semibold">{residentName}</span> com a descrição
            {" "}
            <span className="font-semibold">{description}</span> permanentemente.
          </p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>

          <Button
            asChild
            variant="destructive"
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault();
              handleDelete();
            }}
          >
            <AlertDialogAction>
              {isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
