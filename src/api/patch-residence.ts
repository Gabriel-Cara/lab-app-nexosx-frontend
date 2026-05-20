import { api } from "@/lib/axios";
import type { Residence } from "@/api/get-residences";

export type PatchResidencePayload = {
  id: string;
  number?: string;
  blockId?: string;
  condominiumId?: string;
};

export async function patchResidence({ id, ...payload }: PatchResidencePayload) {
  const response = await api.patch<Residence>(`/residences/${id}`, payload);
  return response.data;
}
