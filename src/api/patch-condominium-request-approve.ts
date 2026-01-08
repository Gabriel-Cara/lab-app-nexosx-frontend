import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export async function approveCondominiumRequest(id: string) {
  const response = await api.patch(`/condominium-requests/${id}/approve`);
  return response.data;
}

export function useApproveCondominiumRequest() {
  return useMutation({
    mutationFn: (id: string) => approveCondominiumRequest(id),
  });
}
