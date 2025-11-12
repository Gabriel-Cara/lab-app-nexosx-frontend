import { useState, type MouseEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "../ui/button";
import { TableCell, TableRow } from "../ui/table";
import { Status } from "./status";
import { ViewVisitorModal } from "./view-modal";

import type { VisitorsResponse } from "@/api/get-visitors";
import { patchStatusOfVisitor } from "@/api/patch-status-of-visitor";

interface TableRowVisitorProps {
  log: VisitorsResponse;
}

export function TableRowVisitor({ log }: TableRowVisitorProps) {
  const [isViewOpen, setIsViewOpen] = useState(false);

  const queryClient = useQueryClient();
  const { mutateAsync: updateStatus, isPending } = useMutation({
    mutationFn: patchStatusOfVisitor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
    },
  });

  const { visitor, host } = log;
  const visitorId = visitor.id;
  const status = visitor.status;

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
      <TableRow
        onClick={handleRowClick}
        className="cursor-pointer transition hover:bg-muted/60"
      >
        <TableCell>{visitor.name}</TableCell>
        <TableCell>{visitor.document}</TableCell>
        <TableCell>{host.name}</TableCell>
        <TableCell>
          <Status variant={status} />
        </TableCell>
        <TableCell className="flex gap-3 justify-center">
          {status === "pending" ? (
            <>
              <Button
                disabled={isPending}
                onClick={(event) => handleActionClick(event, "approve")}
              >
                Autorizar
              </Button>
              <Button
                variant="destructive"
                disabled={isPending}
                onClick={(event) => handleActionClick(event, "reject")}
              >
                Negar
              </Button>
            </>
          ) : status === "authorized" ? (
            <Button
              variant="outline"
              disabled={isPending}
              onClick={(event) => handleActionClick(event, "entry")}
            >
              Marcar entrada
            </Button>
          ) : status === "entry" ? (
            <Button
              variant="outline"
              disabled={isPending}
              onClick={(event) => handleActionClick(event, "exit")}
            >
              Marcar saída
            </Button>
          ) : null}
        </TableCell>
      </TableRow>

      <ViewVisitorModal
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        log={log}
      />
    </>
  );
}
