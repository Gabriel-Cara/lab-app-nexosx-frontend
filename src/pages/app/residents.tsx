import { Search, Users } from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";
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
import { EmptyState } from "@/components/ui/empty";
import { PageHeader } from "@/components/layout/page-header";

export function Residents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const normalizedSearchTerm = deferredSearchTerm.trim();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["residents", page, perPage, normalizedSearchTerm],
    queryFn: () =>
      getResidents({
        page,
        limit: perPage,
        search: normalizedSearchTerm || undefined,
      }),
    placeholderData: (previousData) => previousData,
  });
  const residents = data?.data ?? [];
  const totalItems = data?.pagination.total ?? 0;
  const totalPages = data?.pagination.totalPages ?? 1;

  useEffect(() => {
    setPage(1);
  }, [perPage, searchTerm]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

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

      <main className="flex min-h-0 flex-1 flex-col gap-8">
        <PageHeader
          title="Moradores"
          description="Gerencie os moradores do condomínio"
          actions={
            <>
            <ResidentInviteLinkModal />
            <AddModal />
            </>
          }
        />

        <InputGroup>
          <InputGroupInput
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Buscar morador, apartamento, placa ou vaga"
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
        ) : residents.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum morador encontrado"
            description={
              searchTerm.trim()
                ? "Tente ajustar os filtros ou buscar por outro termo."
                : "Quando houver moradores cadastrados, eles aparecerão aqui."
            }
            size="sm"
          />
        ) : (
          <section className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {residents.map((resident) => (
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
