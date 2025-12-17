import { api } from "@/lib/axios";

export async function deleteArea(id: string) {
  await api.delete(`/areas/${id}`);
}
