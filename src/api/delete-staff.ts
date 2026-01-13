import { api } from "@/lib/axios";

export async function deleteStaff(id: string) {
  await api.delete(`/auth/users/${id}`);
}
