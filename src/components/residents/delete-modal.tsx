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
import { deleteResident } from "@/api/delete-resident";

type DeleteModalProps = {
  id: string;
  name: string;
};

export function DeleteModal({ id, name }: DeleteModalProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutateAsync: mutateDelete, isPending } = useMutation({
    mutationFn: deleteResident,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["residents"] });
    },
  });

  async function handleDelete() {
    try {
      await mutateDelete(id);
      toast.success(`Morador ${name} removido com sucesso.`);
      setOpen(false);
    } catch {
      toast.error("Não foi possível remover o morador. Tente novamente.");
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
            Essa ação não pode ser desfeita. Isso irá deletar a conta de{" "}
            <span className="font-semibold">{name}</span> permanentemente e
            removerá seus dados de nosso servidor.
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
