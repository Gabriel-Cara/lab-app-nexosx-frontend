import { Helmet } from "@dr.pogodin/react-helmet";
import { useQuery } from "@tanstack/react-query";

import { getAdminUsers } from "@/api/get-admin-users";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UserRole } from "@/types/auth";

const roleLabel: Record<UserRole, string> = {
  admin: "Administrador",
  manager: "Gestor",
  doorman: "Portaria",
  resident: "Morador",
};

const roleVariant: Record<UserRole, "default" | "secondary" | "outline"> = {
  admin: "default",
  manager: "secondary",
  doorman: "secondary",
  resident: "outline",
};

export function AdminUsers() {
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["admin-users"],
    queryFn: getAdminUsers,
  });

  return (
    <>
      <Helmet>
        <title>Usuários</title>
      </Helmet>

      <main className="flex min-h-svh flex-col gap-8">
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
            <p className="text-muted-foreground">
              Visualize quem tem acesso aos condomínios da plataforma.
            </p>
          </div>
        </header>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Condomínio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Carregando usuários...
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-destructive">
                  Não foi possível carregar os usuários.
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Nenhum usuário cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              data.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-foreground">
                    {user.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleVariant[user.role]}>
                      {roleLabel[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.condominium
                      ? `${user.condominium.name} (${user.condominium.code})`
                      : "-"}
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
