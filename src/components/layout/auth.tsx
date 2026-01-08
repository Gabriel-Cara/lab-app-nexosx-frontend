import { Outlet } from "react-router";

import icon from "@/assets/icon.png";

export function AuthLayout() {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2 antialiased">
      <div className="hidden md:flex h-full flex-col justify-between border-r border-foreground/5 bg-muted p-10 text-muted-foreground">
        <div className="flex items-center gap-2 text-foreground">
          <img src={icon} alt="logo" className="w-8 h-8" />
          <span className="font-light text-2xl tracking-tight font-montserrat">nexos</span>
        </div>
        <footer className="text-sm">
          Painel do parceiro &copy; nexos - {new Date().getFullYear()}
        </footer>
      </div>

      <div className="flex justify-center items-center relative">
        <Outlet />
      </div>
    </div>
  );
}
