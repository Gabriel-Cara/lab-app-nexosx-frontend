import { Link, useLocation } from "react-router";
import { SidebarMenuButton } from "./ui/sidebar";

interface NavLinkProps {
  url: string;
  title: string;
  icon: React.ElementType;
}

export function NavLink({ url, title, icon: Icon }: NavLinkProps) {
  const { pathname } = useLocation();

  return (
    <>
      <SidebarMenuButton
        asChild
        className={` text-muted-foreground font-medium hover:bg-sidebar-accent transition duration-300 ${
          pathname === url && "bg-lime-200 text-lime-600"
        }`}
      >
        <Link to={url} className="flex items-center gap-3 px-4 py-3">
          <Icon />
          <span className="font-inherit">{title}</span>
        </Link>
      </SidebarMenuButton>
    </>
  );
}
