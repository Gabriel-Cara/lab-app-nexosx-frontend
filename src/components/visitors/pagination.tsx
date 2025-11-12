import { type ChangeEvent } from "react";

import { Button } from "../ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

type VisitorsPaginationProps = {
  page: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (value: number) => void;
  perPageOptions?: number[];
};

export function VisitorsPagination({
  page,
  perPage,
  totalPages,
  totalItems,
  onPageChange,
  onPerPageChange,
  perPageOptions = [5, 10, 20, 50],
}: VisitorsPaginationProps) {
  if (totalItems === 0) {
    return null;
  }

  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onPerPageChange(Number(event.target.value));
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Itens por página</span>
        <select
          className="rounded-md border border-input bg-background px-2 py-1 text-sm"
          value={perPage}
          onChange={handleSelectChange}
        >
          {perPageOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="text-sm text-muted-foreground">
        Página {page} de {totalPages} — {totalItems} visitantes
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(1)}
          disabled={!canGoPrev}
        >
          <ChevronsLeft />
          <span className="sr-only">Ir para a primeira página</span>
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={!canGoPrev}
        >
          <ChevronLeft />
          <span className="sr-only">Ir para a página anterior</span>
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={!canGoNext}
        >
          <ChevronRight />
          <span className="sr-only">Ir para a próxima página</span>
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(totalPages)}
          disabled={!canGoNext}
        >
          <ChevronsRight />
          <span className="sr-only">Ir para a última página</span>
        </Button>
      </div>
    </div>
  );
}
