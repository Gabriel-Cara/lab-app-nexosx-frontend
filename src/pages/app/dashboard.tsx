import { Helmet } from "@dr.pogodin/react-helmet";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Package, UserRoundCheck, Users } from "lucide-react";
import {
  compareAsc,
  compareDesc,
  format,
  isSameDay,
  isToday,
  parseISO,
  subDays,
} from "date-fns";

import { useAuth } from "@/hooks/use-auth";
import { DashboardHero } from "@/components/dashboard/hero";
import {
  OverviewCards,
  type OverviewCard,
} from "@/components/dashboard/overview-cards";
import { PackagesSection } from "@/components/dashboard/packages-section";
import { VisitorsSection } from "@/components/dashboard/visitors-section";
import { ResidentsSection } from "@/components/dashboard/residents-section";
import { AreasSection } from "@/components/dashboard/areas-section";
import { ReservationsSection } from "@/components/dashboard/reservations-section";
import {
  getPackages,
  type Package as PackageModel,
  type PackageType,
} from "@/api/get-packages";
import {
  getResidents,
  type GetResidentsResponse,
} from "@/api/get-residents";
import {
  getVisitors,
  type VisitorsResponse,
} from "@/api/get-visitors";
import { getAreas, type Area } from "@/api/get-areas";
import {
  getReservations,
  type Reservation,
} from "@/api/get-reservations";
import type { UserRole } from "@/types/auth";

type Role = Exclude<UserRole, "master">;

type VisitorStatus = VisitorsResponse["status"];
type ReservationStatus = Reservation["status"];

const roleLabel: Record<Role, string> = {
  admin: "Administrador(a)",
  staff: "Equipe",
  resident: "Morador(a)",
};

const userRoleLabel: Record<UserRole, string> = {
  ...roleLabel,
  master: "Master",
};

const quickLinkDescriptions: Record<string, string> = {
  packages: "Registrar recebimentos e retiradas",
  visitors: "Autorize ou negue acessos",
  residents: "Atualize dados cadastrais",
  areas: "Gerencie espaços comuns",
  reservations: "Organize agendamentos",
};

const sectionOrder = [
  "packages",
  "visitors",
  "residents",
  "areas",
  "reservations",
] as const;

const sectionAccess: Record<(typeof sectionOrder)[number], Role[]> = {
  packages: ["admin", "staff", "resident"],
  visitors: ["admin", "staff", "resident"],
  residents: ["admin", "staff"],
  areas: ["admin", "staff", "resident"],
  reservations: ["admin", "staff"],
};

const sectionLabels: Record<(typeof sectionOrder)[number], string> = {
  packages: "Encomendas",
  visitors: "Visitantes",
  residents: "Moradores",
  areas: "Áreas de lazer",
  reservations: "Reservas",
};

const visitorStatuses: VisitorStatus[] = ["pending", "authorized", "entry", "left", "denied"];

const visitorStatusConfig: Record<VisitorStatus, { label: string; className: string }> = {
  pending: { label: "Pendente", className: "bg-amber-100 text-amber-900" },
  authorized: { label: "Autorizado", className: "bg-emerald-100 text-emerald-900" },
  entry: { label: "Entrou", className: "bg-blue-100 text-blue-900" },
  left: { label: "Saiu", className: "bg-muted text-muted-foreground" },
  denied: { label: "Negado", className: "bg-rose-100 text-rose-900" },
};

const reservationStatuses: ReservationStatus[] = [
  "pending",
  "approved",
  "rejected",
  "cancelled",
];

const reservationStatusConfig: Record<ReservationStatus, { label: string; className: string }> = {
  pending: { label: "Pendente", className: "bg-amber-100 text-amber-900" },
  approved: { label: "Aprovada", className: "bg-emerald-100 text-emerald-900" },
  rejected: { label: "Recusada", className: "bg-rose-100 text-rose-900" },
  cancelled: { label: "Cancelada", className: "bg-slate-200 text-slate-700" },
};

