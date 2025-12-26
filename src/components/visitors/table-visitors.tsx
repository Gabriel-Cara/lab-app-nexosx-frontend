import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import {
  Table,
  TableCell,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

import { TableRowVisitor } from "./table-row-visitor";

import { getVisitors } from "@/api/get-visitors";
import type { VisitorsResponse } from "@/api/get-visitors";
import { VisitorsPagination } from "./pagination";
import { useAuth } from "@/hooks/use-auth";
import { TableVisitorsSkeleton } from "@/components/visitors/table-visitors-skeleton";

type TableVisitorsProps = {
  filters?: {
    searchTerm?: string;
    status?: "all" | "pending" | "authorized" | "denied" | "entry" | "left";
  };
};

export function TableVisitors({ filters }: TableVisitorsProps) {
  const { data: visitorsData = [], isLoading } = useQuery<VisitorsResponse[]>({
    queryKey: ["visitors"],
    queryFn: getVisitors,
  });
  const { session } = useAuth();
  const isResident = session?.user.role === "resident";
  const residentId = session?.user.id;

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const normalizedSearch = (filters?.searchTerm ?? "").trim().toLowerCase();
  const statusFilter = filters?.status ?? "all";

  const filteredVisitors = useMemo(() => {
    const scopedVisitors =
      isResident && residentId
        ? visitorsData.filter((log) => log.hostId === residentId)
        : visitorsData;

    return scopedVisitors.filter((log) => {
      const { visitor, host, status } = log;
      const matchesStatus =
        statusFilter === "all" ? true : status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = [
        visitor.name,
        visitor.document,
        visitor.phone ?? "",
        visitor.visitReason ?? "",
        host.name,
        host.apartment ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [visitorsData, normalizedSearch, statusFilter, isResident, residentId]);

  const totalItems = filteredVisitors.length;
  const totalPages = totalItems === 0 ? 1 : Math.ceil(totalItems / perPage);

  useEffect(() => {
    setPage(1);
  }, [perPage, normalizedSearch, statusFilter]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const visibleVisitors = useMemo(() => {
    if (filteredVisitors.length === 0) return [];

    const start = (page - 1) * perPage;
    return filteredVisitors.slice(start, start + perPage);
  }, [filteredVisitors, page, perPage]);

  const handlePerPageChange = (value: number) => {
    setPerPage(value);
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableCaption>Lista de visitantes</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold">Nome</TableHead>
            <TableHead className="font-bold">Documento</TableHead>
            <TableHead className="font-bold">Morador</TableHead>
            <TableHead className="text-center font-bold">Status</TableHead>
            <TableHead className="text-center font-bold">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableVisitorsSkeleton />
          ) : totalItems === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Nenhum visitante cadastrado ainda.
              </TableCell>
            </TableRow>
          ) : (
            visibleVisitors.map((log) => (
              <TableRowVisitor key={log.id} log={log} />
            ))
          )}
        </TableBody>
      </Table>

      {totalItems > 0 && (
        <VisitorsPagination
          page={page}
          perPage={perPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setPage}
          onPerPageChange={handlePerPageChange}
        />
      )}
    </div>
  );
}
