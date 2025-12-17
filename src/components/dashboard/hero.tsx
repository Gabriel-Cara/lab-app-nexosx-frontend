import { ShieldCheck } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type DashboardHeroProps = {
  userName: string;
  roleLabel: string;
  visibleSections: string[];
  sectionLabels: Record<string, string>;
  quickLinkDescriptions: Record<string, string>;
};

export function DashboardHero({
  userName,
  roleLabel,
  visibleSections,
  sectionLabels,
  quickLinkDescriptions,
}: DashboardHeroProps) {
  return (
    <Card className="bg-gradient-to-br from-secondary/60 to-background shadow-sm">
      <CardHeader className="gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Bem-vindo(a) de volta,</p>
            <CardTitle className="text-2xl font-semibold">{userName}</CardTitle>
            <CardDescription className="text-base">
              Seu acesso é de{" "}
              <span className="font-medium text-foreground">{roleLabel}</span>.
              Visualize abaixo as páginas liberadas e os indicadores do condomínio.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <ShieldCheck className="size-4" />
            {roleLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">Seções liberadas para você:</p>
        {visibleSections.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma seção adicional foi liberada para este perfil no momento.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {visibleSections.map((section) => (
              <Badge
                key={section}
                variant="secondary"
                className="flex items-center gap-1"
                title={quickLinkDescriptions[section] ?? section}
              >
                {sectionLabels[section] ?? section}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
