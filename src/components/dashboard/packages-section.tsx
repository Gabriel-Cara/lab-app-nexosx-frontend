import { Package } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusPackages } from "@/components/packages/status-packages";
import type { Package as PackageModel, PackageType } from "@/api/get-packages";
import {
  PackagesQueueSkeleton,
  PackagesTrendSkeleton,
  PackagesTypeSkeleton,
} from "@/components/dashboard/packages-section-skeleton";
import { EmptyState } from "@/components/ui/empty";

const packageTrendChartConfig: ChartConfig = {
  received: {
    label: "Recebidas",
    color: "hsl(214 84% 56%)",
  },
  retrieved: {
    label: "Retiradas",
    color: "hsl(142 71% 45%)",
  },
};

const packageTypeChartConfig: ChartConfig = {
  box: { label: "Caixa", color: "hsl(221 83% 53%)" },
  envelope: { label: "Envelope", color: "hsl(281 89% 65%)" },
  food: { label: "Comida", color: "hsl(31 97% 62%)" },
  others: { label: "Outros", color: "hsl(12 89% 65%)" },
};

type PackageTrendPoint = {
  day: string;
  received: number;
  retrieved: number;
};

type PackageTypeDistribution = {
  type: PackageType;
  label: string;
  total: number;
};

type PackagesSectionProps = {
  accessLabel: string;
  isLoading: boolean;
  isError: boolean;
  trendData: PackageTrendPoint[];
  packageStatuses: Record<PackageModel["status"], number>;
  pendingPackages: PackageModel[];
  topPendingPackages: PackageModel[];
  packageTypeDistribution: PackageTypeDistribution[];
  typeLabels: Record<PackageType, string>;
};

export function PackagesSection({
  accessLabel,
  isLoading,
  isError,
  trendData,
  packageStatuses,
  pendingPackages,
  topPendingPackages,
  packageTypeDistribution,
  typeLabels,
}: PackagesSectionProps) {
  return (
    <section className="space-y-4">
      <SectionHeader
        title="Encomendas"
        description="Fluxo de recebimento e pendências de retirada."
        icon={Package}
        accessLabel={accessLabel}
      />
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recebidas x Retiradas</CardTitle>
            <CardDescription>Evolução diária dos últimos 7 dias.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <PackagesTrendSkeleton />
            ) : isError ? (
              <p className="text-sm text-destructive">
                Não foi possível carregar as encomendas.
              </p>
            ) : (
              <div className="space-y-6">
                <ChartContainer config={packageTrendChartConfig} className="aspect-[16/8] w-full">
                  <LineChart data={trendData}>
                    <CartesianGrid vertical={false} strokeDasharray="4 4" />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} dy={6} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                    <ChartTooltip
                      content={<ChartTooltipContent hideIndicator indicator="line" />}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line
                      type="monotone"
                      dataKey="received"
                      stroke="var(--color-received)"
                      strokeWidth={3}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="retrieved"
                      stroke="var(--color-retrieved)"
                      strokeWidth={3}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>

                <dl className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border bg-secondary/20 p-3">
                    <dt className="text-xs uppercase text-muted-foreground">Pendentes</dt>
                    <dd className="text-xl font-semibold">{pendingPackages.length}</dd>
                  </div>
                  <div className="rounded-lg border bg-secondary/20 p-3">
                    <dt className="text-xs uppercase text-muted-foreground">Retiradas</dt>
                    <dd className="text-xl font-semibold">{packageStatuses.retrieved ?? 0}</dd>
                  </div>
                  <div className="rounded-lg border bg-secondary/20 p-3">
                    <dt className="text-xs uppercase text-muted-foreground">
                      Canceladas/Atrasadas
                    </dt>
                    <dd className="text-xl font-semibold">
                      {(packageStatuses.cancelled ?? 0) + (packageStatuses.delayed ?? 0)}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por tipo</CardTitle>
            <CardDescription>Categorias recebidas recentemente.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <PackagesTypeSkeleton />
            ) : isError ? (
              <p className="text-sm text-destructive">
                Não foi possível carregar as categorias.
              </p>
            ) : (
              <>
                <ChartContainer
                  config={packageTypeChartConfig}
                  className="aspect-square max-h-[320px] w-full"
                >
                  <BarChart data={packageTypeDistribution} barSize={32}>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent labelFormatter={(value) => `Tipo: ${value}`} />
                      }
                    />
                    <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                      {packageTypeDistribution.map((item) => (
                        <Cell key={item.type} fill={`var(--color-${item.type})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
                <div className="mt-4 text-sm text-muted-foreground">
                  {pendingPackages.length} encomendas aguardando retirada.
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fila priorizada</CardTitle>
          <CardDescription>Últimas pendências registradas e seus status.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <PackagesQueueSkeleton />
          ) : isError ? (
            <p className="text-sm text-destructive">
              Não foi possível carregar os registros.
            </p>
          ) : pendingPackages.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Nenhuma pendência no momento"
              description="As encomendas aguardando retirada aparecerão aqui."
              size="sm"
              className="min-h-44"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Destinatário</TableHead>
                  <TableHead>Apart.</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPendingPackages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="font-medium">{pkg.resident.name}</TableCell>
                    <TableCell>{pkg.resident.apartment ?? "—"}</TableCell>
                    <TableCell>{typeLabels[pkg.type]}</TableCell>
                    <TableCell className="text-center">
                      <StatusPackages variant={pkg.status} />
                    </TableCell>
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
