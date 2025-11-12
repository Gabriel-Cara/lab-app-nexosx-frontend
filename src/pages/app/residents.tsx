import { Search } from "lucide-react";
import { useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { DetailsCard } from "@/components/residents/details-card";
import { AddModal } from "@/components/residents/add-modal";
import { Helmet } from "@dr.pogodin/react-helmet";

interface Morador {
  id: string;
  name: string;
  apartment: string;
  email: string;
  phone: string;
  role: "admin" | "staff" | "resident";
  password?: string;
  building?: string;
  vehicle?: number;
  emergencyContact?: string;
}

const initialMoradores: Morador[] = [
  {
    id: "1",
    name: "Maria Santos",
    apartment: "Apto 101",
    email: "maria@email.com",
    phone: "(11) 96666-6666",
    role: "resident",
    building: "A",
    vehicle: 1,
    emergencyContact: "(11) 95555-5555",
    password: "123456",
  },
  {
    id: "2",
    name: "João Silva",
    apartment: "Apto 102",
    email: "joao@email.com",
    phone: "(11) 95555-5555",
    role: "resident",
    building: "B",
    vehicle: 1,
    emergencyContact: "(11) 94444-4444",
    password: "123456",
  },
  {
    id: "3",
    name: "Ana Paula",
    apartment: "Apto 201",
    email: "ana@email.com",
    phone: "(11) 94444-4444",
    role: "resident",
    building: "B",
    vehicle: 1,
    password: "123456",
  },
  {
    id: "4",
    name: "Carlos Mendes",
    apartment: "Apto 203",
    email: "carlos@email.com",
    phone: "(11) 93333-3333",
    role: "resident",
    building: "A",
    vehicle: 1,
    emergencyContact: "(11) 92222-2222",
    password: "123456",
  },
  {
    id: "5",
    name: "Pedro Costa",
    apartment: "Apto 301",
    email: "pedro@email.com",
    phone: "(11) 92222-2222",
    role: "resident",
    building: "C",
    vehicle: 1,
    password: "123456",
  },
];

export function Residents() {
  const [moradores, _setMoradores] = useState<Morador[]>(initialMoradores);
  const [searchTerm, _setSearchTerm] = useState("");

  const filteredMoradores = moradores.filter(
    (morador) =>
      morador.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      morador.apartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      morador.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    _setSearchTerm(e.target.value);
  }

  return (
    <>
      <Helmet>
        <title>Moradores</title>
      </Helmet>

      <div className="flex min-h-svh flex-col gap-8">
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
            onChange={handleSearch}
            placeholder="Buscar morador"
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMoradores.map((morador) => (
            <DetailsCard key={morador.id} {...morador} />
          ))}
        </div>
      </div>
    </>
  );
}
