import {
  CalendarDays,
  LayoutDashboard,
  Package,
  PartyPopper,
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
const Residents = lazy(() =>
  import("@/pages/app/residents").then((module) => ({ default: module.Residents }))
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
    roles: ["admin", "staff", "resident"],
    label: "Dashboard",
    icon: LayoutDashboard,
    showInSidebar: true,
  },
  {
    id: "residents",
    path: "residents",
    element: withSuspense(<Residents />, <ResidentsPageSkeleton />),
    roles: ["admin", "staff"],
    label: "Moradores",
    icon: Users,
    showInSidebar: true,
  },
  {
    id: "visitors",
    path: "visitors",
    element: withSuspense(<Visitors />),
    roles: ["admin", "staff", "resident"],
    label: "Visitantes",
    icon: UserRoundCheck,
    showInSidebar: true,
  },
  {
    id: "packages",
    path: "packages",
    element: withSuspense(<Packages />),
    roles: ["admin", "staff", "resident"],
    label: "Encomendas",
    icon: Package,
    showInSidebar: true,
  },
  {
    id: "areas",
    path: "areas",
    element: withSuspense(<Areas />),
    roles: ["admin", "staff", "resident"],
    label: "Áreas de Lazer",
    icon: Volleyball,
    showInSidebar: true,
  },
  {
    id: "reservations",
    path: "reservations",
    element: withSuspense(<Reservations />),
    roles: ["admin", "staff"],
    label: "Agendamentos",
    icon: CalendarDays,
    showInSidebar: true,
  },
  {
    id: "profile",
    path: "profile",
    element: withSuspense(<Profile />, <ProfileSkeleton showExtended />),
    roles: ["admin", "staff", "resident"],
    showInSidebar: false,
  },
  {
    id: "events",
    path: "events",
    element: withSuspense(<Events />),
    roles: ["admin", "staff", "resident"],
    label: "Eventos",
    icon: PartyPopper,
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
