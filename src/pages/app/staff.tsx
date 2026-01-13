import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "@dr.pogodin/react-helmet";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { StaffDetailsCard } from "@/components/staff/details-card";
import { AddStaffModal } from "@/components/staff/add-modal";
import { StaffInviteLinkModal } from "@/components/staff/invite-link-modal";
import { StaffPagination } from "@/components/staff/pagination";
import { ResidentsPageSkeleton } from "@/pages/app/residents-skeleton";
import { getStaff } from "@/api/get-staff";

export function Staff() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["staff"],
    queryFn: () => getStaff(),
  });

  const filteredStaff = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    const staff = data?.data ?? [];

    if (!normalized) {
      return staff;
    }

    return staff.filter((member) => {
      const haystack = [member.name, member.email ?? "", member.phone ?? ""]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalized);
    });
  }, [data, searchTerm]);

  const totalItems = filteredStaff.length;
  const totalPages = totalItems === 0 ? 1 : Math.ceil(totalItems / perPage);

  useEffect(() => {
    setPage(1);
  }, [perPage, searchTerm]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const visibleStaff = useMemo(() => {
    if (filteredStaff.length === 0) {
      return [];
    }

    const start = (page - 1) * perPage;
    return filteredStaff.slice(start, start + perPage);
  }, [filteredStaff, page, perPage]);

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchTerm(e.target.value);
  }

  function handlePerPageChange(value: number) {
    setPerPage(value);
  }

  return (
    <>
      <Helmet>
        <title>Equipe</title>
      </Helmet>

      <main className="flex min-h-svh flex-col gap-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl text-foreground font-bold tracking-tight">
              Equipe
            </h1>
            <p className="text-muted-foreground sr-only md:not-sr-only">
              Gerencie os funcionários do condomínio
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StaffInviteLinkModal />
            <AddStaffModal />
          </div>
        </header>

        <InputGroup>
          <InputGroupInput
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Buscar funcionário"
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>

        {isLoading ? (
          <ResidentsPageSkeleton />
        ) : isError ? (
          <p className="text-sm text-destructive">
            Não foi possível carregar a equipe. Tente novamente.
          </p>
        ) : filteredStaff.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum funcionário encontrado.
          </p>
        ) : (
          <section className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleStaff.map((member) => (
                  <StaffDetailsCard
                    key={member.id}
                    id={member.id}
                    name={member.name}
                    email={member.email}
                    phone={member.phone}
                    shift={member.shift}
                    imageUrl={member.imageUrl}
                  />
              ))}
            </div>

            <StaffPagination
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
