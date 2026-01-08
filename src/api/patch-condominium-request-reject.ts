import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export async function rejectCondominiumRequest(id: string, reason?: string) {
  const response = await api.patch(`/condominium-requests/${id}/reject`, {
    reason,
  });
  return response.data;
}

export function useRejectCondominiumRequest() {
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      rejectCondominiumRequest(id, reason),
  });
}
