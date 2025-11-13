import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { DetailsCard } from "@/components/residents/details-card";
import { AddModal } from "@/components/residents/add-modal";
import { Helmet } from "@dr.pogodin/react-helmet";
import { getResidents } from "@/api/get-residents";

export function Residents() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["residents"],
    queryFn: () => getResidents(),
  });

  const residents = data?.data ?? [];

  const filteredResidents = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();

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
  }, [residents, searchTerm]);

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchTerm(e.target.value);
  }

  return (
    <>
      <Helmet>
        <title>Moradores</title>
      </Helmet>

      <main className="flex min-h-svh flex-col gap-8">
        <div className="flex justify-between">
          <div>
            <h1 className="text-2xl text-foreground font-bold tracking-tight">
              Moradores
            </h1>
            <p className="text-muted-foreground sr-only md:not-sr-only">
              Gerencie os moradores do condomínio
            </p>
          </div>
          <AddModal />
        </div>

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
          <p className="text-sm text-muted-foreground">Carregando moradores...</p>
        ) : isError ? (
          <p className="text-sm text-destructive">
            Não foi possível carregar os moradores. Tente novamente.
          </p>
        ) : filteredResidents.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum morador encontrado.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResidents.map((resident) => (
              <DetailsCard
                key={resident.id}
                id={resident.id}
                name={resident.name}
                apartment={resident.apartment}
                email={resident.email}
                phone={resident.phone}
                role={resident.role}
                building={resident.building}
                vehicle={resident.vehicle}
                emergencyContact={resident.emergencyContact}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
