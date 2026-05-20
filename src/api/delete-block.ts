import { api } from "@/lib/axios";

export async function deleteBlock(id: string, condominiumId?: string) {
  await api.delete(`/blocks/${id}`, {
    params: condominiumId ? { condominiumId } : undefined,
  });
}
