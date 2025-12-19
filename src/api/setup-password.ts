import { api } from "@/lib/axios";

export type SetupPasswordPayload = {
  token: string;
  password: string;
};

export async function setupPassword(payload: SetupPasswordPayload) {
  const response = await api.post("/auth/setup-password", payload);
  return response.data;
}
