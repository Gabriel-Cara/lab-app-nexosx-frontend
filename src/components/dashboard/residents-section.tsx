import { Users } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Resident } from "@/api/get-residents";

type ResidentsChartPoint = {
  key: "apartments" | "emergency";
  label: string;
  value: number;
};

type ResidentsSectionProps = {
  accessLabel: string;
  isLoading: boolean;
  isError: boolean;
  residents: Resident[];
  chartData: ResidentsChartPoint[];
  residentsWithApartment: number;
  residentsWithEmergencyContacts: number;
};

const residentsChartConfig = {
  apartments: {
    label: "Responsáveis por apto",
    color: "hsl(262 83% 68%)",
  },
  emergency: {
    label: "Contato de emergência",
    color: "hsl(347 82% 62%)",
  },
};

export function ResidentsSection({
  accessLabel,
  isLoading,
  isError,
  residents,
  chartData,
  residentsWithApartment,
  residentsWithEmergencyContacts,
}: ResidentsSectionProps) {
  return (
    <section className="space-y-4">
      <SectionHeader
        title="Moradores"
        description="Cobertura de cadastros e contatos críticos."
        icon={Users}
        accessLabel={accessLabel}
      />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Cobertura do cadastro</CardTitle>
            <CardDescription>
              Comparativo entre responsáveis e contatos de emergência.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Carregando moradores...</p>
            ) : isError ? (
              <p className="text-sm text-destructive">
                Não foi possível carregar os moradores.
              </p>
            ) : (
              <>
                <ChartContainer config={residentsChartConfig} className="aspect-[16/8] w-full">
                  <BarChart data={chartData} barSize={40}>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent labelFormatter={(value) => `Indicador: ${value}`} />
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
                  {residentsWithApartment} moradores vinculados a unidades e{" "}
                  {residentsWithEmergencyContacts} com contatos de emergência.
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimos cadastrados</CardTitle>
            <CardDescription>Destaque para novos moradores no sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Carregando moradores...</p>
            ) : isError ? (
              <p className="text-sm text-destructive">
                Não foi possível carregar os moradores.
              </p>
            ) : residents.length === 0 ? (
              <p className="text-sm text-muted-foreground">Os cadastros aparecerão aqui.</p>
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
      </div>
    </section>
  );
}
