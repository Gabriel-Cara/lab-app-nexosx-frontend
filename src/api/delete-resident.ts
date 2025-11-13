import { api } from "@/lib/axios";

export async function deleteResident(id: string) {
  await api.delete(`/auth/users/${id}`);
}
