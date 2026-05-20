import {
  CalendarDays,
  ClipboardList,
  Building2,
  House,
  Package,
  PartyPopper,
  UserCog,
  UserRoundCheck,
  Users,
  Volleyball,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { lazy, Suspense, type ReactNode } from "react";

import { RouteFallback } from "@/routes/route-fallback";
import { ResidentsPageSkeleton } from "@/pages/app/residents-skeleton";
import { ProfileSkeleton } from "@/pages/app/profile-skeleton";
import type { UserRole } from "@/types/auth";

const Dashboard = lazy(() =>
  import("@/pages/app/dashboard").then((module) => ({ default: module.Dashboard }))
);
const Blocks = lazy(() =>
  import("@/pages/app/blocks").then((module) => ({ default: module.Blocks }))
);
const Residences = lazy(() =>
  import("@/pages/app/residences").then((module) => ({ default: module.Residences }))
);
const Residents = lazy(() =>
  import("@/pages/app/residents").then((module) => ({ default: module.Residents }))
);
const Staff = lazy(() =>
  import("@/pages/app/staff").then((module) => ({ default: module.Staff }))
);
const Visitors = lazy(() =>
  import("@/pages/app/visitors").then((module) => ({ default: module.Visitors }))
);
const Packages = lazy(() =>
  import("@/pages/app/packages").then((module) => ({ default: module.Packages }))
);
const Areas = lazy(() =>
  import("@/pages/app/areas").then((module) => ({ default: module.Areas }))
);
const Reservations = lazy(() =>
  import("@/pages/app/reservations").then((module) => ({ default: module.Reservations }))
);
const Profile = lazy(() =>
  import("@/pages/app/profile").then((module) => ({ default: module.Profile }))
);
const Events = lazy(() =>
  import("@/pages/app/events").then((module) => ({ default: module.Events }))
);
const CondominiumRequests = lazy(() =>
  import("@/pages/admin/condominium-requests").then((module) => ({
    default: module.CondominiumRequests,
  }))
);
const AdminCondominiums = lazy(() =>
  import("@/pages/admin/condominiums").then((module) => ({
    default: module.AdminCondominiums,
  }))
);
const AdminUsers = lazy(() =>
  import("@/pages/admin/users").then((module) => ({
    default: module.AdminUsers,
  }))
);

const withSuspense = (element: ReactNode, fallback: ReactNode = <RouteFallback />) => (
  <Suspense fallback={fallback}>{element}</Suspense>
);

export type Role = UserRole;

export type AppRouteDefinition = {
  id: string;
  path: string;
  element: ReactNode;
  roles: Role[];
  label?: string;
  icon?: LucideIcon;
  showInSidebar?: boolean;
};

export const appRouteDefinitions: AppRouteDefinition[] = [
  {
    id: "dashboard",
    path: "dashboard",
    element: withSuspense(<Dashboard />),
    roles: ["manager", "doorman", "resident"],
    label: "Home",
    icon: House,
    showInSidebar: true,
  },
  {
    id: "blocks",
    path: "blocks",
    element: withSuspense(<Blocks />),
    roles: ["admin", "manager"],
    label: "Blocos",
    icon: Building2,
    showInSidebar: true,
  },
  {
    id: "residences",
    path: "residences",
    element: withSuspense(<Residences />),
    roles: ["admin", "manager", "doorman", "resident"],
    label: "Residências",
    icon: House,
    showInSidebar: true,
  },
  {
    id: "residents",
    path: "residents",
    element: withSuspense(<Residents />, <ResidentsPageSkeleton />),
    roles: ["manager", "doorman"],
    label: "Moradores",
    icon: Users,
    showInSidebar: true,
  },
  {
    id: "doorman",
    path: "doorman",
    element: withSuspense(<Staff />, <ResidentsPageSkeleton />),
    roles: ["manager"],
    label: "Portaria",
    icon: UserCog,
    showInSidebar: true,
  },
  {
    id: "visitors",
    path: "visitors",
    element: withSuspense(<Visitors />),
    roles: ["manager", "doorman", "resident"],
    label: "Visitantes",
    icon: UserRoundCheck,
    showInSidebar: true,
  },
  {
    id: "packages",
    path: "packages",
    element: withSuspense(<Packages />),
    roles: ["manager", "doorman", "resident"],
    label: "Encomendas",
    icon: Package,
    showInSidebar: true,
  },
  {
    id: "areas",
    path: "areas",
    element: withSuspense(<Areas />),
    roles: ["manager", "doorman", "resident"],
    label: "Áreas de Lazer",
    icon: Volleyball,
    showInSidebar: true,
  },
  {
    id: "reservations",
    path: "reservations",
    element: withSuspense(<Reservations />),
    roles: ["manager", "doorman"],
    label: "Agendamentos",
    icon: CalendarDays,
    showInSidebar: true,
  },
  {
    id: "profile",
    path: "profile",
    element: withSuspense(<Profile />, <ProfileSkeleton showExtended />),
    roles: ["manager", "doorman", "resident"],
    showInSidebar: false,
  },
  {
    id: "events",
    path: "events",
    element: withSuspense(<Events />),
    roles: ["manager", "doorman", "resident"],
    label: "Eventos",
    icon: PartyPopper,
    showInSidebar: true,
  },
  {
    id: "admin-requests",
    path: "admin/requests",
    element: withSuspense(<CondominiumRequests />),
    roles: ["admin"],
    label: "Solicitações",
    icon: ClipboardList,
    showInSidebar: true,
  },
  {
    id: "admin-condominiums",
    path: "admin/condominiums",
    element: withSuspense(<AdminCondominiums />),
    roles: ["admin"],
    label: "Condomínios",
    icon: Building2,
    showInSidebar: true,
  },
  {
    id: "admin-users",
    path: "admin/users",
    element: withSuspense(<AdminUsers />),
    roles: ["admin"],
    label: "Usuários",
    icon: UserCog,
    showInSidebar: true,
  },
];

export const sidebarNavigation = appRouteDefinitions
  .filter((route) => route.showInSidebar && route.label && route.icon)
  .map((route) => ({
    id: route.id,
    title: route.label as string,
    url: route.path === "dashboard" ? "/dashboard" : `/${route.path}`,
    icon: route.icon as LucideIcon,
    roles: route.roles,
  }));
