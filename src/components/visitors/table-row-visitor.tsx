import { useState, type MouseEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarClock, FileBadge2, Home } from "lucide-react";

import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Status } from "./status";
import { ViewVisitorModal } from "./view-modal";

import type { VisitorsResponse } from "@/api/get-visitors";
import { patchVisitorStatus } from "@/api/patch-visitor-status";
import { useAuth } from "@/hooks/use-auth";

interface TableRowVisitorProps {
  log: VisitorsResponse;
}

function formatCreatedAt(value: string) {
  const parsedDate = parseISO(value);

  if (!isValid(parsedDate)) {
    return "Data de registro inválida";
  }

  return format(parsedDate, "dd/MM/yyyy HH:mm", { locale: ptBR });
}

export function TableRowVisitor({ log }: TableRowVisitorProps) {
  const [isViewOpen, setIsViewOpen] = useState(false);

  const { session } = useAuth();
  const isResident = session?.user.role === "resident";

  const queryClient = useQueryClient();
  const { mutateAsync: updateStatus, isPending } = useMutation({
    mutationFn: patchVisitorStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
    },
  });

  const { visitor, host, status } = log;
  const visitorId = visitor.id;
  const canManagePending = status === "pending";
  const canMarkEntry = status === "authorized" && !isResident;
  const canMarkExit = status === "entry" && !isResident;
  const showActions = canManagePending || canMarkEntry || canMarkExit;

  const handleRowClick = () => {
    setIsViewOpen(true);
  };

  const handleActionClick = (
    event: MouseEvent<HTMLButtonElement>,
    method: "approve" | "reject" | "entry" | "exit",
  ) => {
    event.stopPropagation();
    updateStatus({ id: visitorId, method });
  };

  return (
    <>
      <Card
        onClick={handleRowClick}
        className="h-full cursor-pointer transition hover:border-primary/40 hover:bg-muted/30"
      >
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-foreground">{visitor.name}</h3>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <FileBadge2 className="h-4 w-4" />
                {visitor.document}
              </p>
            </div>
            <Status variant={status} />
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              {host.name}
              {host.apartment && ` · Apt ${host.apartment}`}
            </p>
            <p className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4" />
              Registro em {formatCreatedAt(log.createdAt)}
            </p>
          </div>

          {showActions && (
            <div
              className="flex flex-wrap items-center gap-2 pt-1"
              onClick={(event) => event.stopPropagation()}
            >
              {canManagePending ? (
                <>
                  <Button
                    size="sm"
                    disabled={isPending}
                    onClick={(event) => handleActionClick(event, "approve")}
                  >
                    Autorizar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={isPending}
                    onClick={(event) => handleActionClick(event, "reject")}
                  >
                    Negar
                  </Button>
                </>
              ) : null}

              {canMarkEntry ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={(event) => handleActionClick(event, "entry")}
                >
                  Marcar entrada
                </Button>
              ) : null}

              {canMarkExit ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={(event) => handleActionClick(event, "exit")}
                >
                  Marcar saída
                </Button>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      <ViewVisitorModal
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        log={log}
      />
    </>
  );
}
