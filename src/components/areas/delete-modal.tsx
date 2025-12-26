import { CircleAlert } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteArea } from "@/api/delete-area";

interface DeleteModalProps {
  areaId: string;
  name: string;
}

export function DeleteModal({ areaId, name }: DeleteModalProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutateAsync: removeArea, isPending } = useMutation({
    mutationFn: deleteArea,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["areas"] });
    },
  });

  async function handleDelete() {
    try {
      await removeArea(areaId);
      
      toast.success(`Área ${name} removida com sucesso.`);
      setOpen(false);
    } catch {
      toast.error("Não foi possível remover a área. Tente novamente.");
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" >
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
            <span className="font-semibold">{name}</span>{" "}será removido permanentemente do sistema.
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
  )
}
