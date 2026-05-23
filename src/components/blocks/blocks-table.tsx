// Icons
import { Building } from "lucide-react";

// Components
import { BlocksTableSkeleton } from "./blocks-table-skeleton";
import { DeleteModal } from "./delete-modal";
import { EditModal } from "./edit-modal";
import { EmptyState } from "../ui/empty";
import {
  Table,
  TableBody,
  TableHeader,
  TableHead,
  TableCell,
  TableRow,
} from "../ui/table";

// Libs
import { useQuery } from "@tanstack/react-query";

// API
import { getBlocks } from "@/api/get-blocks";


interface BlocksTableProps {
  filters?: {
    searchTerm?: string;
    condominiumId?: string;
  };
}

export function BlocksTable({ filters }: BlocksTableProps) {
  const {
    data: blocks = [],
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["blocks", filters],
    queryFn: () => getBlocks(filters?.condominiumId),
  });

  if (isLoading) {
    return <BlocksTableSkeleton />;
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar os blocos.{" "}
        {error instanceof Error ? error.message : null}
      </div>
    );
  }

  if (!blocks || blocks.length === 0) {
    return (
      <EmptyState
        icon={Building}
        title="Nenhum bloco encontrado"
        description="Os blocos aparecerão aqui assim que forem criados."
        size="sm"
      />
    );
  }

  const filteredBlocks = blocks.filter((block) => {
    if (filters?.searchTerm) {
      return block.name.toLowerCase().includes(filters.searchTerm.toLowerCase());
    }
    return true;
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Bloco</TableHead>
          <TableHead>Residências</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredBlocks.map((block) => (
            <TableRow key={block.id}>
              <TableCell>{block.name}</TableCell>
              <TableCell>{block._count?.residences}</TableCell>
              <TableCell className="text-right"><EditModal block={block} /> <DeleteModal blockId={block.id} name={block.name} condominiumId={block.condominiumId} /></TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
