import { ChevronUp, LogOut, UserCircle } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/use-auth";

export function AccountMenu() {
  const { session, remove } = useAuth();

  const user = session?.user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="p-2 inline-flex items-center w-full h-full justify-between"
        >
          <div className="flex items-center gap-3 max-w-fit">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-300 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-background dark:text-foreground tracking-wide">
                {
                  user?.name.split(" ").map((n) => n[0]).join("").slice(0, 2)
                }
              </span>
            </div>
            <div className="flex-1 min-w-0 text-start">
              <p className="text-foreground tracking-tight">
                {user?.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.role === "admin"
                  ? "Admin"
                  : user?.role === "staff"
                  ? "Staff"
                  : "Morador"}
              </p>
            </div>
          </div>
          <ChevronUp />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="flex flex-col cursor-auto">
          <span>
            {user?.name}
          </span>
          <span className="text-xs font-normal text-muted-foreground">
            {user?.email}
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <UserCircle className="h-4 w-4" />
          <span>Perfil</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={remove}
          className="text-rose-500 dark:text-rose-400"
        >
          <LogOut className="h-4 w-4 text-rose-500 dark:text-rose-400" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
