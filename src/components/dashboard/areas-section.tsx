import { Volleyball } from "lucide-react";

import { SectionHeader } from "./section-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Area } from "@/api/get-areas";
import {
  AreasQuickMapSkeleton,
} from "@/components/dashboard/areas-section-skeleton";
import { EmptyState } from "@/components/ui/empty";

type AreasSectionProps = {
  accessLabel: string;
  isLoading: boolean;
  isError: boolean;
  areas: Area[];
  availableAreas: Area[];
};

export function AreasSection({
  accessLabel,
  isLoading,
  isError,
  areas,
  availableAreas,
}: AreasSectionProps) {
  return (
    <section className="space-y-4">
      <SectionHeader
        title="Áreas de lazer"
        description="Status atual dos espaços compartilhados."
        icon={Volleyball}
        accessLabel={accessLabel}
      />
      <Card>
        <CardHeader>
          <CardTitle>Mapa rápido</CardTitle>
          <CardDescription>
            Espaços cadastrados para ações rápidas.
            {!isLoading && !isError ? (
              <span>
                {" "}
                {availableAreas.length} de {areas.length} áreas disponíveis.
              </span>
            ) : null}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <AreasQuickMapSkeleton />
          ) : isError ? (
            <p className="text-sm text-destructive">Não foi possível carregar as áreas.</p>
          ) : areas.length === 0 ? (
            <EmptyState
              icon={Volleyball}
              title="Nenhuma área cadastrada"
              description="Cadastre áreas para visualizá-las rapidamente neste painel."
              size="sm"
              className="min-h-44"
            />
          ) : (
            areas.slice(0, 6).map((area) => (
              <div
                key={area.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <div>
                  <p className="font-medium">{area.name}</p>
                  <p className="text-muted-foreground text-xs">
                    Capacidade: {area.capacity ?? "—"} pessoas
                  </p>
                </div>
                <Badge variant={area.available ? "success" : "destructive"}>
                  {area.available ? "Disponível" : "Indisponível"}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </section>
  );
}
