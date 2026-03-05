import { Link } from "react-router";
import {
  ArrowRight,
  CalendarDays,
  Package,
  PartyPopper,
  User,
  UserCog,
  UserRoundCheck,
  Users,
  Volleyball,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { UserRole } from "@/types/auth";

type AppRole = Exclude<UserRole, "master">;

type Shortcut = {
  id: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: LucideIcon;
  roles: AppRole[];
};

const roleLabel: Record<AppRole, string> = {
  admin: "Administrador(a)",
  staff: "Equipe",
  resident: "Morador(a)",
};

const roleDescription: Record<AppRole, string> = {
  admin:
    "Acesse rapidamente os fluxos mais críticos para operação do condomínio.",
  staff:
    "Atalhos para tarefas operacionais do dia a dia e atendimento ao morador.",
  resident:
    "Acesse seus recursos principais para organizar visitas, encomendas e reservas.",
};

const shortcuts: Shortcut[] = [
  {
    id: "residents",
    title: "Base de moradores",
    description: "Atualize dados cadastrais e contatos essenciais do condomínio.",
    href: "/residents",
    cta: "Abrir moradores",
    icon: Users,
    roles: ["admin", "staff"],
  },
  {
    id: "staff",
    title: "Equipe e permissões",
    description: "Gerencie o quadro de funcionários e acompanhe responsáveis.",
    href: "/staff",
    cta: "Abrir equipe",
    icon: UserCog,
    roles: ["admin"],
  },
  {
    id: "visitors",
    title: "Controle de visitantes",
    description: "Autorize, negue e acompanhe entradas em tempo real.",
    href: "/visitors",
    cta: "Abrir visitantes",
    icon: UserRoundCheck,
    roles: ["admin", "staff", "resident"],
  },
  {
    id: "packages",
    title: "Operação de encomendas",
    description: "Registre recebimentos e acompanhe retiradas sem perder prazos.",
    href: "/packages",
    cta: "Abrir encomendas",
    icon: Package,
    roles: ["admin", "staff", "resident"],
  },
  {
    id: "areas",
    title: "Áreas comuns",
    description: "Gerencie disponibilidade e acompanhe reservas das áreas.",
    href: "/areas",
    cta: "Abrir áreas",
    icon: Volleyball,
    roles: ["admin", "staff", "resident"],
  },
  {
    id: "reservations",
    title: "Fila de agendamentos",
    description: "Revise solicitações pendentes e próximos horários confirmados.",
    href: "/reservations",
    cta: "Abrir agendamentos",
    icon: CalendarDays,
    roles: ["admin", "staff"],
  },
  {
    id: "events",
    title: "Eventos do condomínio",
    description: "Comunique novidades e acompanhe inscrições em um só lugar.",
    href: "/events",
    cta: "Abrir eventos",
    icon: PartyPopper,
    roles: ["admin", "staff", "resident"],
  },
  {
    id: "profile",
    title: "Meu perfil",
    description: "Mantenha seus dados pessoais e canais de contato atualizados.",
    href: "/profile",
    cta: "Abrir perfil",
    icon: User,
    roles: ["admin", "staff", "resident"],
  },
];

type HomeShortcutsProps = {
  role: AppRole;
};

export function HomeShortcuts({ role }: HomeShortcutsProps) {
  const visibleShortcuts = shortcuts.filter((shortcut) =>
    shortcut.roles.includes(role)
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Atalhos rápidos</h2>
          <p className="text-sm text-muted-foreground">{roleDescription[role]}</p>
        </div>
        <Badge variant="outline">{roleLabel[role]}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {visibleShortcuts.map((shortcut) => {
          const Icon = shortcut.icon;

          return (
            <Card key={shortcut.id} className="gap-0">
              <CardHeader className="space-y-3">
                <span className="w-fit rounded-xl border bg-muted/30 p-2 text-foreground">
                  <Icon className="size-5" />
                </span>
                <CardTitle className="text-base">{shortcut.title}</CardTitle>
                <CardDescription>{shortcut.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <Button asChild variant="outline" className="w-full justify-between">
                  <Link to={shortcut.href}>
                    {shortcut.cta}
                    <ArrowRight />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