const isAppRole = (value: UserRole): value is Role => value !== "master";

const packageTypeLabels: Record<PackageType, string> = {
  box: "Caixa",
  envelope: "Envelope",
  food: "Alimento",
  others: "Outros",
};

function safeParseDate(value?: string | null) {
  if (!value) return null;

  try {
    return parseISO(value);
  } catch {
    return null;
  }
}

function buildPackageTrendData(packages: PackageModel[]) {
  return Array.from({ length: 7 }, (_, index) => {
    const day = subDays(new Date(), 6 - index);

    const received = packages.reduce((total, pkg) => {
      const parsed = safeParseDate(pkg.receivedAt);
      if (!parsed) return total;
      return isSameDay(parsed, day) ? total + 1 : total;
    }, 0);

    const retrieved = packages.reduce((total, pkg) => {
      const parsed = safeParseDate(pkg.retrievedAt);
      if (!parsed) return total;
      return isSameDay(parsed, day) ? total + 1 : total;
    }, 0);

    return {
      day: format(day, "dd/MM"),
      received,
      retrieved,
    };
  });
}

function formatDateWithTime(date: string | null, time?: string | null) {
  const parsed = safeParseDate(time ? `${date ?? ""}T${time}` : date ?? undefined);
  if (!parsed) return "—";

  return time
    ? `${format(parsed, "dd/MM")} às ${format(parsed, "HH:mm")}`
    : format(parsed, "dd/MM");
}

function getAccessLabel(routeId: (typeof sectionOrder)[number]) {
  const allowedRoles = sectionAccess[routeId];
  if (!allowedRoles || allowedRoles.length === 0) return "Acesso configurado";

  const labels = allowedRoles.map((role) => roleLabel[role]);

  if (allowedRoles.length === Object.keys(roleLabel).length) {
    return "Disponível para todos os perfis";
  }

  if (labels.length === 1) {
    return `Exclusivo para ${labels[0]}`;
  }

  if (labels.length === 2) {
    return `Liberado para ${labels.join(" e ")}`;
  }

  return `Perfis: ${labels.join(", ")}`;
}

