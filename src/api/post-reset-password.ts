import { api } from "@/lib/axios";

export type ResetPasswordPayload = {
  token: string;
  password: string;
};

export async function postResetPassword(payload: ResetPasswordPayload) {
  const response = await api.post("/auth/reset-password", payload);
  return response.data;
}
