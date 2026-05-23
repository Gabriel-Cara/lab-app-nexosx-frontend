// React
import { useEffect, useMemo, useState } from "react";

// Icons
import { Filter, Search } from "lucide-react";

// Components
import { BlocksTable } from "@/components/blocks/blocks-table";
import { PageHeader } from "@/components/layout/page-header";
import { AddModal } from "@/components/blocks/add-modal";
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
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Libs
import { Helmet } from "@dr.pogodin/react-helmet";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

// API
import { getCondominiums } from "@/api/get-condominiums";


export function Blocks() {
  const { session } = useAuth();
  const isAdmin = session?.user.role === "admin";
  const [selectedCondominiumId, setSelectedCondominiumId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: condominiums = [] } = useQuery({
    queryKey: ["condominiums"],
    queryFn: getCondominiums,
    enabled: isAdmin,
  });

  useEffect(() => {
    if (isAdmin && !selectedCondominiumId && condominiums.length > 0) {
      setSelectedCondominiumId(condominiums[0].id);
    }
  }, [condominiums, isAdmin, selectedCondominiumId]);

  const condominiumId = isAdmin ? selectedCondominiumId : undefined;

  const filters = useMemo(
    () => ({
      searchTerm,
      condominiumId,
    }),
    [searchTerm, condominiumId],
  );

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchTerm(e.target.value);
  }

  return (
    <>
      <Helmet>
        <title>Blocos</title>
      </Helmet>

      <main className="flex min-h-svh flex-col gap-8">
        {/* Header */}
        <PageHeader
          title="Blocos"
          description="Organize os blocos ou torres de cada condomínio."
          actions={<AddModal />}
        />

        {/* Filtros */}
        <section className="grid gap-4 md:grid-cols-[4fr_1fr]">
          <InputGroup>
            <InputGroupInput
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Buscar por nome, documento ou morador"
              className="placeholder:text-sm"
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>

          {isAdmin && (
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-muted-foreground" />
              <Select
                value={selectedCondominiumId || ""}
                onValueChange={setSelectedCondominiumId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o condomínio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {condominiums.map((condominium) => (
                      <SelectItem
                        key={condominium.id}
                        value={condominium.id}
                        onSelect={() =>
                          setSelectedCondominiumId(condominium.id)
                        }
                      >
                        {condominium.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}
        </section>

        <BlocksTable filters={filters} />
      </main>
    </>
  );
}
