import { Volleyball } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import { SectionHeader } from "./section-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import type { Area } from "@/api/get-areas";
import {
  AreasAvailabilitySkeleton,
  AreasQuickMapSkeleton,
} from "@/components/dashboard/areas-section-skeleton";
import { EmptyState } from "@/components/ui/empty";

type AreasChartPoint = {
  key: "available" | "blocked";
  label: string;
  value: number;
};

type AreasSectionProps = {
  accessLabel: string;
  isLoading: boolean;
  isError: boolean;
  areas: Area[];
  availableAreas: Area[];
  chartData: AreasChartPoint[];
};

const areasChartConfig = {
  available: { label: "Disponíveis", color: "hsl(142 71% 45%)" },
  blocked: { label: "Indisponíveis", color: "hsl(12 89% 65%)" },
};

export function AreasSection({
  accessLabel,
  isLoading,
  isError,
  areas,
  availableAreas,
  chartData,
}: AreasSectionProps) {
  return (
    <section className="space-y-4">
      <SectionHeader
        title="Áreas de lazer"
        description="Disponibilidade e status dos espaços compartilhados."
        icon={Volleyball}
        accessLabel={accessLabel}
      />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Disponibilidade</CardTitle>
            <CardDescription>
              Monitoramento entre áreas liberadas e bloqueadas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <AreasAvailabilitySkeleton />
            ) : isError ? (
              <p className="text-sm text-destructive">Não foi possível carregar as áreas.</p>
            ) : (
              <>
                <ChartContainer config={areasChartConfig} className="aspect-[16/8] w-full">
                  <BarChart data={chartData} barSize={50}>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent labelFormatter={(value) => `Status: ${value}`} />
                      }
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {chartData.map((item) => (
                        <Cell key={item.key} fill={`var(--color-${item.key})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
                <p className="mt-4 text-sm text-muted-foreground">
                  {availableAreas.length} de {areas.length} áreas disponíveis.
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mapa rápido</CardTitle>
            <CardDescription>Espaços cadastrados para ações rápidas.</CardDescription>
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
      </div>
    </section>
  );
}
