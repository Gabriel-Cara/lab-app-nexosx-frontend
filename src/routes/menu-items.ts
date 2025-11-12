import { CalendarDays, LayoutDashboard, Package, PartyPopper, UserRoundCheck, Users } from "lucide-react";

interface MenuItem {
  title: string;
  url: string;
  icon: any;
  role: string[]
}

export const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    role: ["admin", "staff", "resident"]
  },
  {
    title: "Moradores",
    url: "/residents",
    icon: Users,
    role: ["admin", "staff"]
  },
  {
    title: "Visitantes",
    url: "/visitors",
    icon: UserRoundCheck,
    role: ["admin", "staff", "resident"]
  },

  {
    title: "Encomendas",
    url: "/packages",
    icon: Package,
    role: ["admin", "staff", "resident"]
  },

  {
    title: "Áreas de Lazer",
    url: "/areas",
    icon: CalendarDays,
    role: ["admin", "staff", "resident"]
  },

  {
    title: "Eventos",
    url: "/events",
    icon: PartyPopper,
    role: ["admin", "staff", "resident"]
  },
];