export function Dashboard() {
  const { session } = useAuth();
  const role = session?.user.role ?? "resident";
  const userName = session?.user.name ?? "Morador(a)";

  const visibleSections = useMemo(
    () =>
      isAppRole(role)
        ? sectionOrder.filter((section) => sectionAccess[section].includes(role))
        : [],
    [role],
  );

  const {
    data: packages = [],
    isLoading: isLoadingPackages,
    isError: isErrorPackages,
  } = useQuery<PackageModel[]>({
    queryKey: ["dashboard-packages"],
    queryFn: getPackages,
  });

  const {
    data: residentsResponse,
    isLoading: isLoadingResidents,
    isError: isErrorResidents,
  } = useQuery<GetResidentsResponse>({
    queryKey: ["dashboard-residents", { limit: 100 }],
    queryFn: () => getResidents({ limit: 100 }),
  });

  const residents = residentsResponse?.data ?? [];
  const residentsTotal = residentsResponse?.pagination.total ?? residents.length;

  const {
    data: visitors = [],
    isLoading: isLoadingVisitors,
    isError: isErrorVisitors,
  } = useQuery<VisitorsResponse[]>({
    queryKey: ["dashboard-visitors"],
    queryFn: getVisitors,
  });

  const {
    data: areas = [],
    isLoading: isLoadingAreas,
    isError: isErrorAreas,
  } = useQuery<Area[]>({
    queryKey: ["dashboard-areas"],
    queryFn: getAreas,
  });

  const {
    data: reservations = [],
    isLoading: isLoadingReservations,
    isError: isErrorReservations,
  } = useQuery<Reservation[]>({
    queryKey: ["dashboard-reservations"],
    queryFn: () => getReservations(),
  });

  const packageStatuses = useMemo(
    () =>
      packages.reduce(
        (acc, pkg) => {
          acc[pkg.status] = (acc[pkg.status] ?? 0) + 1;
          return acc;
        },
        {} as Record<PackageModel["status"], number>,
      ),
    [packages],
  );

  const packageTrendData = useMemo(() => buildPackageTrendData(packages), [packages]);

  const pendingPackages = packages.filter((pkg) => ["pending", "delayed"].includes(pkg.status));

  const topPendingPackages = useMemo(
    () =>
      pendingPackages
        .slice()
        .sort((a, b) => {
          const dateA = safeParseDate(a.receivedAt) ?? new Date(0);
          const dateB = safeParseDate(b.receivedAt) ?? new Date(0);
          return compareDesc(dateA, dateB);
        })
        .slice(0, 4),
    [pendingPackages],
  );

  const packageTypeChartData = useMemo(
    () =>
      (Object.keys(packageTypeLabels) as PackageType[]).map((type) => ({
        type,
        label: packageTypeLabels[type],
        total: packages.filter((pkg) => pkg.type === type).length,
      })),
    [packages],
  );

  const activeVisitors = useMemo(
    () => visitors.filter((visitor) => ["pending", "authorized", "entry"].includes(visitor.status)).length,
    [visitors],
  );

  const visitorsToday = useMemo(
    () => visitors.filter((visitor) => isToday(parseISO(visitor.createdAt))).length,
    [visitors],
  );

  const visitorStatusTotals = useMemo(
    () =>
      visitors.reduce(
        (acc, visitor) => {
          acc[visitor.status] = (acc[visitor.status] ?? 0) + 1;
          return acc;
        },
        {} as Record<VisitorStatus, number>,
      ),
    [visitors],
  );

  const visitorChartData = useMemo(
    () =>
      visitorStatuses.map((status) => ({
        status,
        label: visitorStatusConfig[status].label,
        value: visitorStatusTotals[status] ?? 0,
      })),
    [visitorStatusTotals],
  );

  const recentVisitors = useMemo(() => {
    return visitors
      .slice()
      .sort((a, b) => {
        const dateA = safeParseDate(a.createdAt) ?? new Date(0);
        const dateB = safeParseDate(b.createdAt) ?? new Date(0);
        return compareDesc(dateA, dateB);
      })
      .slice(0, 4);
  }, [visitors]);

  const areasAvailable = areas.filter((area) => area.available);

  const areasChartData = useMemo(() => {
    const blocked = Math.max(areas.length - areasAvailable.length, 0);
    return [
      { key: "available" as const, label: "Disponíveis", value: areasAvailable.length },
      { key: "blocked" as const, label: "Indisponíveis", value: blocked },
    ];
  }, [areas.length, areasAvailable.length]);

  const upcomingReservations = useMemo(() => {
    return reservations
      .slice()
      .filter((reservation) => {
        const date = safeParseDate(`${reservation.date}T${reservation.startTime}`);
        if (!date) return true;
        return compareAsc(date, new Date()) >= 0;
      })
      .sort((a, b) => {
        const dateA = safeParseDate(`${a.date}T${a.startTime}`) ?? new Date(0);
        const dateB = safeParseDate(`${b.date}T${b.startTime}`) ?? new Date(0);
        return compareAsc(dateA, dateB);
      })
      .slice(0, 4);
  }, [reservations]);

  const reservationStatusTotals = useMemo(
    () =>
      reservations.reduce(
        (acc, reservation) => {
          acc[reservation.status] = (acc[reservation.status] ?? 0) + 1;
          return acc;
        },
        {} as Record<ReservationStatus, number>,
      ),
    [reservations],
  );

  const reservationChartData = useMemo(
    () =>
      reservationStatuses.map((status) => ({
        status,
        label: reservationStatusConfig[status].label,
        value: reservationStatusTotals[status] ?? 0,
      })),
    [reservationStatusTotals],
  );

  const residentsWithApartment = residents.filter((resident) => resident.apartment).length;
  const residentsWithEmergencyContacts = residents.filter((resident) => resident.emergencyContact).length;

  const residentsChartData = useMemo(
    () => [
      {
        key: "apartments" as const,
        label: "Com apartamento",
        value: residentsWithApartment,
      },
      {
        key: "emergency" as const,
        label: "Contato de emergência",
        value: residentsWithEmergencyContacts,
      },
    ],
    [residentsWithApartment, residentsWithEmergencyContacts],
  );

  const overviewCards: OverviewCard[] = [
    {
      id: "packages",
      title: "Encomendas pendentes",
      value: pendingPackages.length,
      icon: Package,
      color: "sky",
      trend: `${packageStatuses.retrieved ?? 0} já entregues recentemente`,
    },
    {
      id: "visitors",
      title: "Visitantes ativos",
      value: activeVisitors,
      icon: UserRoundCheck,
      color: "emerald",
      trend: `${visitorsToday} visitas registradas hoje`,
    },
    {
      id: "residents",
      title: "Moradores cadastrados",
      value: residentsTotal,
      icon: Users,
      color: "indigo",
      trend: `${residentsWithApartment} apartamentos com responsáveis`,
    },
    {
      id: "reservations",
      title: "Reservas aprovadas",
      value: reservationStatusTotals.approved ?? 0,
      icon: CalendarDays,
      color: "amber",
      trend: `${reservationStatusTotals.pending ?? 0} aguardando decisão`,
    },
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard</title>
      </Helmet>

      <main className="flex min-h-svh flex-col gap-8">
        <header className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <DashboardHero
            userName={userName}
            roleLabel={userRoleLabel[role]}
            visibleSections={visibleSections as string[]}
            sectionLabels={sectionLabels}
            quickLinkDescriptions={quickLinkDescriptions}
          />
          <OverviewCards cards={overviewCards} />
        </header>

        {visibleSections.includes("packages") && (
          <PackagesSection
            accessLabel={getAccessLabel("packages")}
            isLoading={isLoadingPackages}
            isError={isErrorPackages}
            trendData={packageTrendData}
            packageStatuses={packageStatuses}
            pendingPackages={pendingPackages}
            topPendingPackages={topPendingPackages}
            packageTypeDistribution={packageTypeChartData}
            typeLabels={packageTypeLabels}
          />
        )}

        {visibleSections.includes("visitors") && (
          <VisitorsSection
            accessLabel={getAccessLabel("visitors")}
            isLoading={isLoadingVisitors}
            isError={isErrorVisitors}
            chartData={visitorChartData}
            activeVisitors={activeVisitors}
            visitorsToday={visitorsToday}
            recentVisitors={recentVisitors}
            formatDate={(date) => formatDateWithTime(date)}
          />
        )}

        {visibleSections.includes("residents") && (
          <ResidentsSection
            accessLabel={getAccessLabel("residents")}
            isLoading={isLoadingResidents}
            isError={isErrorResidents}
            residents={residents}
            chartData={residentsChartData}
            residentsWithApartment={residentsWithApartment}
            residentsWithEmergencyContacts={residentsWithEmergencyContacts}
          />
        )}

        {visibleSections.includes("areas") && (
          <AreasSection
            accessLabel={getAccessLabel("areas")}
            isLoading={isLoadingAreas}
            isError={isErrorAreas}
            areas={areas}
            availableAreas={areasAvailable}
            chartData={areasChartData}
          />
        )}

        {visibleSections.includes("reservations") && (
          <ReservationsSection
            accessLabel={getAccessLabel("reservations")}
            isLoading={isLoadingReservations}
            isError={isErrorReservations}
            chartData={reservationChartData}
            upcomingReservations={upcomingReservations}
            statusConfig={reservationStatusConfig}
            formatDate={formatDateWithTime}
          />
        )}
      </main>
    </>
  );
}
