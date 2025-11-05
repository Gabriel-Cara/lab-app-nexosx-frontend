import { use } from "react";

import { AuthContext } from "../contexts/auth-context";

export function useAuth() {
  const context = use(AuthContext)

  return context
}