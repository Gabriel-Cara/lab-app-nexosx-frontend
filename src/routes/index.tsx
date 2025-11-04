import { BrowserRouter } from "react-router";

import { AuthRoutes } from "@/routes/auth-routes";

export function Routes() {
  return (
    <BrowserRouter>
      <AuthRoutes />
    </BrowserRouter>
  );
}
