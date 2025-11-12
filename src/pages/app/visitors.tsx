import { useMemo, useState } from "react";
import { Helmet } from "@dr.pogodin/react-helmet";

import { Filter, Search } from "lucide-react";

import { TableVisitors } from "@/components/visitors/table-visitors";
import { AddModal } from "@/components/visitors/add-modal";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusOptions = [
  { label: "Todos", value: "all" },
  { label: "Pendente", value: "pending" },
  { label: "Autorizado", value: "authorized" },
  { label: "Negado", value: "denied" },
  { label: "Entrou", value: "entry" },
  { label: "Saiu", value: "left" },
] as const;

export function Visitors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<(typeof statusOptions)[number]["value"]>("all");

  const filters = useMemo(
    () => ({
      searchTerm,
      status: statusFilter,
    }),
    [searchTerm, statusFilter]
  );

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchTerm(e.target.value);
  }

  return (
    <>
      <Helmet>
        <title>Visitantes</title>
      </Helmet>

      <div className="flex min-h-svh flex-col gap-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl text-foreground font-bold tracking-tight">
              Visitantes
            </h1>
            <p className="text-muted-foreground sr-only md:not-sr-only">
              Gerencie os visitantes do condomínio
            </p>
          </div>
          <AddModal />
        </div>

        <div className="grid gap-4 md:grid-cols-[4fr_1fr]">
          <InputGroup>
            <InputGroupInput
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Buscar por nome, documento ou morador"
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>

          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(
                  value as (typeof statusOptions)[number]["value"]
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TableVisitors filters={filters} />
      </div>
    </>
  );
}
