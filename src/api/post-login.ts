import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";

import type { AuthSession, AuthUser } from "@/types/auth";

type LoginVariables = {
  email: string;
  password: string;
};

export type LoginCandidate = {
  token: string;
  user: AuthUser;
  condominium: {
    id: string;
    name: string;
    code: string;
  } | null;
};

export type LoginResponse =
  | (AuthSession & {
      condominium?: {
        id: string;
        name: string;
        code: string;
      } | null;
    })
  | { candidates: LoginCandidate[] };

export async function login(email: string, password: string) {
  const response = await api.post<LoginResponse>("/auth/login", {
    email,
    password,
  });
  return response.data;
}

export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: LoginVariables) =>
      login(email, password),
  });
}
