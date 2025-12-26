import { UserRoundCheck } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { VisitorsResponse } from "@/api/get-visitors";
import { Status as VisitorStatusBadge } from "@/components/visitors/status";
import {
  VisitorsRecentSkeleton,
  VisitorsStatusSkeleton,
} from "@/components/dashboard/visitors-section-skeleton";

type VisitorStatus = VisitorsResponse["status"];

type VisitorChartPoint = {
  status: VisitorStatus;
  label: string;
  value: number;
};

type VisitorsSectionProps = {
  accessLabel: string;
  isLoading: boolean;
  isError: boolean;
  chartData: VisitorChartPoint[];
  activeVisitors: number;
  visitorsToday: number;
  recentVisitors: VisitorsResponse[];
  formatDate: (date: string) => string;
};

const visitorRadarConfig = {
  value: { label: "Visitantes", color: "hsl(221 83% 53%)" },
};

export function VisitorsSection({
  accessLabel,
  isLoading,
  isError,
  chartData,
  activeVisitors,
  visitorsToday,
  recentVisitors,
  formatDate,
}: VisitorsSectionProps) {
  return (
    <section className="space-y-4">
      <SectionHeader
        title="Visitantes"
        description="Autorizações em tempo real e registros recentes."
        icon={UserRoundCheck}
        accessLabel={accessLabel}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Status geral</CardTitle>
            <CardDescription>Distribuição por etapa de acesso.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <VisitorsStatusSkeleton />
            ) : isError ? (
              <p className="text-sm text-destructive">
                Não foi possível carregar os visitantes.
              </p>
            ) : (
              <>
                <ChartContainer
                  config={visitorRadarConfig}
                  className="mx-auto aspect-square max-h-[340px] w-full"
                >
                  <RadarChart data={chartData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="label" />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          labelFormatter={(value, payload) =>
                            payload?.[0]?.payload.label ?? String(value ?? "")
                          }
                        />
                      }
                    />
                    <Radar
                      dataKey="value"
                      stroke="var(--color-value)"
                      fill="var(--color-value)"
                      fillOpacity={0.55}
                      dot={{ r: 4, fillOpacity: 1 }}
                    />
                  </RadarChart>
                </ChartContainer>
                <div className="mt-4 grid gap-2 text-sm">
                  <p>
                    <span className="font-medium">{activeVisitors}</span> acompanhamentos
                    ativos no momento.
                  </p>
                  <p>
                    <span className="font-medium">{visitorsToday}</span> visitas
                    registradas hoje.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimos registros</CardTitle>
            <CardDescription>Visitantes mais recentes e seu status atual.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <VisitorsRecentSkeleton />
            ) : isError ? (
              <p className="text-sm text-destructive">
                Não foi possível carregar os visitantes.
              </p>
            ) : recentVisitors.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma visita registrada ainda.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Visitante</TableHead>
                    <TableHead>Morador</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentVisitors.map((visitor) => (
                    <TableRow key={visitor.id}>
                      <TableCell className="font-medium">{visitor.visitor.name}</TableCell>
                      <TableCell>
                        {visitor.host.name}{" "}
                        {visitor.host.apartment && (
                          <span className="text-muted-foreground text-xs">
                            · Apt {visitor.host.apartment}
                          </span>
                        )}
                      </TableCell>
                    <TableCell>{formatDate(visitor.createdAt)}</TableCell>
                    <TableCell className="text-center">
                        <VisitorStatusBadge variant={visitor.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
