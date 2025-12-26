import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";

import type { AuthSession } from "@/types/auth";

type LoginVariables = {
  email: string;
  password: string;
};

export async function login(email: string, password: string) {
  const response = await api.post<AuthSession>("/auth/login", { email, password });
  return response.data;
}

export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: LoginVariables) => login(email, password),
  });
}
