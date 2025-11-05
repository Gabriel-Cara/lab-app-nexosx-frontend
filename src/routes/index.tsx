import { BrowserRouter } from "react-router";

import { AuthRoutes } from "@/routes/auth-routes";
import { AppRoutes } from "./app-routes";

export function Routes() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
