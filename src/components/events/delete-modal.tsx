import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircleAlert } from "lucide-react";
import { toast } from "sonner";

import { deleteEvent } from "@/api/delete-event";
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

type DeleteModalProps = {
  eventId: string;
  title: string;
};

export function DeleteModal({ eventId, title }: DeleteModalProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutateAsync: removeEvent, isPending } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  async function handleDelete() {
    try {
      await removeEvent(eventId);
      toast.success("Evento removido com sucesso.");
      setOpen(false);
    } catch {
      toast.error("Não foi possível remover o evento. Tente novamente.");
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Deletar</Button>
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
            Essa ação não pode ser desfeita. O evento{" "}
            <span className="font-semibold">{title}</span> será removido
            permanentemente do sistema.
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
