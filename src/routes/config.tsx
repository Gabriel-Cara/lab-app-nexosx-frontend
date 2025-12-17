import {
  CalendarDays,
  LayoutDashboard,
  Package,
  /*PartyPopper,*/ UserRoundCheck,
  Users,
  Volleyball,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Dashboard } from "@/pages/app/dashboard";
import { Residents } from "@/pages/app/residents";
import { Visitors } from "@/pages/app/visitors";
import { Packages } from "@/pages/app/packages";
import { Areas } from "@/pages/app/areas";
import { Reservations } from "@/pages/app/reservations";
import { Profile } from "@/pages/app/profile";
// import { Events } from "@/pages/app/events";

export type Role = "admin" | "staff" | "resident";

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
    element: <Dashboard />,
    roles: ["admin", "staff", "resident"],
    label: "Dashboard",
    icon: LayoutDashboard,
    showInSidebar: true,
  },
  {
    id: "residents",
    path: "residents",
    element: <Residents />,
    roles: ["admin", "staff"],
    label: "Moradores",
    icon: Users,
    showInSidebar: true,
  },
  {
    id: "visitors",
    path: "visitors",
    element: <Visitors />,
    roles: ["admin", "staff", "resident"],
    label: "Visitantes",
    icon: UserRoundCheck,
    showInSidebar: true,
  },
  {
    id: "packages",
    path: "packages",
    element: <Packages />,
    roles: ["admin", "staff", "resident"],
    label: "Encomendas",
    icon: Package,
    showInSidebar: true,
  },
  {
    id: "areas",
    path: "areas",
    element: <Areas />,
    roles: ["admin", "staff", "resident"],
    label: "Áreas de Lazer",
    icon: Volleyball,
    showInSidebar: true,
  },
  {
    id: "reservations",
    path: "reservations",
    element: <Reservations />,
    roles: ["admin", "staff"],
    label: "Agendamentos",
    icon: CalendarDays,
    showInSidebar: true,
  },
  {
    id: "profile",
    path: "profile",
    element: <Profile />,
    roles: ["admin", "staff", "resident"],
    showInSidebar: false,
  },
  // {
  //   id: "events",
  //   path: "events",
  //   element: <Events />,
  //   roles: ["admin", "staff", "resident"],
  //   label: "Eventos",
  //   icon: PartyPopper,
  //   showInSidebar: true,
  // },
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
