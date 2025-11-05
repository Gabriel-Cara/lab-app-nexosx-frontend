import { CalendarDays, LayoutDashboard, Package, PartyPopper, UserRoundCheck, Users } from "lucide-react";

interface MenuItem {
  title: string;
  url: string;
  icon: any;
}

export const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Moradores",
    url: "/residents",
    icon: Users,
  },
  {
    title: "Visitantes",
    url: "/visitors",
    icon: UserRoundCheck,
  },

  {
    title: "Encomendas",
    url: "/packages",
    icon: Package,
  },

  {
    title: "Áreas de Lazer",
    url: "/areas",
    icon: CalendarDays,
  },

  {
    title: "Eventos",
    url: "/events",
    icon: PartyPopper,
  },
];