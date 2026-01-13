import { api } from "@/lib/axios";

export type ForgotPasswordPayload = {
  email: string;
};

export async function postForgotPassword(payload: ForgotPasswordPayload) {
  const response = await api.post("/auth/forgot-password", payload);
  return response.data;
}
