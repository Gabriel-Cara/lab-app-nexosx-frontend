import { Helmet } from "@dr.pogodin/react-helmet";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  getCondominiumRequests,
  type CondominiumRequest,
  type CondominiumRequestStatus,
} from "@/api/get-condominium-requests";
import { useApproveCondominiumRequest } from "@/api/patch-condominium-request-approve";
import { useRejectCondominiumRequest } from "@/api/patch-condominium-request-reject";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type StatusFilter = CondominiumRequestStatus | "all";

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: "pending", label: "Pendentes" },
  { value: "approved", label: "Aprovadas" },
  { value: "rejected", label: "Rejeitadas" },
  { value: "all", label: "Todas" },
];

const statusLabel: Record<CondominiumRequestStatus, string> = {
  pending: "Pendente",
  approved: "Aprovada",
  rejected: "Rejeitada",
};

const statusVariant: Record<
  CondominiumRequestStatus,
  "warning" | "success" | "destructive"
> = {
  pending: "warning",
  approved: "success",
  rejected: "destructive",
};

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("pt-BR");
}

export function CondominiumRequests() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [rejectingRequest, setRejectingRequest] =
    useState<CondominiumRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const queryClient = useQueryClient();

  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["condominium-requests", statusFilter],
    queryFn: () =>
      getCondominiumRequests(statusFilter === "all" ? undefined : statusFilter),
  });

  const { mutateAsync: approveRequest, isPending: isApproving } =
    useApproveCondominiumRequest();
  const { mutateAsync: rejectRequest, isPending: isRejecting } =
    useRejectCondominiumRequest();

  async function handleApprove(requestId: string) {
    try {
      await approveRequest(requestId);
      toast.success("Solicitação aprovada.");
      queryClient.invalidateQueries({
        queryKey: ["condominium-requests"],
      });
    } catch {
      toast.error("Não foi possível aprovar a solicitação.");
    }
  }

  async function handleReject() {
    if (!rejectingRequest) {
      return;
    }

    try {
      await rejectRequest({
        id: rejectingRequest.id,
        reason: rejectionReason.trim() || undefined,
      });
      toast.success("Solicitação rejeitada.");
      setRejectingRequest(null);
      setRejectionReason("");
      queryClient.invalidateQueries({
        queryKey: ["condominium-requests"],
      });
    } catch {
      toast.error("Não foi possível rejeitar a solicitação.");
    }
  }

  const isBusy = isApproving || isRejecting;

  return (
    <>
      <Helmet>
        <title>Solicitações de condomínio</title>
      </Helmet>

      <main className="flex min-h-svh flex-col gap-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Solicitações de condomínio
            </h1>
            <p className="text-muted-foreground">
              Avalie os pedidos pendentes e aprove novos cadastros.
            </p>
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger className="min-w-[180px]">
              <SelectValue placeholder="Filtrar status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </header>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Condomínio</TableHead>
              <TableHead>Administrador</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Solicitado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Carregando solicitações...
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-destructive">
                  Não foi possível carregar as solicitações.
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Nenhuma solicitação encontrada.
                </TableCell>
              </TableRow>
            ) : (
              data.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {request.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Código: {request.code}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {request.adminName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {request.adminEmail}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {request.adminPhone || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[request.status]}>
                      {statusLabel[request.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(request.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    {request.status === "pending" ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request.id)}
                          disabled={isBusy}
                        >
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setRejectingRequest(request);
                            setRejectionReason("");
                          }}
                          disabled={isBusy}
                        >
                          Rejeitar
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </main>

      <Dialog
        open={!!rejectingRequest}
        onOpenChange={(open) => {
          if (!open) {
            setRejectingRequest(null);
            setRejectionReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar solicitação</DialogTitle>
            <DialogDescription>
              Informe um motivo para comunicar ao solicitante (opcional).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="rejectionReason">Motivo</Label>
            <Textarea
              id="rejectionReason"
              placeholder="Descreva o motivo da rejeição"
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejectingRequest(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleReject}
              disabled={isRejecting}
            >
              Confirmar rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
