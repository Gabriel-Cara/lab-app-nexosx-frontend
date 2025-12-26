
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Status } from "./status";

import type { VisitorsResponse } from "@/api/get-visitors";
import { ImageManager } from "@/components/images/image-manager";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";

type ViewVisitorModalProps = {
  log: VisitorsResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ViewVisitorModal({
  log,
  open,
  onOpenChange,
}: ViewVisitorModalProps) {
  const { visitor, host, handledBy, entryTime, exitTime, status } = log;
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const canManageImage =
    session?.user.role !== "resident" || log.hostId === session?.user.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-background">
        <DialogHeader>
          <DialogTitle>Dados do visitante</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-scroll max-h-[80vh] space-y-4">
          <div className="p-4 border rounded-md">
            <Table>
              <TableHeader>
                <TableHead className="uppercase font-semibold">
                  Visitante
                </TableHead>
                <TableHead className="flex justify-end">
                  <Status variant={status} />
                </TableHead>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell className="text-end">
                    <Badge variant="outline">{visitor.name}</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Documento</TableCell>
                  <TableCell className="text-end">
                    <Badge variant="outline">{visitor.document}</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Telefone</TableCell>
                  <TableCell className="text-end">
                    <Badge variant="outline">
                      {visitor.phone === "" ? "Sem telefone" : visitor.phone}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Motivo da visita</TableCell>
                  <TableCell className="text-end">
                    <Badge variant="outline">
                      {visitor.visitReason === ""
                        ? "Sem motivo registrado"
                        : visitor.visitReason}
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="p-4 border rounded-md">
            <Table>
              <TableHeader>
                <TableHead className="uppercase font-semibold">
                  Registros
                </TableHead>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Entrada</TableCell>
                  <TableCell className="text-end">
                    <Badge variant="outline">{entryTime === null || entryTime === "" ? "Não entrou" : format(entryTime, "dd/MM/yyyy HH:mm", { locale: ptBR }) }</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Saída</TableCell>
                  <TableCell className="text-end">
                    <Badge variant="outline">{exitTime === null || exitTime === "" ? "Não saiu" : format(exitTime, "dd/MM/yyyy HH:mm", { locale: ptBR }) }</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Responsável</TableCell>
                  <TableCell className="text-end">
                    <Badge variant="outline">
                      {handledBy?.name === ""
                        ? "Não informado"
                        : handledBy?.name}
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="p-4 border rounded-md">
            <Table>
              <TableHeader>
                <TableHead className="uppercase font-semibold">Anfitrião</TableHead>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>ID do morador</TableCell>
                  <TableCell className="text-end"><Badge variant="outline">{log.hostId}</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell className="text-end"><Badge variant="outline">{host.name}</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Apartamento</TableCell>
                  <TableCell className="text-end"><Badge variant="outline">{host.apartment}</Badge></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="p-4 border rounded-md">
            <ImageManager
              entityType="visit"
              entityId={log.id}
              imageUrl={log.imageUrl}
              label="Imagem da visita"
              disabled={!canManageImage}
              onUpdated={() =>
                queryClient.invalidateQueries({ queryKey: ["visitors"] })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button>Fechar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
