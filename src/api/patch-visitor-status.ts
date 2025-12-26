import { api } from "@/lib/axios";

interface PatchVisitorStatusPayload {
  id: string;
  method: "approve" | "reject" | "entry" | "exit";
}

export async function patchVisitorStatus({ id, method }: PatchVisitorStatusPayload) {
  const response = await api.patch<PatchVisitorStatusPayload>(`/visitors/${id}/${method}`);
  return response.data;
}
