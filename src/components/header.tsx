import icon from "@/assets/icon.png";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "./ui/sidebar";

import { ThemeToggle } from "./theme/theme-toggle";
import { Button } from "./ui/button";

export function Header(props: React.ComponentProps<"header">) {
  return (
    <header {...props}>
      <div className="flex h-16 items-center gap-6 px-6">
        <div className="flex items-center gap-2">
          <img src={icon} alt="logo" className="w-14 h-14" />
          <div className="hidden md:block">
            <span className="text-xl font-bold tracking-tight">nexos</span>
          </div>
        </div>

        <Separator
          orientation="vertical"
          className="max-h-6 sr-only md:not-sr-only"
        />

        <div className="ml-auto flex items-center gap-2">
          <Button className="h-11 w-11 md:hidden" variant="outline" asChild>
            <SidebarTrigger>
              <span className="sr-only">Toggle Sidebar</span>
            </SidebarTrigger>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
