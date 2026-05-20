import { api } from "@/lib/axios";

export async function deleteResidence(id: string, condominiumId?: string) {
  await api.delete(`/residences/${id}`, {
    params: condominiumId ? { condominiumId } : undefined,
  });
}
