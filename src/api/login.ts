import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: "admin" | "staff" | "resident";
  };
}

type LoginVariables = {
  email: string;
  password: string;
};

export async function login(email: string, password: string) {
  const response = await api.post<LoginResponse>("/auth/login", { email, password });
  return response.data;
}

export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: LoginVariables) => login(email, password),
  });
}
