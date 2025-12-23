import { api } from "@/lib/axios";

export async function deletePackage(id: string) {
  await api.delete(`/packages/${id}`);
}
