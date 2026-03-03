import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

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
  const {
    data: visitorsData = [],
    isLoading,
    isError,
  } = useQuery<VisitorsResponse[]>({
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

  const emptyMessage =
    normalizedSearch || statusFilter !== "all"
      ? "Nenhum visitante encontrado com os filtros aplicados."
      : "Nenhum visitante cadastrado ainda.";

  return (
    <div className="space-y-4">
      {isLoading ? (
        <TableVisitorsSkeleton />
      ) : isError ? (
        <p className="text-sm text-destructive">
          Não foi possível carregar os visitantes. Tente novamente.
        </p>
      ) : totalItems === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {visibleVisitors.map((log) => (
            <TableRowVisitor key={log.id} log={log} />
          ))}
        </section>
      )}

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
