import { Users } from "lucide-react";

import { SectionHeader } from "./section-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Resident } from "@/api/get-residents";
import {
  ResidentsRecentSkeleton,
} from "@/components/dashboard/residents-section-skeleton";
import { EmptyState } from "@/components/ui/empty";

type ResidentsSectionProps = {
  accessLabel: string;
  isLoading: boolean;
  isError: boolean;
  residents: Resident[];
};

export function ResidentsSection({
  accessLabel,
  isLoading,
  isError,
  residents,
}: ResidentsSectionProps) {
  return (
    <section className="space-y-4">
      <SectionHeader
        title="Moradores"
        description="Acompanhe os moradores cadastrados mais recentemente."
        icon={Users}
        accessLabel={accessLabel}
      />
      <Card>
        <CardHeader>
          <CardTitle>Últimos cadastrados</CardTitle>
          <CardDescription>Destaque para novos moradores no sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ResidentsRecentSkeleton />
          ) : isError ? (
            <p className="text-sm text-destructive">
              Não foi possível carregar os moradores.
            </p>
          ) : residents.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Sem cadastros recentes"
              description="Os novos moradores aparecerão aqui assim que forem registrados."
              size="sm"
              className="min-h-44"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Apart.</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {residents.slice(0, 5).map((resident) => (
                  <TableRow key={resident.id}>
                    <TableCell className="font-medium">{resident.name}</TableCell>
                    <TableCell>{resident.apartment ?? "—"}</TableCell>
                    <TableCell className="truncate">{resident.email ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
