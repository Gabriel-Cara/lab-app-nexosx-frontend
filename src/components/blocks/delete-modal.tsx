// React
import { useState } from "react";

// Icons
import { CircleAlert, Loader2, Trash2 } from "lucide-react";

// Components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";

// Libs
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";

// API
import { deleteBlock } from "@/api/delete-block";

// Toast
import { toast } from "sonner";

interface DeleteModalProps {
  blockId: string;
  name: string;
  condominiumId?: string;
}

export function DeleteModal({ blockId: id, name, condominiumId }: DeleteModalProps) {
  const [open, setOpen] = useState(false);

  const { mutateAsync: removeBlock, isPending} = useMutation({
    mutationFn: (id: string) => deleteBlock(id, condominiumId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["blocks"] });
      toast.success(`Bloco ${name} removido com sucesso.`);
      setOpen(false);
    },
    onError: () => {
      toast.error("Não foi possível remover o bloco. Tente novamente.");
      setOpen(false);
    },
  })

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();

    removeBlock(id);
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 />
          Deletar
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
          <p className="text-center font-light tracking-tight mt-4">
            Essa ação não pode ser desfeita. Uma vez feito{" "}
            <span className="font-semibold">{name}</span> será removido
            permanentemente do sistema.
          </p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>

          <Button
            asChild
            variant="destructive"
            disabled={isPending}
            onClick={(e) => handleDelete(e)}
          >
            <AlertDialogAction>
              {isPending ? (
                <span>
                  <Loader2 className="mr-2 animate-spin" /> Excluindo...
                </span>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
