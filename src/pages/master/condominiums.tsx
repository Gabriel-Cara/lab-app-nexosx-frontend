import { Helmet } from "@dr.pogodin/react-helmet";
import { useQuery } from "@tanstack/react-query";

import { getCondominiums } from "@/api/get-condominiums";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("pt-BR");
}

export function MasterCondominiums() {
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["condominiums"],
    queryFn: getCondominiums,
  });

  return (
    <>
      <Helmet>
        <title>Condomínios</title>
      </Helmet>

      <main className="flex min-h-svh flex-col gap-8">
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Condomínios</h1>
            <p className="text-muted-foreground">
              Visualize os condomínios cadastrados na plataforma.
            </p>
          </div>
        </header>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Criado em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Carregando condomínios...
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-destructive">
                  Não foi possível carregar os condomínios.
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Nenhum condomínio cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              data.map((condominium) => (
                <TableRow key={condominium.id}>
                  <TableCell className="font-medium text-foreground">
                    {condominium.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {condominium.code}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(condominium.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </main>
    </>
  );
}
