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
import { DashboardQuickActions } from "@/components/dashboard/quick-actions";
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

type Role = Exclude<UserRole, "admin">;

type VisitorStatus = VisitorsResponse["status"];
type ReservationStatus = Reservation["status"];

const roleLabel: Record<Role, string> = {
  manager: "Gestor(a)",
  doorman: "Portaria",
  resident: "Morador(a)",
};

const sectionOrder = [
  "packages",
  "visitors",
  "residents",
  "areas",
  "reservations",
] as const;

const sectionAccess: Record<(typeof sectionOrder)[number], Role[]> = {
  packages: ["manager", "doorman", "resident"],
  visitors: ["manager", "doorman", "resident"],
  residents: ["manager", "doorman"],
  areas: ["manager", "doorman", "resident"],
  reservations: ["manager", "doorman"],
};

const visitorStatuses: VisitorStatus[] = ["pending", "authorized", "entry", "left", "denied"];

const visitorStatusConfig: Record<VisitorStatus, { label: string; className: string }> = {
  pending: { label: "Pendente", className: "bg-amber-100 text-amber-900" },
  authorized: { label: "Autorizado", className: "bg-emerald-100 text-emerald-900" },
  entry: { label: "Entrou", className: "bg-blue-100 text-blue-900" },
  left: { label: "Saiu", className: "bg-muted text-muted-foreground" },
  denied: { label: "Negado", className: "bg-rose-100 text-rose-900" },
};

const reservationStatusConfig: Record<ReservationStatus, { label: string; className: string }> = {
  pending: { label: "Pendente", className: "bg-amber-100 text-amber-900" },
  approved: { label: "Aprovada", className: "bg-emerald-100 text-emerald-900" },
  rejected: { label: "Recusada", className: "bg-rose-100 text-rose-900" },
  cancelled: { label: "Cancelada", className: "bg-slate-200 text-slate-700" },
};

const isAppRole = (value: UserRole): value is Role => value !== "admin";

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
  const role = session?.user.role;
  const showOverview = role === "manager" || role === "doorman";
  const dashboardResidentsPage = 1;
  const dashboardResidentsLimit = 100;
  const dashboardResidentsSearch = "";
  const isAuthenticated = Boolean(session?.token);

  const visibleSections = useMemo(
    () =>
      role && isAppRole(role)
        ? sectionOrder.filter((section) => sectionAccess[section].includes(role))
        : [],
    [role],
  );
  const canLoadPackages = isAuthenticated && visibleSections.includes("packages");
  const canLoadResidents =
    isAuthenticated &&
    (showOverview || visibleSections.includes("residents"));
  const canLoadVisitors = isAuthenticated && visibleSections.includes("visitors");
  const canLoadAreas = isAuthenticated && visibleSections.includes("areas");
  const canLoadReservations =
    isAuthenticated &&
    (showOverview || visibleSections.includes("reservations"));

  const {
    data: packages = [],
    isLoading: isLoadingPackages,
    isError: isErrorPackages,
  } = useQuery<PackageModel[]>({
    queryKey: ["packages"],
    queryFn: getPackages,
    enabled: canLoadPackages,
  });

  const {
    data: residentsResponse,
    isLoading: isLoadingResidents,
    isError: isErrorResidents,
  } = useQuery<GetResidentsResponse>({
    queryKey: [
      "residents",
      dashboardResidentsPage,
      dashboardResidentsLimit,
      dashboardResidentsSearch,
    ],
    queryFn: () =>
      getResidents({
        page: dashboardResidentsPage,
        limit: dashboardResidentsLimit,
        search: undefined,
      }),
    enabled: canLoadResidents,
  });

  const residents = residentsResponse?.data ?? [];
  const residentsTotal = residentsResponse?.pagination.total ?? residents.length;

  const {
    data: visitors = [],
    isLoading: isLoadingVisitors,
    isError: isErrorVisitors,
  } = useQuery<VisitorsResponse[]>({
    queryKey: ["visitors"],
    queryFn: getVisitors,
    enabled: canLoadVisitors,
  });

  const {
    data: areas = [],
    isLoading: isLoadingAreas,
    isError: isErrorAreas,
  } = useQuery<Area[]>({
    queryKey: ["areas"],
    queryFn: getAreas,
    enabled: canLoadAreas,
  });

  const {
    data: reservations = [],
    isLoading: isLoadingReservations,
    isError: isErrorReservations,
  } = useQuery<Reservation[]>({
    queryKey: ["reservations", "all"],
    queryFn: () => getReservations(),
    enabled: canLoadReservations,
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

  const residentsWithApartment = residents.filter((resident) => resident.apartment).length;

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

  if (!role) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Dashboard</title>
      </Helmet>

      <main className="flex min-h-svh flex-col gap-8">
        <header className="space-y-6">
          <section className="space-y-3">
            <div>
              <p className="text-lg font-semibold leading-tight">Quick actions</p>
              <p className="text-muted-foreground text-sm">Ações diretas para o dia a dia.</p>
            </div>
            <DashboardQuickActions
              role={role}
              activeVisitorsCount={activeVisitors}
              pendingPackagesCount={pendingPackages.length}
              availableAreasCount={areasAvailable.length}
              defaultAreaId={areasAvailable[0]?.id ?? null}
            />
          </section>

          {showOverview && (
            <section className="space-y-3">
              <div>
                <p className="text-lg font-semibold leading-tight">Visão geral</p>
                <p className="text-muted-foreground text-sm">Resumo rápido dos indicadores.</p>
              </div>
              <OverviewCards cards={overviewCards} />
            </section>
          )}
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
          />
        )}

        {visibleSections.includes("areas") && (
          <AreasSection
            accessLabel={getAccessLabel("areas")}
            isLoading={isLoadingAreas}
            isError={isErrorAreas}
            areas={areas}
            availableAreas={areasAvailable}
          />
        )}

        {visibleSections.includes("reservations") && (
          <ReservationsSection
            accessLabel={getAccessLabel("reservations")}
            isLoading={isLoadingReservations}
            isError={isErrorReservations}
            upcomingReservations={upcomingReservations}
            statusConfig={reservationStatusConfig}
            formatDate={formatDateWithTime}
          />
        )}
      </main>
    </>
  );
}
