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
import { CircleAlert, Trash2 } from "lucide-react";

export function DeleteModal() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost">
          <Trash2 className="text-rose-500" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <CircleAlert size={52} strokeWidth={2} className="text-rose-500 mx-auto animate-pulse duration-200"/>
          </AlertDialogTitle>
        </AlertDialogHeader>
        <div>
          <h1 className="font-bold text-xl text-center">Você tem certeza?</h1>
          <p className="font-light tracking-tight text-center">
            Essa ação não pode ser desfeita. Isso irá deletar essa conta
            permanentemente e removerá seus dados de nosso servidor.
          </p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>

          <Button asChild variant="destructive">
            <AlertDialogAction>Continuar</AlertDialogAction>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
