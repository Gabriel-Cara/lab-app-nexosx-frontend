import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export type CondominiumRequestPayload = {
  name: string;
  code: string;
  adminName: string;
  adminEmail: string;
  adminPhone?: string | null;
  adminPassword: string;
};

export type CondominiumRequestResponse = {
  id: string;
  name: string;
  code: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export async function createCondominiumRequest(
  payload: CondominiumRequestPayload
) {
  const response = await api.post<CondominiumRequestResponse>(
    "/condominium-requests",
    payload
  );
  return response.data;
}

export function useCreateCondominiumRequest() {
  return useMutation({
    mutationFn: (payload: CondominiumRequestPayload) =>
      createCondominiumRequest(payload),
  });
}
