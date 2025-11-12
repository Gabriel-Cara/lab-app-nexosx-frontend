import { BrowserRouter } from "react-router";

import { useAuth } from "@/hooks/use-auth";

import { AuthRoutes } from "@/routes/auth-routes";
import { AppRoutes } from "./app-routes";

export function Routes() {
  const { session } = useAuth();

  switch (session?.user.role) {
    case "admin":
      return (
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      );
    case "staff":
      return (
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      );
    case "resident":
      return (
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      );
    default:
      return (
        <BrowserRouter>
          <AuthRoutes />x
        </BrowserRouter>
      );
  }
}
