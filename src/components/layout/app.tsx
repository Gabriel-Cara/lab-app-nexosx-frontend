import { Outlet } from "react-router";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

import { Header } from "@/components/header";

export function AppLayout() {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />

      <div className="flex flex-1 flex-col gap-4">
        <Header className="border-b max-w-screen" />
        <div className="flex flex-col flex-1 py-2 px-4 max-w-screen">
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  );
}
