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
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/api/get-profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AccountMenu() {
  const navigate = useNavigate();

  const { session, remove } = useAuth();

  const user = session?.user;
  const userId = user?.id;

  const { data: profile } = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => getProfile(userId!),
    enabled: !!userId,
  });

  const displayName = profile?.name ?? user?.name ?? "";
  const firstName = displayName.split(" ")[0] ?? "";
  const lastName = displayName.split(" ")[displayName.split(" ").length - 1] ?? "";
  const initials = displayName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="p-2 inline-flex items-center w-full h-full justify-between"
        >
          <div className="flex items-center gap-3 max-w-fit">
            <Avatar className="h-10 w-10">
              {profile?.imageUrl && (
                <AvatarImage src={profile.imageUrl} alt={displayName} />
              )}
              <AvatarFallback className="bg-linear-to-br from-sky-300 to-blue-600 text-background dark:text-foreground tracking-wide">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-start">
              <p className="text-foreground tracking-tight">
                {`${firstName} ${lastName === firstName ? "" : lastName}`}
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
          <span>{user?.name}</span>
          <span className="text-xs font-normal text-muted-foreground">
            {user?.email}
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => navigate("/profile")}>
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
