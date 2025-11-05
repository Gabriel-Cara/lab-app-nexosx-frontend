import icon from "@/assets/icon.png";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

import { AccountMenu } from "./account-menu";
import { NavLink } from "./nav-link";

import { menuItems } from "@/routes/menu-items";


export function AppSidebar() {
  const sidebarItems = menuItems.map((item) => (
    <SidebarMenuSubItem key={item.title}>
      <NavLink url={item.url} title={item.title} icon={item.icon} />
    </SidebarMenuSubItem>
  ));

  return (
    <Sidebar variant="floating">
      <SidebarHeader className="flex border-b border-muted flex-row items-center gap-3 p-4">
        
        <img src={icon} className="h-12 w-12" />
        <div>
          <span className="text-xl font-bold tracking-wider">nexus</span>
          <p className="text-xs tracking-wide text-muted-foreground">Sistema de controle</p>
        </div>
      </SidebarHeader>

      <SidebarContent className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto">
        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-foreground uppercase tracking-wider px-3 py-2">
            Navegação
          </SidebarGroupLabel>
          <SidebarMenuSub className="gap-2">
            {sidebarItems}
          </SidebarMenuSub>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="flex border-t border-muted flex-row items-center p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <AccountMenu />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
