import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { DetailsCard } from "@/components/residents/details-card";
import { AddModal } from "@/components/residents/add-modal";
import { ResidentInviteLinkModal } from "@/components/residents/invite-link-modal";
import { Helmet } from "@dr.pogodin/react-helmet";
import { getResidents } from "@/api/get-residents";
import { ResidentsPagination } from "@/components/residents/pagination";
import { ResidentsPageSkeleton } from "@/pages/app/residents-skeleton";

export function Residents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["residents"],
    queryFn: () => getResidents(),
  });

  const filteredResidents = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    const residents = data?.data ?? [];

    if (!normalized) {
      return residents;
    }

    return residents.filter((resident) => {
      const haystack = [
        resident.name,
        resident.apartment ?? "",
        resident.email ?? "",
        resident.phone ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalized);
    });
  }, [data, searchTerm]);

  const totalItems = filteredResidents.length;
  const totalPages = totalItems === 0 ? 1 : Math.ceil(totalItems / perPage);

  useEffect(() => {
    setPage(1);
  }, [perPage, searchTerm]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const visibleResidents = useMemo(() => {
    if (filteredResidents.length === 0) {
      return [];
    }

    const start = (page - 1) * perPage;
    return filteredResidents.slice(start, start + perPage);
  }, [filteredResidents, page, perPage]);

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchTerm(e.target.value);
  }

  function handlePerPageChange(value: number) {
    setPerPage(value);
  }

  return (
    <>
      <Helmet>
        <title>Moradores</title>
      </Helmet>

      <main className="flex min-h-svh flex-col gap-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl text-foreground font-bold tracking-tight">
              Moradores
            </h1>
            <p className="text-muted-foreground sr-only md:not-sr-only">
              Gerencie os moradores do condomínio
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ResidentInviteLinkModal />
            <AddModal />
          </div>
        </header>

        <InputGroup>
          <InputGroupInput
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Buscar morador"
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>

        {isLoading ? (
          <ResidentsPageSkeleton />
        ) : isError ? (
          <p className="text-sm text-destructive">
            Não foi possível carregar os moradores. Tente novamente.
          </p>
        ) : filteredResidents.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum morador encontrado.
          </p>
        ) : (
          <section className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleResidents.map((resident) => (
                <DetailsCard
                  key={resident.id}
                  id={resident.id}
                  name={resident.name}
                  apartment={resident.apartment}
                  email={resident.email}
                  phone={resident.phone}
                  role={resident.role}
                  imageUrl={resident.imageUrl}
                  building={resident.building}
                  vehicles={resident.vehicles}
                  emergencyContact={resident.emergencyContact}
                />
              ))}
            </div>

            <ResidentsPagination
              page={page}
              perPage={perPage}
              totalPages={totalPages}
              totalItems={totalItems}
              onPageChange={setPage}
              onPerPageChange={handlePerPageChange}
              perPageOptions={[5, 10, 20, 50]}
            />
          </section>
        )}
      </main>
    </>
  );
}
