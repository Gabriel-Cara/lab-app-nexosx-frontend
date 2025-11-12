import { api } from "@/lib/axios";

interface PatchStatusOfVisitorResponse {
  id: string;
  method: "approve" | "reject" | "entry" | "exit";
}

export async function patchStatusOfVisitor({ id, method }: PatchStatusOfVisitorResponse) {
  const response = await api.patch<PatchStatusOfVisitorResponse>(`/visitors/${id}/${method}`);
  return response.data;
}